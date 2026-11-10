/**
 * LOGICRAFT PRO v3.5
 * Sanoat Darajasidagi Mantiqiy Elementlar va Sxematexnika Simulyatori
 * Mualliflik huquqi va ishlab chiquvchi: Antigravity Team
 */

// ===================== 1. AUDIO SYNTHESIZER (WEB AUDIO API) =====================
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('logicraft_sound') !== 'false';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('logicraft_sound', this.enabled ? 'true' : 'false');
    return this.enabled;
  }

  playClick(pitch = 600, duration = 0.04) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  playConnect() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.12);
    } catch (_) {}
  }

  playDelete() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.12);
    } catch (_) {}
  }

  playBuzzer() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now); // B5 note

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.08);
    } catch (_) {}
  }
}
const sound = new SoundEffects();

// ===================== 2. MANTIQIY ELEMENTLAR MA'LUMOTLAR BAZASI =====================
const GATE_DEFS = {
  // --- KIRISH & MANBALAR ---
  INPUT: {
    category: 'sources',
    name: "Mantiqiy Kalit (Input Switch)",
    symbol: "IN",
    desc: "Sxemaga doimiy 0 (Past / LOW / 0V) yoki 1 (Yuqori / HIGH / +5V) signal beradi.",
    usage: "Foydalanuvchi buyruqlari, datchik holatlari va sinov signallarini uzatish.",
    formula: "Y = Val (0 yoki 1)",
    chip: "Manual Toggle / SPST Switch",
    color: "#22c55e",
    inputs: 0, outputs: 1, w: 60, h: 42,
    evalFn: (ins, comp) => [comp.value ? 1 : 0]
  },
  PULSE: {
    category: 'sources',
    name: "Impuls Tugmasi (Push Button)",
    symbol: "⎍",
    desc: "Bosilganda bir martalik qisqa takt pulsi (1) beradi va 200ms ichida 0 ga qaytadi.",
    usage: "Triggerlarni qayta o'rnatish (Reset), qo'lda takt berish (Manual Step Clock).",
    formula: "Y = Impulse (200ms)",
    chip: "Tactile Push Button",
    color: "#10b981",
    inputs: 0, outputs: 1, w: 60, h: 42,
    evalFn: (ins, comp) => [comp.value ? 1 : 0]
  },
  CLOCK: {
    category: 'sources',
    name: "Takt Generatori (Clock)",
    symbol: "CLK",
    desc: "Davriy ravishda 0 va 1 to'g'ri burchakli meandr signali ishlab chiqaradi (chastotasi sozlanuvchi).",
    usage: "Sinxron avtomatlar, xotira registrlari, hisoblagichlar va protsessor takt chastotasini ta'minlash.",
    formula: "f = 1 Hz (Davriy meandr)",
    chip: "Kvars generatori / NE555 Astable",
    color: "#06b6d4",
    inputs: 0, outputs: 1, w: 66, h: 44,
    evalFn: (ins, comp) => [comp.value ? 1 : 0]
  },

  // --- TRIGGERLAR & XOTIRA (SXEMATEXNIKA) ---
  RS_LATCH: {
    category: 'latches',
    name: "Asinxron RS-Trigger (SR Latch)",
    symbol: "RS",
    desc: "Eng asosiy 1-bitli statik xotira katakchasi. S=1 o'rnatadi (Q=1), R=1 nollaydi (Q=0). S=R=0 holatda xotirani saqlaydi.",
    usage: "Kontakt titrashini yo'qotish (Debounce), statik xotira (SRAM) katakchalari, avtomatika relelarini Start/Stop boshqarish.",
    formula: "Q(t+1) = S + R̄·Q(t); Taqiqlangan: S=1, R=1",
    chip: "74HC279 / 2x NOR yoki 2x NAND",
    color: "#f43f5e",
    inputs: 2, outputs: 2, w: 82, h: 62,
    inputLabels: ['S', 'R'],
    outputLabels: ['Q', 'Q̄'],
    evalFn: (ins, comp) => {
      const S = ins[0] || 0;
      const R = ins[1] || 0;
      if (!comp.state) comp.state = { q: 0 };
      if (S === 1 && R === 0) comp.state.q = 1;
      else if (S === 0 && R === 1) comp.state.q = 0;
      else if (S === 1 && R === 1) return [0, 0]; // Taqiqlangan holat
      return [comp.state.q, comp.state.q ? 0 : 1];
    }
  },
  SR_FF: {
    category: 'latches',
    name: "Sinxron SR-Trigger (Clocked SR Flip-Flop)",
    symbol: "SR-FF",
    desc: "CLK=1 bo'lgan vaqtda S va R kirishlarini qabul qiladi. CLK=0 da kirish signallari bloklanadi va holat o'zgarmaydi.",
    usage: "Sinxron xotira shinalari, taktli avtomatlar va vaqt bo'yicha cheklangan boshqaruv tizimlari.",
    formula: "CLK=1 da Q = S + R̄·Q; CLK=0 da saqlash",
    chip: "74HC74 modifikatsiyasi",
    color: "#ec4899",
    inputs: 3, outputs: 2, w: 84, h: 66,
    inputLabels: ['S', 'CLK', 'R'],
    outputLabels: ['Q', 'Q̄'],
    evalFn: (ins, comp) => {
      const S = ins[0] || 0, CLK = ins[1] || 0, R = ins[2] || 0;
      if (!comp.state) comp.state = { q: 0 };
      if (CLK === 1) {
        if (S === 1 && R === 0) comp.state.q = 1;
        else if (S === 0 && R === 1) comp.state.q = 0;
        else if (S === 1 && R === 1) return [0, 0];
      }
      return [comp.state.q, comp.state.q ? 0 : 1];
    }
  },
  D_FF: {
    category: 'latches',
    name: "D-Trigger (Data Flip-Flop)",
    symbol: "D-FF",
    desc: "CLK soat signalining ko'tariluvchi frontida (0 dan 1 ga o'tganda) D kirishidagi qiymatni qabul qilib saqlaydi. Taqiqlangan holati mavjud emas!",
    usage: "Kompyuter registrlari (CPU Registers), siljituvchi registrlar (Shift Registers), xotira buferlari.",
    formula: "Q(t+1) = D (CLK ↑ frontida)",
    chip: "74HC74 (Dual D-Type Flip-Flop)",
    color: "#d946ef",
    inputs: 2, outputs: 2, w: 84, h: 60,
    inputLabels: ['D', 'CLK'],
    outputLabels: ['Q', 'Q̄'],
    evalFn: (ins, comp) => {
      const D = ins[0] || 0, CLK = ins[1] || 0;
      if (!comp.state) comp.state = { q: 0, prevClk: 0 };
      if (CLK === 1 && comp.state.prevClk === 0) {
        comp.state.q = D;
      }
      comp.state.prevClk = CLK;
      return [comp.state.q, comp.state.q ? 0 : 1];
    }
  },
  JK_FF: {
    category: 'latches',
    name: "JK-Trigger (Universal Flip-Flop)",
    symbol: "JK-FF",
    desc: "Universal trigger. J=1, K=0 -> 1; J=0, K=1 -> 0; J=K=0 -> Saqlash; J=K=1 bo'lganda CLK frontida Q holati teskarisiga o'zgaradi (Toggle)!",
    usage: "Barcha sanoq hisoblagichlari (Binary Counters), chastota bo'lgichlar, ketma-ket boshqaruv avtomatlari.",
    formula: "Q(t+1) = J·Q̄ + K̄·Q (CLK ↑ frontida)",
    chip: "74HC73 / 74HC109",
    color: "#a855f7",
    inputs: 3, outputs: 2, w: 84, h: 66,
    inputLabels: ['J', 'CLK', 'K'],
    outputLabels: ['Q', 'Q̄'],
    evalFn: (ins, comp) => {
      const J = ins[0] || 0, CLK = ins[1] || 0, K = ins[2] || 0;
      if (!comp.state) comp.state = { q: 0, prevClk: 0 };
      if (CLK === 1 && comp.state.prevClk === 0) {
        if (J === 1 && K === 0) comp.state.q = 1;
        else if (J === 0 && K === 1) comp.state.q = 0;
        else if (J === 1 && K === 1) comp.state.q = comp.state.q ? 0 : 1; // Toggle
      }
      comp.state.prevClk = CLK;
      return [comp.state.q, comp.state.q ? 0 : 1];
    }
  },
  T_FF: {
    category: 'latches',
    name: "T-Trigger (Toggle Flip-Flop)",
    symbol: "T-FF",
    desc: "T=1 bo'lsa, har bir soat impulsida chiqish holati almashadi (0 -> 1 -> 0). Chiqish chastotasi 2 marta pasayadi.",
    usage: "Chastota bo'lgichlar, raqamli soatlar, ikkilik sanoq qurilmalari.",
    formula: "Q(t+1) = T ⊕ Q (CLK ↑ frontida)",
    chip: "JK triggerdan (J=K=T) shakllanadi",
    color: "#8b5cf6",
    inputs: 2, outputs: 2, w: 80, h: 60,
    inputLabels: ['T', 'CLK'],
    outputLabels: ['Q', 'Q̄'],
    evalFn: (ins, comp) => {
      const T = ins[0] || 0, CLK = ins[1] || 0;
      if (!comp.state) comp.state = { q: 0, prevClk: 0 };
      if (CLK === 1 && comp.state.prevClk === 0) {
        if (T === 1) comp.state.q = comp.state.q ? 0 : 1;
      }
      comp.state.prevClk = CLK;
      return [comp.state.q, comp.state.q ? 0 : 1];
    }
  },

  // --- TAYMERLAR & KECHIKISH ---
  TIMER: {
    category: 'timers',
    name: "555 Monostabil Taymer (One-Shot Timer)",
    symbol: "555-T",
    desc: "TRG kirishiga signal kelganda faollashib, belgilangan vaqt davomida (masalan 1500ms) chiqishda 1 ushlab turadi, so'ngra avtomatik 0 ga tushadi.",
    usage: "Avtomatika vaqt relesi, kechiktirib yoqish/o'chirish zanjirlari, qisqa impulslarni kengaytirish, xavfsizlik blokirovkasi.",
    formula: "T = 1.1 · R · C (Sozlanuvchi millisoniya)",
    chip: "NE555 / LM555 Precision Timer",
    color: "#eab308",
    inputs: 2, outputs: 2, w: 88, h: 62,
    inputLabels: ['TRG', 'RST'],
    outputLabels: ['OUT', 'Q̄'],
    evalFn: (ins, comp) => {
      const TRG = ins[0] || 0, RST = ins[1] || 0;
      const now = performance.now();
      if (!comp.duration) comp.duration = 1500;
      if (!comp.state) comp.state = { active: false, endTime: 0, prevTrg: 0 };

      if (RST === 1) {
        comp.state.active = false;
      } else if (TRG === 1 && comp.state.prevTrg === 0 && !comp.state.active) {
        comp.state.active = true;
        comp.state.endTime = now + comp.duration;
      }
      comp.state.prevTrg = TRG;

      if (comp.state.active && now >= comp.state.endTime) {
        comp.state.active = false;
      }
      const out = comp.state.active ? 1 : 0;
      return [out, out ? 0 : 1];
    }
  },

  // --- ASOSIY MANTIQIY ELEMENTLAR ---
  AND: {
    category: 'basic',
    name: "AND (Mantiqiy VA)",
    symbol: "&",
    desc: "Mantiqiy ko'paytirish (konyunksiya). Barcha kirishlar 1 bo'lgandagina chiqish 1 bo'ladi.",
    usage: "Ko'p shartli tekshirishlar, ruxsat signallari (Gate enable), xavfsizlik datchiklarini ketma-ket ulash.",
    formula: "Y = A · B",
    chip: "74HC08 (Quad 2-Input AND Gate)",
    color: "#3b82f6",
    inputs: 2, outputs: 1, w: 70, h: 50,
    evalFn: (ins) => [((ins[0] || 0) && (ins[1] || 0)) ? 1 : 0]
  },
  OR: {
    category: 'basic',
    name: "OR (Mantiqiy YOKI)",
    symbol: "≥1",
    desc: "Mantiqiy qo'shish (dizyunksiya). Kirishlardan kamida biri 1 bo'lsa chiqish 1 bo'ladi.",
    usage: "Avariya signallarini yig'ish, har qanday datchikdan signal o'tkazish, parallel boshqaruv.",
    formula: "Y = A + B",
    chip: "74HC32 (Quad 2-Input OR Gate)",
    color: "#6366f1",
    inputs: 2, outputs: 1, w: 70, h: 50,
    evalFn: (ins) => [((ins[0] || 0) || (ins[1] || 0)) ? 1 : 0]
  },
  NOT: {
    category: 'basic',
    name: "NOT (Invertor / Inkor)",
    symbol: "1",
    desc: "Mantiqiy inkor elementi. Kiruvchi 0 ni 1 ga, 1 ni esa 0 ga aylantirib beradi.",
    usage: "Signal qutbini o'zgartirish, teskari aloqa zanjirlari, multivibrator generatorlar.",
    formula: "Y = ¬A (Ā)",
    chip: "74HC04 (Hex Inverter)",
    color: "#ef4444",
    inputs: 1, outputs: 1, w: 60, h: 40,
    evalFn: (ins) => [(ins[0] || 0) === 1 ? 0 : 1]
  },
  NAND: {
    category: 'basic',
    name: "NAND (VA-EMAS)",
    symbol: "&̄",
    desc: "Universal mantiqiy element (Sheffer shtrixi). Barcha kirishlar 1 bo'lsagina chiqish 0 bo'ladi, qolgan hollarda 1.",
    usage: "Universal baza: faqat NAND elementlaridan istalgan murakkab mantiqiy mikrosxemani yig'ish mumkin.",
    formula: "Y = ¬(A · B)",
    chip: "74HC00 (Quad 2-Input NAND Gate)",
    color: "#06b6d4",
    inputs: 2, outputs: 1, w: 70, h: 50,
    evalFn: (ins) => [((ins[0] || 0) && (ins[1] || 0)) ? 0 : 1]
  },
  NOR: {
    category: 'basic',
    name: "NOR (YOKI-EMAS)",
    symbol: "≥1̄",
    desc: "Universal mantiqiy element (Pirs strelkasi). Barcha kirishlar 0 bo'lgandagina chiqish 1 bo'ladi.",
    usage: "Faqat NOR elementlari orqali har qanday mantiqiy funksiya va RS-triggerlarni yasash.",
    formula: "Y = ¬(A + B)",
    chip: "74HC02 (Quad 2-Input NOR Gate)",
    color: "#f59e0b",
    inputs: 2, outputs: 1, w: 70, h: 50,
    evalFn: (ins) => [((ins[0] || 0) || (ins[1] || 0)) ? 0 : 1]
  },
  XOR: {
    category: 'basic',
    name: "XOR (Eksklyuziv YOKI)",
    symbol: "=1",
    desc: "Modul 2 bo'yicha qo'shish. Kirishlar bir-biriga teng bo'lmagandagina (biri 1, ikkinchisi 0) chiqish 1 bo'ladi.",
    usage: "Ikkilik qo'shgichlar (Binary Adders), paritet (juftlik) nazorati, ma'lumotlarni shifrlash (kriptografiya).",
    formula: "Y = A ⊕ B = ĀB + AB̄",
    chip: "74HC86 (Quad 2-Input XOR Gate)",
    color: "#10b981",
    inputs: 2, outputs: 1, w: 70, h: 50,
    evalFn: (ins) => [((ins[0] || 0) ^ (ins[1] || 0))]
  },
  XNOR: {
    category: 'basic',
    name: "XNOR (Ekvivalentlik)",
    symbol: "=1̄",
    desc: "Mantiqiy tenglik indikatori. Kirish signallari bir xil bo'lganda (0=0 yoki 1=1) chiqishda 1 beradi.",
    usage: "Sonlarni solishtirish (Komparatorlar), faza mosligini aniqlash, paritet tekshiruvi.",
    formula: "Y = ¬(A ⊕ B) = AB + ĀB̄",
    chip: "74HC7266 (Quad 2-Input XNOR)",
    color: "#ec4899",
    inputs: 2, outputs: 1, w: 70, h: 50,
    evalFn: (ins) => [((ins[0] || 0) ^ (ins[1] || 0)) ? 0 : 1]
  },

  // --- ARITMETIKA & KOMMUTATSIYA ---
  HALF_ADDER: {
    category: 'compound',
    name: "Yarim Qo'shgich (Half Adder)",
    symbol: "HA",
    desc: "Ikkita 1-bitli sonni (A va B) qo'shadi. S (Sum) - yig'indi, C (Carry) - yuqori razryadga o'tish.",
    usage: "Mikroprotsessorlarning arifmetik-mantiqiy qurilmasi (ALU) va hisoblagichlarning boshlang'ich razryadi.",
    formula: "Sum = A ⊕ B, Carry = A · B",
    chip: "XOR + AND birikmasi",
    color: "#22c55e",
    inputs: 2, outputs: 2, w: 82, h: 60,
    inputLabels: ['A', 'B'],
    outputLabels: ['S', 'C'],
    evalFn: (ins) => {
      const a = ins[0] || 0, b = ins[1] || 0;
      return [a ^ b, a & b];
    }
  },
  FULL_ADDER: {
    category: 'compound',
    name: "To'liq Qo'shgich (Full Adder)",
    symbol: "FA",
    desc: "Uchta 1-bitli sonni (A, B va oldingi razryaddan o'tgan Cin) qo'shuvchi to'liq sanoat summatori.",
    usage: "Ko'p razryadli (8, 16, 32, 64-bit) qo'shish sxemalarini hosil qilish uchun ketma-ket kaskadlanadi.",
    formula: "Sum = A ⊕ B ⊕ Cin, Cout = (A·B) + (Cin·(A⊕B))",
    chip: "74HC283 (4-Bit Binary Adder)",
    color: "#14b8a6",
    inputs: 3, outputs: 2, w: 88, h: 66,
    inputLabels: ['A', 'B', 'Cin'],
    outputLabels: ['S', 'Cout'],
    evalFn: (ins) => {
      const a = ins[0] || 0, b = ins[1] || 0, cin = ins[2] || 0;
      const sum = a ^ b ^ cin;
      const cout = (a & b) | (cin & (a ^ b));
      return [sum, cout];
    }
  },
  MUX: {
    category: 'compound',
    name: "Multipleksor 2:1 (Data Selector)",
    symbol: "MUX",
    desc: "Boshqaruvchi S selektori yordamida ikkita kirish ma'lumotidan (D0 yoki D1) birini tanlab chiqishga uzatadi.",
    usage: "Ma'lumotlar shinalarini kommutatsiya qilish, marshrutizatorlar va apparat darajasidagi funksiyalar.",
    formula: "Y = (¬S · D0) + (S · D1)",
    chip: "74HC157 / 74HC151",
    color: "#a855f7",
    inputs: 3, outputs: 1, w: 78, h: 68,
    inputLabels: ['D0', 'D1', 'S'],
    outputLabels: ['Y'],
    evalFn: (ins) => {
      const d0 = ins[0] || 0, d1 = ins[1] || 0, s = ins[2] || 0;
      return [s === 1 ? d1 : d0];
    }
  },

  // --- CHIQISH VA INDIKATSIYA ---
  OUTPUT: {
    category: 'outputs',
    name: "LED Indikator (Output)",
    symbol: "LED",
    desc: "Kirish signali 1 bo'lsa yorqin yashil rangda yonadi, 0 bo'lsa xira o'chadi.",
    usage: "Mantiqiy natijalarni vizual kuzatish, avariya yoki tayyorgarlik holati ko'rsatkichi.",
    formula: "Yorug'lik = Signal 1",
    chip: "LED + 330Ω Balast Rezistor",
    color: "#f59e0b",
    inputs: 1, outputs: 0, w: 60, h: 42,
    evalFn: () => []
  },
  BUZZER: {
    category: 'outputs',
    name: "Ovozli Signalizator (Audio Buzzer)",
    symbol: "BEEP",
    desc: "Kirish signali 1 (HIGH) bo'lganda akustik signal / pyezo buzzer tovushi beradi.",
    usage: "Avariya signallari, ruxsat etilmagan holatlar, xavfsizlik va ogohlantirish tizimlari.",
    formula: "Ovoz = Kirish 1",
    chip: "Piezo Buzzer 5V",
    color: "#f43f5e",
    inputs: 1, outputs: 0, w: 64, h: 44,
    evalFn: (ins, comp) => {
      const val = ins[0] || 0;
      if (val === 1 && (!comp.state || !comp.state.wasHigh)) {
        sound.playBuzzer();
      }
      if (!comp.state) comp.state = {};
      comp.state.wasHigh = val === 1;
      return [];
    }
  },
  SEV_SEG: {
    category: 'outputs',
    name: "7-Segment Indikator (BCD Display)",
    symbol: "7-SEG",
    desc: "4-bitli ikkilik kodni (1, 2, 4, 8) qabul qilib, o'nlik (0-9) va o'n oltilik (A-F) raqamlar shaklida ko'rsatadi.",
    usage: "Hisoblagichlar, raqamli soatlar, sanoat o'lchash asboblari va kalkulyatorlar displeyi.",
    formula: "Qiymat = D0 + 2·D1 + 4·D2 + 8·D3",
    chip: "74HC4511 / 7-Segment LED Display",
    color: "#06b6d4",
    inputs: 4, outputs: 0, w: 76, h: 90,
    inputLabels: ['1', '2', '4', '8'],
    evalFn: () => []
  }
};

// ===================== 3. APPLICATION STATE =====================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap');
const minimapCtx = minimapCanvas.getContext('2d');
const analyzerCanvas = document.getElementById('analyzerCanvas');
const analyzerCtx = analyzerCanvas ? analyzerCanvas.getContext('2d') : null;

let components = [];
let wires = [];
let selectedComponent = null;
let selectedWire = null;
let hoveredComponent = null;
let hoveredPort = null;
let draggingComponent = null;
let dragOffsetX = 0, dragOffsetY = 0;
let wireStart = null;
let tempWireEnd = null;
let panX = 0, panY = 0;
let zoom = 1;
let showGrid = true;
let simulating = true;
let clockState = false;
let clockInterval = null;
let undoStack = [];
let redoStack = [];
let nextId = 1;
let isPanning = false;
let panStartX = 0, panStartY = 0;
let panStartPanX = 0, panStartPanY = 0;
let selectionBox = null;
let multiSelected = [];
let isLightTheme = localStorage.getItem('logicraft_theme') === 'light';

// Multi-touch tracking for phones/tablets
let activeTouches = {};
let initialPinchDist = 0;
let initialPinchZoom = 1;
let initialPinchMidpoint = { x: 0, y: 0 };
let touchDraggedComp = null;

// Oscilloscope History
let analyzerHistory = []; // { time, signals: { label: val } }
let analyzerOpen = false;

// Apply theme on initial load
if (isLightTheme) {
  document.body.classList.add('light-theme');
}

// ===================== 4. CANVAS RESIZE & HiDPI HANDLING =====================
function resizeCanvas() {
  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const w = container.clientWidth;
  const h = container.clientHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';

  ctx.resetTransform();
  ctx.scale(dpr, dpr);

  if (analyzerCanvas) {
    analyzerCanvas.width = (window.innerWidth - 30) * dpr;
    analyzerCanvas.height = 120 * dpr;
    analyzerCanvas.style.width = (window.innerWidth - 30) + 'px';
    analyzerCanvas.style.height = '120px';
    if (analyzerCtx) {
      analyzerCtx.resetTransform();
      analyzerCtx.scale(dpr, dpr);
    }
  }

  render();
}
window.addEventListener('resize', resizeCanvas);

function screenToWorld(sx, sy) {
  return { x: (sx - panX) / zoom, y: (sy - panY) / zoom };
}
function worldToScreen(wx, wy) {
  return { x: wx * zoom + panX, y: wy * zoom + panY };
}

// ===================== 5. FACTORY & PORTS =====================
function createComponent(type, x, y) {
  const def = GATE_DEFS[type];
  if (!def) return null;
  return {
    id: nextId++,
    type,
    x: Math.round(x / 10) * 10,
    y: Math.round(y / 10) * 10,
    w: def.w,
    h: def.h,
    inputValues: new Array(def.inputs).fill(0),
    outputValues: new Array(def.outputs).fill(0),
    value: 0,
    label: '',
    state: {},
    duration: type === 'TIMER' ? 1500 : undefined
  };
}

function getInputPorts(comp) {
  const def = GATE_DEFS[comp.type];
  const ports = [];
  for (let i = 0; i < def.inputs; i++) {
    const spacing = comp.h / (def.inputs + 1);
    ports.push({ x: comp.x, y: comp.y + spacing * (i + 1), index: i });
  }
  return ports;
}

function getOutputPorts(comp) {
  const def = GATE_DEFS[comp.type];
  const ports = [];
  for (let i = 0; i < def.outputs; i++) {
    const spacing = comp.h / (def.outputs + 1);
    ports.push({ x: comp.x + comp.w, y: comp.y + spacing * (i + 1), index: i });
  }
  return ports;
}

function findPortAt(wx, wy) {
  // Mobile touch uchun qulay kattaroq ushlash zonasi (radius 14px)
  const threshold = 14 / zoom;
  for (let i = components.length - 1; i >= 0; i--) {
    const comp = components[i];
    const outs = getOutputPorts(comp);
    for (const p of outs) {
      if (Math.hypot(wx - p.x, wy - p.y) < threshold) {
        return { componentId: comp.id, portIndex: p.index, isOutput: true, x: p.x, y: p.y };
      }
    }
    const ins = getInputPorts(comp);
    for (const p of ins) {
      if (Math.hypot(wx - p.x, wy - p.y) < threshold) {
        return { componentId: comp.id, portIndex: p.index, isOutput: false, x: p.x, y: p.y };
      }
    }
  }
  return null;
}

function findComponentAt(wx, wy) {
  for (let i = components.length - 1; i >= 0; i--) {
    const c = components[i];
    if (wx >= c.x && wx <= c.x + c.w && wy >= c.y && wy <= c.y + c.h) return c;
  }
  return null;
}

function findWireAt(wx, wy) {
  const threshold = 8 / zoom;
  for (let i = wires.length - 1; i >= 0; i--) {
    const w = wires[i];
    const fromComp = components.find(c => c.id === w.fromId);
    const toComp = components.find(c => c.id === w.toId);
    if (!fromComp || !toComp) continue;
    const fromPorts = getOutputPorts(fromComp);
    const toPorts = getInputPorts(toComp);
    if (!fromPorts[w.fromPort] || !toPorts[w.toPort]) continue;
    const x1 = fromPorts[w.fromPort].x, y1 = fromPorts[w.fromPort].y;
    const x2 = toPorts[w.toPort].x, y2 = toPorts[w.toPort].y;
    const dx = Math.abs(x2 - x1);
    const cpOffset = Math.max(30, dx * 0.4);
    for (let t = 0; t <= 1; t += 0.05) {
      const px = (1-t)**3*x1 + 3*(1-t)**2*t*(x1+cpOffset) + 3*(1-t)*t**2*(x2-cpOffset) + t**3*x2;
      const py = (1-t)**3*y1 + 3*(1-t)**2*t*y1 + 3*(1-t)*t**2*y2 + t**3*y2;
      if (Math.hypot(wx - px, wy - py) < threshold) return w;
    }
  }
  return null;
}

// ===================== 6. SIMULATION ENGINE =====================
function simulate() {
  if (!simulating) return;

  const maxPasses = 5;
  for (let pass = 0; pass < maxPasses; pass++) {
    // 1. Simlar bo'yicha signal tarqalishi
    components.forEach(comp => {
      const def = GATE_DEFS[comp.type];
      for (let i = 0; i < def.inputs; i++) {
        const wire = wires.find(w => w.toId === comp.id && w.toPort === i);
        if (wire) {
          const fromComp = components.find(c => c.id === wire.fromId);
          comp.inputValues[i] = fromComp ? (fromComp.outputValues[wire.fromPort] || 0) : 0;
        } else {
          comp.inputValues[i] = 0;
        }
      }
    });

    // 2. Har bir komponent mantig'ini hisoblash
    components.forEach(comp => {
      const def = GATE_DEFS[comp.type];
      if (def && def.evalFn) {
        comp.outputValues = def.evalFn(comp.inputValues, comp);
      }
    });
  }

  // Oscilloscope record (agar panel ochiq bo'lsa)
  if (analyzerOpen) {
    recordAnalyzerSignals();
  }
}

// Global real-time animation loop
let lastFpsTime = performance.now();
let frameCount = 0;
let currentFps = 60;

function animLoop() {
  if (simulating) {
    simulate();
  }
  render();

  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    currentFps = frameCount;
    frameCount = 0;
    lastFpsTime = now;
    const fpsEl = document.getElementById('fpsDisplay');
    if (fpsEl) fpsEl.textContent = `${currentFps} FPS`;
  }

  requestAnimationFrame(animLoop);
}

// ===================== 7. RENDERING ENGINE =====================
function drawGrid() {
  if (!showGrid) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  const gridSize = 20;
  const startX = -panX / zoom;
  const startY = -panY / zoom;
  const endX = startX + w / zoom;
  const endY = startY + h / zoom;

  const isLight = document.body.classList.contains('light-theme');
  ctx.strokeStyle = isLight ? '#e2e8f0' : '#121a2c';
  ctx.lineWidth = 0.5 / zoom;
  ctx.beginPath();
  for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
    ctx.moveTo(x, startY); ctx.lineTo(x, endY);
  }
  for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
    ctx.moveTo(startX, y); ctx.lineTo(endX, y);
  }
  ctx.stroke();

  const majorSize = 100;
  ctx.strokeStyle = isLight ? '#cbd5e1' : '#19243d';
  ctx.lineWidth = 0.8 / zoom;
  ctx.beginPath();
  for (let x = Math.floor(startX / majorSize) * majorSize; x < endX; x += majorSize) {
    ctx.moveTo(x, startY); ctx.lineTo(x, endY);
  }
  for (let y = Math.floor(startY / majorSize) * majorSize; y < endY; y += gridSize) {
    ctx.moveTo(startX, y); ctx.lineTo(endX, y);
  }
  ctx.stroke();
}

function draw7Segment(comp, x, y, w, h) {
  const val = (comp.inputValues[0] || 0) + (comp.inputValues[1] || 0) * 2 + (comp.inputValues[2] || 0) * 4 + (comp.inputValues[3] || 0) * 8;
  const hexChars = ['0','1','2','3','4','5','6','7','8','9','A','b','C','d','E','F'];
  const char = hexChars[val] || '0';
  const isLight = document.body.classList.contains('light-theme');

  ctx.save();
  ctx.fillStyle = isLight ? '#0f172a' : '#0a0e17';
  ctx.fillRect(x + 10, y + 10, w - 20, h - 28);
  ctx.strokeStyle = isLight ? '#334155' : '#1e293b';
  ctx.strokeRect(x + 10, y + 10, w - 20, h - 28);

  ctx.font = `bold 32px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = isLight ? 6 : 14;
  ctx.fillStyle = '#22d3ee';
  ctx.fillText(char, x + w / 2, y + h / 2 - 4);
  ctx.restore();

  ctx.fillStyle = isLight ? '#475569' : '#64748b';
  ctx.font = `9px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`DEC: ${val}`, x + w / 2, y + h - 6);
}

function drawGateShape(comp, def) {
  const { x, y, w, h } = comp;
  const isSelected = selectedComponent === comp || multiSelected.includes(comp);
  const isHovered = hoveredComponent === comp;
  const isLight = document.body.classList.contains('light-theme');

  ctx.save();

  // Shadow
  ctx.shadowColor = isSelected ? 'rgba(56, 189, 248, 0.45)' : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(0, 0, 0, 0.55)');
  ctx.shadowBlur = isSelected ? 14 : 7;
  ctx.shadowOffsetY = 2;

  // Body gradient
  const r = 7;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  if (isLight) {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f1f5f9');
  } else {
    grad.addColorStop(0, '#162032');
    grad.addColorStop(1, '#0c1322');
  }
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Border
  ctx.strokeStyle = isSelected ? '#38bdf8' : (isHovered ? '#60a5fa' : (isLight ? '#cbd5e1' : def.color + '70'));
  ctx.lineWidth = (isSelected ? 2.5 : 1.5) / zoom;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();

  // Top header color accent bar
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, 3.5, [r, r, 0, 0]);
  ctx.fillStyle = def.color;
  ctx.fill();
  ctx.restore();

  // Maxsus elementlar (7-Segment, LED, Switch, Timer)
  if (comp.type === 'SEV_SEG') {
    draw7Segment(comp, x, y, w, h);
  } else {
    ctx.fillStyle = def.color;
    ctx.font = `bold 13px 'Segoe UI', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.symbol, x + w / 2, y + h / 2 - (comp.label ? 6 : 2));

    if (comp.label) {
      ctx.fillStyle = isLight ? '#334155' : '#94a3b8';
      ctx.font = `9px sans-serif`;
      ctx.fillText(comp.label, x + w / 2, y + h / 2 + 10);
    } else {
      ctx.fillStyle = isLight ? '#64748b' : '#475569';
      ctx.font = `8px sans-serif`;
      ctx.fillText(comp.type, x + w / 2, y + h - 6);
    }
  }

  // Timer Progress Bar
  if (comp.type === 'TIMER' && comp.state && comp.state.active) {
    const left = Math.max(0, comp.state.endTime - performance.now());
    const pct = Math.min(1, left / (comp.duration || 1500));
    ctx.fillStyle = '#eab30830';
    ctx.fillRect(x + 5, y + h - 8, w - 10, 4);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 5, y + h - 8, (w - 10) * pct, 4);
  }

  // Invert bubbles on NOT, NAND, NOR, XNOR
  if (['NOT', 'NAND', 'NOR', 'XNOR'].includes(comp.type)) {
    const outPorts = getOutputPorts(comp);
    if (outPorts.length > 0) {
      ctx.beginPath();
      ctx.arc(outPorts[0].x + 1, outPorts[0].y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#ffffff' : '#0c1322';
      ctx.fill();
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 1.5 / zoom;
      ctx.stroke();
    }
  }

  // INPUT Switch
  if (comp.type === 'INPUT') {
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 9, 0, Math.PI * 2);
    ctx.fillStyle = comp.value ? '#22c55e' : (isLight ? '#e2e8f0' : '#1e293b');
    ctx.fill();
    ctx.strokeStyle = comp.value ? '#4ade80' : (isLight ? '#94a3b8' : '#475569');
    ctx.lineWidth = 1.5 / zoom;
    ctx.stroke();
    ctx.fillStyle = comp.value ? '#ffffff' : (isLight ? '#0f172a' : '#94a3b8');
    ctx.font = `bold 10px monospace`;
    ctx.fillText(comp.value ? '1' : '0', x + w / 2, y + h / 2);
  }

  // PULSE Button
  if (comp.type === 'PULSE') {
    ctx.beginPath();
    ctx.roundRect(x + 12, y + 10, w - 24, h - 20, 4);
    ctx.fillStyle = comp.value ? '#10b981' : (isLight ? '#e2e8f0' : '#1e293b');
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.stroke();
    ctx.fillStyle = comp.value ? '#ffffff' : (isLight ? '#0f172a' : '#cbd5e1');
    ctx.font = `bold 9px sans-serif`;
    ctx.fillText('PUSH', x + w / 2, y + h / 2);
  }

  // OUTPUT LED Bulb
  if (comp.type === 'OUTPUT') {
    const val = comp.inputValues[0] || 0;
    ctx.save();
    if (val) {
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 18;
    }
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 10, 0, Math.PI * 2);
    ctx.fillStyle = val ? '#22c55e' : (isLight ? '#e2e8f0' : '#151f30');
    ctx.fill();
    ctx.strokeStyle = val ? '#4ade80' : (isLight ? '#cbd5e1' : '#334155');
    ctx.lineWidth = 2 / zoom;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = val ? '#ffffff' : (isLight ? '#64748b' : '#64748b');
    ctx.font = `bold 10px monospace`;
    ctx.fillText(val ? '1' : '0', x + w / 2, y + h / 2);
  }

  // BUZZER Icon
  if (comp.type === 'BUZZER') {
    const val = comp.inputValues[0] || 0;
    ctx.save();
    if (val) {
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 14;
    }
    ctx.fillStyle = val ? '#f43f5e' : (isLight ? '#64748b' : '#475569');
    ctx.font = `14px sans-serif`;
    ctx.fillText(val ? '🔊' : '🔈', x + w / 2, y + h / 2);
    ctx.restore();
  }

  // CLOCK Wave
  if (comp.type === 'CLOCK') {
    ctx.strokeStyle = comp.value ? '#06b6d4' : (isLight ? '#94a3b8' : '#334155');
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + h / 2 + 3);
    ctx.lineTo(x + 18, y + h / 2 + 3);
    ctx.lineTo(x + 18, y + h / 2 - 3);
    ctx.lineTo(x + 26, y + h / 2 - 3);
    ctx.lineTo(x + 26, y + h / 2 + 3);
    ctx.lineTo(x + 34, y + h / 2 + 3);
    ctx.stroke();
  }

  // Ports
  const inPorts = getInputPorts(comp);
  const outPorts = getOutputPorts(comp);

  inPorts.forEach((p, i) => {
    const val = comp.inputValues[i] || 0;
    const isP = hoveredPort && hoveredPort.componentId === comp.id && !hoveredPort.isOutput && hoveredPort.portIndex === i;
    ctx.beginPath();
    ctx.arc(p.x, p.y, isP ? 6 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = val ? '#22c55e' : (isLight ? '#ffffff' : '#1e293b');
    ctx.fill();
    ctx.strokeStyle = isP ? '#38bdf8' : (val ? '#4ade80' : (isLight ? '#94a3b8' : '#64748b'));
    ctx.lineWidth = 1.5 / zoom;
    ctx.stroke();

    if (def.inputLabels && def.inputLabels[i]) {
      ctx.fillStyle = isLight ? '#475569' : '#94a3b8';
      ctx.font = `600 8.5px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(def.inputLabels[i], p.x - 6, p.y + 3);
    }
  });

  outPorts.forEach((p, i) => {
    const val = comp.outputValues[i] || 0;
    const isP = hoveredPort && hoveredPort.componentId === comp.id && hoveredPort.isOutput && hoveredPort.portIndex === i;
    ctx.beginPath();
    ctx.arc(p.x, p.y, isP ? 6 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = val ? '#22c55e' : (isLight ? '#ffffff' : '#1e293b');
    ctx.fill();
    ctx.strokeStyle = isP ? '#38bdf8' : (val ? '#4ade80' : (isLight ? '#94a3b8' : '#64748b'));
    ctx.lineWidth = 1.5 / zoom;
    ctx.stroke();

    if (def.outputLabels && def.outputLabels[i]) {
      ctx.fillStyle = isLight ? '#475569' : '#94a3b8';
      ctx.font = `600 8.5px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(def.outputLabels[i], p.x + 6, p.y + 3);
    }
  });
}

function drawWire(wire, isTemp = false) {
  const fromComp = components.find(c => c.id === wire.fromId);
  const toComp = isTemp ? null : components.find(c => c.id === wire.toId);
  if (!fromComp) return;

  const fromPorts = getOutputPorts(fromComp);
  if (!fromPorts[wire.fromPort]) return;
  const x1 = fromPorts[wire.fromPort].x;
  const y1 = fromPorts[wire.fromPort].y;

  let x2, y2;
  if (isTemp) {
    x2 = tempWireEnd.x;
    y2 = tempWireEnd.y;
  } else {
    if (!toComp) return;
    const toPorts = getInputPorts(toComp);
    if (!toPorts[wire.toPort]) return;
    x2 = toPorts[wire.toPort].x;
    y2 = toPorts[wire.toPort].y;
  }

  const val = fromComp.outputValues[wire.fromPort] || 0;
  const isSelected = selectedWire === wire;
  const isLight = document.body.classList.contains('light-theme');

  const dx = Math.abs(x2 - x1);
  const cpOffset = Math.max(30, dx * 0.4);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(x1 + cpOffset, y1, x2 - cpOffset, y2, x2, y2);

  if (isTemp) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }

  const wireColor = val ? (isLight ? '#16a34a' : '#22c55e') : (isLight ? '#94a3b8' : '#475569');
  ctx.strokeStyle = isSelected ? '#38bdf8' : wireColor;
  ctx.lineWidth = (isSelected ? 3.5 : 2.2) / zoom;

  if (val) {
    ctx.save();
    ctx.shadowColor = isLight ? 'rgba(22, 163, 74, 0.5)' : '#22c55e';
    ctx.shadowBlur = isLight ? 4 : 8;
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.stroke();
  }

  // Signal Flow Arrow
  if (simulating) {
    const t = 0.5;
    const mx = (1-t)**3*x1 + 3*(1-t)**2*t*(x1+cpOffset) + 3*(1-t)*t**2*(x2-cpOffset) + t**3*x2;
    const my = (1-t)**3*y1 + 3*(1-t)**2*t*y1 + 3*(1-t)*t**2*y2 + t**3*y2;

    const t2 = t + 0.02;
    const mx2 = (1-t2)**3*x1 + 3*(1-t2)**2*t2*(x1+cpOffset) + 3*(1-t2)*t2**2*(x2-cpOffset) + t2**3*x2;
    const my2 = (1-t2)**3*y1 + 3*(1-t2)**2*t2*y1 + 3*(1-t2)*t2**2*y2 + t2**3*y2;
    const angle = Math.atan2(my2 - my, mx2 - mx);

    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(-3, -3);
    ctx.lineTo(-3, 3);
    ctx.closePath();
    ctx.fillStyle = val ? (isLight ? '#16a34a' : '#22c55e') : (isLight ? '#64748b' : '#64748b');
    ctx.fill();
    ctx.restore();
  }
}

function drawSelectionBox() {
  if (!selectionBox) return;
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1 / zoom;
  ctx.setLineDash([4, 4]);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
  const x = Math.min(selectionBox.x1, selectionBox.x2);
  const y = Math.min(selectionBox.y1, selectionBox.y2);
  const w = Math.abs(selectionBox.x2 - selectionBox.x1);
  const h = Math.abs(selectionBox.y2 - selectionBox.y1);
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function render() {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(zoom, zoom);

  drawGrid();

  // Wires
  wires.forEach(w => drawWire(w));

  // In-progress wire
  if (wireStart && tempWireEnd) {
    drawWire({ fromId: wireStart.componentId, fromPort: wireStart.portIndex }, true);
  }

  // Components
  components.forEach(comp => {
    const def = GATE_DEFS[comp.type];
    if (def) drawGateShape(comp, def);
  });

  drawSelectionBox();
  ctx.restore();

  // Status updates
  const zoomEl = document.getElementById('zoomDisplay');
  if (zoomEl) zoomEl.textContent = Math.round(zoom * 100) + '%';
  const compCountEl = document.getElementById('componentCount');
  if (compCountEl) compCountEl.textContent = `Elementlar: ${components.length}`;
  const wireCountEl = document.getElementById('wireCount');
  if (wireCountEl) wireCountEl.textContent = `Simlar: ${wires.length}`;

  renderMinimap();
}

function renderMinimap() {
  if (!minimapCanvas) return;
  const mw = minimapCanvas.width;
  const mh = minimapCanvas.height;
  const isLight = document.body.classList.contains('light-theme');

  minimapCtx.clearRect(0, 0, mw, mh);
  minimapCtx.fillStyle = isLight ? '#f1f5f9' : '#090e18';
  minimapCtx.fillRect(0, 0, mw, mh);

  if (components.length === 0) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  components.forEach(c => {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x + c.w);
    maxY = Math.max(maxY, c.y + c.h);
  });

  const pad = 60;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const scale = Math.min(mw / (maxX - minX), mh / (maxY - minY));
  const offX = (mw - (maxX - minX) * scale) / 2;
  const offY = (mh - (maxY - minY) * scale) / 2;

  // Wires in minimap
  minimapCtx.strokeStyle = isLight ? '#cbd5e1' : '#223249';
  minimapCtx.lineWidth = 0.8;
  wires.forEach(w => {
    const from = components.find(c => c.id === w.fromId);
    const to = components.find(c => c.id === w.toId);
    if (!from || !to) return;
    minimapCtx.beginPath();
    minimapCtx.moveTo((from.x + from.w - minX) * scale + offX, (from.y + from.h/2 - minY) * scale + offY);
    minimapCtx.lineTo((to.x - minX) * scale + offX, (to.y + to.h/2 - minY) * scale + offY);
    minimapCtx.stroke();
  });

  // Nodes in minimap
  components.forEach(c => {
    const def = GATE_DEFS[c.type];
    minimapCtx.fillStyle = def ? def.color : '#38bdf8';
    minimapCtx.fillRect(
      (c.x - minX) * scale + offX,
      (c.y - minY) * scale + offY,
      Math.max(3, c.w * scale),
      Math.max(3, c.h * scale)
    );
  });

  // Viewport rect
  const dpr = window.devicePixelRatio || 1;
  const cw = canvas.width / dpr;
  const ch = canvas.height / dpr;
  const vpLeft = (-panX / zoom - minX) * scale + offX;
  const vpTop = (-panY / zoom - minY) * scale + offY;
  const vpW = (cw / zoom) * scale;
  const vpH = (ch / zoom) * scale;
  minimapCtx.strokeStyle = '#38bdf8';
  minimapCtx.lineWidth = 1.2;
  minimapCtx.strokeRect(vpLeft, vpTop, vpW, vpH);
}

// ===================== 8. HOVER HUD INSPECTOR =====================
const hud = document.getElementById('hudInspector');

function updateHoverHud(comp, screenX, screenY) {
  if (!hud) return;
  if (!comp) {
    hud.classList.add('hidden');
    hud.style.opacity = '0';
    return;
  }

  const def = GATE_DEFS[comp.type];
  if (!def) return;

  document.getElementById('hudTitle').textContent = def.name;
  document.getElementById('hudType').textContent = def.chip || comp.type;
  document.getElementById('hudBadge').textContent = def.category.toUpperCase();
  document.getElementById('hudDesc').textContent = def.desc;
  document.getElementById('hudUsage').textContent = def.usage;
  document.getElementById('hudFormula').textContent = def.formula;

  document.getElementById('hudInSignals').textContent = `[${comp.inputValues.join(', ')}]`;
  document.getElementById('hudOutSignals').textContent = `[${comp.outputValues.join(', ')}]`;

  const pad = 15;
  let posX = screenX + pad;
  let posY = screenY + pad;
  if (posX + 340 > window.innerWidth) posX = screenX - 350;
  if (posY + 260 > window.innerHeight) posY = screenY - 260;

  hud.style.left = `${Math.max(10, posX)}px`;
  hud.style.top = `${Math.max(10, posY)}px`;

  hud.classList.remove('hidden');
  hud.style.opacity = '1';
}

// ===================== 9. MOUSE & DESKTOP EVENT LISTENERS =====================
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const world = screenToWorld(mx, my);

  // Middle-click or Alt+click -> Pan
  if (e.button === 1 || (e.button === 0 && e.altKey)) {
    isPanning = true;
    panStartX = mx;
    panStartY = my;
    panStartPanX = panX;
    panStartPanY = panY;
    canvas.style.cursor = 'grabbing';
    e.preventDefault();
    return;
  }

  if (e.button !== 0) return;

  // Port click (wire connection)
  const port = findPortAt(world.x, world.y);
  if (port) {
    if (!wireStart) {
      wireStart = port;
      sound.playClick(800, 0.05);
      setStatus('Sim boshlang\'ich porti tanlandi. Endi ikkinchi portni bosing.');
    } else {
      if (wireStart.isOutput !== port.isOutput && wireStart.componentId !== port.componentId) {
        const from = wireStart.isOutput ? wireStart : port;
        const to = wireStart.isOutput ? port : wireStart;

        // Agar kirish portida sim bo'lsa, uni tozalab yangisiga ulaymiz
        wires = wires.filter(w => !(w.toId === to.componentId && w.toPort === to.portIndex));

        saveUndo();
        wires.push({
          fromId: from.componentId,
          fromPort: from.portIndex,
          toId: to.componentId,
          toPort: to.portIndex,
        });
        sound.playConnect();
        simulate();
        setStatus('Sim muvaffaqiyatli ulandi!');
      } else {
        setStatus('Noto\'g\'ri ulanish: Chiqish portini (o\'ng) kirish portiga (chap) ulang.');
      }
      wireStart = null;
      tempWireEnd = null;
    }
    render();
    return;
  }

  // Component click
  const comp = findComponentAt(world.x, world.y);
  if (comp) {
    if (comp.type === 'INPUT') {
      saveUndo();
      comp.value = comp.value ? 0 : 1;
      comp.outputValues = [comp.value];
      sound.playClick(comp.value ? 750 : 400);
      simulate();
      render();
    }
    if (comp.type === 'PULSE') {
      saveUndo();
      comp.value = 1;
      comp.outputValues = [1];
      sound.playClick(850, 0.08);
      simulate();
      render();
      setTimeout(() => {
        comp.value = 0;
        comp.outputValues = [0];
        simulate();
        render();
      }, 200);
    }

    if (e.shiftKey) {
      if (multiSelected.includes(comp)) multiSelected = multiSelected.filter(c => c !== comp);
      else multiSelected.push(comp);
    } else {
      if (!multiSelected.includes(comp)) multiSelected = [];
      selectedComponent = comp;
      selectedWire = null;
      showPropsPanel(comp);
    }

    draggingComponent = comp;
    dragOffsetX = world.x - comp.x;
    dragOffsetY = world.y - comp.y;
    canvas.style.cursor = 'move';
    render();
    return;
  }

  // Wire click
  const wire = findWireAt(world.x, world.y);
  if (wire) {
    selectedWire = wire;
    selectedComponent = null;
    multiSelected = [];
    hideProps();
    sound.playClick(500, 0.03);
    setStatus('Sim tanlandi. Uni o\'chirish uchun Delete bosing.');
    render();
    return;
  }

  // Deselect & box selection
  selectedComponent = null;
  selectedWire = null;
  multiSelected = [];
  hideProps();
  wireStart = null;
  tempWireEnd = null;
  selectionBox = { x1: world.x, y1: world.y, x2: world.x, y2: world.y };
  render();
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const world = screenToWorld(mx, my);

  const coordEl = document.getElementById('coordDisplay');
  if (coordEl) coordEl.textContent = `X: ${Math.round(world.x)}, Y: ${Math.round(world.y)}`;

  if (isPanning) {
    panX = panStartPanX + (mx - panStartX);
    panY = panStartPanY + (my - panStartY);
    render();
    return;
  }

  if (selectionBox) {
    selectionBox.x2 = world.x;
    selectionBox.y2 = world.y;
    const x1 = Math.min(selectionBox.x1, selectionBox.x2);
    const y1 = Math.min(selectionBox.y1, selectionBox.y2);
    const x2 = Math.max(selectionBox.x1, selectionBox.x2);
    const y2 = Math.max(selectionBox.y1, selectionBox.y2);
    multiSelected = components.filter(c => c.x >= x1 && c.x + c.w <= x2 && c.y >= y1 && c.y + c.h <= y2);
    render();
    return;
  }

  if (draggingComponent) {
    const newX = Math.round((world.x - dragOffsetX) / 10) * 10;
    const newY = Math.round((world.y - dragOffsetY) / 10) * 10;
    const dx = newX - draggingComponent.x;
    const dy = newY - draggingComponent.y;
    draggingComponent.x = newX;
    draggingComponent.y = newY;

    if (multiSelected.includes(draggingComponent)) {
      multiSelected.forEach(c => {
        if (c !== draggingComponent) {
          c.x += dx;
          c.y += dy;
        }
      });
    }
    render();
    return;
  }

  if (wireStart) {
    tempWireEnd = { x: world.x, y: world.y };
    render();
  }

  hoveredPort = findPortAt(world.x, world.y);
  const hComp = findComponentAt(world.x, world.y);
  if (hComp !== hoveredComponent) {
    hoveredComponent = hComp;
    updateHoverHud(hComp, e.clientX, e.clientY);
  } else if (hComp) {
    updateHoverHud(hComp, e.clientX, e.clientY);
  } else {
    updateHoverHud(null);
  }

  canvas.style.cursor = hoveredPort ? 'crosshair' : (hoveredComponent ? 'pointer' : 'default');
});

canvas.addEventListener('mouseup', () => {
  if (isPanning) {
    isPanning = false;
    canvas.style.cursor = 'default';
  }
  if (draggingComponent) {
    saveUndo();
    draggingComponent = null;
    canvas.style.cursor = 'default';
  }
  if (selectionBox) {
    selectionBox = null;
    render();
  }
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const oldZoom = zoom;
  if (e.deltaY < 0) {
    zoom = Math.min(zoom * 1.15, 4.5);
  } else {
    zoom = Math.max(zoom / 1.15, 0.2);
  }

  panX = mx - (mx - panX) * (zoom / oldZoom);
  panY = my - (my - panY) * (zoom / oldZoom);
  render();
}, { passive: false });

// ===================== 10. MULTI-TOUCH MOBILE ENGINE (TELEFONLAR VA PLANSHETLAR) =====================
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();

  if (e.touches.length === 1) {
    const t = e.touches[0];
    const mx = t.clientX - rect.left;
    const my = t.clientY - rect.top;
    const world = screenToWorld(mx, my);

    // 1. Port bosildimi? (Sim ulash)
    const port = findPortAt(world.x, world.y);
    if (port) {
      if (!wireStart) {
        wireStart = port;
        sound.playClick(800, 0.05);
        setStatus('Port tanlandi. Ulanadigan ikkinchi portni bosing.');
      } else {
        if (wireStart.isOutput !== port.isOutput && wireStart.componentId !== port.componentId) {
          const from = wireStart.isOutput ? wireStart : port;
          const to = wireStart.isOutput ? port : wireStart;

          wires = wires.filter(w => !(w.toId === to.componentId && w.toPort === to.portIndex));
          saveUndo();
          wires.push({
            fromId: from.componentId,
            fromPort: from.portIndex,
            toId: to.componentId,
            toPort: to.portIndex,
          });
          sound.playConnect();
          simulate();
          setStatus('Sim muvaffaqiyatli ulandi!');
        }
        wireStart = null;
        tempWireEnd = null;
      }
      render();
      return;
    }

    // 2. Komponent bosildimi? (Drag yoki Toggle)
    const comp = findComponentAt(world.x, world.y);
    if (comp) {
      if (comp.type === 'INPUT') {
        saveUndo();
        comp.value = comp.value ? 0 : 1;
        comp.outputValues = [comp.value];
        sound.playClick(comp.value ? 750 : 400);
        simulate();
      } else if (comp.type === 'PULSE') {
        saveUndo();
        comp.value = 1;
        comp.outputValues = [1];
        sound.playClick(850, 0.08);
        simulate();
        setTimeout(() => {
          comp.value = 0;
          comp.outputValues = [0];
          simulate();
          render();
        }, 200);
      }

      selectedComponent = comp;
      selectedWire = null;
      touchDraggedComp = comp;
      dragOffsetX = world.x - comp.x;
      dragOffsetY = world.y - comp.y;
      showPropsPanel(comp);
      render();
      return;
    }

    // 3. Sim bosildimi?
    const wire = findWireAt(world.x, world.y);
    if (wire) {
      selectedWire = wire;
      selectedComponent = null;
      sound.playClick(500, 0.03);
      setStatus('Sim tanlandi. Chiqindi qutisiga bosib o\'chiring.');
      render();
      return;
    }

    // 4. Bo'sh joy -> Pan tayyorligi
    isPanning = true;
    panStartX = mx;
    panStartY = my;
    panStartPanX = panX;
    panStartPanY = panY;
    selectedComponent = null;
    selectedWire = null;
    wireStart = null;
    hideProps();
    render();
  } else if (e.touches.length === 2) {
    // 2-barmoq: Pinch to Zoom & Two-finger Pan
    isPanning = false;
    touchDraggedComp = null;
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    initialPinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    initialPinchZoom = zoom;
    initialPinchMidpoint = {
      x: (t1.clientX + t2.clientX) / 2 - rect.left,
      y: (t1.clientY + t2.clientY) / 2 - rect.top,
    };
    panStartPanX = panX;
    panStartPanY = panY;
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();

  if (e.touches.length === 1) {
    const t = e.touches[0];
    const mx = t.clientX - rect.left;
    const my = t.clientY - rect.top;
    const world = screenToWorld(mx, my);

    if (touchDraggedComp) {
      touchDraggedComp.x = Math.round((world.x - dragOffsetX) / 10) * 10;
      touchDraggedComp.y = Math.round((world.y - dragOffsetY) / 10) * 10;
      render();
      return;
    }

    if (isPanning) {
      panX = panStartPanX + (mx - panStartX);
      panY = panStartPanY + (my - panStartY);
      render();
      return;
    }

    if (wireStart) {
      tempWireEnd = { x: world.x, y: world.y };
      render();
    }
  } else if (e.touches.length === 2) {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    if (initialPinchDist > 0) {
      const zoomFactor = currentDist / initialPinchDist;
      const targetZoom = Math.min(Math.max(initialPinchZoom * zoomFactor, 0.2), 4.5);

      const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const midY = (t1.clientY + t2.clientY) / 2 - rect.top;

      panX = midX - (midX - panStartPanX) * (targetZoom / initialPinchZoom);
      panY = midY - (midY - panStartPanY) * (targetZoom / initialPinchZoom);
      zoom = targetZoom;
      render();
    }
  }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  if (touchDraggedComp) {
    saveUndo();
    touchDraggedComp = null;
  }
  if (isPanning) {
    isPanning = false;
  }
  if (e.touches.length === 0) {
    initialPinchDist = 0;
  }
}, { passive: false });

// ===================== 11. KEYBOARD LISTENERS & ACCESSIBILITY =====================
document.addEventListener('keydown', (e) => {
  // Matn kiritish maydonlarida (input, textarea) bo'lsa Delete sxemani o'chirmasligi kerak
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
  if (activeTag === 'input' || activeTag === 'textarea') return;

  if (e.key === 'Delete' || e.key === 'Backspace') {
    deleteSelected();
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
  if (e.ctrlKey && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
  if (e.ctrlKey && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelected(); }
  if (e.ctrlKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    multiSelected = [...components];
    render();
    setStatus(`${components.length} ta element tanlandi`);
  }
  if (e.key === 'Escape') {
    wireStart = null;
    tempWireEnd = null;
    selectedComponent = null;
    selectedWire = null;
    multiSelected = [];
    selectionBox = null;
    hideProps();
    closeEncyclopedia();
    closeTruthTable();
    setStatus('Tayyor');
    render();
  }
});

// ===================== 12. SIDEBAR DRAG & TAP-TO-ADD =====================
document.querySelectorAll('[draggable="true"]').forEach(el => {
  // Desktop Drag-and-drop
  el.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('componentType', el.dataset.type);
    e.dataTransfer.effectAllowed = 'copy';
  });

  // Mobile & Quick Click: Tap-to-Add to viewport center
  el.addEventListener('click', () => {
    const type = el.dataset.type;
    if (!type) return;
    addComponentToCenter(type);
    // Agar mobil menyu ochiq bo'lsa, uni yopish
    closeMobileSidebar();
  });
});

canvas.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  const type = e.dataTransfer.getData('componentType');
  if (!type) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const world = screenToWorld(mx, my);

  const def = GATE_DEFS[type];
  if (!def) return;

  saveUndo();
  const comp = createComponent(type, world.x - def.w / 2, world.y - def.h / 2);
  components.push(comp);
  selectedComponent = comp;
  sound.playClick(600, 0.06);

  if (type === 'CLOCK' && !clockInterval) startClock();

  simulate();
  render();
  showPropsPanel(comp);
  setStatus(`${def.name} sxemaga qo'shildi`);
});

function addComponentToCenter(type) {
  const def = GATE_DEFS[type];
  if (!def) return;

  const dpr = window.devicePixelRatio || 1;
  const cw = canvas.width / dpr;
  const ch = canvas.height / dpr;
  const centerWorld = screenToWorld(cw / 2, ch / 2);

  // Markazga bir oz tasodifiy siljish bilan qo'shish (ustma-ust tushmasligi uchun)
  const offset = (Math.random() - 0.5) * 40;
  saveUndo();
  const comp = createComponent(type, centerWorld.x - def.w / 2 + offset, centerWorld.y - def.h / 2 + offset);
  components.push(comp);
  selectedComponent = comp;
  sound.playClick(600, 0.06);

  if (type === 'CLOCK' && !clockInterval) startClock();

  simulate();
  render();
  showPropsPanel(comp);
  setStatus(`${def.name} markazga qo'shildi`);
}

// ===================== 13. PROPERTIES PANEL =====================
function showPropsPanel(comp) {
  const panel = document.getElementById('propsPanel');
  const content = document.getElementById('propsContent');
  if (!panel || !content) return;
  const def = GATE_DEFS[comp.type];

  document.getElementById('propsTypeBadge').textContent = comp.type;

  let html = `
    <div class="bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
      <div class="text-xs font-bold text-[var(--text-main)] mb-0.5">${def.name}</div>
      <div class="text-[11px] text-[var(--text-muted)] leading-relaxed mb-2">${def.desc}</div>
      <div class="text-[10px] text-[var(--accent-cyan)] font-mono bg-[var(--bg-app)] p-1.5 rounded border border-[var(--border-subtle)]">
        <span class="text-[var(--text-faint)] font-sans">Vazifasi:</span> ${def.usage}
      </div>
    </div>

    <div>
      <label class="text-[10px] text-[var(--text-muted)] block mb-1">Maxsus Yorliq (Label)</label>
      <input type="text" value="${comp.label || ''}" placeholder="Masalan: CLK_1, Reset..." 
        onchange="updateLabel(${comp.id}, this.value)"
        class="w-full bg-[var(--bg-input)] border border-[var(--border-strong)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:border-[var(--border-focus)] focus:outline-none">
    </div>
  `;

  if (comp.type === 'TIMER') {
    html += `
      <div class="bg-[var(--bg-card)] p-2.5 rounded-lg border border-amber-500/30">
        <label class="text-[10px] font-bold text-amber-400 block mb-1">⏱ Impuls Davomiyligi (ms)</label>
        <div class="flex items-center gap-2">
          <input type="number" min="200" max="10000" step="100" value="${comp.duration || 1500}" 
            onchange="updateTimerDuration(${comp.id}, this.value)"
            class="w-24 bg-[var(--bg-input)] border border-[var(--border-strong)] rounded px-2 py-1 text-xs text-amber-400 font-mono">
          <span class="text-xs text-[var(--text-muted)]">millisoniya</span>
        </div>
      </div>
    `;
  }

  if (comp.type === 'INPUT') {
    html += `
      <div>
        <label class="text-[10px] text-[var(--text-muted)] block mb-1">Mantiqiy Holat</label>
        <button onclick="toggleInput(${comp.id})" class="w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${comp.value ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
          <span>${comp.value ? '● 1 (HIGH / +5V)' : '○ 0 (LOW / 0V)'}</span>
        </button>
      </div>
    `;
  }

  html += `
    <div class="bg-[var(--bg-app)] p-2 rounded-lg border border-[var(--border-subtle)] text-[10px] font-mono space-y-1">
      <div class="text-[var(--text-muted)] flex justify-between"><span>Kirishlar:</span> <span class="text-[var(--text-main)] font-bold">[${comp.inputValues.join(', ')}]</span></div>
      <div class="text-[var(--text-muted)] flex justify-between"><span>Chiqishlar:</span> <span class="text-emerald-400 font-bold">[${comp.outputValues.join(', ')}]</span></div>
      ${comp.state && comp.state.q !== undefined ? `<div class="text-[var(--text-muted)] flex justify-between border-t border-[var(--border-subtle)] pt-1"><span>Ichki Xotira Q:</span> <span class="text-pink-400 font-bold">${comp.state.q}</span></div>` : ''}
    </div>

    <div class="flex gap-2 pt-1">
      <button onclick="duplicateSelected()" class="flex-1 py-1.5 rounded-lg text-xs bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-main)] transition">
        📋 Nusxa olish
      </button>
      <button onclick="deleteSelected()" class="flex-1 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 transition">
        🗑 O'chirish
      </button>
    </div>
  `;

  content.innerHTML = html;
  panel.classList.remove('hidden');
}

function hideProps() {
  const panel = document.getElementById('propsPanel');
  if (panel) panel.classList.add('hidden');
}

function updateLabel(id, label) {
  const comp = components.find(c => c.id === id);
  if (comp) { comp.label = label; render(); }
}

function updateTimerDuration(id, val) {
  const comp = components.find(c => c.id === id);
  if (comp) {
    comp.duration = Math.max(100, parseInt(val) || 1500);
    if (comp.state) comp.state.duration = comp.duration;
  }
}

function toggleInput(id) {
  const comp = components.find(c => c.id === id);
  if (comp) {
    saveUndo();
    comp.value = comp.value ? 0 : 1;
    comp.outputValues = [comp.value];
    sound.playClick(comp.value ? 750 : 400);
    simulate();
    render();
    showPropsPanel(comp);
  }
}

// ===================== 14. SIMULATION CONTROLS & CLOCK =====================
function toggleSimulation() {
  simulating = !simulating;
  const btn = document.getElementById('simBtn');
  const icon = document.getElementById('simIcon');
  const text = document.getElementById('simText');

  if (simulating) {
    icon.textContent = '⏸';
    text.textContent = 'Simulyatsiya Faol';
    btn.className = 'btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm';
    if (components.some(c => c.type === 'CLOCK') && !clockInterval) startClock();
    setStatus('Simulyatsiya davom etmoqda...');
  } else {
    icon.textContent = '▶';
    text.textContent = 'Pauzada';
    btn.className = 'btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm';
    if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
    setStatus('Simulyatsiya to\'xtatildi');
  }
}

function startClock() {
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(() => {
    clockState = !clockState;
    components.filter(c => c.type === 'CLOCK').forEach(c => {
      c.value = clockState ? 1 : 0;
      c.outputValues = [c.value];
    });
    if (simulating) simulate();
  }, 500);
}
startClock();

// ===================== 15. THEME TOGGLE (DARK / LIGHT MODE) =====================
function toggleTheme() {
  isLightTheme = !isLightTheme;
  if (isLightTheme) {
    document.body.classList.add('light-theme');
    localStorage.setItem('logicraft_theme', 'light');
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.textContent = '☀️';
    setStatus('Yoriq mavzu (Light Mode) yoqildi');
  } else {
    document.body.classList.remove('light-theme');
    localStorage.setItem('logicraft_theme', 'dark');
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.textContent = '🌙';
    setStatus('Qorong\'u mavzu (Dark Mode) yoqildi');
  }
  render();
}

// Sound toggle
function toggleSound() {
  const isEnabled = sound.toggle();
  const btn = document.getElementById('soundBtn');
  if (btn) btn.textContent = isEnabled ? '🔊' : '🔇';
  setStatus(isEnabled ? 'Ovozli effektlar yoqildi' : 'Ovoz o\'chirildi');
}

// ===================== 16. DUPLICATE, UNDO, REDO & DELETION =====================
function duplicateSelected() {
  const target = selectedComponent;
  if (!target) return;
  saveUndo();

  const def = GATE_DEFS[target.type];
  const newComp = createComponent(target.type, target.x + 30, target.y + 30);
  newComp.value = target.value;
  newComp.label = target.label ? `${target.label}_copy` : '';
  newComp.duration = target.duration;

  components.push(newComp);
  selectedComponent = newComp;
  sound.playClick(700, 0.05);
  simulate();
  render();
  showPropsPanel(newComp);
  setStatus(`${def.name} nusxasi olindi`);
}

function deleteSelected() {
  saveUndo();
  const toDelete = multiSelected.length > 0 ? multiSelected : (selectedComponent ? [selectedComponent] : []);

  if (selectedWire && toDelete.length === 0) {
    wires = wires.filter(w => w !== selectedWire);
    selectedWire = null;
    sound.playDelete();
    simulate();
    render();
    setStatus('Sim olib tashlandi');
    return;
  }

  if (toDelete.length > 0) {
    const ids = toDelete.map(c => c.id);
    components = components.filter(c => !ids.includes(c.id));
    wires = wires.filter(w => !ids.includes(w.fromId) && !ids.includes(w.toId));
    selectedComponent = null;
    multiSelected = [];
    hideProps();
    sound.playDelete();
    simulate();
    render();
    setStatus(`${toDelete.length} ta element o'chirildi`);
  }
}

function zoomIn() { zoom = Math.min(zoom * 1.2, 4.5); render(); }
function zoomOut() { zoom = Math.max(zoom / 1.2, 0.2); render(); }
function resetView() { panX = 0; panY = 0; zoom = 1; render(); }
function toggleGrid() {
  showGrid = !showGrid;
  const btn = document.getElementById('gridBtn');
  if (btn) btn.className = showGrid ? 'btn p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-strong)] text-blue-400' : 'btn p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-faint)]';
  render();
}

function newCircuit() {
  if (components.length > 0 && !confirm('Diqqat! Barcha elementlar tozalanadi. Yangi toza sxema boshlaysizmi?')) return;
  saveUndo();
  components = [];
  wires = [];
  selectedComponent = null;
  selectedWire = null;
  multiSelected = [];
  nextId = 1;
  hideProps();
  simulate();
  render();
  setStatus('Yangi toza ish stoli yaratildi');
}

function saveCircuit() {
  const data = {
    version: '3.5',
    name: 'LogiCraft Circuit',
    created: new Date().toISOString(),
    components: components.map(c => ({
      id: c.id, type: c.type, x: c.x, y: c.y,
      value: c.value, label: c.label, duration: c.duration
    })),
    wires: wires.map(w => ({
      fromId: w.fromId, fromPort: w.fromPort,
      toId: w.toId, toPort: w.toPort,
    })),
    nextId,
    view: { panX, panY, zoom },
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `logic_circuit_${Date.now()}.json`;
  a.click();
  setStatus('Sxema JSON faylga saqlandi!');
}

function loadCircuit() {
  document.getElementById('fileInput').click();
}

function handleFileLoad(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      saveUndo();
      components = data.components.map(c => {
        const def = GATE_DEFS[c.type];
        return {
          ...c,
          w: def ? def.w : 70,
          h: def ? def.h : 50,
          inputValues: new Array(def ? def.inputs : 2).fill(0),
          outputValues: new Array(def ? def.outputs : 1).fill(0),
          state: {}
        };
      });
      wires = data.wires || [];
      nextId = data.nextId || Math.max(...components.map(c => c.id), 0) + 1;
      if (data.view) {
        panX = data.view.panX || 0;
        panY = data.view.panY || 0;
        zoom = data.view.zoom || 1;
      }
      simulate();
      render();
      setStatus('Sxema fayldan muvaffaqiyatli yuklandi');
    } catch (err) {
      alert('Faylni yuklashda xatolik: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// Export Canvas to PNG
function exportPNG() {
  if (components.length === 0) {
    alert('Eksport qilish uchun sxemada kamida bitta element bo\'lishi kerak.');
    return;
  }

  // Elementlar chegarasini aniqlash
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  components.forEach(c => {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x + c.w);
    maxY = Math.max(maxY, c.y + c.h);
  });

  const pad = 50;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const w = maxX - minX;
  const h = maxY - minY;

  const offCanvas = document.createElement('canvas');
  const dpr = 2; // High-resolution export
  offCanvas.width = w * dpr;
  offCanvas.height = h * dpr;
  const oCtx = offCanvas.getContext('2d');
  oCtx.scale(dpr, dpr);

  const isLight = document.body.classList.contains('light-theme');
  oCtx.fillStyle = isLight ? '#ffffff' : '#070b14';
  oCtx.fillRect(0, 0, w, h);

  oCtx.save();
  oCtx.translate(-minX, -minY);

  // Wires
  wires.forEach(wire => {
    const fromComp = components.find(c => c.id === wire.fromId);
    const toComp = components.find(c => c.id === wire.toId);
    if (!fromComp || !toComp) return;
    const fp = getOutputPorts(fromComp)[wire.fromPort];
    const tp = getInputPorts(toComp)[wire.toPort];
    if (!fp || !tp) return;
    const dx = Math.abs(tp.x - fp.x);
    const cp = Math.max(30, dx * 0.4);
    const val = fromComp.outputValues[wire.fromPort] || 0;

    oCtx.beginPath();
    oCtx.moveTo(fp.x, fp.y);
    oCtx.bezierCurveTo(fp.x + cp, fp.y, tp.x - cp, tp.y, tp.x, tp.y);
    oCtx.strokeStyle = val ? (isLight ? '#16a34a' : '#22c55e') : (isLight ? '#94a3b8' : '#475569');
    oCtx.lineWidth = 2.2;
    oCtx.stroke();
  });

  // Components
  components.forEach(comp => {
    const def = GATE_DEFS[comp.type];
    if (!def) return;
    const { x, y, w, h } = comp;
    oCtx.save();
    oCtx.beginPath();
    oCtx.roundRect(x, y, w, h, 7);
    oCtx.fillStyle = isLight ? '#f8fafc' : '#141d2e';
    oCtx.fill();
    oCtx.strokeStyle = def.color;
    oCtx.lineWidth = 1.5;
    oCtx.stroke();

    oCtx.fillStyle = def.color;
    oCtx.font = `bold 13px sans-serif`;
    oCtx.textAlign = 'center';
    oCtx.textBaseline = 'middle';
    oCtx.fillText(def.symbol, x + w / 2, y + h / 2);
    oCtx.restore();
  });

  oCtx.restore();

  // Watermark
  oCtx.fillStyle = isLight ? '#94a3b8' : '#475569';
  oCtx.font = '11px sans-serif';
  oCtx.textAlign = 'right';
  oCtx.fillText('LogiCraft Pro v3.5', w - 15, h - 15);

  const a = document.createElement('a');
  a.download = `logicraft_circuit_${Date.now()}.png`;
  a.href = offCanvas.toDataURL('image/png');
  a.click();
  setStatus('Sxema PNG rasm sifatida yuklab olindi!');
}

function getState() {
  return JSON.stringify({
    components: components.map(c => ({ ...c, state: {} })),
    wires: wires.map(w => ({ ...w })),
    nextId,
  });
}

function restoreState(state) {
  const data = JSON.parse(state);
  components = data.components.map(c => {
    const def = GATE_DEFS[c.type];
    return { ...c, w: def ? def.w : 70, h: def ? def.h : 50, state: {} };
  });
  wires = data.wires;
  nextId = data.nextId;
  selectedComponent = null;
  selectedWire = null;
  multiSelected = [];
  hideProps();
  simulate();
  render();
}

function saveUndo() {
  undoStack.push(getState());
  if (undoStack.length > 40) undoStack.shift();
  redoStack = [];
  // Autosave to localStorage
  try {
    localStorage.setItem('logicraft_autosave', getState());
  } catch (_) {}
}

function undo() {
  if (undoStack.length === 0) return;
  redoStack.push(getState());
  restoreState(undoStack.pop());
  sound.playClick(400, 0.04);
  setStatus('Amal bekor qilindi (Undo)');
}

function redo() {
  if (redoStack.length === 0) return;
  undoStack.push(getState());
  restoreState(redoStack.pop());
  sound.playClick(600, 0.04);
  setStatus('Amal qaytarildi (Redo)');
}

function setStatus(msg) {
  const el = document.getElementById('statusMsg');
  if (el) el.textContent = msg;
}

// ===================== 17. MOBILE DRAWER MENU =====================
function toggleMobileSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebarBackdrop');
  if (sb && bd) {
    const isOpen = sb.classList.contains('open');
    if (isOpen) {
      sb.classList.remove('open');
      bd.classList.remove('open');
    } else {
      sb.classList.add('open');
      bd.classList.add('open');
    }
  }
}

function closeMobileSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebarBackdrop');
  if (sb) sb.classList.remove('open');
  if (bd) bd.classList.remove('open');
}

// ===================== 18. LOGIC ANALYZER / OSCILLOSCOPE =====================
function toggleAnalyzer() {
  analyzerOpen = !analyzerOpen;
  const drawer = document.getElementById('analyzerDrawer');
  const btn = document.getElementById('analyzerBtn');
  if (drawer) {
    if (analyzerOpen) {
      drawer.classList.remove('collapsed');
      if (btn) btn.classList.add('text-cyan-400');
      setStatus('Mantiqiy osiloskop faollashdi');
    } else {
      drawer.classList.add('collapsed');
      if (btn) btn.classList.remove('text-cyan-400');
    }
  }
}

function recordAnalyzerSignals() {
  if (!analyzerCtx) return;

  const time = performance.now();
  const sample = { time, signals: {} };

  // Kuzatiladigan elementlar (CLOCK, INPUT, OUTPUT, D_FF Q...)
  components.forEach(c => {
    if (['CLOCK', 'INPUT', 'OUTPUT', 'RS_LATCH', 'D_FF', 'JK_FF'].includes(c.type)) {
      const name = c.label || `${c.type}_${c.id}`;
      const val = c.type === 'OUTPUT' ? (c.inputValues[0] || 0) : (c.outputValues[0] || 0);
      sample.signals[name] = val;
    }
  });

  analyzerHistory.push(sample);
  if (analyzerHistory.length > 120) analyzerHistory.shift();

  renderAnalyzer();
}

function renderAnalyzer() {
  if (!analyzerCtx || !analyzerOpen) return;
  const dpr = window.devicePixelRatio || 1;
  const w = analyzerCanvas.width / dpr;
  const h = analyzerCanvas.height / dpr;

  const isLight = document.body.classList.contains('light-theme');
  analyzerCtx.clearRect(0, 0, w, h);
  analyzerCtx.fillStyle = isLight ? '#f8fafc' : '#090e18';
  analyzerCtx.fillRect(0, 0, w, h);

  if (analyzerHistory.length < 2) return;

  const signalNames = Object.keys(analyzerHistory[analyzerHistory.length - 1].signals);
  if (signalNames.length === 0) {
    analyzerCtx.fillStyle = isLight ? '#64748b' : '#475569';
    analyzerCtx.font = '11px sans-serif';
    analyzerCtx.fillText('Kuzatish uchun sxemaga CLOCK, INPUT yoki OUTPUT elementlarini qo\'shing.', 20, 30);
    return;
  }

  const rowHeight = Math.min(32, Math.floor((h - 20) / signalNames.length));
  const startX = 110;
  const plotWidth = w - startX - 20;
  const stepX = plotWidth / 120;

  signalNames.forEach((name, idx) => {
    const yBase = 25 + idx * rowHeight;
    const yHigh = yBase - 14;
    const yLow = yBase;

    // Label
    analyzerCtx.fillStyle = isLight ? '#0f172a' : '#cbd5e1';
    analyzerCtx.font = 'bold 10px monospace';
    analyzerCtx.textAlign = 'right';
    analyzerCtx.fillText(name.slice(0, 10), startX - 10, yBase - 3);

    // Guide line
    analyzerCtx.strokeStyle = isLight ? '#e2e8f0' : '#1e293b';
    analyzerCtx.lineWidth = 0.5;
    analyzerCtx.beginPath();
    analyzerCtx.moveTo(startX, yLow);
    analyzerCtx.lineTo(w - 20, yLow);
    analyzerCtx.stroke();

    // Waveform
    analyzerCtx.strokeStyle = '#06b6d4';
    analyzerCtx.lineWidth = 1.6;
    analyzerCtx.beginPath();

    let prevY = null;
    for (let i = 0; i < analyzerHistory.length; i++) {
      const val = analyzerHistory[i].signals[name] || 0;
      const x = startX + i * stepX;
      const y = val === 1 ? yHigh : yLow;

      if (i === 0) {
        analyzerCtx.moveTo(x, y);
      } else {
        if (prevY !== null && prevY !== y) {
          analyzerCtx.lineTo(x, prevY); // Vertical edge
        }
        analyzerCtx.lineTo(x, y);
      }
      prevY = y;
    }
    analyzerCtx.stroke();
  });
}

// ===================== 19. ENSIKLOPEDIYA MODAL =====================
function openEncyclopedia() {
  filterEncyclopedia('all');
  const modal = document.getElementById('encyclopediaModal');
  if (modal) modal.classList.remove('hidden');
}

function closeEncyclopedia() {
  const modal = document.getElementById('encyclopediaModal');
  if (modal) modal.classList.add('hidden');
}

function filterEncyclopedia(cat, btn) {
  const tabs = document.querySelectorAll('.enc-tab');
  tabs.forEach(t => {
    t.className = 'enc-tab px-3 py-1 rounded-md bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] text-xs';
  });

  if (btn) {
    btn.className = 'enc-tab active px-3 py-1 rounded-md bg-blue-600 text-white font-medium text-xs';
  } else if (tabs[0]) {
    tabs[0].className = 'enc-tab active px-3 py-1 rounded-md bg-blue-600 text-white font-medium text-xs';
  }

  const container = document.getElementById('encyclopediaContent');
  if (!container) return;
  let html = '';

  const entries = Object.entries(GATE_DEFS).filter(([_, def]) => {
    if (cat === 'all') return true;
    return def.category === cat;
  });

  entries.forEach(([type, def]) => {
    html += `
      <div class="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style="background:${def.color}25; border:1px solid ${def.color}50; color:${def.color}">
              ${def.symbol}
            </div>
            <div>
              <h4 class="text-sm font-bold text-[var(--text-main)]">${def.name} (${type})</h4>
              <span class="text-[10px] text-[var(--text-muted)] font-mono">Standart mikrosxema: ${def.chip || 'Standart'}</span>
            </div>
          </div>
          <span class="badge" style="background:${def.color}20; color:${def.color}; border:1px solid ${def.color}40">
            ${def.category.toUpperCase()}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
          <div class="bg-[var(--bg-app)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
            <div class="text-[10px] font-bold text-amber-400 mb-1">⚡ Nima ish qiladi (Ishlash printsipi):</div>
            <div class="text-[var(--text-main)] leading-relaxed">${def.desc}</div>
          </div>
          <div class="bg-[var(--bg-app)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
            <div class="text-[10px] font-bold text-cyan-400 mb-1">🏭 Sxematexnikadagi vazifasi (Nima uchun ishlatiladi):</div>
            <div class="text-[var(--text-main)] leading-relaxed">${def.usage}</div>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs bg-[var(--bg-card)] px-3 py-2 rounded-lg border border-[var(--border-subtle)]">
          <span class="text-[var(--text-muted)] font-mono">Mantiqiy ifoda / Formula:</span>
          <span class="font-mono text-emerald-400 font-bold">${def.formula}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function filterPalette(val) {
  const query = val.toLowerCase().trim();
  document.querySelectorAll('#paletteList .sidebar-item').forEach(el => {
    const text = el.textContent.toLowerCase();
    const type = el.dataset.type.toLowerCase();
    if (text.includes(query) || type.includes(query)) {
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  });
}

// ===================== 20. TRUTH TABLE ENGINE =====================
function showTruthTable() {
  const inputs = components.filter(c => c.type === 'INPUT');
  const outputs = components.filter(c => c.type === 'OUTPUT');

  if (inputs.length === 0 || outputs.length === 0) {
    alert('Haqiqat jadvalini tuzish uchun sxemada kamida 1 ta INPUT kaliti va 1 ta OUTPUT indikatori bo\'lishi shart!');
    return;
  }
  if (inputs.length > 7) {
    alert('Haqiqat jadvali uchun maksimum 7 ta kirish qo\'llab-quvvatlanadi (128 ta kombinatsiya).');
    return;
  }

  const n = inputs.length;
  const rows = Math.pow(2, n);
  const oldValues = inputs.map(c => c.value);

  let html = `<table class="w-full text-xs font-mono text-center border-collapse"><thead><tr class="bg-[var(--bg-card)] text-[var(--text-muted)] border-b border-[var(--border-strong)]">`;
  inputs.forEach((inp, i) => {
    html += `<th class="p-2 border-r border-[var(--border-strong)] text-cyan-400 font-bold">${inp.label || 'IN_' + (i+1)}</th>`;
  });
  outputs.forEach((out, i) => {
    html += `<th class="p-2 border-r border-[var(--border-strong)] text-amber-400 font-bold">${out.label || 'OUT_' + (i+1)}</th>`;
  });
  html += `</tr></thead><tbody>`;

  window._truthTableData = { inputs: [], outputs: [], inLabels: [], outLabels: [] };
  inputs.forEach((inp, i) => window._truthTableData.inLabels.push(inp.label || 'IN_' + (i+1)));
  outputs.forEach((out, i) => window._truthTableData.outLabels.push(out.label || 'OUT_' + (i+1)));

  for (let r = 0; r < rows; r++) {
    const inRow = [];
    for (let bit = 0; bit < n; bit++) {
      const val = (r >> (n - 1 - bit)) & 1;
      inputs[bit].value = val;
      inputs[bit].outputValues = [val];
      inRow.push(val);
    }

    simulate();

    const outRow = [];
    outputs.forEach(out => outRow.push(out.inputValues[0] || 0));

    window._truthTableData.inputs.push(inRow);
    window._truthTableData.outputs.push(outRow);

    html += `<tr class="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] transition">`;
    inRow.forEach(v => {
      html += `<td class="p-1.5 border-r border-[var(--border-subtle)] ${v ? 'text-green-400 font-bold' : 'text-[var(--text-faint)]'}">${v}</td>`;
    });
    outRow.forEach(v => {
      html += `<td class="p-1.5 border-r border-[var(--border-subtle)] ${v ? 'text-emerald-400 font-bold' : 'text-[var(--text-faint)]'}">${v}</td>`;
    });
    html += `</tr>`;
  }
  html += `</tbody></table>`;

  inputs.forEach((inp, i) => {
    inp.value = oldValues[i];
    inp.outputValues = [oldValues[i]];
  });
  simulate();
  render();

  document.getElementById('truthTableContent').innerHTML = html;
  document.getElementById('truthTableStats').textContent = `${rows} ta kombinatsiya hisoblandi (${inputs.length} kirish, ${outputs.length} chiqish)`;
  document.getElementById('truthTableModal').classList.remove('hidden');
}

function closeTruthTable() {
  document.getElementById('truthTableModal').classList.add('hidden');
}

function exportTruthTableCSV() {
  if (!window._truthTableData) return;
  const d = window._truthTableData;
  let csv = d.inLabels.join(',') + ',' + d.outLabels.join(',') + '\n';
  for (let i = 0; i < d.inputs.length; i++) {
    csv += d.inputs[i].join(',') + ',' + d.outputs[i].join(',') + '\n';
  }
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `truth_table_${Date.now()}.csv`;
  a.click();
}

// ===================== 21. SANOAT PRESETLARI (NAMUNALAR) =====================
function loadDemoPreset(type) {
  saveUndo();
  components = [];
  wires = [];
  selectedComponent = null;
  selectedWire = null;
  nextId = 1;

  if (type === 'HALF_ADDER') {
    const inA = createComponent('INPUT', 120, 110); inA.label = 'A';
    const inB = createComponent('INPUT', 120, 200); inB.label = 'B';
    const xorG = createComponent('XOR', 300, 100);
    const andG = createComponent('AND', 300, 210);
    const outS = createComponent('OUTPUT', 480, 105); outS.label = 'Sum (S)';
    const outC = createComponent('OUTPUT', 480, 215); outC.label = 'Carry (C)';

    components.push(inA, inB, xorG, andG, outS, outC);
    wires.push(
      { fromId: inA.id, fromPort: 0, toId: xorG.id, toPort: 0 },
      { fromId: inB.id, fromPort: 0, toId: xorG.id, toPort: 1 },
      { fromId: inA.id, fromPort: 0, toId: andG.id, toPort: 0 },
      { fromId: inB.id, fromPort: 0, toId: andG.id, toPort: 1 },
      { fromId: xorG.id, fromPort: 0, toId: outS.id, toPort: 0 },
      { fromId: andG.id, fromPort: 0, toId: outC.id, toPort: 0 }
    );
    setStatus('Demo 1: Yarim Qo\'shgich (Half Adder) yuklandi.');
  } else if (type === 'RS_LATCH') {
    const btnSet = createComponent('PULSE', 100, 120); btnSet.label = 'SET (S)';
    const btnRst = createComponent('PULSE', 100, 220); btnRst.label = 'RESET (R)';
    const rs = createComponent('RS_LATCH', 280, 150);
    const outQ = createComponent('OUTPUT', 460, 140); outQ.label = 'Xotira Q';
    const outQn = createComponent('OUTPUT', 460, 210); outQn.label = 'Invert Q̄';

    components.push(btnSet, btnRst, rs, outQ, outQn);
    wires.push(
      { fromId: btnSet.id, fromPort: 0, toId: rs.id, toPort: 0 },
      { fromId: btnRst.id, fromPort: 0, toId: rs.id, toPort: 1 },
      { fromId: rs.id, fromPort: 0, toId: outQ.id, toPort: 0 },
      { fromId: rs.id, fromPort: 1, toId: outQn.id, toPort: 0 }
    );
    setStatus('Demo 2: Asinxron RS-Trigger 1-Bit Xotira yuklandi.');
  } else if (type === 'D_FLIPFLOP') {
    const inD = createComponent('INPUT', 100, 120); inD.label = 'Data (D)';
    const inClk = createComponent('CLOCK', 100, 220); inClk.label = 'Clock';
    const dff = createComponent('D_FF', 290, 150);
    const outQ = createComponent('OUTPUT', 470, 140); outQ.label = 'Q (Saved)';
    const outQn = createComponent('OUTPUT', 470, 210); outQn.label = 'Q̄';

    components.push(inD, inClk, dff, outQ, outQn);
    wires.push(
      { fromId: inD.id, fromPort: 0, toId: dff.id, toPort: 0 },
      { fromId: inClk.id, fromPort: 0, toId: dff.id, toPort: 1 },
      { fromId: dff.id, fromPort: 0, toId: outQ.id, toPort: 0 },
      { fromId: dff.id, fromPort: 1, toId: outQn.id, toPort: 0 }
    );
    setStatus('Demo 3: D-Trigger Ma\'lumot Registri yuklandi.');
  } else if (type === 'JK_COUNTER') {
    const clk = createComponent('CLOCK', 80, 160); clk.label = 'Takt';
    const vcc = createComponent('INPUT', 80, 80); vcc.value = 1; vcc.label = 'HIGH (+5V)';
    const jk1 = createComponent('JK_FF', 240, 130); jk1.label = 'Bit 0';
    const jk2 = createComponent('JK_FF', 400, 130); jk2.label = 'Bit 1';
    const disp = createComponent('SEV_SEG', 580, 110); disp.label = 'Hisoblagich';

    components.push(clk, vcc, jk1, jk2, disp);
    wires.push(
      { fromId: vcc.id, fromPort: 0, toId: jk1.id, toPort: 0 },
      { fromId: clk.id, fromPort: 0, toId: jk1.id, toPort: 1 },
      { fromId: vcc.id, fromPort: 0, toId: jk1.id, toPort: 2 },
      { fromId: vcc.id, fromPort: 0, toId: jk2.id, toPort: 0 },
      { fromId: jk1.id, fromPort: 0, toId: jk2.id, toPort: 1 },
      { fromId: vcc.id, fromPort: 0, toId: jk2.id, toPort: 2 },
      { fromId: jk1.id, fromPort: 0, toId: disp.id, toPort: 0 },
      { fromId: jk2.id, fromPort: 0, toId: disp.id, toPort: 1 }
    );
    setStatus('Demo 4: 2-Bitli Ikkilik Hisoblagich va 7-Segment Displey yuklandi.');
  } else if (type === 'TIMER_555') {
    const btn = createComponent('PULSE', 100, 140); btn.label = 'Trigger (Start)';
    const rst = createComponent('INPUT', 100, 230); rst.label = 'Reset';
    const timer = createComponent('TIMER', 280, 150); timer.duration = 2000; timer.label = 'NE555 (2s)';
    const out = createComponent('OUTPUT', 470, 140); out.label = 'Chiroq';
    const buzzer = createComponent('BUZZER', 470, 220); buzzer.label = 'Signal';

    components.push(btn, rst, timer, out, buzzer);
    wires.push(
      { fromId: btn.id, fromPort: 0, toId: timer.id, toPort: 0 },
      { fromId: rst.id, fromPort: 0, toId: timer.id, toPort: 1 },
      { fromId: timer.id, fromPort: 0, toId: out.id, toPort: 0 },
      { fromId: timer.id, fromPort: 0, toId: buzzer.id, toPort: 0 }
    );
    setStatus('Demo 5: 555 Taymer Avtomatika yuklandi. Start tugmasini bosing!');
  }

  const dpr = window.devicePixelRatio || 1;
  panX = (canvas.width / dpr) / 2 - 320;
  panY = (canvas.height / dpr) / 2 - 170;
  zoom = 1;
  simulate();
  render();
}

// Boshlang'ich tekshirish: agar avtosave bo'lsa uni yuklash, aks holda RS_LATCH
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  const autosaved = localStorage.getItem('logicraft_autosave');
  if (autosaved) {
    try {
      restoreState(autosaved);
      setStatus('Oldingi sessiyadagi sxema avtomatik tiklandi');
    } catch (_) {
      loadDemoPreset('RS_LATCH');
    }
  } else {
    loadDemoPreset('RS_LATCH');
  }

  // Animation Loop boshlash
  requestAnimationFrame(animLoop);
});
