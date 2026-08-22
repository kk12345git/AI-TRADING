from datetime import datetime
from typing import List, Dict, Any
from app.models.trade import Trade, MetricsSummary, TimeframeAggregation, EquityPoint, MistakeStat, PerformanceReport

def calculate_metrics(trades: List[Trade]) -> MetricsSummary:
    if not trades:
        return MetricsSummary(
            net_pnl=0.0,
            total_trades=0,
            winning_trades=0,
            losing_trades=0,
            breakeven_trades=0,
            win_rate=0.0,
            profit_factor=0.0,
            avg_win=0.0,
            avg_loss=0.0,
            risk_reward_ratio=0.0,
            max_drawdown=0.0,
            max_drawdown_percent=0.0,
            expectancy=0.0,
            best_trade_pnl=0.0,
            worst_trade_pnl=0.0,
            total_fees=0.0
        )

    total_trades = len(trades)
    winning_trades = [t for t in trades if t.status == "WIN"]
    losing_trades = [t for t in trades if t.status == "LOSS"]
    breakeven_trades = [t for t in trades if t.status == "BREAKEVEN"]

    win_count = len(winning_trades)
    loss_count = len(losing_trades)
    be_count = len(breakeven_trades)

    win_rate = round((win_count / total_trades) * 100, 2) if total_trades > 0 else 0.0

    total_win_pnl = sum(t.net_pnl for t in winning_trades)
    total_loss_pnl = abs(sum(t.net_pnl for t in losing_trades))

    net_pnl = round(sum(t.net_pnl for t in trades), 2)
    total_fees = round(sum(t.fees for t in trades), 2)

    avg_win = round(total_win_pnl / win_count, 2) if win_count > 0 else 0.0
    avg_loss = round(total_loss_pnl / loss_count, 2) if loss_count > 0 else 0.0

    profit_factor = round(total_win_pnl / total_loss_pnl, 2) if total_loss_pnl > 0 else (round(total_win_pnl, 2) if total_win_pnl > 0 else 0.0)
    rr_ratio = round(avg_win / avg_loss, 2) if avg_loss > 0 else (avg_win if avg_win > 0 else 0.0)

    # Expectancy = (Win Rate % * Avg Win) - (Loss Rate % * Avg Loss)
    loss_rate = (loss_count / total_trades) if total_trades > 0 else 0.0
    win_rate_dec = (win_count / total_trades) if total_trades > 0 else 0.0
    expectancy = round((win_rate_dec * avg_win) - (loss_rate * avg_loss), 2)

    best_trade = max(t.net_pnl for t in trades)
    worst_trade = min(t.net_pnl for t in trades)

    # Max Drawdown calculation
    sorted_trades = sorted(trades, key=lambda t: f"{t.date} {t.time}")
    cum_pnl = 0.0
    peak = 0.0
    max_dd = 0.0
    max_dd_pct = 0.0

    for t in sorted_trades:
        cum_pnl += t.net_pnl
        if cum_pnl > peak:
            peak = cum_pnl
        drawdown = peak - cum_pnl
        if drawdown > max_dd:
            max_dd = drawdown
            if peak > 0:
                max_dd_pct = (drawdown / peak) * 100

    return MetricsSummary(
        net_pnl=net_pnl,
        total_trades=total_trades,
        winning_trades=win_count,
        losing_trades=loss_count,
        breakeven_trades=be_count,
        win_rate=win_rate,
        profit_factor=profit_factor,
        avg_win=avg_win,
        avg_loss=avg_loss,
        risk_reward_ratio=rr_ratio,
        max_drawdown=round(max_dd, 2),
        max_drawdown_percent=round(max_dd_pct, 2),
        expectancy=expectancy,
        best_trade_pnl=round(best_trade, 2),
        worst_trade_pnl=round(worst_trade, 2),
        total_fees=total_fees
    )

def generate_equity_curve(trades: List[Trade]) -> List[EquityPoint]:
    if not trades:
        return []

    sorted_trades = sorted(trades, key=lambda t: f"{t.date} {t.time}")

    daily_map: Dict[str, List[Trade]] = {}
    for t in sorted_trades:
        daily_map.setdefault(t.date, []).append(t)

    equity_points = []
    cumulative = 0.0

    for date in sorted(daily_map.keys()):
        day_trades = daily_map[date]
        day_pnl = sum(t.net_pnl for t in day_trades)
        cumulative += day_pnl

        equity_points.append(EquityPoint(
            date=date,
            pnl=round(day_pnl, 2),
            cumulative_pnl=round(cumulative, 2),
            trades_count=len(day_trades)
        ))

    return equity_points

def aggregate_by_timeframe(trades: List[Trade], timeframe: str) -> List[TimeframeAggregation]:
    if not trades:
        return []

    sorted_trades = sorted(trades, key=lambda t: f"{t.date} {t.time}")
    groups: Dict[str, List[Trade]] = {}

    for t in sorted_trades:
        dt = datetime.strptime(t.date, "%Y-%m-%d")

        if timeframe == "daily":
            key = t.date
        elif timeframe == "weekly":
            year, week, _ = dt.isocalendar()
            key = f"{year}-W{week:02d}"
        elif timeframe == "monthly":
            key = dt.strftime("%Y-%m")
        elif timeframe == "yearly":
            key = dt.strftime("%Y")
        else:
            key = "All-Time"

        groups.setdefault(key, []).append(t)

    result = []
    for period_key in sorted(groups.keys()):
        grp_trades = groups[period_key]
        pnl = sum(tr.net_pnl for tr in grp_trades)
        wins = sum(1 for tr in grp_trades if tr.status == "WIN")
        win_rate = round((wins / len(grp_trades)) * 100, 2) if grp_trades else 0.0

        result.append(TimeframeAggregation(
            timeframe=timeframe,
            period_label=period_key,
            net_pnl=round(pnl, 2),
            trades_count=len(grp_trades),
            win_rate=win_rate
        ))

    return result

def analyze_mistakes(trades: List[Trade]) -> List[MistakeStat]:
    losing_trades = [t for t in trades if t.net_pnl < 0 and t.mistake_tag != "None - Followed Plan"]
    total_losses = abs(sum(t.net_pnl for t in losing_trades)) if losing_trades else 1.0

    mistake_groups: Dict[str, List[Trade]] = {}
    for t in losing_trades:
        mistake_groups.setdefault(t.mistake_tag, []).append(t)

    stats = []
    for mistake, m_trades in mistake_groups.items():
        loss_val = abs(sum(tr.net_pnl for tr in m_trades))
        pct = round((loss_val / total_losses) * 100, 1) if total_losses > 0 else 0.0

        stats.append(MistakeStat(
            mistake=mistake,
            count=len(m_trades),
            total_loss=round(loss_val, 2),
            percentage_of_losses=pct
        ))

    return sorted(stats, key=lambda s: s.total_loss, reverse=True)

def analyze_top_items(trades: List[Trade], key_attr: str) -> List[Dict[str, Any]]:
    groups: Dict[str, List[Trade]] = {}
    for t in trades:
        val = getattr(t, key_attr, "Unknown")
        groups.setdefault(val, []).append(t)

    res = []
    for name, grp in groups.items():
        pnl = sum(tr.net_pnl for tr in grp)
        wins = sum(1 for tr in grp if tr.status == "WIN")
        win_rate = round((wins / len(grp)) * 100, 1)

        res.append({
            "name": name,
            "count": len(grp),
            "net_pnl": round(pnl, 2),
            "win_rate": win_rate
        })

    return sorted(res, key=lambda item: item["net_pnl"], reverse=True)

def generate_performance_report(trades: List[Trade], timeframe: str = "monthly") -> PerformanceReport:
    metrics = calculate_metrics(trades)
    equity_curve = generate_equity_curve(trades)
    timeframe_breakdown = aggregate_by_timeframe(trades, timeframe)
    mistake_analysis = analyze_mistakes(trades)
    top_assets = analyze_top_items(trades, "symbol")
    top_setups = analyze_top_items(trades, "setup_tag")

    return PerformanceReport(
        timeframe=timeframe,
        metrics=metrics,
        equity_curve=equity_curve,
        timeframe_breakdown=timeframe_breakdown,
        mistake_analysis=mistake_analysis,
        top_assets=top_assets,
        top_setups=top_setups
    )
