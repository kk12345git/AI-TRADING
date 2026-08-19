import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MyTrade AI Indicator"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "mytrade_ai_super_secret_jwt_key_2026_nse_bse_indicator"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Authorized Users (Only 2 authorized users as specified)
    AUTHORIZED_USERS: dict = {
        "user1@mytrade.ai": "tradePass123!",
        "user2@mytrade.ai": "tradePass123!"
    }
    
    # AI Engine Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_AI_PROVIDER: str = "builtin"  # 'builtin', 'openai', 'gemini', 'anthropic'
    
    class Config:
        case_sensitive = True

settings = Settings()
