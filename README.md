# 🎬 YT Video Downloader (Local Edition)

<div align="center">

[![GitHub License](https://img.shields.io/github/license/MacReyhan/ytdl-userscript?style=for-the-badge&color=blue)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/MacReyhan/ytdl-userscript?style=for-the-badge&color=red)](https://github.com/MacReyhan/ytdl-userscript/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/MacReyhan/ytdl-userscript?style=for-the-badge&color=orange)](https://github.com/MacReyhan/ytdl-userscript/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/MacReyhan/ytdl-userscript?style=for-the-badge)](https://github.com/MacReyhan/ytdl-userscript/issues)

A powerful, high-performance userscript that injects a clean, floating **Download** button directly into the YouTube video player. Powered by local execution of `yt-dlp` and `ffmpeg`.

[Explore the Code](https://github.com/MacReyhan/ytdl-userscript) · [Report Bug](https://github.com/MacReyhan/ytdl-userscript/issues) · [Request Feature](https://github.com/MacReyhan/ytdl-userscript/issues)

</div>

---

## 📋 Table of Contents
1. [⚡ Features](#-features)
2. [🚀 Installation Guide](#-installation-guide)
3. [💡 How to Use](#-how-to-use)
4. [🤝 Contributing](#-contributing)
5. [📄 License](#-license)
6. [🙌 Credits & Acknowledgements](#-credits--acknowledgements)

---

## ⚡ Features
- **100% Local Processing**: Runs `yt-dlp.exe` and `ffmpeg.exe` directly on your PC for ultimate security, speed, and privacy.
- **Maximum Quality**: Download in up to **4K/8K resolution** at high frame rates, or convert videos to crystal-clear audio formats (MP3 320kbps, FLAC, WAV).
- **Zero Configuration Silent Startup**: Register a background Windows startup task using [`setup_silent_startup.bat`](setup_silent_startup.bat) to run the server invisibly. No command windows left open!
- **Fast and Resilient**: Bypasses typical cloud downloader server limits and avoids waiting queues.

<p align="right">(<a href="#-yt-video-downloader-local-edition">back to top</a>)</p>

---

## 🚀 Installation Guide

### Prerequisites
- [Python 3](https://www.python.org/downloads/) installed (Ensure you check the box that says **"Add Python to PATH"** during installation).
- A browser userscript manager extension installed:
  - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
  - [Violentmonkey](https://violentmonkey.github.io/)

### Setup
1. **Download Local Dependencies**:
   Double-click [`install_userscript.bat`](install_userscript.bat). This script will automatically download the correct versions of `yt-dlp.exe` and `ffmpeg.exe` for your system.
2. **Install the Userscript**:
   Open **[`yt-downloader.user.js`](yt-downloader.user.js)**, copy its contents, and create a new script in your userscript manager, or install it directly.
3. **Configure Silent Autostart**:
   Double-click **[`setup_silent_startup.bat`](setup_silent_startup.bat)**. This registers an automated Windows task, so the local server starts silently in the background whenever you boot your PC.

<p align="right">(<a href="#-yt-video-downloader-local-edition">back to top</a>)</p>

---

## 💡 How to Use

1. Navigate to any YouTube video (e.g. watch page).
2. You will see a transparent **Download** button inside the top-right corner of the video player.
3. Click the button to toggle the resolution/format list panel.
4. Select your desired format (e.g. `1080p` or `MP3 — 320 kbps`).
5. A native console window will briefly spawn showing the download progress. The media is saved directly to your system's **Downloads** folder!

<p align="right">(<a href="#-yt-video-downloader-local-edition">back to top</a>)</p>

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Feel free to open an [issue](https://github.com/MacReyhan/ytdl-userscript/issues) if you find bugs or want to request extra options!

<p align="right">(<a href="#-yt-video-downloader-local-edition">back to top</a>)</p>

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

<p align="right">(<a href="#-yt-video-downloader-local-edition">back to top</a>)</p>

---

## 🙌 Credits & Acknowledgements

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — The best CLI multimedia downloader.
- [FFmpeg](https://ffmpeg.org/) — Crucial tool for audio/video merging and conversion.
- Created and maintained by **[MacReyhan](https://github.com/MacReyhan)**.

<p align="right">(<a href="#-yt-video-downloader-local-edition">back to top</a>)</p>
