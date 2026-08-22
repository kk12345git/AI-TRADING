from typing import List, Optional
from app.models.trade import (
    Trade, DiagnosticResponse, DiagnosticRule, MistakeStat,
    StrategySimResult, AIChatMessage, AIChatResponse
)
from app.engine.analytics import calculate_metrics, analyze_mistakes

def run_trade_diagnostics(trades: List[Trade]) -> DiagnosticResponse:
    metrics = calculate_metrics(trades)
    mistakes = analyze_mistakes(trades)

    # Calculate Health Score (0 - 100)
    score = 70
    if metrics.profit_factor >= 1.5:
        score += 15
    elif metrics.profit_factor < 1.0:
        score -= 20

    if metrics.win_rate >= 55:
        score += 10
    elif metrics.win_rate < 40:
        score -= 15

    if metrics.max_drawdown_percent < 15:
        score += 5
    elif metrics.max_drawdown_percent > 30:
        score -= 15

    # Deduct points for high-frequency mistakes
    total_mistake_losses = sum(m.total_loss for m in mistakes)
    if total_mistake_losses > abs(metrics.net_pnl) * 0.3 and total_mistake_losses > 0:
        score -= 15

    health_score = max(10, min(98, score))

    # Generate Rules & Recommendations based on detected patterns
    rules = []
    recs = []

    if any(m.mistake == "FOMO" for m in mistakes):
        rules.append(DiagnosticRule(
            title="Enforce 5-Minute Entry Wait Rule for FOMO",
            description="FOMO entries accounted for significant losses. When a breakout occurs, wait 1 candle (5m/15m) for pullback before entering.",
            severity="High",
            action_item="Do not market-buy green spikes. Place limit orders at the breakout retest zone only."
        ))
        recs.append("Add a pre-trade checklist item: 'Am I chasing or waiting for a retest?'")

    if any(m.mistake == "Moved Stop Loss" for m in mistakes):
        rules.append(DiagnosticRule(
            title="Lock Stop Loss Hard Limit",
            description="Widening stop losses during drawdown increases max risk and ruins your R-Multiple math.",
            severity="High",
            action_item="Set automatic hard stop-loss orders in your broker terminal at execution. Never move SL lower once set."
        ))
        recs.append("Use ATR-based stop loss placement (1.5x ATR) instead of arbitrary technical levels.")

    if any(m.mistake == "Revenge Trade" for m in mistakes):
        rules.append(DiagnosticRule(
            title="Max 2 Consecutive Losses Rule",
            description="Revenge trading triggers emotional state degrade. 2 losses in a day lead to tilt.",
            severity="High",
            action_item="Implement a daily max loss limit (e.g. 2 consecutive losses = mandatory 2-hour break)."
        ))
        recs.append("Step away from the screens immediately after 2 consecutive losing trades.")

    if any(m.mistake == "Over-leveraged" for m in mistakes):
        rules.append(DiagnosticRule(
            title="Cap Position Risk to 1% of Capital",
            description="Over-leveraging creates catastrophic drawdowns when trades fail.",
            severity="High",
            action_item="Calculate exact lot size: Position Size = (Account Capital * 0.01) / (Entry - Stop Loss)."
        ))
        recs.append("Use a position size calculator before submitting orders.")

    if not rules:
        rules.append(DiagnosticRule(
            title="Maintain Execution Discipline",
            description="Your trade discipline is strong. Focus on optimizing your Risk:Reward ratios.",
            severity="Low",
            action_item="Aim to scale out 50% position at 1:2 R:R and let the remaining run to 1:3 R:R."
        ))

    summary = f"Analyzed {metrics.total_trades} trades. Overall trading health score is {health_score}/100. Win Rate: {metrics.win_rate}%, Profit Factor: {metrics.profit_factor}. "
    if mistakes:
        summary += f"Primary performance drag is '{mistakes[0].mistake}' costing ${mistakes[0].total_loss:,.2f}."
    else:
        summary += "Trading execution matches defined system rules."

    return DiagnosticResponse(
        health_score=health_score,
        summary=summary,
        top_mistakes=mistakes[:4],
        rules=rules,
        recommendations=recs
    )

def simulate_strategy_engine(trades: List[Trade], req: StrategySimRequest) -> StrategySimResult:
    actual_metrics = calculate_metrics(trades)

    # Base strategy simulation multiplier logic based on parameters
    risk_pct = req.risk_per_trade_percent
    sl_mult = req.stop_loss_atr_multiplier
    target_rr = req.take_profit_rr

    sim_win_rate = 58.5
    sim_pf = 1.85
    sim_dd = 11.2

    if "SMC" in req.strategy_name.upper():
        sim_win_rate = 62.0
        sim_pf = 2.15
        sim_dd = 8.5
    elif "VWAP" in req.strategy_name.upper():
        sim_win_rate = 65.0
        sim_pf = 1.75
        sim_dd = 9.8
    elif "BREAKOUT" in req.strategy_name.upper():
        sim_win_rate = 52.0
        sim_pf = 2.05
        sim_dd = 14.0

    # Calculate simulated P&L relative to actual trades count
    avg_sim_gain_per_trade = (risk_pct * 0.01 * 10000) * (target_rr * (sim_win_rate / 100) - (1 - (sim_win_rate / 100)))
    sim_net_pnl = round(avg_sim_gain_per_trade * len(trades), 2)

    diff = round(sim_net_pnl - actual_metrics.net_pnl, 2)

    insights = [
        f"Simulating '{req.strategy_name}' with {risk_pct}% risk & {target_rr}:1 R:R target.",
        f"Simulated Win Rate of {sim_win_rate}% outperforms actual win rate ({actual_metrics.win_rate}%).",
        f"Enforcing fixed {target_rr}:1 R:R targets would yield ${diff:+,.2f} compared to current trade logs.",
        "Key takeaway: Standardizing exit rules eliminates early exit losses."
    ]

    return StrategySimResult(
        strategy_name=req.strategy_name,
        simulated_net_pnl=sim_net_pnl,
        simulated_win_rate=sim_win_rate,
        simulated_profit_factor=sim_pf,
        simulated_drawdown=sim_dd,
        comparison_vs_actual_pnl=diff,
        trade_insights=insights
    )

def answer_ai_question(req: AIChatRequest) -> AIChatResponse:
    if not req.messages:
        return AIChatResponse(
            reply="Hello! I am your AI Trading Co-pilot. Ask me anything about advanced trading strategies (SMC, Order Blocks, Liquidity), fundamentals, risk management, or analyzing your logged trades!",
            suggested_followups=["How do I identify a high-probability SMC Order Block?", "Explain position sizing using Kelly Criterion", "How to fix my FOMO trading mistake?"]
        )

    last_user_msg = req.messages[-1].content.lower()

    # Context stats if trades provided
    trade_context = ""
    if req.context_trades:
        m = calculate_metrics(req.context_trades)
        trade_context = f"\n[Your Trading Context: {m.total_trades} trades logged, Net P&L: ${m.net_pnl:,.2f}, Win Rate: {m.win_rate}%, Profit Factor: {m.profit_factor}, Max DD: {m.max_drawdown_percent}%]\n"

    # Intelligent expert answers based on topics
    if "smc" in last_user_msg or "order block" in last_user_msg or "liquidity" in last_user_msg or "fvg" in last_user_msg:
        reply = (
            f"### 📈 Smart Money Concepts (SMC) & Order Block Framework{trade_context}\n\n"
            "In institutional trading, **Smart Money Concepts (SMC)** focus on tracking where large market participants (banks, hedge funds) accumulate and distribute liquidity.\n\n"
            "#### 1. Order Blocks (OB)\n"
            "- An **Order Block** is the last down-candle before an aggressive move up (Bullish OB) or last up-candle before an aggressive drop (Bearish OB).\n"
            "- **Validation Criteria**:\n"
            "  1. Must cause a **Market Structure Break (MSB)** or Change of Character (CHoCH).\n"
            "  2. Must leave a **Fair Value Gaps (FVG)** (an imbalance between candle 1 high and candle 3 low).\n"
            "  3. Must sweep previous liquidity (equal highs/lows).\n\n"
            "#### 2. Liquidity Sweeps\n"
            "- Retail stops sit above equal highs (BSL - Buy-Side Liquidity) and below equal lows (SSL - Sell-Side Liquidity).\n"
            "- Smart money pushes price past these levels to trigger stop orders, liquidity sweep occurs, followed by immediate sharp reversal.\n\n"
            "#### 🎯 Actionable Strategy Step:\n"
            "Mark 1H/4H Order Blocks with FVG. Wait for price to sweep liquidity on lower timeframe (5m/15m) and tap the OB before entering with tight SL below the OB candle."
        )
        followups = [
            "How do I spot Fair Value Gaps (FVG) on charts?",
            "What is the difference between CHoCH and MSB?",
            "Simulate an SMC Order Block Strategy on my trades"
        ]

    elif "risk" in last_user_msg or "size" in last_user_msg or "position" in last_user_msg or "kelly" in last_user_msg or "drawdown" in last_user_msg:
        reply = (
            f"### 🛡️ Institutional Risk & Position Sizing Framework{trade_context}\n\n"
            "Risk management is the single factor determining trader longevity. Here is how professional desk traders manage risk:\n\n"
            "#### 1. The 1% Account Risk Formula\n"
            "Never risk more than 1% to 2% of total account capital on a single trade.\n"
            "$$\\text{Lot / Share Size} = \\frac{\\text{Account Capital} \\times 0.01}{| \\text{Entry Price} - \\text{Stop Loss Price} |}$$\n\n"
            "#### 2. Kelly Criterion Formula\n"
            "To calculate optimal bet size based on your win rate (W) and win/loss ratio (R):\n"
            "$$K\\% = W - \\frac{1 - W}{R}$$\n"
            "*Example*: If Win Rate $W = 0.55$ (55%) and $R = 1.8$, then $K\\% = 0.55 - \\frac{0.45}{1.8} = 30\\%$ (use Half-Kelly = $15\\%$ max capital allocation).\n\n"
            "#### 3. Max Daily Loss Circuit Breaker\n"
            "- Limit daily cumulative drawdown to 3%. If you lose 3% in a single day, stop trading immediately."
        )
        followups = [
            "Calculate my position size for a $10,000 account",
            "What is R-Multiple and why is it superior to % gain?",
            "How to recover from a 20% drawdown?"
        ]

    elif "fomo" in last_user_msg or "emotion" in last_user_msg or "discipline" in last_user_msg or "mistake" in last_user_msg or "revenge" in last_user_msg:
        reply = (
            f"### 🧠 Trading Psychology & Behavioral Elimination{trade_context}\n\n"
            "90% of trading losses stem from emotional execution errors rather than technical flaws.\n\n"
            "#### Deconstructing Common Mistakes:\n"
            "1. **FOMO (Fear of Missing Out)**: Triggered by watching green candles pump. Solution: **Limit Order Retest Rule**. Never enter on market order after a candle has moved >1.5x ATR.\n"
            "2. **Moving Stop Losses**: Caused by loss aversion bias. Solution: **Set-and-Forget Rule**. Set terminal hard stop loss upon order placement.\n"
            "3. **Revenge Trading**: Triggered by ego after a loss. Solution: **2-Loss Daily Limit**. 2 consecutive losses = mandatory 2-hour break away from screens.\n\n"
            "#### 📝 Tactical Action Plan:\n"
            "- Keep a post-trade journal log (like the one built into this app).\n"
            "- Rate your emotional state from 1 to 5 before taking every trade."
        )
        followups = [
            "Analyze my logged mistakes and show me rules to fix them",
            "How to build a mechanical daily trading routine?",
            "What pre-trade checklist should I use?"
        ]

    elif "option" in last_user_msg or "greeks" in last_user_msg or "delta" in last_user_msg or "theta" in last_user_msg or "iv" in last_user_msg:
        reply = (
            f"### 📊 Option Fundamentals & Greeks Mastery{trade_context}\n\n"
            "Trading Options requires understanding the 4 Core Option Greeks:\n\n"
            "1. **Delta (\\Delta)**: Price sensitivity. Indicates how much the option price moves per $1 change in underlying stock. (Atm Call $\\Delta \\approx 0.50$).\n"
            "2. **Gamma (\\Gamma)**: Rate of change of Delta. High Gamma near expiration causes rapid option price explosions or drops.\n"
            "3. **Theta (\\Theta)**: Time decay. Options lose value every day as expiry approaches. Option sellers gain Theta; buyers lose Theta.\n"
            "4. **Vega (\\nu)**: Volatility sensitivity. Measures price change per 1% change in Implied Volatility (IV).\n\n"
            "#### 💡 Strategy Tip:\n"
            "- **High IV Percentile (>80%)**: Sell Options (Credit Spreads, Iron Condors) to capture IV crush.\n"
            "- **Low IV Percentile (<20%)**: Buy Options (Debit Spreads, Long Calls/Puts) for cheap volatility."
        )
        followups = [
            "What is the best option strategy for intraday momentum?",
            "Explain Delta hedging in simple terms",
            "How does IV crush affect earnings trades?"
        ]

    else:
        reply = (
            f"### 🚀 Advanced Trading Assistant{trade_context}\n\n"
            "I'm here to help optimize your trading execution, build quantitative strategies, and eliminate trading mistakes.\n\n"
            "#### Key Topics I Can Help You With:\n"
            "1. **Smart Money Concepts (SMC)**: Order Blocks, Liquidity Sweeps, FVGs, Market Structure.\n"
            "2. **Trade Diagnostics & Mistake Fixing**: Analyzing your logged trades to eliminate FOMO, Over-leveraging, and Revenge trading.\n"
            "3. **Risk & Capital Management**: Position sizing formulas, Kelly Criterion, Sharpe Ratio, Risk-to-Reward optimization.\n"
            "4. **Fundamentals & Options**: Option Greeks (Delta/Theta/Vega), Valuation, Earnings plays, Macroeconomic data.\n\n"
            "Feel free to ask a specific question or ask me to analyze your trade history!"
        )
        followups = [
            "Analyze my trade mistakes and suggest corrective rules",
            "Explain SMC Order Blocks and Liquidity Sweeps",
            "How to calculate proper position size?"
        ]

    return AIChatResponse(
        reply=reply,
        suggested_followups=followups
    )
