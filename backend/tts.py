from os import getenv
from typing import Optional
from dotenv import load_dotenv
from elevenlabs import stream as play_stream
from elevenlabs.client import ElevenLabs

# Load environment variables from backend/.env if present
load_dotenv()

_api_key: Optional[str] = getenv("ELEVENLABS_API_KEY")
_client: Optional[ElevenLabs] = ElevenLabs(api_key=_api_key) if _api_key else None
_default_voice: Optional[str] = getenv("ELEVENLABS_VOICE_ID")
_default_model: str = getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")


def stream_tts(text: str, voice_id: Optional[str] = None, model_id: Optional[str] = None, play: bool = True) -> None:
    """
    Stream TTS audio from ElevenLabs. For demo resilience, this is a no-op if
    ELEVENLABS_API_KEY or voice_id are missing.
    """
    if not _client:
        return
    vid = voice_id or _default_voice
    if not vid:
        return
    mid = model_id or _default_model
    audio_stream = _client.text_to_speech.stream(
        text=text,
        voice_id=vid,
        model_id=mid,
    )
    if play:
        play_stream(audio_stream)
    else:
        for _chunk in audio_stream:
            # Hook for future processing of raw bytes
            pass


