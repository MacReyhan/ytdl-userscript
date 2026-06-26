# YT Video Downloader (Local Edition)

A powerful Tampermonkey / Violentmonkey userscript that adds an IDM-style **Download** button directly to YouTube watch pages. 

This version runs **100% locally** on your machine using `yt-dlp` and `ffmpeg` to provide high-speed, unlimited 4K downloads and audio conversion with no third-party server queues or restrictions.

---

## ⚡ Features
- **100% Local Execution**: Runs `yt-dlp.exe` and `ffmpeg.exe` directly on your PC.
- **Support for All Formats**: Download in 4K, 1440p, 1080p, 720p, etc., or extract high-quality audio (MP3, FLAC, WAV).
- **Silent Background Startup**: Includes a "Set & Forget" script ([`setup_silent_startup.bat`](setup_silent_startup.bat)) so the local server runs completely invisibly in the background.

---

## 🚀 Installation Guide

1. **Install Prerequisites**: Ensure you have [Python 3](https://www.python.org/downloads/) installed (make sure to check **"Add Python to PATH"** during installation).
2. **Download Downloader Dependencies**: Double-click [`install_userscript.bat`](install_userscript.bat). This will automatically fetch `yt-dlp.exe` and `ffmpeg.exe` and setup the workspace.
3. **Install the Userscript**: Install the **[`yt-downloader.user.js`](yt-downloader.user.js)** userscript in your userscript manager (Tampermonkey or Violentmonkey).
4. **Enable Silent Startup (No Command Windows)**: Double-click **[`setup_silent_startup.bat`](setup_silent_startup.bat)**. This registers a silent Windows startup task so the backend server boots invisibly every time you start your PC.

---

## 💡 How to Use

1. Open any YouTube video.
2. Click the floating **Download** button in the top-right corner of the video player.
3. Select your desired video resolution (e.g., `1080p`) or audio format (e.g., `MP3 — 320 kbps`).
4. A native command prompt window will pop up showing `yt-dlp` downloading your file directly to your **Downloads** folder!
