from typing import List, Dict, Any, Optional
from app.models.schemas import RuleCondition, TradePlan, FullSignalPayload, AIExplanationResponse, OptionChainData, Candle
from app.engine.technical import TechnicalEngine
from app.engine.price_action import PriceActionEngine
from app.engine.structure import StructureEngine
from app.engine.strategy import StrategyEngine
from app.engine.ai_explanation import AIExplanationEngine

class SignalEngine:
    @staticmethod
    def process_full_signal(
        symbol: str,
        exchange: str,
        timeframe: str,
        candles_15m: List[Candle],
        candles_5m: List[Candle],
        candles_1m: List[Candle],
        option_data: Optional[OptionChainData] = None,
        market_status: str = "LIVE"
    ) -> FullSignalPayload:
        
        if not candles_5m:
            candles_5m = candles_15m
            
        tech_5m = TechnicalEngine.calculate_all(candles_5m)
        pa_5m = PriceActionEngine.analyze_structure_sequence(candles_5m)
        pa_15m = PriceActionEngine.analyze_structure_sequence(candles_15m) if candles_15m else pa_5m
        
        vwap_val = tech_5m.get("vwap", candles_5m[-1].close)
        supports, resistances = StructureEngine.identify_support_resistance(candles_5m, vwap_val)
        fvgs = StructureEngine.identify_fair_value_gaps(candles_5m, timeframe=timeframe)

        vp_dict = tech_5m.get("volume_profile")
        macd_div_dict = tech_5m.get("macd_divergence")
        fib_dict = tech_5m.get("fibonacci")
        
        strategy_config = StrategyEngine.get_default_strategy()
        evaluated_rules, strategy_score, signal, lifecycle = StrategyEngine.evaluate_strategy(
            strategy_config=strategy_config,
            candles_15m=candles_15m,
            candles_5m=candles_5m,
            candles_1m=candles_1m,
            tech_5m=tech_5m,
            pa_5m=pa_5m,
            pa_15m=pa_15m,
            supports=supports,
            resistances=resistances,
            option_data=option_data
        )
        
        curr_price = candles_5m[-1].close
        atr_val = tech_5m.get("atr", curr_price * 0.005)
        
        # Calculate Risk Parameters based on User Strategy Rules
        sl_level = supports[0]["price"] if supports else round(curr_price - (atr_val * 1.5), 2)
        risk = max(5.0, curr_price - sl_level)
        
        target_1 = round(curr_price + (risk * 1.5), 2)
        target_2 = round(curr_price + (risk * 2.5), 2)
        target_3 = round(curr_price + (risk * 4.0), 2)
        rr_ratio = round((target_1 - curr_price) / max(1.0, risk), 2)
        
        trade_plan = TradePlan(
            entry_zone=f"{curr_price - (atr_val * 0.2):.2f} - {curr_price + (atr_val * 0.2):.2f}" if signal == "BUY" else "Wait for Volume Trigger",
            stop_loss=sl_level,
            target_1=target_1,
            target_2=target_2,
            target_3=target_3,
            risk_reward=f"1:{rr_ratio:.2f}"
        )
        
        # Missing conditions
        missing_conds = [r.name for r in evaluated_rules if not r.is_satisfied]
        invalidation_text = f"5m candle close below Support level ({sl_level:.2f}) or losing VWAP ({vwap_val:.2f})"
        trigger_text = "5m Candle close above resistance with Volume expansion > 1.15x MA"
        
        # Generate AI explanation payload
        ai_exp = AIExplanationEngine.generate_explanation(
            signal=signal,
            score=strategy_score,
            setup_state=lifecycle,
            trend=pa_15m.get("trend", "BULLISH"),
            structure=pa_5m.get("structure_seq", "HH -> HL"),
            vwap_val=vwap_val,
            curr_price=curr_price,
            vol_ratio=tech_5m.get("volume_ratio", 1.0),
            option_data=option_data,
            supports=supports,
            resistances=resistances,
            missing_conditions=missing_conds,
            trigger_required=trigger_text,
            invalidation=invalidation_text,
            trade_plan=trade_plan
        )
        
        return FullSignalPayload(
            exchange=exchange,
            symbol=symbol,
            timeframe=timeframe,
            data_health="LIVE",
            market_status=market_status,
            price=curr_price,
            signal=signal,
            strategy_score=strategy_score,
            setup_lifecycle=lifecycle,
            trend_15m=pa_15m.get("trend", "BULLISH"),
            setup_5m=pa_5m.get("current_state", "Bullish Continuation"),
            entry_1m="Confirmed" if (candles_1m and candles_1m[-1].close > candles_1m[-1].open) else "Pending 1m Candle Close",
            conditions=evaluated_rules,
            support_levels=supports,
            resistance_levels=resistances,
            volume_profile=vp_dict,
            fair_value_gaps=fvgs,
            macd_divergence=macd_div_dict,
            fibonacci_levels=fib_dict,
            ai_explanation=ai_exp,
            last_update=str(candles_5m[-1].time) if hasattr(candles_5m[-1], 'time') else str(candles_5m[-1])
        )

