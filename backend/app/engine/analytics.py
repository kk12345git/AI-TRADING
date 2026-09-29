from datetime import datetime
from typing import List, Dict, Any
from app.models.trade import (
    Trade, MetricsSummary, TimeframeAggregation, DailyTradeGroup,
    EquityPoint, StrategyStat, PerformanceReport
)

def calculate_metrics(trades: List[Trade]) -> MetricsSummary:
    if not trades:
        return MetricsSummary(
            net_pnl=0.0,
            total_points=0.0,
            total_trades=0,
            winning_trades=0,
            losing_trades=0,
            breakeven_trades=0,
            win_rate=0.0,
            profit_factor=0.0,
            avg_win=0.0,
            avg_loss=0.0,
            avg_points_per_trade=0.0,
            risk_reward_ratio=0.0,
            max_drawdown=0.0,
            best_trade_pnl=0.0,
            worst_trade_pnl=0.0,
            best_day_pnl=0.0,
            worst_day_pnl=0.0,
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
    total_points = round(sum(t.points for t in trades), 2)
    total_fees = round(sum(t.fees for t in trades), 2)

    avg_win = round(total_win_pnl / win_count, 2) if win_count > 0 else 0.0
    avg_loss = round(total_loss_pnl / loss_count, 2) if loss_count > 0 else 0.0
    avg_points = round(total_points / total_trades, 2) if total_trades > 0 else 0.0

    profit_factor = round(total_win_pnl / total_loss_pnl, 2) if total_loss_pnl > 0 else (round(total_win_pnl, 2) if total_win_pnl > 0 else 0.0)
    rr_ratio = round(avg_win / avg_loss, 2) if avg_loss > 0 else (avg_win if avg_win > 0 else 0.0)

    best_trade = max(t.net_pnl for t in trades)
    worst_trade = min(t.net_pnl for t in trades)

    # Calculate day-level stats
    daily_totals: Dict[str, float] = {}
    for t in trades:
        daily_totals[t.date] = daily_totals.get(t.date, 0.0) + t.net_pnl

    best_day = max(daily_totals.values()) if daily_totals else 0.0
    worst_day = min(daily_totals.values()) if daily_totals else 0.0

    # Max Drawdown calculation
    sorted_trades = sorted(trades, key=lambda t: f"{t.date} {t.time}")
    cum_pnl = 0.0
    peak = 0.0
    max_dd = 0.0

    for t in sorted_trades:
        cum_pnl += t.net_pnl
        if cum_pnl > peak:
            peak = cum_pnl
        drawdown = peak - cum_pnl
        if drawdown > max_dd:
            max_dd = drawdown

    return MetricsSummary(
        net_pnl=net_pnl,
        total_points=total_points,
        total_trades=total_trades,
        winning_trades=win_count,
        losing_trades=loss_count,
        breakeven_trades=be_count,
        win_rate=win_rate,
        profit_factor=profit_factor,
        avg_win=avg_win,
        avg_loss=avg_loss,
        avg_points_per_trade=avg_points,
        risk_reward_ratio=rr_ratio,
        max_drawdown=round(max_dd, 2),
        best_trade_pnl=round(best_trade, 2),
        worst_trade_pnl=round(worst_trade, 2),
        best_day_pnl=round(best_day, 2),
        worst_day_pnl=round(worst_day, 2),
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
    cumulative_pnl = 0.0
    cumulative_pts = 0.0

    for date in sorted(daily_map.keys()):
        day_trades = daily_map[date]
        day_pnl = sum(t.net_pnl for t in day_trades)
        day_pts = sum(t.points for t in day_trades)
        cumulative_pnl += day_pnl
        cumulative_pts += day_pts

        equity_points.append(EquityPoint(
            date=date,
            pnl=round(day_pnl, 2),
            points=round(day_pts, 2),
            cumulative_pnl=round(cumulative_pnl, 2),
            cumulative_points=round(cumulative_pts, 2),
            trades_count=len(day_trades)
        ))

    return equity_points

def generate_daily_groups(trades: List[Trade]) -> List[DailyTradeGroup]:
    if not trades:
        return []

    groups: Dict[str, List[Trade]] = {}
    for t in trades:
        groups.setdefault(t.date, []).append(t)

    daily_groups = []
    # Sort reverse chronological (newest days first)
    for date in sorted(groups.keys(), reverse=True):
        d_trades = sorted(groups[date], key=lambda x: x.time, reverse=True)
        tot_pnl = sum(t.net_pnl for t in d_trades)
        tot_pts = sum(t.points for t in d_trades)
        wins = sum(1 for t in d_trades if t.status == "WIN")
        losses = sum(1 for t in d_trades if t.status == "LOSS")
        wr = round((wins / len(d_trades)) * 100, 1) if d_trades else 0.0

        daily_groups.append(DailyTradeGroup(
            date=date,
            total_pnl=round(tot_pnl, 2),
            total_points=round(tot_pts, 2),
            trades_count=len(d_trades),
            wins=wins,
            losses=losses,
            win_rate=wr,
            trades=d_trades
        ))

    return daily_groups

def aggregate_by_timeframe(trades: List[Trade], timeframe: str) -> List[TimeframeAggregation]:
    if not trades:
        return []

    sorted_trades = sorted(trades, key=lambda t: f"{t.date} {t.time}")
    groups: Dict[str, List[Trade]] = {}

    for t in sorted_trades:
        try:
            dt = datetime.strptime(t.date, "%Y-%m-%d")
        except Exception:
            dt = datetime.now()

        if timeframe == "daily":
            key = t.date
        elif timeframe == "weekly":
            year, week, _ = dt.isocalendar()
            key = f"{year}-W{week:02d}"
        elif timeframe == "monthly":
            key = dt.strftime("%Y-%m (%b)")
        elif timeframe == "quarterly":
            q = (dt.month - 1) // 3 + 1
            key = f"{dt.year}-Q{q}"
        elif timeframe == "half_yearly":
            h = 1 if dt.month <= 6 else 2
            key = f"{dt.year}-H{h} (Half {h})"
        elif timeframe == "annually" or timeframe == "yearly":
            key = dt.strftime("%Y")
        else:
            key = dt.strftime("%Y-%m")

        groups.setdefault(key, []).append(t)

    result = []
    for period_key in sorted(groups.keys()):
        grp_trades = groups[period_key]
        pnl = sum(tr.net_pnl for tr in grp_trades)
        pts = sum(tr.points for tr in grp_trades)
        wins = sum(1 for tr in grp_trades if tr.status == "WIN")
        losses = sum(1 for tr in grp_trades if tr.status == "LOSS")
        win_rate = round((wins / len(grp_trades)) * 100, 1) if grp_trades else 0.0

        result.append(TimeframeAggregation(
            timeframe=timeframe,
            period_label=period_key,
            net_pnl=round(pnl, 2),
            total_points=round(pts, 2),
            trades_count=len(grp_trades),
            wins=wins,
            losses=losses,
            win_rate=win_rate
        ))

    return result

def analyze_strategies(trades: List[Trade]) -> List[StrategyStat]:
    if not trades:
        return []

    strat_groups: Dict[str, List[Trade]] = {}
    for t in trades:
        strat = t.strategy if t.strategy else "General Strategy"
        strat_groups.setdefault(strat, []).append(t)

    stats = []
    for name, grp in strat_groups.items():
        pnl = sum(tr.net_pnl for tr in grp)
        pts = sum(tr.points for tr in grp)
        wins = sum(1 for tr in grp if tr.status == "WIN")
        wr = round((wins / len(grp)) * 100, 1)

        stats.append(StrategyStat(
            name=name,
            trades_count=len(grp),
            net_pnl=round(pnl, 2),
            total_points=round(pts, 2),
            win_rate=wr
        ))

    return sorted(stats, key=lambda s: s.net_pnl, reverse=True)

def generate_performance_report(trades: List[Trade], timeframe: str = "monthly") -> PerformanceReport:
    metrics = calculate_metrics(trades)
    equity_curve = generate_equity_curve(trades)
    timeframe_breakdown = aggregate_by_timeframe(trades, timeframe)
    daily_groups = generate_daily_groups(trades)
    strategy_breakdown = analyze_strategies(trades)

    return PerformanceReport(
        user_id="",
        timeframe=timeframe,
        metrics=metrics,
        equity_curve=equity_curve,
        timeframe_breakdown=timeframe_breakdown,
        daily_groups=daily_groups,
        strategy_breakdown=strategy_breakdown
    )
