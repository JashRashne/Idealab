# Field-level encryption helpers (uses cryptography.fernet, already installed via python-jose)
from cryptography.fernet import Fernet


def generate_key() -> bytes:
    """Generate a new Fernet key. Store this securely (e.g., in env vars)."""
    return Fernet.generate_key()


def encrypt(data: str, key: bytes) -> str:
    return Fernet(key).encrypt(data.encode()).decode()


def decrypt(token: str, key: bytes) -> str:
    return Fernet(key).decrypt(token.encode()).decode()
