"""
Supabase client initialization.

When SUPABASE_URL and SUPABASE_KEY are set → uses the real Supabase client.
Otherwise → falls back to an in-memory mock so the server runs immediately.
"""

from config import SUPABASE_URL, SUPABASE_KEY


def _create_client():
    """Create the appropriate client based on available credentials."""
    if SUPABASE_URL and SUPABASE_KEY:
        from supabase import create_client
        print("🔗 Connecting to Supabase...")
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        from mock_supabase import MockSupabaseClient
        print("⚠️  No Supabase credentials found — using in-memory mock database")
        print("   Set SUPABASE_URL and SUPABASE_KEY in .env to use real Supabase")
        return MockSupabaseClient()


# Singleton client
supabase = _create_client()
