// =====================================================================
// Noor Transliterate v3 — app2.js — Features Part 2
// Quran API, Daily Ayah, Custom Dict, Word-by-Word,
// Tajweed, Themes, Export, Shortcuts, PWA Install, Lifecycle
// =====================================================================

// =====================================================================
// DAILY AYAH
// =====================================================================
async function fetchDailyAyah(forceNew) {
    if (!forceNew) {
        const cached = sessionStorage.getItem('daily_ayah');
        if (cached) { _dailyAyahData = JSON.parse(cached); displayDailyAyah(_dailyAyahData); return; }
    }
    try {
        const num = Math.floor(Math.random() * 6236) + 1;
        const r = await fetch(`https://api.alquran.cloud/v1/ayah/${num}/editions/quran-uthmani,en.transliteration,en.sahih`);
        if (!r.ok) throw new Error('API request failed');
        const d = await r.json();
        if (d.code === 200) {
            _dailyAyahData = { arabic: d.data[0].text, transliteration: d.data[1].text, translation: d.data[2].text, surah: d.data[0].surah.englishName, number: d.data[0].surah.number, ayah: d.data[0].numberInSurah };
            sessionStorage.setItem('daily_ayah', JSON.stringify(_dailyAyahData));
            displayDailyAyah(_dailyAyahData);
        }
    } catch (e) { console.log('Could not fetch daily ayah:', e.message); }
}

function displayDailyAyah(d) {
    document.getElementById('dailyAyahArabic').textContent = d.arabic;
    document.getElementById('dailyAyahTranslation').textContent = d.translation;
    document.getElementById('dailyAyahRef').textContent = `Surah ${d.surah} (${d.number}:${d.ayah})`;
    document.getElementById('dailyAyahBanner').classList.remove('hidden');
}

function loadAyahIntoTransliterator() {
    if (!_dailyAyahData) return;
    mainInput.value = _dailyAyahData.arabic;
    translationContainer.classList.remove('hidden');
    outputTranslation.innerText = _dailyAyahData.translation;
    outputArabicEditable.value = _dailyAyahData.arabic;
    output1.value = _dailyAyahData.transliteration || performFormalTransliteration(_dailyAyahData.arabic);
    outputArabizi.value = reverseTransliterate(_dailyAyahData.arabic);
    _currentQuranRef = `${_dailyAyahData.number}:${_dailyAyahData.ayah}`;
    document.getElementById('quranAudioBtn').classList.remove('hidden');
    mainInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// =====================================================================
// QURAN API
// =====================================================================
async function handleUnifiedSearch() {
    const query = document.getElementById('quranKeyword').value.trim();
    if (!query) return;
    apiLoading.classList.remove('hidden');
    document.getElementById('apiLoadingText').innerText = 'Fetching Divine Verses...';
    const lang = document.getElementById('translationLang').value || 'en.sahih';
    try {
        const refMatch = query.match(/^(\d+):(\d+)$/);
        if (refMatch) {
            const r = await fetch(`https://api.alquran.cloud/v1/ayah/${query}/editions/quran-uthmani,en.transliteration,${lang}`);
            if (!r.ok) throw new Error('API request failed');
            const d = await r.json();
            if (d.code === 200) {
                mainInput.value = d.data[0].text;
                outputArabicEditable.value = d.data[0].text;
                output1.value = d.data[1].text;
                outputArabizi.value = reverseTransliterate(d.data[0].text);
                outputTranslation.innerText = d.data[2].text;
                translationContainer.classList.remove('hidden');
                _currentQuranRef = query;
                document.getElementById('quranAudioBtn').classList.remove('hidden');
                quranResults.classList.add('hidden');
                if (document.getElementById('tajweedToggle').checked) applyTajweed();
            }
        } else {
            const r = await fetch(`https://api.alquran.cloud/v1/search/${query}/all/en.sahih`);
            if (!r.ok) throw new Error('API request failed');
            const d = await r.json();
            quranResults.innerHTML = '';
            if (d.code === 200 && d.data.matches.length > 0) {
                quranResults.classList.remove('hidden');
                d.data.matches.slice(0, 10).forEach(m => {
                    const div = document.createElement('div');
                    div.className = 'p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 cursor-pointer text-xs mb-2 transition-all bg-white dark:bg-slate-800 hover:border-emerald-500 shadow-sm';

                    const header = document.createElement('div');
                    header.className = 'font-black accent-text uppercase';
                    header.textContent = `${m.surah.englishName} (${m.surah.number}:${m.numberInSurah})`;

                    const text = document.createElement('p');
                    text.className = 'text-slate-600 dark:text-slate-400 line-clamp-2 mt-1';
                    text.textContent = m.text;

                    div.appendChild(header);
                    div.appendChild(text);
                    div.addEventListener('click', () => { document.getElementById('quranKeyword').value = `${m.surah.number}:${m.numberInSurah}`; handleUnifiedSearch(); });
                    quranResults.appendChild(div);
                });
            } else {
                quranResults.classList.remove('hidden');
                quranResults.innerHTML = "<div class='text-sm text-slate-500 text-center p-4'>No results found.</div>";
            }
        }
    } catch (e) { console.error(e); showToast('⚠️ Could not connect to Quran API'); }
    finally { apiLoading.classList.add('hidden'); }
}

async function fetchQuranMetadata() {
    try {
        const r = await fetch('https://api.alquran.cloud/v1/surah');
        if (!r.ok) throw new Error('Failed to load Surah metadata');
        const d = await r.json(); surahData = d.data;
        const ss = document.getElementById('pickSurah');
        ss.innerHTML = '<option value="">Select Surah</option>';
        surahData.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.number;
            opt.textContent = `${s.number}. ${s.englishName}`;
            ss.appendChild(opt);
        });
        const js = document.getElementById('pickJuz');
        js.innerHTML = '<option value="">Select Juz</option>';
        for (let i = 1; i <= 30; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `Juz ${i}`;
            js.appendChild(opt);
        }
    } catch (e) { console.error('Failed to load Surah metadata:', e.message); }
}

function handleJuzChange() { const j = document.getElementById('pickJuz').value; if (j) fetchVerseByRef(`juz/${j}/quran-uthmani`); }
function handleSurahChange() {
    const sn = document.getElementById('pickSurah').value, as = document.getElementById('pickAyah');
    as.innerHTML = '<option value="">Ayah</option>';
    if (!sn) return;
    const s = surahData.find(x => x.number == sn);
    for (let i = 1; i <= s.numberOfAyahs; i++) as.innerHTML += `<option value="${i}">${i}</option>`;
}
function handleAyahChange() { const s = document.getElementById('pickSurah').value, a = document.getElementById('pickAyah').value; if (s && a) fetchVerseByRef(`${s}:${a}`); }
async function fetchVerseByRef(ref) { document.getElementById('quranKeyword').value = ref; handleUnifiedSearch(); }
function changeTranslationLang() { if (_currentQuranRef) { document.getElementById('quranKeyword').value = _currentQuranRef; handleUnifiedSearch(); } }

// =====================================================================
// QURAN AUDIO
// =====================================================================
function playQuranAudio() {
    if (!_currentQuranRef) { showToast('⚠️ No verse loaded'); return; }
    const player = document.getElementById('quranAudioPlayer');
    const [surah, ayah] = _currentQuranRef.split(':');
    const ayahNum = parseInt(surah) > 1 ? getAbsoluteAyahNumber(parseInt(surah), parseInt(ayah)) : parseInt(ayah);
    player.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNum}.mp3`;
    player.classList.remove('hidden');
    player.play().catch(() => showToast('⚠️ Audio unavailable'));
    showToast('🔊 Playing recitation...');
}
function getAbsoluteAyahNumber(surahNum, ayahNum) {
    const surahStarts = [0, 1, 8, 42, 93, 122, 152, 207, 262, 297, 327, 342, 352, 377, 387, 397, 410, 418, 429, 445, 452, 463, 479, 488, 496, 512, 525, 533, 545, 564, 574, 582, 588, 603, 620, 638, 651, 660, 675, 685, 692, 706, 718, 728, 733, 744, 752, 756, 762, 768, 773, 777, 785, 792, 800, 806, 814, 825, 833, 839, 845, 850, 855, 863, 870, 876, 886, 892, 898, 907, 913, 919, 925, 929, 933, 937, 942, 946, 950, 953, 958, 966, 970, 975, 979, 984, 988, 993, 998, 1002, 1006, 1011, 1015, 1018, 1021, 1024, 1028, 1032, 1036, 1039, 1043, 1047, 1051, 1055, 1058, 1062, 1067, 1071, 1076, 1080, 1085, 1089, 1094];
    if (surahNum <= 0 || surahNum > 114) return ayahNum;
    return (surahStarts[surahNum - 1] || 0) + ayahNum;
}

// =====================================================================
// WORD-BY-WORD BREAKDOWN
// =====================================================================
function showWordByWord() {
    const text = outputArabicEditable.value.trim();
    if (!text || text === '') { showToast('⚠️ No Arabic text to break down'); return; }
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const grid = document.getElementById('wordByWordGrid');
    grid.innerHTML = '';
    words.forEach(word => {
        const card = document.createElement('div');
        card.className = 'word-card';
        const translit = performFormalTransliteration(word);
        const arabizi = reverseTransliterate(word);
        card.innerHTML = `<p class="text-2xl arabic-text text-slate-800 dark:text-white mb-2">${word}</p>
            <p class="text-xs font-bold text-slate-600 dark:text-slate-400 italic ltr">${translit}</p>
            <p class="text-[10px] font-mono text-orange-500 ltr mt-1">${arabizi}</p>`;
        card.onclick = () => { mainInput.value = word; process(); };
        grid.appendChild(card);
    });
    document.getElementById('wordByWordContainer').classList.remove('hidden');
    document.getElementById('wordByWordContainer').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// =====================================================================
// CUSTOM DICTIONARY
// =====================================================================
function getCustomDict() { return JSON.parse(localStorage.getItem('noor_custom_dict') || '{}'); }
function saveCustomDict(d) { localStorage.setItem('noor_custom_dict', JSON.stringify(d)); }
function toggleCustomDictPanel() {
    const p = document.getElementById('customDictPanel'), a = document.getElementById('customDictArrow');
    p.classList.toggle('hidden'); a.style.transform = p.classList.contains('hidden') ? '' : 'rotate(180deg)';
}
function addCustomDictEntry() {
    const key = document.getElementById('customDictKey').value.trim().toLowerCase();
    const val = document.getElementById('customDictValue').value.trim();
    if (!key || !val) { showToast('⚠️ Both fields required'); return; }
    if (key.length > 100) { showToast('⚠️ Key too long (max 100 chars)'); return; }
    if (val.length > 200) { showToast('⚠️ Value too long (max 200 chars)'); return; }
    const d = getCustomDict();
    if (!(key in d) && Object.keys(d).length >= 500) { showToast('⚠️ Dictionary full (max 500 entries)'); return; }
    d[key] = val; saveCustomDict(d);
    document.getElementById('customDictKey').value = '';
    document.getElementById('customDictValue').value = '';
    renderCustomDict(); showToast('📝 Entry added!');
}
function removeCustomDictEntry(key) { const d = getCustomDict(); delete d[key]; saveCustomDict(d); renderCustomDict(); }
function renderCustomDict() {
    const list = document.getElementById('customDictList'), empty = document.getElementById('customDictEmpty');
    const d = getCustomDict(), entries = Object.entries(d);
    if (entries.length === 0) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden'); list.innerHTML = '';
    entries.forEach(([k, v]) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm';

        const inner = document.createElement('div');
        inner.className = 'flex gap-4 items-center';

        const keySpan = document.createElement('span');
        keySpan.className = 'text-sm font-mono text-amber-600';
        keySpan.textContent = k;

        const arrow = document.createElement('span');
        arrow.className = 'text-slate-300';
        arrow.textContent = '→';

        const valSpan = document.createElement('span');
        valSpan.className = 'text-lg arabic-text text-slate-800 dark:text-white';
        valSpan.textContent = v;

        inner.appendChild(keySpan);
        inner.appendChild(arrow);
        inner.appendChild(valSpan);

        const delBtn = document.createElement('button');
        delBtn.className = 'text-slate-300 hover:text-red-500 text-sm';
        delBtn.textContent = '✕';
        delBtn.addEventListener('click', () => removeCustomDictEntry(k));

        div.appendChild(inner);
        div.appendChild(delBtn);
        list.appendChild(div);
    });
}

// =====================================================================
// TAJWEED COLORING
// =====================================================================
const qalqalahLetters = ['ق', 'ط', 'ب', 'ج', 'د'];
const ghunnahPattern = /نّ|مّ/g;
function toggleTajweed() {
    const on = document.getElementById('tajweedToggle').checked;
    document.getElementById('tajweedOutput').classList.toggle('hidden', !on);
    if (on) applyTajweed();
}
function applyTajweed() {
    const text = outputArabicEditable.value;
    if (!text) { document.getElementById('tajweedOutput').innerHTML = ''; return; }
    let html = '';
    for (let i = 0; i < text.length; i++) {
        const c = text[i], n = text[i + 1] || '';
        if (c === 'ن' && n === '\u0651') { html += `<span class="tajweed-ghunnah">${c}${n}</span>`; i++; continue; }
        if (c === 'م' && n === '\u0651') { html += `<span class="tajweed-ghunnah">${c}${n}</span>`; i++; continue; }
        if (qalqalahLetters.includes(c) && (n === '\u0652' || n === ' ' || i === text.length - 1)) { html += `<span class="tajweed-qalqalah">${c}</span>`; continue; }
        if ((c === 'ا' || c === 'و' || c === 'ي') && n === '\u0670') { html += `<span class="tajweed-madd">${c}${n}</span>`; i++; continue; }
        html += c;
    }
    document.getElementById('tajweedOutput').innerHTML = html;
}

// =====================================================================
// ACCENT THEMES
// =====================================================================
function setAccentTheme(name) {
    document.documentElement.classList.remove('theme-emerald', 'theme-blue', 'theme-purple', 'theme-gold');
    document.documentElement.classList.add('theme-' + name);
    localStorage.setItem('accent_theme', name);
    document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active-accent'));
    const activeBtn = document.querySelector(`.accent-dot[title="${name.charAt(0).toUpperCase() + name.slice(1)}"]`);
    if (activeBtn) activeBtn.classList.add('active-accent');
}

// =====================================================================
// EXPORT AS IMAGE
// =====================================================================
function exportAsImage() {
    const card = document.getElementById('outputCard');
    if (!card) { showToast('⚠️ No content to export'); return; }
    if (typeof html2canvas === 'undefined') { showToast('⚠️ Export library loading...'); return; }
    const ar = outputArabicEditable.value.trim();
    const tr = output1.value.trim();
    if (!ar || tr === 'Waiting...') { showToast('⚠️ Nothing to export'); return; }
    // Create a styled temporary div for a cleaner export
    const exportDiv = document.createElement('div');
    exportDiv.style.cssText = 'position:fixed;left:-9999px;top:0;padding:40px;background:linear-gradient(135deg,#f0fdf4,#d1fae5);border-radius:24px;width:600px;font-family:Inter,sans-serif;';
    // Header
    const header = document.createElement('div');
    header.style.cssText = 'text-align:center;margin-bottom:24px;';
    header.innerHTML = '<div style="font-size:24px;font-weight:900;color:#065f46;">🌟 Noor Transliterate</div><div style="font-size:11px;color:#6b7280;margin-top:4px;">Arabic Transliteration Tool</div>';
    exportDiv.appendChild(header);
    // Input section
    const inputLabel = document.createElement('div');
    inputLabel.style.cssText = 'font-size:10px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;';
    inputLabel.textContent = 'Input';
    exportDiv.appendChild(inputLabel);
    const inputBox = document.createElement('div');
    inputBox.style.cssText = 'background:white;padding:16px;border-radius:16px;font-size:22px;direction:rtl;text-align:right;margin-bottom:20px;border:1px solid #d1d5db;color:#1e293b;';
    inputBox.textContent = mainInput.value.trim();
    exportDiv.appendChild(inputBox);
    // Arabic output
    const arLabel = document.createElement('div');
    arLabel.style.cssText = 'font-size:10px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;';
    arLabel.textContent = 'Arabic Script';
    exportDiv.appendChild(arLabel);
    const arBox = document.createElement('div');
    arBox.style.cssText = 'background:white;padding:16px;border-radius:16px;font-size:26px;direction:rtl;text-align:right;margin-bottom:20px;border:1px solid #d1d5db;font-family:Amiri,serif;color:#1e293b;';
    arBox.textContent = ar;
    exportDiv.appendChild(arBox);
    // Transliteration
    const trLabel = document.createElement('div');
    trLabel.style.cssText = 'font-size:10px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;';
    trLabel.textContent = 'Transliteration';
    exportDiv.appendChild(trLabel);
    const trBox = document.createElement('div');
    trBox.style.cssText = 'background:white;padding:16px;border-radius:16px;font-size:16px;font-style:italic;margin-bottom:20px;border:1px solid #d1d5db;color:#374151;';
    trBox.textContent = tr;
    exportDiv.appendChild(trBox);
    // Arabizi
    const abz = document.getElementById('outputArabizi').value.trim();
    if (abz) {
        const abzLabel = document.createElement('div');
        abzLabel.style.cssText = 'font-size:10px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;';
        abzLabel.textContent = 'Arabizi (Chat Style)';
        exportDiv.appendChild(abzLabel);
        const abzBox = document.createElement('div');
        abzBox.style.cssText = 'background:#fff7ed;padding:16px;border-radius:16px;font-size:16px;font-family:monospace;margin-bottom:20px;border:1px solid #fed7aa;color:#9a3412;';
        abzBox.textContent = abz;
        exportDiv.appendChild(abzBox);
    }
    // Translation if visible
    const transVisible = !translationContainer.classList.contains('hidden');
    if (transVisible) {
        const trnText = outputTranslation.innerText.trim();
        if (trnText) {
            const trnLabel = document.createElement('div');
            trnLabel.style.cssText = 'font-size:10px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;';
            trnLabel.textContent = 'Translation';
            exportDiv.appendChild(trnLabel);
            const trnBox = document.createElement('div');
            trnBox.style.cssText = 'background:#faf5ff;padding:16px;border-radius:16px;font-size:14px;font-style:italic;margin-bottom:20px;border:1px solid #e9d5ff;color:#581c87;';
            trnBox.textContent = trnText;
            exportDiv.appendChild(trnBox);
        }
    }
    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = 'text-align:center;font-size:10px;color:#9ca3af;margin-top:8px;';
    footer.textContent = '© Noor Transliterate v2 • Generated ' + new Date().toLocaleDateString();
    exportDiv.appendChild(footer);
    document.body.appendChild(exportDiv);
    showToast('🖼️ Generating image...');
    html2canvas(exportDiv, { backgroundColor: null, scale: 2, useCORS: true }).then(canvas => {
        document.body.removeChild(exportDiv);
        const link = document.createElement('a');
        link.download = 'noor-transliteration.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('✅ Image downloaded!');
    }).catch(() => { document.body.removeChild(exportDiv); showToast('⚠️ Export failed'); });
}

// =====================================================================
// KEYBOARD SHORTCUTS
// =====================================================================
function toggleShortcutsModal() { document.getElementById('shortcutsModal').classList.toggle('hidden'); }
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); autoCorrectText(); }
    else if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); copyText('outputArabicEditable'); }
    else if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setMode('quran'); document.getElementById('quranKeyword').focus(); }
    else if (e.ctrlKey && e.key === 'd') { e.preventDefault(); toggleDarkMode(); }
    else if (e.ctrlKey && e.key === 'm') { e.preventDefault(); startVoiceInput(); }
    else if (e.ctrlKey && e.key === '/') { e.preventDefault(); toggleShortcutsModal(); }
    else if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveToHistory(); }
    else if (e.key === 'Escape') { document.getElementById('shortcutsModal').classList.add('hidden'); document.getElementById('settingsModal').classList.add('hidden'); hideSuggestions(); }
});

// =====================================================================
// PWA INSTALL
// =====================================================================
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); _deferredPrompt = e; document.getElementById('installBanner').classList.remove('hidden'); });
function installPWA() { if (!_deferredPrompt) return; _deferredPrompt.prompt(); _deferredPrompt.userChoice.then(() => { _deferredPrompt = null; document.getElementById('installBanner').classList.add('hidden'); }); }
function dismissInstall() { document.getElementById('installBanner').classList.add('hidden'); }

// =====================================================================
// YAMLI SMART ARABIC KEYBOARD INTEGRATION
// =====================================================================
let yamliReady = false;
function initYamli() {
    if (typeof Yamli === 'object') {
        try {
            if (Yamli.init({ uiLanguage: 'en', startMode: 'onOrUserDefault' })) {
                yamliReady = true;
            }
        } catch (e) { console.log('Yamli init failed:', e.message); }
    }
}
function enableYamliOnInput() {
    if (yamliReady) {
        try { Yamli.yamlify('mainInput', { settingsPlacement: 'inside' }); } catch (e) { console.log('Yamli yamlify failed:', e.message); }
    }
}
function disableYamliOnInput() {
    if (yamliReady) {
        try { Yamli.deyamlify('mainInput'); } catch (e) { console.log('Yamli deyamlify failed:', e.message); }
    }
}

// =====================================================================
// MODE & LIFECYCLE
// =====================================================================
function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('[id^="mode"]').forEach(b => b.classList.remove('active-tab'));
    document.getElementById('mode' + mode.charAt(0).toUpperCase() + mode.slice(1)).classList.add('active-tab');
    document.getElementById('quranPickContainer').classList.toggle('hidden', mode !== 'quran');
    const isArabizi = mode === 'arabizi';
    mainInput.style.textAlign = isArabizi ? 'left' : 'right';
    mainInput.setAttribute('dir', isArabizi ? 'ltr' : 'rtl');
    inputLabel.textContent = isArabizi ? 'Arabizi Input (Latin → Arabic)' : mode === 'quran' ? 'Quran Arabic' : 'Input (Arabic / Arabizi)';
    if (isArabizi) enableYamliOnInput(); else disableYamliOnInput();
    hideSuggestions();
    process();
}

window.addEventListener('load', () => {
    initYamli();
    initKeyboard();
    fetchQuranMetadata();
    fetchDailyAyah();
    setMode('standard');
    renderHistory();
    renderCustomDict();

    // Dark mode
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('darkModeBtn').innerText = '☀️';
    }

    // Accent theme
    const savedTheme = localStorage.getItem('accent_theme');
    if (savedTheme) {
        document.documentElement.classList.add('theme-' + savedTheme);
    }

    // Font size
    const savedSize = localStorage.getItem('arabic_font_size');
    if (savedSize) {
        outputArabicEditable.style.fontSize = savedSize + 'px';
        const slider = document.getElementById('fontSizeSlider');
        if (slider) slider.value = savedSize;
    }

    // Load suggestion setting
    const sugSetting = localStorage.getItem('noor_suggestions');
    if (sugSetting === 'off') {
        suggestionsEnabled = false;
        const cb = document.getElementById('settingSuggestions');
        if (cb) cb.checked = false;
    }

    // Load auto-save setting
    const asSetting = localStorage.getItem('noor_autosave');
    if (asSetting === 'off') {
        const cb = document.getElementById('settingAutoSave');
        if (cb) cb.checked = false;
    }
});

mainInput.addEventListener('input', () => {
    translationContainer.classList.add('hidden');
    _currentQuranRef = null;
    document.getElementById('quranAudioBtn').classList.add('hidden');
    process();
    autoExpand(mainInput);
    // Show local suggestions only in arabizi mode when Yamli is not available
    if (currentMode === 'arabizi' && suggestionsEnabled && !yamliReady) {
        showSuggestions(mainInput.value);
    } else {
        hideSuggestions();
    }
});

outputArabicEditable.addEventListener('input', () => {
    updateTranslitFromArabicEdit();
    autoExpand(outputArabicEditable);
    if (document.getElementById('tajweedToggle').checked) applyTajweed();
});

// Auto-save after 2 seconds of inactivity
let autoSaveTimer;
mainInput.addEventListener('input', () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => { if (isAutoSaveEnabled()) autoSaveToHistory(); }, 2000);
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('suggestionsDropdown');
    if (dropdown && !dropdown.contains(e.target) && e.target !== mainInput) {
        hideSuggestions();
    }
});
