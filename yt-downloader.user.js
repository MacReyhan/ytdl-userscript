// ==UserScript==
// @name         YT Video Downloader (yt-dlp)
// @namespace    com.ytdl.userscript
// @version      1.0.0
// @description  Download YouTube videos & audio via local yt-dlp server. Exact functionality of ytdl-extension.
// @author       MacReyhan & Arena Agent
// @match        *://*.youtube.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @connect      127.0.0.1
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // ─── LOCAL SERVER CONFIG ──────────────────────────────
  const SERVER_URL = 'http://127.0.0.1:6554/';

  // ─── STYLES ───────────────────────────────────────────
  const css = `
/** 
 * Floating Download Button (IDM-style)
 */
.ytdl-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  /* Top right corner of the video player */
  z-index: 999999;
  /* Sit above video controls and overlays */

  display: flex !important;
  align-items: center;
  justify-content: center;
  gap: 6px;

  /* Glassmorphism / IDM style */
  background-color: rgba(30, 30, 30, 0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  /* Slightly less round, more tool-like */
  padding: 0 14px;
  height: 32px;

  font-family: "Roboto", Arial, sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  /* Make sure it doesn't trigger mouse events when hidden by YouTube controls */
  pointer-events: auto;
}

/* Hover effects */
.ytdl-btn:hover {
  background-color: rgba(220, 38, 38, 0.9);
  /* Subtle YouTube red on hover */
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.ytdl-btn:active {
  transform: translateY(0);
}

/* Ensure the SVG scales correctly */
.ytdl-btn svg {
  fill: currentColor;
  width: 16px;
  height: 16px;
}

/**
 * Download Quality Panel
 */
.ytdl-panel {
  position: fixed;
  z-index: 999999;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  width: 320px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  font-family: "Roboto", Arial, sans-serif;
  color: #0f0f0f;
  animation: ytdl-fade-in 0.15s ease-out;
  overflow: hidden;
  /* keep rounded corners */
}

html[dark] .ytdl-panel {
  background-color: #212121;
  border-color: #383838;
  color: #f1f1f1;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

@keyframes ytdl-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.ytdl-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f8f8;
}

html[dark] .ytdl-panel-header {
  border-bottom-color: #383838;
  background-color: #181818;
}

.ytdl-panel-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: inherit;
}

.ytdl-close-btn {
  background: none;
  border: none;
  color: #606060;
  font-size: 1.6rem;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  border-radius: 50%;
  transition: background-color 0.2s;
}

html[dark] .ytdl-close-btn {
  color: #aaaaaa;
}

.ytdl-close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #0f0f0f;
}

html[dark] .ytdl-close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* Video Title Display */
.ytdl-video-title {
  padding: 12px 16px;
  font-size: 1.2rem;
  color: #606060;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 1px solid #eee;
}

html[dark] .ytdl-video-title {
  color: #aaaaaa;
  border-bottom-color: #383838;
}

/* Panel Body (Scrollable options list) */
.ytdl-panel-body {
  overflow-y: auto;
  padding: 8px 0;
  flex-grow: 1;
}

/* Scrollbar styling for the body */
.ytdl-panel-body::-webkit-scrollbar {
  width: 8px;
}

.ytdl-panel-body::-webkit-scrollbar-track {
  background: transparent;
}

.ytdl-panel-body::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

html[dark] .ytdl-panel-body::-webkit-scrollbar-thumb {
  background: #666;
}

/* Section Title */
.ytdl-section-title {
  padding: 8px 16px 4px 16px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #606060;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

html[dark] .ytdl-section-title {
  color: #aaaaaa;
}

/* Divider between sections */
.ytdl-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 8px 0;
}

html[dark] .ytdl-divider {
  background-color: #383838;
}

/* Individual Option Button */
.ytdl-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s;
  color: inherit;
}

.ytdl-option:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

html[dark] .ytdl-option:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* The Quality/Tag badge (e.g. 1080p, MP3) */
.ytdl-option-tag {
  display: inline-block;
  background-color: #f0f0f0;
  color: #0f0f0f;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 12px;
  min-width: 48px;
  text-align: center;
}

html[dark] .ytdl-option-tag {
  background-color: #383838;
  color: #f1f1f1;
}

.ytdl-option-label {
  font-size: 1.3rem;
}

/* Status Bar at the bottom */
.ytdl-status {
  padding: 12px 16px;
  font-size: 1.2rem;
  font-weight: 500;
  border-top: 1px solid #e0e0e0;
  background-color: #f9f9f9;
  display: none;
  /* hidden by default */
}

html[dark] .ytdl-status {
  border-top-color: #383838;
  background-color: #1f1f1f;
}

/* Show status bar when it has a specific state class */
.ytdl-status-loading,
.ytdl-status-success,
.ytdl-status-error {
  display: block;
}

.ytdl-status-loading {
  color: #065fd4;
  /* YouTube blue */
}

html[dark] .ytdl-status-loading {
  color: #3ea6ff;
}

.ytdl-status-success {
  color: #2ba640;
  /* Green */
}

.ytdl-status-error {
  color: #cc0000;
  /* Red */
}

html[dark] .ytdl-status-error {
  color: #ff4e45;
}
`;

  if (typeof GM_addStyle !== 'undefined') {
    GM_addStyle(css);
  } else {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─── IDs ──────────────────────────────────────────────
  const BTN_ID = 'ytdl-ext-btn';
  const PANEL_ID = 'ytdl-ext-panel';

  // ─── PRESET OPTIONS ──────────────────────────────────
  const VIDEO_OPTIONS = [
    {
      label: 'Best Quality (MP4)', tag: 'BEST',
      args: ['-f', 'bestvideo+bestaudio/best', '--merge-output-format', 'mp4']
    },
    {
      label: '2160p — 4K', tag: '4K',
      args: ['-f', 'bestvideo[height<=2160]+bestaudio/best[height<=2160]', '--merge-output-format', 'mp4']
    },
    {
      label: '1440p — QHD', tag: '1440p',
      args: ['-f', 'bestvideo[height<=1440]+bestaudio/best[height<=1440]', '--merge-output-format', 'mp4']
    },
    {
      label: '1080p — Full HD', tag: '1080p',
      args: ['-f', 'bestvideo[height<=1080]+bestaudio/best[height<=1080]', '--merge-output-format', 'mp4']
    },
    {
      label: '720p — HD', tag: '720p',
      args: ['-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]', '--merge-output-format', 'mp4']
    },
    {
      label: '480p', tag: '480p',
      args: ['-f', 'bestvideo[height<=480]+bestaudio/best[height<=480]', '--merge-output-format', 'mp4']
    },
    {
      label: '360p', tag: '360p',
      args: ['-f', 'bestvideo[height<=360]+bestaudio/best[height<=360]', '--merge-output-format', 'mp4']
    },
  ];

  const AUDIO_OPTIONS = [
    {
      label: 'MP3  — 320 kbps', tag: '320K',
      args: ['-x', '--audio-format', 'mp3', '--audio-quality', '320K']
    },
    {
      label: 'MP3  — 256 kbps', tag: '256K',
      args: ['-x', '--audio-format', 'mp3', '--audio-quality', '256K']
    },
    {
      label: 'MP3  — 192 kbps', tag: '192K',
      args: ['-x', '--audio-format', 'mp3', '--audio-quality', '192K']
    },
    {
      label: 'MP3  — 128 kbps', tag: '128K',
      args: ['-x', '--audio-format', 'mp3', '--audio-quality', '128K']
    },
    {
      label: 'FLAC — Lossless', tag: 'FLAC',
      args: ['-x', '--audio-format', 'flac']
    },
    {
      label: 'WAV  — Lossless', tag: 'WAV',
      args: ['-x', '--audio-format', 'wav']
    },
  ];

  // container selectors, targeting the video player itself
  const INJECT_SELECTORS = [
    '#movie_player',
    '.html5-video-player'
  ];

  // ─── STATE ────────────────────────────────────────────
  let panelOpen = false;
  let lastUrl = '';

  // ─── INIT ─────────────────────────────────────────────
  function init() {
    checkPage();

    // YouTube fires this on every SPA navigation
    document.addEventListener('yt-navigate-finish', () => setTimeout(checkPage, 1200));

    // fallback: poll for URL changes
    setInterval(() => {
      if (location.href !== lastUrl) { lastUrl = location.href; checkPage(); }
    }, 1500);
  }

  function isWatch() { return location.pathname === '/watch'; }

  function checkPage() {
    if (!isWatch()) { removeBtn(); removePanel(); return; }
    if (document.getElementById(BTN_ID)) return;      // already there
    tryInject(0);
  }

  function tryInject(n) {
    if (n > 40) { // gave up after ~20 seconds
      console.warn('YT Video Downloader: Could not find movie_player to inject floating button.');
      return;
    }
    for (const sel of INJECT_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) { injectBtn(el); return; }
    }
    setTimeout(() => tryInject(n + 1), 500);
  }

  // ─── BUTTON ───────────────────────────────────────────
  function injectBtn(container) {
    if (document.getElementById(BTN_ID)) return;

    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.className = 'ytdl-btn';
    btn.title = 'Download with yt-dlp';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-5 2v1h10v-1H7z"/>
      </svg>
      <span>Download</span>`;
    btn.addEventListener('click', e => { e.stopPropagation(); togglePanel(); });
    container.appendChild(btn);
  }

  function removeBtn() {
    const b = document.getElementById(BTN_ID); if (b) b.remove();
  }

  // ─── PANEL ────────────────────────────────────────────
  function togglePanel() { panelOpen ? removePanel() : buildPanel(); }

  function removePanel() {
    const p = document.getElementById(PANEL_ID); if (p) p.remove();
    panelOpen = false;
    document.removeEventListener('click', outsideClick);
  }

  function outsideClick(e) {
    const p = document.getElementById(PANEL_ID);
    const b = document.getElementById(BTN_ID);
    if (p && !p.contains(e.target) && (!b || !b.contains(e.target))) removePanel();
  }

  function videoTitle() {
    const el = document.querySelector(
      'h1.ytd-watch-metadata yt-formatted-string,' +
      '#title h1 yt-formatted-string,' +
      'h1.title');
    return el ? el.textContent.trim() : document.title.replace(/ - YouTube$/, '');
  }

  function buildPanel() {
    removePanel();
    panelOpen = true;

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'ytdl-panel';

    /* ── header ── */
    const hdr = el('div', 'ytdl-panel-header');
    hdr.appendChild(Object.assign(el('span', 'ytdl-panel-title'), { textContent: '⬇  Download' }));
    const closeBtn = el('button', 'ytdl-close-btn');
    closeBtn.textContent = '✕';
    closeBtn.onclick = removePanel;
    hdr.appendChild(closeBtn);
    panel.appendChild(hdr);

    /* ── video title ── */
    const vt = el('div', 'ytdl-video-title');
    vt.textContent = videoTitle();
    vt.title = vt.textContent;
    panel.appendChild(vt);

    /* ── scrollable body ── */
    const body = el('div', 'ytdl-panel-body');

    body.appendChild(sectionTitle('🎬  VIDEO'));
    VIDEO_OPTIONS.forEach(o => body.appendChild(optionRow(o)));

    body.appendChild(divider());

    body.appendChild(sectionTitle('🎵  AUDIO ONLY'));
    AUDIO_OPTIONS.forEach(o => body.appendChild(optionRow(o)));

    panel.appendChild(body);

    /* ── status bar ── */
    const status = el('div', 'ytdl-status');
    status.id = 'ytdl-status';
    panel.appendChild(status);

    document.body.appendChild(panel);
    requestAnimationFrame(() => posPanel(panel));
    setTimeout(() => document.addEventListener('click', outsideClick), 80);
  }

  /* helpers */
  function el(tag, cls) { const e = document.createElement(tag); e.className = cls || ''; return e; }
  function divider() { return el('div', 'ytdl-divider'); }

  function sectionTitle(text) {
    const s = el('div', 'ytdl-section-title');
    s.textContent = text;
    return s;
  }

  function optionRow(opt) {
    const row = el('button', 'ytdl-option');
    const tag = el('span', 'ytdl-option-tag');
    tag.textContent = opt.tag;
    const lbl = el('span', 'ytdl-option-label');
    lbl.textContent = opt.label;
    row.appendChild(tag);
    row.appendChild(lbl);
    row.addEventListener('click', () => startDownload(opt));
    return row;
  }

  function posPanel(panel) {
    const btn = document.getElementById(BTN_ID);
    if (!btn) return;
    const r = btn.getBoundingClientRect();

    // Position below the floating button
    let top = r.bottom + 10;

    // Align horizontally with the button
    let left = r.right - 320; // 320 is panel width

    // Keep it on screen
    if (left < 10) left = 10;
    if (top + panel.offsetHeight > innerHeight - 10) {
      top = r.top - panel.offsetHeight - 10;
    }
    if (top < 10) top = 10;

    panel.style.top = top + 'px';
    panel.style.left = left + 'px';
  }

  // ─── DOWNLOAD via Userscript Server ───────────────────
  function startDownload(opt) {
    setStatus('⏳  Starting: ' + opt.label + ' …', 'loading');

    const payload = {
      action: 'download',
      url: location.href,
      format_args: opt.args
    };

    const requestFunc = typeof GM_xmlhttpRequest !== 'undefined' ? GM_xmlhttpRequest : (typeof GM !== 'undefined' && GM.xmlHttpRequest ? GM.xmlHttpRequest : null);

    if (!requestFunc) {
      setStatus('❌  GM_xmlhttpRequest is not supported by your userscript manager.', 'error');
      return;
    }

    requestFunc({
      method: 'POST',
      url: SERVER_URL,
      data: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      onload: function (response) {
        if (response.status === 200) {
          try {
            const resp = JSON.parse(response.responseText);
            if (resp && resp.success) {
              setStatus('✅  Download started — check the console window!', 'success');
              setTimeout(removePanel, 3000);
            } else {
              setStatus('❌  ' + (resp?.error || 'Unknown error'), 'error');
            }
          } catch (e) {
            setStatus('❌  Invalid response from local server.', 'error');
          }
        } else {
          setStatus('❌  Server returned status ' + response.status, 'error');
        }
      },
      onerror: function (err) {
        setStatus('❌  Could not connect to local server! Ensure run_server.bat is running.', 'error');
      },
      ontimeout: function () {
        setStatus('❌  Connection to local server timed out.', 'error');
      }
    });
  }

  function setStatus(txt, type) {
    const s = document.getElementById('ytdl-status');
    if (!s) return;
    s.textContent = txt;
    s.className = 'ytdl-status ytdl-status-' + type;
  }

  // ─── BOOT ─────────────────────────────────────────────
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
