const { execSync } = require('child_process');
// [2026-02-17] تطهير العمليات القديمة لضمان سيادة النسخة الأحدث
try { execSync("pkill -9 node || true"); } catch (e) {}

const express = require('express');
const Datastore = require('nedb');
const multer = require('multer');
const path = require('path');
const app = express();

// Railway تفرض منفذها الخاص، وإلا نستخدم 7000 محلياً
const PORT = process.env.PORT || 7000; 

const db = new Datastore({ filename: 'chya_2026_pro.db', autoload: true });
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// إعداد تخزين وصولات بريدي موب
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, `CHYA_PAY_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.send(`
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
            <style>
                body { background: #020617; color: white; font-family: sans-serif; direction: rtl; text-align: center; margin: 0; padding: 20px; }
                .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 25px; margin-top: 20px; display: inline-block; width: 95%; max-width: 800px; }
                video { width: 100%; border-radius: 15px; box-shadow: 0 0 20px rgba(56, 189, 248, 0.4); background: black; }
                input, button { width: 90%; padding: 12px; margin: 10px 0; border-radius: 8px; border: none; }
                button { background: #0284c7; color: white; font-weight: bold; cursor: pointer; }
            </style>
        </head>
        <body>
            <h1 style="color: #38bdf8;">ChYA Beta 2026 Live 📹</h1>
            <p>المنصة التعليمية للأستاذ شراك هواري - Oran</p>

            <div class="glass">
                <video id="video" controls autoplay muted></video>
                <p style="color: #4ade80;">🔴 بث مباشر الآن: حصة الدعم والتقوية</p>
            </div>

            <div class="glass" style="max-width: 450px;">
                <h3 style="color: #fbbf24;">تفعيل الحساب (3000 دج)</h3>
                <form action="/register" method="POST" enctype="multipart/form-data">
                    <input type="text" name="name" placeholder="الاسم الكامل للتلميذ" required>
                    <input type="tel" name="phone" placeholder="رقم الهاتف" required>
                    <label style="color: #38bdf8; display: block; margin-top: 10px;">ارفاق وصل بريدي موب:</label>
                    <input type="file" name="receipt" accept="image/*" required style="background: none;">
                    <button type="submit">إرسال الوصل والدخول</button>
                </form>
            </div>

            <script>
                var video = document.getElementById('video');
                var videoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
                if (Hls.isSupported()) {
                    var hls = new Hls();
                    hls.loadSource(videoSrc);
                    hls.attachMedia(video);
                }
            </script>
        </body>
    `);
});

app.post('/register', upload.single('receipt'), (req, res) => {
    const student = { name: req.body.name, phone: req.body.phone, receipt: req.file.filename, date: new Date() };
    db.insert(student, () => {
        res.send('<div style="text-align:center; padding:50px; font-family:sans-serif; color:#10b981;"><h2>تم استلام طلبك بنجاح! ✅</h2><p>سيتم تفعيل البث المباشر الكامل لك بعد مراجعة الوصل.</p></div>');
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 ChYA Live & Pay Platform Active');
});
