from typing import List, Dict, Any, Tuple
from app.models.schemas import RuleCondition, StrategyRuleConfig, Candle, OptionChainData

class StrategyEngine:
    @staticmethod
    def get_default_strategy() -> StrategyRuleConfig:
        return StrategyRuleConfig(
            strategy_id="custom_strategy_1",
            strategy_name="NSE/BSE Price Action & VWAP Breakout Strategy",
            timeframes={
                "higher": "15m",
                "setup": "5m",
                "entry": "1m"
            },
            rules=[
                RuleCondition(
                    id="rule_15m_trend",
                    name="15M Trend Alignment",
                    category="TREND",
                    timeframe="15m",
                    rule_text="15m trend = BULLISH",
                    weight=20,
                    mandatory=True
                ),
                RuleCondition(
                    id="rule_vwap_hold",
                    name="VWAP Hold",
                    category="VWAP",
                    timeframe="5m",
                    rule_text="5m Price > VWAP (Holds Above)",
                    weight=15,
                    mandatory=True
                ),
                RuleCondition(
                    id="rule_structure",
                    name="Market Structure Sequence",
                    category="STRUCTURE",
                    timeframe="5m",
                    rule_text="5m structure = HH + HL (Higher Highs / Higher Lows)",
                    weight=20,
                    mandatory=True
                ),
                RuleCondition(
                    id="rule_breakout",
                    name="Resistance Breakout",
                    category="BREAKOUT",
                    timeframe="5m",
                    rule_text="Price breaks resistance level",
                    weight=15,
                    mandatory=True
                ),
                RuleCondition(
                    id="rule_volume_expansion",
                    name="Volume Confirmation",
                    category="VOLUME",
                    timeframe="5m",
                    rule_text="Volume > 1.2x 20-period Volume MA",
                    weight=15,
                    mandatory=True
                ),
                RuleCondition(
                    id="rule_1m_trigger",
                    name="1M Entry Trigger",
                    category="ENTRY_TRIGGER",
                    timeframe="1m",
                    rule_text="1m candle bullish confirmation close",
                    weight=15,
                    mandatory=False
                ),
                RuleCondition(
                    id="rule_option_oi",
                    name="Option Put OI Support",
                    category="OPTION",
                    timeframe="5m",
                    rule_text="Put/Call Ratio (PCR) > 1.0 (Put OI Support)",
                    weight=10,
                    mandatory=False
                )
            ]
        )

    @staticmethod
    def evaluate_strategy(
        strategy_config: StrategyRuleConfig,
        candles_15m: List[Candle],
        candles_5m: List[Candle],
        candles_1m: List[Candle],
        tech_5m: Dict[str, Any],
        pa_5m: Dict[str, Any],
        pa_15m: Dict[str, Any],
        supports: List[Dict[str, Any]],
        resistances: List[Dict[str, Any]],
        option_data: Optional[OptionChainData] = None
    ) -> Tuple[List[RuleCondition], int, str, str]:
        
        evaluated_rules = []
        total_possible_score = 0
        achieved_score = 0
        
        curr_price = candles_5m[-1].close if candles_5m else 0.0
        vwap_val = tech_5m.get("vwap", 0.0)
        vol_ratio = tech_5m.get("volume_ratio", 1.0)
        
        # 1. 15m Trend Rule
        r_15m = next((r for r in strategy_config.rules if r.id == "rule_15m_trend"), None)
        trend_15m_satisfied = (pa_15m.get("trend") == "BULLISH")
        if r_15m:
            r_copy = r_15m.copy()
            r_copy.is_satisfied = trend_15m_satisfied
            r_copy.current_value = pa_15m.get("trend", "UNKNOWN")
            r_copy.target_value = "BULLISH"
            evaluated_rules.append(r_copy)

        # 2. VWAP Rule
        r_vwap = next((r for r in strategy_config.rules if r.id == "rule_vwap_hold"), None)
        vwap_satisfied = (curr_price > vwap_val)
        if r_vwap:
            r_copy = r_vwap.copy()
            r_copy.is_satisfied = vwap_satisfied
            r_copy.current_value = f"Price: {curr_price:.2f}"
            r_copy.target_value = f"VWAP: {vwap_val:.2f}"
            evaluated_rules.append(r_copy)

        # 3. Structure Rule
        r_struct = next((r for r in strategy_config.rules if r.id == "rule_structure"), None)
        struct_satisfied = pa_5m.get("is_higher_high", False) or pa_5m.get("is_higher_low", False)
        if r_struct:
            r_copy = r_struct.copy()
            r_copy.is_satisfied = struct_satisfied
            r_copy.current_value = pa_5m.get("structure_seq", "RANGING")
            r_copy.target_value = "HH → HL"
            evaluated_rules.append(r_copy)

        # 4. Breakout Rule
        r_break = next((r for r in strategy_config.rules if r.id == "rule_breakout"), None)
        breakout_satisfied = pa_5m.get("breakout", False) or (resistances and curr_price >= resistances[0]["price"] * 0.999)
        if r_break:
            r_copy = r_break.copy()
            r_copy.is_satisfied = breakout_satisfied
            nearest_res = resistances[0]["price"] if resistances else 0.0
            r_copy.current_value = f"Price: {curr_price:.2f}"
            r_copy.target_value = f"Res: {nearest_res:.2f}"
            evaluated_rules.append(r_copy)

        # 5. Volume Expansion Rule
        r_vol = next((r for r in strategy_config.rules if r.id == "rule_volume_expansion"), None)
        vol_satisfied = (vol_ratio >= 1.15)
        if r_vol:
            r_copy = r_vol.copy()
            r_copy.is_satisfied = vol_satisfied
            r_copy.current_value = f"{vol_ratio:.2f}x Vol MA"
            r_copy.target_value = "> 1.15x Vol MA"
            evaluated_rules.append(r_copy)

        # 6. 1m Entry Trigger Rule
        r_1m = next((r for r in strategy_config.rules if r.id == "rule_1m_trigger"), None)
        trigger_1m_satisfied = (candles_1m[-1].close > candles_1m[-1].open) if candles_1m else False
        if r_1m:
            r_copy = r_1m.copy()
            r_copy.is_satisfied = trigger_1m_satisfied
            r_copy.current_value = "Bullish Candle" if trigger_1m_satisfied else "Bearish/Doji Candle"
            r_copy.target_value = "Bullish 1m Close"
            evaluated_rules.append(r_copy)

        # 7. Option OI Rule
        r_opt = next((r for r in strategy_config.rules if r.id == "rule_option_oi"), None)
        pcr_val = option_data.pcr if option_data else 1.05
        opt_satisfied = (pcr_val >= 1.0)
        if r_opt:
            r_copy = r_opt.copy()
            r_copy.is_satisfied = opt_satisfied
            r_copy.current_value = f"PCR: {pcr_val:.2f}"
            r_copy.target_value = "PCR >= 1.00"
            evaluated_rules.append(r_copy)

        # Calculate Score
        for rule in evaluated_rules:
            total_possible_score += rule.weight
            if rule.is_satisfied:
                achieved_score += rule.weight
                
        strategy_score = int((achieved_score / max(1, total_possible_score)) * 100)
        
        # Check mandatory rules satisfaction
        all_mandatory_met = all(r.is_satisfied for r in evaluated_rules if r.mandatory)
        
        # Signal Determination
        if all_mandatory_met and strategy_score >= 80:
            signal = "BUY"
            lifecycle = "CONFIRMED"
        elif any(r.is_satisfied for r in evaluated_rules if r.mandatory) and strategy_score >= 40:
            signal = "WAIT"
            lifecycle = "FORMING"
        elif curr_price < (vwap_val * 0.995) and not trend_15m_satisfied:
            signal = "INVALID"
            lifecycle = "INVALIDATED"
        else:
            signal = "WAIT"
            lifecycle = "WATCHING"
            
        return evaluated_rules, strategy_score, signal, lifecycle
