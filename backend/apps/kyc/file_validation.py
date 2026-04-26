"""
Server-side file validation.

We validate:
  1. File size  — max 5 MB
  2. Extension  — must be .pdf / .jpg / .jpeg / .png
  3. Magic bytes — read the first 8 bytes of actual file content to detect the
                   real MIME type, ignoring whatever the client claims.

This prevents:
  - Oversized uploads that could exhaust disk/memory.
  - Disguised uploads (e.g. a .exe renamed to .pdf).
"""

import os

from rest_framework import serializers

# ── Constants ─────────────────────────────────────────────────────────────────

MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}

# (magic_bytes_prefix, detected_mime)
_MAGIC_SIGNATURES = [
    (b'\x25\x50\x44\x46', 'application/pdf'),   # %PDF
    (b'\xff\xd8\xff',      'image/jpeg'),
    (b'\x89\x50\x4e\x47', 'image/png'),          # .PNG
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _detect_mime(file) -> str | None:
    """Read up to 8 bytes from the file and match against known magic bytes."""
    header = file.read(8)
    file.seek(0)
    for magic, mime in _MAGIC_SIGNATURES:
        if header.startswith(magic):
            return mime
    return None


# ── Public validator ──────────────────────────────────────────────────────────

def validate_upload(file) -> None:
    """
    Raise serializers.ValidationError if the file fails any check.
    Mutates nothing; only inspects.
    """
    # 1. Size
    if file.size > MAX_SIZE_BYTES:
        size_mb = file.size / (1024 * 1024)
        raise serializers.ValidationError(
            f"File is too large ({size_mb:.1f} MB). Maximum allowed size is 5 MB."
        )

    # 2. Extension
    _, ext = os.path.splitext(file.name)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise serializers.ValidationError(
            f"Extension '{ext}' is not allowed. "
            f"Please upload a PDF, JPG, or PNG file."
        )

    # 3. Magic bytes (server-side; cannot be spoofed by changing the filename)
    detected_mime = _detect_mime(file)
    if detected_mime is None:
        raise serializers.ValidationError(
            "File content does not match any supported format (PDF, JPG, PNG). "
            "Please ensure you are uploading the correct file."
        )
