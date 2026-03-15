# Noor Transliterate v2 🌟

A beautiful, 100% offline Arabic transliteration tool built as a Progressive Web App (PWA).

## Features

- **Arabic ↔ Transliteration** — Real-time formal transliteration with diacritics
- **Arabizi Mode** — Convert Latin-based Arabic chat (e.g. `3rb` → `عرب`)
- **Quran Search & Browse** — Search by keyword or reference (e.g. `2:255`), with audio playback
- **99 Names of Allah** — Built-in dictionary with transliteration for all divine names
- **Daily Ayah** — Random Quran verse with translation on each session
- **Custom Dictionary** — Add your own Arabizi → Arabic mappings
- **Tajweed Coloring** — Color-coded pronunciation rules for Quranic text
- **Virtual Arabic Keyboard** — On-screen keyboard with white/black themes
- **Word-by-Word Breakdown** — Analyze each word's transliteration individually
- **Auto-Correct (Harakat)** — Apply proper vowel marks from the embedded dictionary
- **Linguistic Reflection** — Root word insights for common Islamic terms
- **Text-to-Speech** — Native browser Arabic TTS
- **Voice Input** — Speech recognition for hands-free Arabic input
- **Export as Image** — Save transliterations as PNG images
- **Share** — Share via Web Share API or clipboard
- **Multi-Theme** — Dark mode + 4 accent color themes (Emerald, Blue, Purple, Gold)
- **PWA** — Install on any device for offline use, zero data collection

## Tech Stack

- Vanilla JavaScript (ES6+)
- [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- [html2canvas](https://html2canvas.hertzen.com/) for image export
- [AlQuran Cloud API](https://alquran.cloud/api) for Quran data
- Service Workers for offline caching

## Getting Started

No build step required — just serve the static files.

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

Then open `http://localhost:8000` in your browser.

## Files

| File | Description |
|------|-------------|
| `index.html` | Main HTML — single-page application |
| `app.js` | Core transliteration engine, dictionary, keyboard, history |
| `app2.js` | Quran API, daily ayah, custom dictionary, tajweed, themes, PWA |
| `style.css` | Custom styles (dark mode, accent themes, tajweed colors) |
| `sw.js` | Service worker for offline caching |
| `manifest.json` | PWA manifest |
| `split.js` / `split.py` | Utility to extract JS/CSS from a combined `index.html` |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Auto-correct (apply Harakat) |
| `Ctrl+Shift+C` | Copy Arabic output |
| `Ctrl+K` | Focus Quran search |
| `Ctrl+D` | Toggle dark mode |
| `Ctrl+M` | Voice input |
| `Ctrl+S` | Save to history |
| `Ctrl+/` | Show shortcuts modal |

## License

© Noor Transliterate v2 — Offline-First PWA — Zero Data Collection
