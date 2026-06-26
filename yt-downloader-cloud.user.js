// ==UserScript==
// @name         YT Video Downloader (Cloud Serverless / Cobalt API)
// @namespace    com.ytdl.userscript.cloud
// @version      1.0.0
// @description  Download YouTube videos & audio without any local server or .bat files. Powered by Cobalt API.
// @author       MacReyhan & Arena Agent
// @match        *://*.youtube.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM_download
// @connect      api.cobalt.tools
// @connect      cobalt.tools
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // ─── COBALT API CONFIG ────────────────────────────────
  const COBALT_API_URL = 'https://api.cobalt.tools/';

  // ─── STYLES ───────────────────────────────────────────
  const css = `
/** 
 * Floating Download Button (IDM-style)
 */
.ytdl-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 999999;

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
  padding: 0 14px;
  height: 32px;

  font-family: "Roboto", Arial, sans-serif;
  font-size: 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}

.ytdl-btn:hover {
  background-color: rgba(220, 38, 38, 0.9);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.ytdl-btn:active {
  transform: translateY(0);
}

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
}

html[dark] .ytdl-panel {
  background-color: #212121;
  border-color: #383838;
  color: #f1f1f1;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

@keyframes ytdl-fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
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

html[dark] .ytdl-close-btn { color: #aaaaaa; }
.ytdl-close-btn:hover { background-color: rgba(0, 0, 0, 0.05); color: #0f0f0f; }
html[dark] .ytdl-close-btn:hover { background-color: rgba(255, 255, 255, 0.1); color: #ffffff; }

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

/* Panel Body */
.ytdl-panel-body {
  overflow-y: auto;
  padding: 8px 0;
  flex-grow: 1;
}

.ytdl-panel-body::-webkit-scrollbar { width: 8px; }
.ytdl-panel-body::-webkit-scrollbar-track { background: transparent; }
.ytdl-panel-body::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
html[dark] .ytdl-panel-body::-webkit-scrollbar-thumb { background: #666; }

/* Section Title */
.ytdl-section-title {
  padding: 8px 16px 4px 16px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #606060;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
html[dark] .ytdl-section-title { color: #aaaaaa; }

/* Divider */
.ytdl-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 8px 0;
}
html[dark] .ytdl-divider { background-color: #383838; }

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
.ytdl-option:hover { background-color: rgba(0, 0, 0, 0.05); }
html[dark] .ytdl-option:hover { background-color: rgba(255, 255, 255, 0.1); }

/* The Quality/Tag badge */
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
html[dark] .ytdl-option-tag { background-color: #383838; color: #f1f1f1; }
.ytdl-option-label { font-size: 1.3rem; }

/* Status Bar */
.ytdl-status {
  padding: 12px 16px;
  font-size: 1.2rem;
  font-weight: 500;
  border-top: 1px solid #e0e0e0;
  background-color: #f9f9f9;
  display: none;
}
html[dark] .ytdl-status { border-top-color: #383838; background-color: #1f1f1f; }

.ytdl-status-loading, .ytdl-status-success, .ytdl-status-error { display: block; }
.ytdl-status-loading { color: #065fd4; }
html[dark] .ytdl-status-loading { color: #3ea6ff; }
.ytdl-status-success { color: #2ba640; }
.ytdl-status-error { color: #cc0000; }
html[dark] .ytdl-status-error { color: #ff4e45; }
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

  // ─── PRESET OPTIONS (Mapped for Cobalt API) ──────────
  const VIDEO_OPTIONS = [
    { label: 'Best Quality (MP4)', tag: 'BEST', quality: '1080', audioOnly: false },
    { label: '2160p — 4K', tag: '4K', quality: '2160', audioOnly: false },
    { label: '1440p — QHD', tag: '1440p', quality: '1440', audioOnly: false },
    { label: '1080p — Full HD', tag: '1080p', quality: '1080', audioOnly: false },
    { label: '720p — HD', tag: '720p', quality: '720', audioOnly: false },
    { label: '480p', tag: '480p', quality: '480', audioOnly: false },
    { label: '360p', tag: '360p', quality: '360', audioOnly: false },
  ];

  const AUDIO_OPTIONS = [
    { label: 'MP3 — High Quality', tag: 'MP3', quality: 'best', audioOnly: true, audioFormat: 'mp3' },
    { label: 'FLAC — Lossless', tag: 'FLAC', quality: 'best', audioOnly: true, audioFormat: 'flac' },
    { label: 'WAV — Lossless', tag: 'WAV', quality: 'best', audioOnly: true, audioFormat: 'wav' },
    { label: 'OPUS — Original', tag: 'OPUS', quality: 'best', audioOnly: true, audioFormat: 'opus' },
  ];

  const INJECT_SELECTORS = ['#movie_player', '.html5-video-player'];

  // ─── STATE ────────────────────────────────────────────
  let panelOpen = false;
  let lastUrl = '';

  // ─── INIT ─────────────────────────────────────────────
  function init() {
    checkPage();
    document.addEventListener('yt-navigate-finish', () => setTimeout(checkPage, 1200));
    setInterval(() => {
      if (location.href !== lastUrl) { lastUrl = location.href; checkPage(); }
    }, 1500);
  }

  function isWatch() { return location.pathname === '/watch'; }

  function checkPage() {
    if (!isWatch()) { removeBtn(); removePanel(); return; }
    if (document.getElementById(BTN_ID)) return;
    tryInject(0);
  }

  function tryInject(n) {
    if (n > 40) return;
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
    btn.title = 'Download via Cloud API';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('fill', 'currentColor');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 16l-5-5h3V4h4v7h3l-5 5zm-5 2v1h10v-1H7z');
    svg.appendChild(path);

    const span = document.createElement('span');
    span.textContent = 'Download';

    btn.appendChild(svg);
    btn.appendChild(span);

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

    const hdr = el('div', 'ytdl-panel-header');
    hdr.appendChild(Object.assign(el('span', 'ytdl-panel-title'), { textContent: '⬇  Download (Cloud)' }));
    const closeBtn = el('button', 'ytdl-close-btn');
    closeBtn.textContent = '✕';
    closeBtn.onclick = removePanel;
    hdr.appendChild(closeBtn);
    panel.appendChild(hdr);

    const vt = el('div', 'ytdl-video-title');
    vt.textContent = videoTitle();
    vt.title = vt.textContent;
    panel.appendChild(vt);

    const body = el('div', 'ytdl-panel-body');

    body.appendChild(sectionTitle('🎬  VIDEO'));
    VIDEO_OPTIONS.forEach(o => body.appendChild(optionRow(o)));

    body.appendChild(divider());

    body.appendChild(sectionTitle('🎵  AUDIO ONLY'));
    AUDIO_OPTIONS.forEach(o => body.appendChild(optionRow(o)));

    panel.appendChild(body);

    const status = el('div', 'ytdl-status');
    status.id = 'ytdl-status';
    panel.appendChild(status);

    document.body.appendChild(panel);
    requestAnimationFrame(() => posPanel(panel));
    setTimeout(() => document.addEventListener('click', outsideClick), 80);
  }

  function el(tag, cls) { const e = document.createElement(tag); e.className = cls || ''; return e; }
  function divider() { return el('div', 'ytdl-divider'); }
  function sectionTitle(text) { const s = el('div', 'ytdl-section-title'); s.textContent = text; return s; }

  function optionRow(opt) {
    const row = el('button', 'ytdl-option');
    const tag = el('span', 'ytdl-option-tag'); tag.textContent = opt.tag;
    const lbl = el('span', 'ytdl-option-label'); lbl.textContent = opt.label;
    row.appendChild(tag); row.appendChild(lbl);
    row.addEventListener('click', () => startDownload(opt));
    return row;
  }

  function posPanel(panel) {
    const btn = document.getElementById(BTN_ID); if (!btn) return;
    const r = btn.getBoundingClientRect();
    let top = r.bottom + 10;
    let left = r.right - 320;
    if (left < 10) left = 10;
    if (top + panel.offsetHeight > innerHeight - 10) top = r.top - panel.offsetHeight - 10;
    if (top < 10) top = 10;
    panel.style.top = top + 'px';
    panel.style.left = left + 'px';
  }

  // ─── DOWNLOAD via Cobalt Cloud API ─────────────────────
  function startDownload(opt) {
    setStatus('⏳  Contacting Cloud API (' + opt.label + ') …', 'loading');

    const payload = {
      url: location.href,
      videoQuality: opt.quality,
      isAudioOnly: opt.audioOnly,
      audioFormat: opt.audioFormat || 'mp3',
      filenamePattern: 'classic'
    };

    const requestFunc = typeof GM_xmlhttpRequest !== 'undefined' ? GM_xmlhttpRequest : (typeof GM !== 'undefined' && GM.xmlHttpRequest ? GM.xmlHttpRequest : null);

    if (!requestFunc) {
      setStatus('❌  GM_xmlhttpRequest is not supported by your userscript manager.', 'error');
      return;
    }

    requestFunc({
      method: 'POST',
      url: COBALT_API_URL,
      data: JSON.stringify(payload),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': 'https://cobalt.tools',
        'Referer': 'https://cobalt.tools/'
      },
      timeout: 20000,
      onload: function (response) {
        if (response.status === 200 || response.status === 202) {
          try {
            const resp = JSON.parse(response.responseText);
            if (resp && (resp.status === 'redirect' || resp.status === 'tunnel' || resp.status === 'picker' || resp.url)) {
              setStatus('✅  Generating download link...', 'success');
              const downloadUrl = resp.url || resp.picker[0].url;
              
              // Open download in a hidden iframe or new tab
              if (typeof GM_download !== 'undefined') {
                GM_download({
                  url: downloadUrl,
                  name: videoTitle() + (opt.audioOnly ? '.' + opt.audioFormat : '.mp4'),
                  onload: () => setStatus('✅  Download complete!', 'success'),
                  onerror: () => { window.open(downloadUrl, '_blank'); }
                });
              } else {
                window.open(downloadUrl, '_blank');
              }

              setStatus('✅  Download started successfully!', 'success');
              setTimeout(removePanel, 3000);
            } else {
              setStatus('❌  API Error: ' + (resp?.text || resp?.error?.message || 'Unknown error'), 'error');
            }
          } catch (e) {
            setStatus('❌  Invalid response from Cloud API.', 'error');
          }
        } else {
          try {
            const errResp = JSON.parse(response.responseText);
            setStatus('❌  API Error (' + response.status + '): ' + (errResp?.error?.message || errResp?.text || ''), 'error');
          } catch(e) {
            setStatus('❌  Cloud API returned status ' + response.status, 'error');
          }
        }
      },
      onerror: function (err) {
        setStatus('❌  Could not connect to Cloud API! Check your network connection.', 'error');
      },
      ontimeout: function () {
        setStatus('❌  Connection to Cloud API timed out.', 'error');
      }
    });
  }

  function setStatus(txt, type) {
    const s = document.getElementById('ytdl-status'); if (!s) return;
    s.textContent = txt; s.className = 'ytdl-status ytdl-status-' + type;
  }

  // ─── BOOT ─────────────────────────────────────────────
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
