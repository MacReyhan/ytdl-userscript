# YT Video Downloader (Userscript Editions)

A powerful Tampermonkey / Violentmonkey userscript that adds an IDM-style **Download** button directly to YouTube watch pages. 

We provide **two distinct versions** of the userscript depending on your preference for how downloads are processed:

---

## 🌟 Choose Your Version

### ☁️ Option A: The Cloud Serverless Edition ([`yt-downloader-cloud.user.js`](yt-downloader-cloud.user.js))
**Best if you want zero setup and hate running `.bat` files.**
- **No Local Server Needed**: 100% serverless. You do not need Python, `yt-dlp.exe`, or any `.bat` files running on your PC.
- **Powered by Cobalt API**: Automatically connects to the blazing fast, free, ad-free `api.cobalt.tools` cloud backend to fetch direct download links instantly.
- **Cross-Platform**: Works instantly on Windows, Mac, Linux, Android (via Kiwi Browser / Firefox), and iOS (via Userscripts app).

### 🖥️ Option B: The Local Hardware Edition ([`yt-downloader.user.js`](yt-downloader.user.js))
**Best if you want raw local `yt-dlp` power, unlimited 4K downloads, and zero third-party server queues.**
- **100% Local Execution**: Runs `yt-dlp.exe` and `ffmpeg.exe` directly on your machine.
- **Silent Background Startup**: Includes a "Set & Forget" script ([`setup_silent_startup.bat`](setup_silent_startup.bat)) so the server boots completely invisibly in the background with Windows. **You never have to click a `.bat` file again!**

---

## 🚀 Installation Guide

### Option A: Cloud Edition (Zero Setup)
1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) in your browser.
2. Open your userscript manager's dashboard and click **Create a new script**.
3. Copy and paste the entire contents of **[`yt-downloader-cloud.user.js`](yt-downloader-cloud.user.js)**.
4. Save the script (`Ctrl+S`). You are ready to go!

---

### Option B: Local Edition (With Silent Startup)
1. Ensure you have [Python 3](https://www.python.org/downloads/) installed (ensure **"Add Python to PATH"** is checked).
2. Double-click [`install_userscript.bat`](install_userscript.bat) to automatically download `yt-dlp.exe` and `ffmpeg.exe`.
3. Install **[`yt-downloader.user.js`](yt-downloader.user.js)** in Tampermonkey / Violentmonkey.
4. **Enable Silent Startup (No `.bat` clicks)**: Double-click **[`setup_silent_startup.bat`](setup_silent_startup.bat)**. This creates an invisible Windows startup task. The server will run silently in the background automatically every time you start your PC!

---

## 💡 How to Use

1. Open any YouTube video (e.g., `https://www.youtube.com/watch?v=...`).
2. Look for the floating **Download** button in the top-right corner of the video player.
3. Click the button to open the quality selection panel.
4. Select your desired video resolution (e.g., `1080p`) or audio format (e.g., `MP3 — 320 kbps`).
5. **Cloud Edition**: Your browser will automatically begin downloading the file!
   **Local Edition**: A native command prompt window will pop up showing `yt-dlp` actively saving your file to your Downloads folder!
