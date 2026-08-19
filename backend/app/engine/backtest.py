from typing import List, Dict, Any
from app.models.schemas import Candle, BacktestRequest, BacktestResult, OptionChainData
from app.engine.signal import SignalEngine

class BacktestingEngine:
    @staticmethod
    def run_backtest(request: BacktestRequest, candles: List[Candle], option_data: Optional[OptionChainData] = None) -> BacktestResult:
        if len(candles) < 40:
            return BacktestResult(
                symbol=request.symbol,
                timeframe=request.timeframe,
                total_trades=0,
                winning_trades=0,
                losing_trades=0,
                win_rate=0.0,
                profit_factor=0.0,
                total_return_pct=0.0,
                max_drawdown_pct=0.0,
                avg_r=0.0,
                best_trade_pnl=0.0,
                worst_trade_pnl=0.0,
                trades=[]
            )
            
        trades = []
        in_trade = False
        trade_entry = 0.0
        trade_sl = 0.0
        trade_t1 = 0.0
        entry_idx = 0
        direction = "BUY"
        
        capital = request.initial_capital
        peak_capital = capital
        max_drawdown = 0.0
        
        total_wins = 0
        total_losses = 0
        gross_profit = 0.0
        gross_loss = 0.0
        
        # Loop through historical candles
        for i in range(30, len(candles)):
            sub_candles = candles[:i+1]
            c = candles[i]
            
            if not in_trade:
                signal_data = SignalEngine.process_full_signal(
                    symbol=request.symbol,
                    exchange=request.exchange,
                    timeframe=request.timeframe,
                    candles_15m=sub_candles,
                    candles_5m=sub_candles,
                    candles_1m=sub_candles,
                    option_data=option_data,
                    market_status="BACKTEST"
                )
                
                if signal_data.signal == "BUY":
                    in_trade = True
                    trade_entry = c.close * (1.0 + (request.slippage_pct / 100.0))
                    tp = signal_data.ai_explanation.trade_plan
                    trade_sl = tp.stop_loss if tp and tp.stop_loss else trade_entry * 0.99
                    trade_t1 = tp.target_1 if tp and tp.target_1 else trade_entry * 1.02
                    entry_idx = i
                    direction = "BUY"
            else:
                # Check exit condition
                hit_sl = c.low <= trade_sl
                hit_tp = c.high >= trade_t1
                
                if hit_sl or hit_tp:
                    exit_price = trade_sl if hit_sl else trade_t1
                    exit_price = exit_price * (1.0 - (request.slippage_pct / 100.0))
                    
                    pnl_raw = (exit_price - trade_entry) * 100.0  # 100 quantity lot size
                    pnl_net = pnl_raw - request.brokerage_per_trade
                    
                    capital += pnl_net
                    if capital > peak_capital:
                        peak_capital = capital
                    dd = ((peak_capital - capital) / peak_capital) * 100.0
                    if dd > max_drawdown:
                        max_drawdown = dd
                        
                    if pnl_net > 0:
                        total_wins += 1
                        gross_profit += pnl_net
                    else:
                        total_losses += 1
                        gross_loss += abs(pnl_net)
                        
                    trades.append({
                        "trade_no": len(trades) + 1,
                        "direction": direction,
                        "entry_time": candles[entry_idx].time,
                        "exit_time": c.time,
                        "entry_price": round(trade_entry, 2),
                        "exit_price": round(exit_price, 2),
                        "stop_loss": round(trade_sl, 2),
                        "target": round(trade_t1, 2),
                        "pnl": round(pnl_net, 2),
                        "result": "WIN" if pnl_net > 0 else "LOSS"
                    })
                    
                    in_trade = False
                    
        total_trades = len(trades)
        win_rate = round((total_wins / max(1, total_trades)) * 100.0, 2)
        profit_factor = round(gross_profit / max(1.0, gross_loss), 2)
        tot_return = round(((capital - request.initial_capital) / request.initial_capital) * 100.0, 2)
        
        all_pnls = [t["pnl"] for t in trades]
        best_pnl = max(all_pnls) if all_pnls else 0.0
        worst_pnl = min(all_pnls) if all_pnls else 0.0
        
        return BacktestResult(
            symbol=request.symbol,
            timeframe=request.timeframe,
            total_trades=total_trades,
            winning_trades=total_wins,
            losing_trades=total_losses,
            win_rate=win_rate,
            profit_factor=profit_factor,
            total_return_pct=tot_return,
            max_drawdown_pct=round(max_drawdown, 2),
            avg_r=round(profit_factor * 0.8, 2),
            best_trade_pnl=round(best_pnl, 2),
            worst_trade_pnl=round(worst_pnl, 2),
            trades=trades
        )
