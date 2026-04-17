"""
Application configuration — loads settings from environment variables.
"""

import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))

# Frontend origin for CORS
FRONTEND_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
