"""
Alert delivery — desktop notifications and terminal output.
"""

import platform
import subprocess


def send_desktop_notification(title: str, message: str, urgency: str = "normal"):
    """Send a desktop notification. Falls back gracefully if unavailable."""
    try:
        system = platform.system()
        if system == "Linux":
            subprocess.run(
                ["notify-send", f"--urgency={urgency}", title, message],
                timeout=5, check=False,
            )
        elif system == "Darwin":  # macOS
            script = f'display notification "{message}" with title "{title}"'
            subprocess.run(["osascript", "-e", script], timeout=5, check=False)
        elif system == "Windows":
            # Use plyer as fallback on Windows
            from plyer import notification
            notification.notify(title=title, message=message, timeout=10)
    except Exception:
        pass  # Notifications are best-effort


def play_alert_sound():
    """Play a short alert beep."""
    try:
        system = platform.system()
        if system == "Linux":
            subprocess.run(["paplay", "/usr/share/sounds/freedesktop/stereo/message-new-instant.oga"],
                           timeout=5, check=False)
        elif system == "Darwin":
            subprocess.run(["afplay", "/System/Library/Sounds/Glass.aiff"], timeout=5, check=False)
        else:
            print("\a", end="", flush=True)  # Terminal bell fallback
    except Exception:
        print("\a", end="", flush=True)
