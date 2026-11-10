# ⚡ LogiCraft Pro v3.5
> **Sanoat Darajasidagi Mantiqiy Elementlar va Sxematexnika Simulyatori**  
> *Mobile + Desktop moslashuvchan, Yoriq va Qorong'u rejimli, Web Audio ovozli va Osiloskopli zamonaviy veb-ilova.*

---

## 🚀 Loyihadagi Asosiy Yangiliklar va Tuzatilgan Xatolar

1. **🛠 Barcha Texnik Xatolar Tuzatildi (Bug Fixes):**
   - Ensiklopediyada eskirgan `event` obyekti to'g'irlandi (zamonaviy brauzerlarda xatoliksiz ishlash uchun).
   - Mantiqiy elementlarning barcha `evalFn` hisoblash funksiyalari null/undefined xatolaridan himoyalandi (`(ins[0] || 0)`).
   - Matn kiritish (label, taymer vaqti) maydonida `Delete` yoki `Backspace` bosilganda sxemadagi element tasodifan o'chib ketish xatosi to'g'irlandi.
   - Kirish portiga ikkita sim ulanganda paydo bo'ladigan noaniqlik bartaraf etildi (yangi sim eski simni avtomatik xavfsiz almashtiradi).
   - Retina / HiDPI ekranlarda chiziqlar va yozuvlar xiralashishi `devicePixelRatio` orqali to'liq tiniqlashtirildi.
   - `localStorage` orqali avtomatik saqlash joriy qilindi — brauzer sahifasi yangilansa ham loyihangiz yo'qolmaydi!

2. **📱 Telefon va Kompyuterga To'liq Moslashtirildi (Mobile & Desktop Responsive):**
   - **Mobil Gamburger Menyusi (Drawer):** Telefonlarda ekranni to'sib qo'ymasligi uchun chap panel yig'iladi va `☰` tugmasi orqali qulay ochiladi.
   - **Multi-Touch Sensor Boshqaruvi:**
     - 1 barmoq bilan elementlarni siljitish, kalit va tugmalarni yoqish/o'chirish.
     - Portni bosib sim chiqarish va ulanadigan ikkinchi portga oson ulash.
     - 2 barmoq bilan erkin chimchilab masshtabni o'zgartirish (Pinch-to-Zoom).
     - 2 barmoq bilan butun sxemani siljitish (Two-finger pan).
   - **Tap-to-Add:** Telefondan foydalanganda menyudagi istalgan elementga bir marta bosish bilan uni ekran markaziga qo'shish imkoniyati.
   - **Mobil Tezkor Panel:** Telefon ekranining pastki qismida element qo'shish, simulyatsiya, orqaga qaytarish va o'chirish tugmalari.

3. **🌓 Yoriq va Qorong'u Mavzu (Light & Dark Theme):**
   - Yuqori paneldagi `🌙 / ☀️` tugmasi orqali rejimlar bir zumda almashadi.
   - **Qorong'u Rejim (Cyber Slate):** Shinam neon chiziqlar, ko'zni toliqtirmaydigan qorong'u fon.
   - **Yoriq Rejim (Engineering Blueprint):** Oq qog'ozli laboratoriya sxemalari uslubi, yuqori kontrastli va chop etishga qulay.
   - Foydalanuvchi tanlovi avtomatik eslab qolinadi.

4. **✨ Kuchaytirilgan Dizayn va Yangi Qulayliklar:**
   - **Web Audio Akustik Effektlar:** Kalitlarni bosishdagi mexanik rele ovozi, sim ulanish signallari va o'chirish tovushlari (xohlasangiz `🔊/🔇` orqali o'chiriladi).
   - **Ovozli Signalizator (BUZZER):** Sxemada signal 1 bo'lganda real akustik signal beruvchi komponent.
   - **Vaqt Diagrammasi (Logic Waveform Analyzer / Osiloskop):** CLK, Triggerlar va chiqish signallarining vaqt bo'yicha to'lqin shaklini real vaqtda chizib beradi.
   - **PNG Rasm Qilib Saqlash (`📷 Rasm`):** Sxemani laboratoriya ishlari yoki hisobotlarga qo'yish uchun yuqori aniqlikda rasm formatida yuklab olish.
   - **Nusxa Olish (Duplicate / Ctrl+D):** Tanlangan elementdan bir zumda nusxa yaratish.

---

## 📂 Loyiha Fayllari Tuzilishi

```text
logicraft-pro/
├── index.html       # Bosh sahifa, responsive boshqaruv va interfeys
├── style.css        # CSS o'zgaruvchilari (Dark/Light), animatsiyalar
├── app.js           # Multi-touch dvigatel, Web Audio, Osiloskop va simulyator
├── vercel.json      # Vercel konfiguratsiyasi va xavfsizlik sarlavhalari
├── package.json     # Node.js loyiha ma'lumotlari
├── .gitignore       # Git uchun keraksiz fayllar filtri
└── README.md        # To'liq qo'llanma
```

---

## 🐙 1-QADAM: Loyihani GitHub-ga Chiqarish

1. **GitHub veb-saytiga kiring:**
   - [github.com](https://github.com) saytiga kiring.
   - **"New repository"** (Yangi repozitoriy) tugmasini bosing.
   - Repozitoriy nomini yozing, masalan: `logicraft-pro`.
   - **Public** ni tanlang (Vercel bepul ulanishi uchun).
   - **"Create repository"** tugmasini bosing.

2. **Kompyuteringiz terminalida ushbu buyruqlarni bajaring:**
   *(Loyiha papkasi: `C:\Users\Owner\.gemini\antigravity\scratch\logicraft-pro`)*

   ```powershell
   cd C:\Users\Owner\.gemini\antigravity\scratch\logicraft-pro

   # Git repozitoriyni sozlash (allaqachon init qilingan bo'lsa keyingi qatorga o'ting)
   git init
   git add .
   git commit -m "feat: LogiCraft Pro v3.5 - Mobile, Dark/Light mode, Audio, Analyzer"

   # GitHub linking (USERNAME va REPO nomingizni qo'ying):
   git branch -M main
   git remote add origin https://github.com/USERNAME/logicraft-pro.git
   git push -u origin main
   ```

*(Eslatma: Agar GitHub parolingizni so'rasa, GitHub Settings -> Developer Settings -> Personal Access Tokens orqali olingan tokendan foydalanasiz).*

---

## ▲ 2-QADAM: Loyihani Vercel-ga Chiqarish (Deploy)

### 🥇 1-Usul: GitHub orqali (Tavsiya etiladi — Avtomatik yangilanadi)
1. [vercel.com](https://vercel.com) saytiga kiring va GitHub akkauntingiz orqali tizimga kiring.
2. Bosh sahifadagi **"Add New..."** tugmasini bosib, **"Project"** ni tanlang.
3. Yangi ochilgan ro'yxatdan boya yaratgan `logicraft-pro` repozitoriyangiz yonidagi **"Import"** tugmasini bosing.
4. Framework Preset bo'limida **"Other"** (yoki default) turadi.
5. **"Deploy"** tugmasini bosing!
6. Bir necha soniya ichida loyihangiz internetda ishga tushadi va sizga `https://logicraft-pro.vercel.app` ko'rinishidagi bepul jonli havola (URL) beriladi!

---

### 🥈 2-Usul: Vercel CLI orqali (Terminaldan to'g'ridan-to'g'ri)
Agar GitHub-siz to'g'ridan-to'g'ri kompyuterdan chiqarmoqchi bo'lsangiz:

```powershell
cd C:\Users\Owner\.gemini\antigravity\scratch\logicraft-pro
npx vercel
```
Terminaldagi savollarga Enter bosib tasdiqlaysiz, bir zumda havola tayyor bo'ladi!

---

## ⌨️ Klaviatura Yorliqlari (Hotkeys)

| Tugma | Vazifasi |
|---|---|
| `Delete` / `Backspace` | Tanlangan sim yoki elementni o'chirish |
| `Ctrl + Z` | Amalni bekor qilish (Undo) |
| `Ctrl + Y` | Amalni qaytarish (Redo) |
| `Ctrl + D` | Tanlangan elementdan nusxa olish (Duplicate) |
| `Ctrl + A` | Barcha elementlarni birdaniga tanlash |
| `Esc` | Tanlovni bekor qilish / sim chizishni to'xtatish |
| `Sichqoncha g'ildiragi` | Masshtabni yaqinlashtirish / uzoqlashtirish |

---

## 🧪 O'rnatilgan Tayyor Namunalar (Presets)

1. **RS-Trigger Xotira:** Asinxron 1-bit statik SRAM xotira katakchasi (SET va RESET tugmalari).
2. **Yarim Qo'shgich (Half Adder):** 2 bitli raqamlarni qo'shuvchi XOR va AND sxemasi.
3. **D-Trigger Registr:** Soat (CLK) frontida ishlovchi protsessor registrlari asosi.
4. **2-Bitli Hisoblagich:** JK triggerlar va 7-segment indikatori orqali 0, 1, 2, 3 sanash.
5. **555 Taymer Avtomatika:** 2 soniyali monostabil vaqt relesi va ovozli sirena.
