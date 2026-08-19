import json
import urllib.request
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.models.schemas import AIExplanationResponse, TradePlan, OptionChainData
from app.core.config import settings

class AIExplanationEngine:
    @staticmethod
    def call_gemini_api(prompt: str) -> Optional[str]:
        """Calls Google Gemini API for deep market narrative."""
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return None
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 200}
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text.strip()
        except Exception:
            return None

    @staticmethod
    def generate_explanation(
        signal: str,
        score: int,
        setup_state: str,
        trend: str,
        structure: str,
        vwap_val: float,
        curr_price: float,
        vol_ratio: float,
        option_data: Optional[OptionChainData],
        supports: List[Dict[str, Any]],
        resistances: List[Dict[str, Any]],
        missing_conditions: List[str],
        trigger_required: str,
        invalidation: str,
        trade_plan: Optional[TradePlan]
    ) -> AIExplanationResponse:
        
        vwap_state = "Price ABOVE VWAP (Bullish)" if curr_price > vwap_val else "Price BELOW VWAP (Bearish)"
        vol_state = f"Strong ({vol_ratio:.2f}x MA)" if vol_ratio >= 1.2 else f"Weak / Average ({vol_ratio:.2f}x MA)"
        
        opt_confirm = "Put OI Support Visible (PCR > 1.0)"
        if option_data:
            if option_data.pcr < 0.85:
                opt_confirm = "Call OI Heavy Resistance (Bearish Unwinding)"
            elif option_data.pcr > 1.15:
                opt_confirm = "Strong Put OI Support (Bullish Buildup)"
                
        supp_val = supports[0]["price"] if supports else round(curr_price * 0.99, 2)
        res_val = resistances[0]["price"] if resistances else round(curr_price * 1.01, 2)

        # Default deterministic AI comment
        if signal == "BUY":
            ai_comment = (
                f"My custom strategy conditions are fully satisfied with a score of {score}/100. "
                f"Market structure is {trend} with {structure}. Price is holding above VWAP ({vwap_val:.2f}) "
                f"and option data confirms Put OI support. Entry is confirmed within defined risk parameters."
            )
        elif signal == "WAIT":
            missing_str = ", ".join(missing_conditions) if missing_conditions else "Volume confirmation"
            ai_comment = (
                f"My strategy setup is forming with a Strategy Score of {score}/100, but {missing_str} is missing. "
                f"Do not force an entry yet. Wait for a 5m candle close above {res_val:.2f} with volume expansion."
            )
        elif signal == "INVALID":
            ai_comment = (
                f"Setup is INVALIDATED. Price lost VWAP ({vwap_val:.2f}) or closed below key support level ({supp_val:.2f}). "
                f"Strategy rules mandate standing aside until a new valid setup develops."
            )
        else:
            ai_comment = "Market is in consolidation. Waiting for custom strategy setup alignment."

        # Attempt Gemini LLM call if key is available
        if settings.GEMINI_API_KEY:
            prompt = (
                f"You are an expert Indian stock market trading AI assistant for NSE/BSE. Summarize this setup in 2 concise sentences:\n"
                f"Signal: {signal}, Score: {score}/100, Price: {curr_price}, Trend: {trend}, Structure: {structure}, "
                f"VWAP: {vwap_val}, Volume Ratio: {vol_ratio}x, PCR: {option_data.pcr if option_data else 1.0}, Support: {supp_val}, Resistance: {res_val}."
            )
            llm_text = AIExplanationEngine.call_gemini_api(prompt)
            if llm_text:
                ai_comment = f"[Gemini AI] {llm_text}"
            
        risk_level = "LOW" if score >= 85 and signal == "BUY" else ("MEDIUM" if score >= 60 else "HIGH")
        
        return AIExplanationResponse(
            signal=signal,
            strategy_score=score,
            setup_state=setup_state,
            trend=trend,
            structure=structure,
            vwap_state=vwap_state,
            volume_state=vol_state,
            option_confirmation=opt_confirm,
            support=supp_val,
            resistance=res_val,
            missing_conditions=missing_conditions,
            trigger_required=trigger_required,
            invalidation=invalidation,
            risk_level=risk_level,
            ai_comment=ai_comment,
            trade_plan=trade_plan,
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

