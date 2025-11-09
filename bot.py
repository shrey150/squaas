#!/usr/bin/env python3
"""
imessage_describer_bot.py

Every N seconds (default 10), this script:
  1) Takes a macOS screenshot via `screencapture`
  2) Sends the image to OpenAI to generate a concise, descriptive one-liner about the image
  3) Sends the description to a recipient over iMessage using AppleScript

Requirements:
  - macOS with the Messages app signed in to iMessage
  - Permissions:
      • Screen Recording permission for your terminal/python (System Settings → Privacy & Security → Screen Recording)
      • Automation permission to control Messages (granted on first run)
  - Environment:
      • OPENAI_API_KEY must be set
      • IMESSAGE_RECIPIENT must be set (phone number like +15551234567 or a Contact name)
  - Python deps:
      • openai (new SDK) → pip install --upgrade openai

Usage:
  export OPENAI_API_KEY="sk-..."
  export IMESSAGE_RECIPIENT="+15551234567"   # or a Contact name in Messages
  python3 bot.py --interval 10 --model gpt-4o-mini
"""
import argparse
import base64
import os
import subprocess
import sys
import tempfile
import time
from typing import Optional
from dotenv import load_dotenv


load_dotenv()


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        print(f"Environment variable {name} is required.", file=sys.stderr)
        sys.exit(1)
    return value


def take_screenshot_png_bytes() -> bytes:
    """
    Uses the native macOS `screencapture` tool to grab a full-screen PNG.
    Avoids third-party Python packages for better reliability on fresh systems.
    """
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        # -x = do not play sound; -t png is implied by suffix
        result = subprocess.run(
            ["screencapture", "-x", tmp_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(
                f"screencapture failed: {result.stderr.strip()}")
        with open(tmp_path, "rb") as f:
            return f.read()
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


def escape_applescript_text(text: str) -> str:
    """
    Escape double quotes and backslashes for AppleScript string literals.
    """
    return text.replace("\\", "\\\\").replace('"', '\\"')


def send_imessage(text: str, recipient: str) -> None:
    """
    Sends an iMessage via AppleScript to a phone number or contact name.
    """
    escaped_text = escape_applescript_text(text)
    escaped_recipient = escape_applescript_text(recipient)
    script = f'''
tell application "Messages"
    set targetService to 1st service whose service type is iMessage
    set targetBuddy to buddy "{escaped_recipient}" of targetService
    send "{escaped_text}" to targetBuddy
end tell
'''.strip()
    proc = subprocess.run(
        ["osascript", "-e", script],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"osascript failed: {proc.stderr.strip() or proc.stdout.strip()}")


def load_openai_client():
    """
    Lazy import the OpenAI SDK and instantiate a client.
    """
    try:
        # Newer SDK (2024+) interface
        from openai import OpenAI  # type: ignore
    except Exception as exc:
        print(
            "The 'openai' package is required. Install with:\n"
            "  pip install --upgrade openai\n"
            f"Import error: {exc}",
            file=sys.stderr,
        )
        sys.exit(1)
    # The SDK will pick up OPENAI_API_KEY from env automatically; allow explicit as well
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY is not set.", file=sys.stderr)
        sys.exit(1)
    return OpenAI(api_key=api_key)


def generate_detailed_description_from_image(
    client,
    image_png_bytes: bytes,
    model: str,
    max_tokens: int = 100,
    temperature: float = 0.2,
) -> str:
    """
    Sends the screenshot to a vision-capable model to get a clear, objective,
    one-line description of what is visible in the image.
    Uses the Chat Completions-style multimodal content.
    """
    b64_image = base64.b64encode(image_png_bytes).decode("utf-8")
    prompt = (
        "Describe the visual space in a single, short line. Focus ONLY on what you see: "
        "people, objects, scenes, colors, text content, layout, and visual elements. "
        "DO NOT mention video calls, end-to-end encryption, call status, or any communication metadata. "
        "Ignore UI indicators about calls, encryption, or connection status. "
        "Do not mention screenshots, images, or that you are analyzing a picture. "
        "Just describe the space as if you are observing it directly. "
        "Keep it factual, clear, and under 150 characters. No emojis or hashtags. "
        "Format as a simple text message that's easy to read and parse."
    )
    try:
        # Chat Completions multimodal payload (widely supported by 'gpt-4o*' models)
        resp = client.chat.completions.create(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{b64_image}"
                            },
                        },
                    ],
                }
            ],
        )
        content = resp.choices[0].message.content or ""
        return content.strip()
    except Exception as exc:
        raise RuntimeError(f"OpenAI request failed: {exc}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Loop: screenshot → OpenAI one-liner description → iMessage.")
    parser.add_argument(
        "--interval",
        type=float,
        default=10.0,
        help="Seconds between messages (default: 10)",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="gpt-4o-mini",
        help="OpenAI vision-capable model (default: gpt-4o-mini)",
    )
    parser.add_argument(
        "--recipient",
        type=str,
        default=None,
        help="iMessage recipient (overrides IMESSAGE_RECIPIENT env)",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run a single cycle and exit (useful for testing).",
    )
    args = parser.parse_args()

    recipient = args.recipient or os.getenv("IMESSAGE_RECIPIENT")
    if not recipient:
        print("IMESSAGE_RECIPIENT not set and --recipient not provided.",
              file=sys.stderr)
        sys.exit(1)
    require_env("OPENAI_API_KEY")

    client = load_openai_client()

    time.sleep(3)

    print(
        f"Starting loop. Interval: {args.interval}s | Model: {args.model} | Recipient: {recipient}")
    try:
        while True:
            try:
                img = take_screenshot_png_bytes()
                line = generate_detailed_description_from_image(
                    client, img, model=args.model)
                if not line:
                    line = "No description available."
                print(f"Sending: {line}")
                send_imessage(line, recipient)
            except Exception as exc:
                print(f"[error] {exc}", file=sys.stderr)
            if args.once:
                break
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\nExiting on user interrupt.")


if __name__ == "__main__":
    main()
