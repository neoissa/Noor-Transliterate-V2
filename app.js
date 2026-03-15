// =====================================================================
// Noor Transliterate v3 — app.js — Full Enhancement Build
// =====================================================================
let currentMode = 'standard', surahData = [], _dailyAyahData = null, _currentQuranRef = null, _deferredPrompt = null;
const mainInput = document.getElementById('mainInput');
const output1 = document.getElementById('output1');
const outputArabicEditable = document.getElementById('outputArabicEditable');
const translationContainer = document.getElementById('translationContainer');
const outputTranslation = document.getElementById('outputTranslation');
const inputLabel = document.getElementById('inputLabel');
const apiLoading = document.getElementById('apiLoading');
const quranResults = document.getElementById('quranResults');
const keyboardGrid = document.getElementById('keyboardGrid');
const keyboardSection = document.getElementById('keyboardSection');
const aiInsightsContainer = document.getElementById('aiInsightsContainer');
const aiInsightsContent = document.getElementById('aiInsightsContent');


// =====================================================================
// EMBEDDED DICTIONARY
// =====================================================================
const embeddedDictionary = {
    "bismillah": "بِسْمِ اللَّهِ", "bismillahirrahmanirraheem": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "alhamdulillah": "الْحَمْدُ لِلَّهِ", "alhamdulillahirabbilalamin": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    "subhanallah": "سُبْحَانَ اللَّهِ", "subhanarabbiyal3azeem": "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    "subhanarabbiyal2ala": "سُبْحَانَ رَبِّيَ الْأَعْلَى", "allahuakbar": "اللَّهُ أَكْبَرُ",
    "salam": "سَلَام", "assalamualaikum": "السَّلَامُ عَلَيْكُمْ",
    "assalamualaikumwarahmatullahwabarakatuh": "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ",
    "salamalaykum": "السَّلَامُ عَلَيْكُمْ", "waalaikumassalam": "وَعَلَيْكُمُ السَّلَامُ",
    "mashallah": "مَا شَاءَ اللَّهُ", "inshallah": "إِنْ شَاءَ اللَّهُ",
    "astaghfirullah": "أَسْتَغْفِرُ اللَّهَ", "astaghfirullahalazeem": "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ",
    "innalillahi": "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
    "laahawla": "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    "hasbunallah": "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    "jazakallah": "جَزَاكَ اللَّهُ خَيْرًا", "jazakallahkhayran": "جَزَاكَ اللَّهُ خَيْرًا",
    "barakallahufik": "بَارَكَ اللَّهُ فِيكَ", "allahummabarik": "اللَّهُمَّ بَارِكْ",
    "yarhamukallah": "يَرْحَمُكَ اللَّهُ", "alhamduliilah": "الْحَمْدُ لِلَّهِ",
    "tabarakallah": "تَبَارَكَ اللَّهُ", "fi amanillah": "فِي أَمَانِ اللَّهِ",
    "tawakkaltu3alallah": "تَوَكَّلْتُ عَلَى اللَّهِ",
    "shahadah": "لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ",
    "kalimah": "لَا إِلَٰهَ إِلَّا اللَّهُ", "lailahaillallah": "لَا إِلَٰهَ إِلَّا اللَّهُ",
    "salawat": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    "allahummasalli": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ",
    "allah": "اللَّهُ", "muhammad": "مُحَمَّدٌ", "ali": "عَلِيٌّ", "hasan": "حَسَنٌ",
    "husayn": "حُسَيْنٌ", "hussain": "حُسَيْنٌ", "fatima": "فَاطِمَةُ", "zahra": "الزَّهْرَاءُ",
    "maryam": "مَرْيَمُ", "ibrahim": "إِبْرَاهِيمُ", "ismail": "إِسْمَاعِيلُ",
    "yusuf": "يُوسُفُ", "musa": "مُوسَى", "isa": "عِيسَى",
    "quran": "قُرْآن", "dua": "دُعَاء", "salat": "صَلَاة", "zakat": "زَكَاة",
    "sawm": "صَوْم", "hajj": "حَجّ", "jibreel": "جِبْرِيلُ", "jannah": "جَنَّةٌ",
    "jahannam": "جَهَنَّمُ", "akhira": "آخِرَةٌ", "tawbah": "تَوْبَةٌ", "sunnah": "سُنَّةٌ",
    "hadith": "حَدِيثٌ", "fiqh": "فِقْهٌ", "iman": "إِيمَانٌ", "ihsan": "إِحْسَانٌ",
    "ikhlas": "إِخْلَاصٌ", "taqwa": "تَقْوَى", "sabr": "صَبْرٌ", "shukr": "شُكْرٌ",
    "rahmah": "رَحْمَةٌ", "barakah": "بَرَكَةٌ", "noor": "نُورٌ", "huda": "هُدًى",
    "ar-rahman": "ٱلرَّحْمَٰنُ", "ar-raheem": "ٱلرَّحِيمُ", "al-malik": "ٱلْمَلِكُ",
    "al-quddus": "ٱلْقُدُّوسُ", "as-salam": "ٱلسَّلَامُ", "al-mumin": "ٱلْمُؤْمِنُ",
    "al-muhaymin": "ٱلْمُهَيْمِنُ", "al-aziz": "ٱلْعَزِيزُ", "al-jabbar": "ٱلْجَبَّارُ",
    "al-mutakabbir": "ٱلْمُتَكَبِّرُ", "al-khaliq": "ٱلْخَالِقُ", "al-bari": "ٱلْبَارِئُ",
    "al-musawwir": "ٱلْمُصَوِّرُ", "al-ghaffar": "ٱلْغَفَّارُ", "al-qahhar": "ٱلْقَهَّارُ",
    "al-wahhab": "ٱلْوَهَّابُ", "ar-razzaq": "ٱلرَّزَّاقُ", "al-fattah": "ٱلْفَتَّاحُ",
    "al-aleem": "ٱلْعَلِيمُ", "al-qabid": "ٱلْقَابِضُ", "al-basit": "ٱلْبَاسِطُ",
    "al-hafid": "ٱلْخَافِضُ", "ar-rafi": "ٱلرَّافِعُ", "al-muizz": "ٱلْمُعِزُّ",
    "al-mudhill": "ٱلْمُذِلُّ", "as-sami": "ٱلسَّمِيعُ", "al-baseer": "ٱلْبَصِيرُ",
    "al-hakam": "ٱلْحَكَمُ", "al-adl": "ٱلْعَدْلُ", "al-lateef": "ٱللَّطِيفُ",
    "al-khabeer": "ٱلْخَبِيرُ", "al-haleem": "ٱلْحَلِيمُ", "al-azeem": "ٱلْعَظِيمُ",
    "al-ghafoor": "ٱلْغَفُورُ", "ash-shakoor": "ٱلشَّكُورُ", "al-aliyy": "ٱلْعَلِيُّ",
    "al-kabeer": "ٱلْكَبِيرُ", "al-hafeez": "ٱلْحَفِيظُ", "al-muqeet": "ٱلْمُقِيتُ",
    "al-haseeb": "ٱلْحَسِيبُ", "al-jaleel": "ٱلْجَلِيلُ", "al-kareem": "ٱلْكَرِيمُ",
    "ar-raqeeb": "ٱلرَّقِيبُ", "al-mujeeb": "ٱلْمُجِيبُ", "al-wasi": "ٱلْوَاسِعُ",
    "al-hakeem": "ٱلْحَكِيمُ", "al-wadood": "ٱلْوَدُودُ", "al-majeed": "ٱلْمَجِيدُ",
    "al-baaith": "ٱلْبَاعِثُ", "ash-shaheed": "ٱلشَّهِيدُ", "al-haqq": "ٱلْحَقُّ",
    "al-wakeel": "ٱلْوَكِيلُ", "al-qawiyy": "ٱلْقَوِيُّ", "al-mateen": "ٱلْمَتِينُ",
    "al-waliyy": "ٱلْوَلِيُّ", "al-hameed": "ٱلْحَمِيدُ", "al-muhsi": "ٱلْمُحْصِي",
    "al-mubdi": "ٱلْمُبْدِئُ", "al-mueed": "ٱلْمُعِيدُ", "al-muhyi": "ٱلْمُحْيِي",
    "al-mumeet": "ٱلْمُمِيتُ", "al-hayy": "ٱلْحَيُّ", "al-qayyum": "ٱلْقَيُّومُ",
    "al-wajid": "ٱلْوَاجِدُ", "al-majid": "ٱلْمَاجِدُ", "al-wahid": "ٱلْوَاحِدُ",
    "al-ahad": "ٱلْأَحَدُ", "as-samad": "ٱلصَّمَدُ", "al-qadir": "ٱلْقَادِرُ",
    "al-muqtadir": "ٱلْمُقْتَدِرُ", "al-muqaddim": "ٱلْمُقَدِّمُ", "al-muakhkhir": "ٱلْمُؤَخِّرُ",
    "al-awwal": "ٱلْأَوَّلُ", "al-akhir": "ٱلْآخِرُ", "az-zahir": "ٱلظَّاهِرُ",
    "al-batin": "ٱلْبَاطِنُ", "al-wali": "ٱلْوَالِي", "al-mutaali": "ٱلْمُتَعَالِي",
    "al-barr": "ٱلْبَرُّ", "at-tawwab": "ٱلتَّوَّابُ", "al-muntaqim": "ٱلْمُنْتَقِمُ",
    "al-afuww": "ٱلْعَفُوُّ", "ar-rauf": "ٱلرَّءُوفُ", "malik-ul-mulk": "مَالِكُ الْمُلْكِ",
    "dhul-jalal": "ذُو الْجَلَالِ وَالْإِكْرَامِ", "al-muqsit": "ٱلْمُقْسِطُ",
    "al-jami": "ٱلْجَامِعُ", "al-ghani": "ٱلْغَنِيُّ", "al-mughni": "ٱلْمُغْنِي",
    "al-mani": "ٱلْمَانِعُ", "ad-darr": "ٱلضَّارُّ", "an-nafi": "ٱلنَّافِعُ",
    "an-noor": "ٱلنُّورُ", "al-hadi": "ٱلْهَادِي", "al-badi": "ٱلْبَدِيعُ",
    "al-baqi": "ٱلْبَاقِي", "al-warith": "ٱلْوَارِثُ", "ar-rasheed": "ٱلرَّشِيدُ",
    "as-saboor": "ٱلصَّبُورُ",
    "بسم الله": "بِسْمِ اللَّهِ", "بسم الله الرحمن الرحيم": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "الحمد لله": "الْحَمْدُ لِلَّهِ", "سبحان الله": "سُبْحَانَ اللَّهِ",
    "الله اكبر": "اللَّهُ أَكْبَرُ", "السلام عليكم": "السَّلَامُ عَلَيْكُمْ",
    "ما شاء الله": "مَا شَاءَ اللَّهُ", "ان شاء الله": "إِنْ شَاءَ اللَّهُ",
    "إن شاء الله": "إِنْ شَاءَ اللَّهُ", "استغفر الله": "أَسْتَغْفِرُ اللَّهَ",
    "الله": "اللَّهُ", "محمد": "مُحَمَّدٌ", "علي": "عَلِيٌّ", "حسن": "حَسَنٌ", "حسين": "حُسَيْنٌ",
    "فاطمة": "فَاطِمَةُ", "قران": "قُرْآن", "القرآن": "الْقُرْآن", "دعاء": "دُعَاء",
    "صلاة": "صَلَاة", "لا اله الا الله": "لَا إِلَٰهَ إِلَّا اللَّهُ",
    "الرحمن": "ٱلرَّحْمَٰنُ", "الرحيم": "ٱلرَّحِيمُ", "الملك": "ٱلْمَلِكُ",
    "القدوس": "ٱلْقُدُّوسُ", "الخالق": "ٱلْخَالِقُ", "الرحمة": "الرَّحْمَةُ",
    "النور": "ٱلنُّورُ", "الحق": "ٱلْحَقُّ", "الصبر": "الصَّبْرُ", "الشكر": "الشُّكْرُ",
    "التوبة": "التَّوْبَةُ", "الجنة": "الْجَنَّةُ", "الإيمان": "الْإِيمَانُ",
    "النبي": "النَّبِيُّ", "الرسول": "الرَّسُولُ"
};

// =====================================================================
// REFLECTION DICTIONARY
// =====================================================================
const reflectionDictionary = {
    "allah": "The supreme name of God. Root: A-L-H. Denotes the One who is worshipped and to whom all creation submits.",
    "الله": "The supreme name of God. Root: A-L-H. The One to whom all worship is due.",
    "salam": "Root: S-L-M (سلم). Denotes peace, wholeness, safety, and surrender. As-Salamu is one of the 99 Names of Allah.",
    "سلام": "Root: S-L-M. Peace, security, and wholeness. Islam itself derives from this root.",
    "bismillah": "Compound of Bismi (name) + Allah. The Basmala — the phrase that begins every action in Islam.",
    "بسم الله": "The invocation of divine grace. Every surah of the Quran (except At-Tawbah) begins with this phrase.",
    "alhamdulillah": "Root: H-M-D (حمد). Encompasses both intense praise and absolute gratitude.",
    "الحمد لله": "The opening phrase of Surah Al-Fatiha. Root H-M-D: gratitude encompassing both praise and thanks.",
    "subhanallah": "Root: S-B-H (سبح). To glorify, to swim, to declare free from defect.",
    "سبحان الله": "Tasbih — glorification of Allah. Root S-B-H: to be free, to swim swiftly.",
    "muhammad": "Root: H-M-D. The intensely and repeatedly praised one. The name of the final Messenger ﷺ.",
    "محمد": "Root: H-M-D. The name revealed by Allah for the final Prophet ﷺ.",
    "ali": "Root: ʿ-L-W (علو). The Most High, the Exalted.",
    "علي": "Root: ʿ-L-W. Height, elevation, supremacy.",
    "husayn": "Root: H-S-N (حسن). The diminutive of Hasan, meaning 'the beautiful.'",
    "حسين": "Root: H-S-N. Beauty, goodness. The grandson of the Prophet ﷺ.",
    "rahmah": "Root: R-H-M (رحم). Womb, unconditional mercy and grace.",
    "رحمة": "Root: R-H-M. Connected to the word for womb (rahim). Ar-Rahman and Ar-Raheem derive from this root.",
    "noor": "Root: N-W-R (نور). Light. Allah is An-Nur — the Light of the heavens and the earth (24:35).",
    "نور": "Root: N-W-R. Divine light and illumination. The Quran is described as a Noor.",
    "ar-rahman": "Root: R-H-M. The Most Gracious — encompassing all of creation with His mercy.",
    "as-salam": "Root: S-L-M. The Source of Peace and Perfection.",
    "al-khaliq": "Root: Kh-L-Q (خلق). The Creator — who brings things into existence from nothing.",
    "al-hakeem": "Root: H-K-M (حكم). The All-Wise — whose wisdom is manifested in every atom of creation.",
    "iman": "Root: A-M-N (أمن). Faith, security, trust.",
    "الإيمان": "Root: A-M-N. Faith — the secure trust and conviction in Allah.",
    "taqwa": "Root: W-Q-Y (وقى). God-consciousness, piety, inner shield.",
    "تقوى": "Root: W-Q-Y. The muttaqeen are the most honored in the sight of Allah (49:13).",
    "sabr": "Root: S-B-R (صبر). Patience, steadfastness. 'Indeed, Allah is with the patient.' (2:153)",
    "الصبر": "Root: S-B-R. The Quran mentions sabr over 90 times."
};

// =====================================================================
// TRANSLITERATION MAPS
// =====================================================================
const arToEn = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'ā', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'ḥ', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ', 'ظ': 'ẓ',
    'ع': "\u2018", 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
    'ي': 'y', 'ة': 'h', 'ى': 'ā', 'ء': "'", 'ئ': "'", 'ؤ': "'", 'ٱ': 'a',
    '\u064E': 'a', '\u064F': 'u', '\u0650': 'i', '\u0651': '', '\u0652': '',
    '\u064B': 'an', '\u064C': 'un', '\u064D': 'in', '\u0670': 'ā'
};

const arToArabizi = {
    'ا': 'a', 'أ': '2', 'إ': '2', 'آ': '2a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': '7', 'خ': '5',
    'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': '9', 'ض': '9\'', 'ط': '6', 'ظ': '6\'',
    'ع': '3', 'غ': '3\'', 'ف': 'f', 'ق': '8', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
    'ي': 'y', 'ة': 'a', 'ى': 'a', 'ء': '2', 'ئ': '2', 'ؤ': '2', 'ٱ': 'a',
    '\u064E': 'a', '\u064F': 'o', '\u0650': 'i', '\u0651': '', '\u0652': '',
    '\u064B': 'an', '\u064C': 'on', '\u064D': 'in', '\u0670': 'a', ' ': ' '
};

const chatToAr = {
    "3'": "غ", "3*": "غ", "gh": "غ", "6'": "ظ", "6*": "ظ", "zh": "ظ",
    "9'": "ض", "9*": "ض", "dh": "ض", "7'": "خ", "7*": "خ", "kh": "خ",
    "5": "خ", "sh": "ش", "ch": "ش", "4": "ش", "th": "ث", "ee": "ي",
    "oo": "و", "ou": "و", "uu": "و", "aa": "ا", "2": "أ", "3": "ع",
    "6": "ط", "7": "ح", "8": "ق", "9": "ص", "a": "ا", "b": "ب", "t": "ت",
    "j": "ج", "d": "د", "r": "ر", "z": "ز", "s": "س", "f": "ف", "k": "ك",
    "l": "ل", "m": "م", "n": "ن", "h": "ه", "w": "و", "y": "ي",
    "i": "ي", "u": "و", "e": "ا", "o": "و"
};

const keys = [
    '\u064E', '\u064F', '\u0650', '\u0651', '\u0652', '\u064B', '\u064C', '\u064D', '\u0670',
    'ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د',
    'ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط',
    'ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ', 'ذ',
    '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠', 'Space', 'Bksp'
];

// =====================================================================
// KEYBOARD
// =====================================================================
function setKeyboardTheme(theme) {
    keyboardSection.classList.remove('kb-theme-white', 'kb-theme-black');
    keyboardSection.classList.add('kb-theme-' + theme);
    localStorage.setItem('kb_theme', theme);
}
function initKeyboard() {
    keyboardGrid.innerHTML = '';
    keys.forEach(key => {
        const btn = document.createElement('button');
        let fs = 'text-xl sm:text-3xl';
        if (key === 'Space' || key === 'Bksp') fs = 'text-[10px] uppercase tracking-tighter';
        if (key === 'لا') fs = 'text-lg';
        btn.className = `keyboard-key p-2 sm:p-3 rounded-xl font-bold shadow-sm ${fs}`;
        btn.innerText = key;
        btn.onclick = () => {
            const s = mainInput.selectionStart, v = mainInput.value;
            if (key === 'Bksp') { mainInput.value = v.substring(0, Math.max(0, s - 1)) + v.substring(s); mainInput.selectionStart = mainInput.selectionEnd = Math.max(0, s - 1); }
            else if (key === 'Space') { mainInput.value = v.substring(0, s) + ' ' + v.substring(s); mainInput.selectionStart = mainInput.selectionEnd = s + 1; }
            else { mainInput.value = v.substring(0, s) + key + v.substring(s); mainInput.selectionStart = mainInput.selectionEnd = s + key.length; }
            mainInput.focus(); process();
        };
        keyboardGrid.appendChild(btn);
    });
    setKeyboardTheme(localStorage.getItem('kb_theme') || 'white');
}
document.addEventListener('keydown', e => { const btn = Array.from(keyboardGrid.children).find(b => b.innerText === e.key || (e.key === 'Backspace' && b.innerText === 'Bksp') || (e.key === ' ' && b.innerText === 'Space')); if (btn) btn.classList.add('active-key'); });
document.addEventListener('keyup', e => { const btn = Array.from(keyboardGrid.children).find(b => b.innerText === e.key || (e.key === 'Backspace' && b.innerText === 'Bksp') || (e.key === ' ' && b.innerText === 'Space')); if (btn) btn.classList.remove('active-key'); });

// =====================================================================
// CORE ENGINE
// =====================================================================
function performFormalTransliteration(text) {
    let res = '';
    for (let i = 0; i < text.length; i++) {
        const c = text[i], n = text[i + 1];
        if (n === '\u0651') { res += (arToEn[c] || '') + (arToEn[c] || ''); i++; continue; }
        if (c === 'ا' && n === 'ل' && (i === 0 || text[i - 1] === ' ')) { res += 'al-'; i++; continue; }
        if (c === 'ٱ' && n === 'ل') { res += 'al-'; i++; continue; }
        const t = arToEn[c]; res += (t !== undefined) ? t : c;
    }
    return res.charAt(0).toUpperCase() + res.slice(1);
}

function reverseTransliterate(text) {
    let res = '';
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c.charCodeAt(0) < 128) { res += c; continue; }
        const t = arToArabizi[c]; res += (t !== undefined) ? t : c;
    }
    return res;
}

function convertWordToArabic(word) {
    // Check custom dictionary first
    const custom = getCustomDict();
    if (custom[word.toLowerCase()]) return custom[word.toLowerCase()];
    let w = '', j = 0;
    const sk = Object.keys(chatToAr).sort((a, b) => b.length - a.length);
    if (word.startsWith('al-')) { w += 'ال'; j = 3; }
    while (j < word.length) { let m = false; for (const k of sk) { if (word.substring(j, j + k.length) === k) { w += chatToAr[k]; j += k.length; m = true; break; } } if (!m) { w += word[j]; j++; } }
    return w;
}

function process() {
    const text = mainInput.value;
    if (!text.trim()) { output1.value = 'Waiting...'; outputArabicEditable.value = ''; outputArabizi.value = ''; return; }
    if (currentMode === 'standard' || currentMode === 'quran') {
        if (translationContainer.classList.contains('hidden')) {
            outputArabicEditable.value = text;
            output1.value = performFormalTransliteration(text);
        }
    } else {
        let ab = '';
        text.split(/(\s+)/).forEach(p => { if (!p) return; if (/\s+/.test(p)) { ab += p; return; } ab += convertWordToArabic(p.toLowerCase()); });
        outputArabicEditable.value = ab;
        output1.value = performFormalTransliteration(ab);
    }
    outputArabizi.value = reverseTransliterate(outputArabicEditable.value);
    animateOutput();
    if (document.getElementById('tajweedToggle').checked) applyTajweed();
}

function updateTranslitFromArabicEdit() { output1.value = performFormalTransliteration(outputArabicEditable.value); outputArabizi.value = reverseTransliterate(outputArabicEditable.value); }
function animateOutput() { outputArabicEditable.classList.add('output-flash'); setTimeout(() => outputArabicEditable.classList.remove('output-flash'), 400); }

// =====================================================================
// AUTO-CORRECT & REFLECTION
// =====================================================================
function autoCorrectText() {
    let text = mainInput.value.trim(); if (!text) return;
    let words = text.split(/\s+/), rw = [], i = 0;
    const custom = getCustomDict(), merged = { ...embeddedDictionary, ...custom };
    while (i < words.length) {
        let mf = false;
        if (i <= words.length - 3) { let p = [words[i], words[i + 1], words[i + 2]].join(' '); if (merged[p.toLowerCase()]) { rw.push(merged[p.toLowerCase()]); i += 3; mf = true; continue; } if (merged[p]) { rw.push(merged[p]); i += 3; mf = true; continue; } }
        if (!mf && i <= words.length - 2) { let p = [words[i], words[i + 1]].join(' '); if (merged[p.toLowerCase()]) { rw.push(merged[p.toLowerCase()]); i += 2; mf = true; continue; } if (merged[p]) { rw.push(merged[p]); i += 2; mf = true; continue; } }
        if (!mf) { const w = words[i].toLowerCase(); rw.push(merged[w] || merged[words[i]] || words[i]); i++; }
    }
    mainInput.value = rw.join(' '); process(); showToast('✨ Harakat applied!');
}

function localReflectText() {
    const input = mainInput.value.toLowerCase().trim(); if (!input) return;
    let r = 'No specific linguistic root found. Try words like "Allah", "Bismillah", "Salam", "Ar-Rahman", or any of the 99 Names.';
    for (const k in reflectionDictionary) { if (input.includes(k.toLowerCase())) { r = reflectionDictionary[k]; break; } }
    aiInsightsContent.innerText = r; aiInsightsContainer.classList.remove('hidden');
}

// =====================================================================
// SPEECH (TTS + STT)
// =====================================================================
function speakTextNative() {
    const input = outputArabicEditable.value.trim() || mainInput.value.trim(); if (!input) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(input); u.lang = 'ar-SA'; u.rate = 0.85;
    const v = window.speechSynthesis.getVoices();
    if (v.length !== 0) window.speechSynthesis.speak(u);
    else window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.speak(u);
    showToast('🔊 Speaking...');
}

let speechRecognition = null;
function startVoiceInput() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast('⚠️ Voice input not supported in this browser'); return; }
    if (speechRecognition) { speechRecognition.stop(); speechRecognition = null; document.getElementById('voiceBtn').classList.remove('voice-recording'); return; }
    speechRecognition = new SR(); speechRecognition.lang = 'ar-SA'; speechRecognition.continuous = false; speechRecognition.interimResults = true;
    document.getElementById('voiceBtn').classList.add('voice-recording');
    speechRecognition.onresult = (e) => { let t = ''; for (let i = 0; i < e.results.length; i++)t += e.results[i][0].transcript; mainInput.value = t; process(); };
    speechRecognition.onend = () => { document.getElementById('voiceBtn').classList.remove('voice-recording'); speechRecognition = null; showToast('🎙️ Voice input complete'); };
    speechRecognition.onerror = () => { document.getElementById('voiceBtn').classList.remove('voice-recording'); speechRecognition = null; showToast('⚠️ Voice error'); };
    speechRecognition.start(); showToast('🎙️ Listening...');
}

// =====================================================================
// SHARE & COPY
// =====================================================================
async function shareContent() {
    const ar = outputArabicEditable.value.trim(), tr = output1.value.trim();
    if (!ar || tr === 'Waiting...') { showToast('⚠️ Nothing to share'); return; }
    const st = `${ar}\n${tr}\n\n— Shared via Noor Transliterate`;
    if (navigator.share) { try { await navigator.share({ title: 'Noor Transliterate', text: st }); } catch (e) { if (e.name !== 'AbortError') copyFB(st); } }
    else copyFB(st);
}
function copyFB(t) { navigator.clipboard.writeText(t).then(() => showToast('📋 Copied!')).catch(() => { const el = document.createElement('textarea'); el.value = t; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); showToast('📋 Copied!'); }); }
function pasteText() { navigator.clipboard.readText().then(t => { mainInput.value += t; process(); }).catch(() => alert('Paste manually with Ctrl+V')); }
function clearText(t) { if (t === 'input') { mainInput.value = ''; outputArabicEditable.value = ''; process(); translationContainer.classList.add('hidden'); aiInsightsContainer.classList.add('hidden'); const wbw = document.getElementById('wordByWordContainer'); if (wbw) wbw.classList.add('hidden'); } else { output1.value = 'Waiting...'; outputTranslation.innerText = ''; translationContainer.classList.add('hidden'); } }
function copyText(id) { const el = document.getElementById(id); const v = el.tagName === 'TEXTAREA' ? el.value : el.innerText; if (!v || v === 'Waiting...') return; navigator.clipboard.writeText(v).then(() => showToast('📋 Copied!')).catch(() => { const t = document.createElement('textarea'); t.value = v; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); showToast('📋 Copied!'); }); }

// =====================================================================
// TOAST & UI UTIL
// =====================================================================
let toastTimer;
function showToast(msg) { const t = document.getElementById('toastNotification'), m = document.getElementById('toastMsg'); if (!t) return; m.textContent = msg; t.classList.remove('translate-y-[150%]', 'opacity-0'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('translate-y-[150%]', 'opacity-0'), 3000); }
function changeFontSize(s) { outputArabicEditable.style.fontSize = s + 'px'; localStorage.setItem('arabic_font_size', s); }
function autoExpand(f) { f.style.height = 'inherit'; f.style.height = f.scrollHeight + 'px'; }
function toggleDarkMode() { document.documentElement.classList.toggle('dark'); const d = document.documentElement.classList.contains('dark'); localStorage.setItem('theme', d ? 'dark' : 'light'); document.getElementById('darkModeBtn').innerText = d ? '☀️' : '🌙'; }
function toggleHelp() { const p = document.getElementById('helpPanel'); if (p) p.classList.toggle('hidden'); }

// =====================================================================
// HISTORY
// =====================================================================
function saveToHistory(arabic, translit) {
    arabic = arabic || outputArabicEditable.value.trim(); translit = translit || output1.value.trim();
    if (!arabic || translit === 'Waiting...' || !translit) { showToast('⚠️ Nothing to save'); return; }
    let h = JSON.parse(localStorage.getItem('noor_history') || '[]');
    if (h.some(x => x.arabic === arabic)) { showToast('⭐ Already saved'); return; }
    h.unshift({ arabic, translit, timestamp: new Date().toLocaleString() });
    if (h.length > 30) h = h.slice(0, 30);
    localStorage.setItem('noor_history', JSON.stringify(h)); renderHistory(); showToast('⭐ Saved!');
}
function autoSaveToHistory() {
    const ar = outputArabicEditable.value.trim(), tr = output1.value.trim();
    if (ar && tr && tr !== 'Waiting...' && ar.length > 2) { let h = JSON.parse(localStorage.getItem('noor_history') || '[]'); if (!h.some(x => x.arabic === ar)) { h.unshift({ arabic: ar, translit: tr, timestamp: new Date().toLocaleString() }); if (h.length > 30) h = h.slice(0, 30); localStorage.setItem('noor_history', JSON.stringify(h)); renderHistory(); } }
}
function loadHistory(arabic) { mainInput.value = arabic; translationContainer.classList.add('hidden'); process(); mainInput.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
function deleteHistory(i) { let h = JSON.parse(localStorage.getItem('noor_history') || '[]'); h.splice(i, 1); localStorage.setItem('noor_history', JSON.stringify(h)); renderHistory(); }
function clearAllHistory() { if (!confirm('Clear all history?')) return; localStorage.removeItem('noor_history'); renderHistory(); showToast('🗑️ History cleared'); }
function toggleHistoryPanel() { const p = document.getElementById('historyPanel'), a = document.getElementById('historyArrow'); p.classList.toggle('hidden'); a.style.transform = p.classList.contains('hidden') ? '' : 'rotate(180deg)'; }
function renderHistory() {
    const list = document.getElementById('historyList'), empty = document.getElementById('historyEmpty'), h = JSON.parse(localStorage.getItem('noor_history') || '[]');
    if (h.length === 0) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden'); list.innerHTML = '';
    h.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'flex items-start justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-amber-300 transition-all cursor-pointer shadow-sm group';

        const content = document.createElement('div');
        content.className = 'flex-1 min-w-0';
        content.addEventListener('click', () => loadHistory(item.arabic));

        const pArabic = document.createElement('p');
        pArabic.className = 'text-xl arabic-text text-right text-slate-800 dark:text-white truncate';
        pArabic.textContent = item.arabic;

        const pTranslit = document.createElement('p');
        pTranslit.className = 'text-xs italic text-slate-500 dark:text-slate-400 mt-1 ltr truncate';
        pTranslit.textContent = item.translit;

        const pTime = document.createElement('p');
        pTime.className = 'text-[10px] text-slate-300 dark:text-slate-600 mt-0.5';
        pTime.textContent = item.timestamp;

        content.appendChild(pArabic);
        content.appendChild(pTranslit);
        content.appendChild(pTime);

        const delBtn = document.createElement('button');
        delBtn.className = 'text-slate-300 hover:text-red-500 transition-colors text-lg flex-shrink-0 opacity-0 group-hover:opacity-100';
        delBtn.title = 'Delete';
        delBtn.textContent = '🗑️';
        delBtn.addEventListener('click', () => deleteHistory(i));

        div.appendChild(content);
        div.appendChild(delBtn);
        list.appendChild(div);
    });
}
