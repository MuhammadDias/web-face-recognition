# WEB-FACE - Sistem Deteksi dan Pengenalan Wajah Akurat

Aplikasi web Flask untuk registrasi dan verifikasi wajah pasien rumah sakit. Menggunakan **InsightFace (RetinaFace + ArcFace)** untuk deteksi dan pengenalan wajah dengan akurasi tinggi.

## 🚀 Fitur Utama

- **Deteksi Wajah Akurat**: RetinaFace untuk deteksi real-time
- **Pengenalan Wajah Modern**: ArcFace embedding (512 dimensi)
- **Multi-Frame Voting**: Meningkatkan akurasi dengan analisis multiple frame
- **Face Alignment**: Normalisasi posisi wajah untuk hasil optimal
- **Auto-Fallback**: Otomatis ke LBPH jika InsightFace tidak tersedia

## 📁 Struktur Direktori

```
WEB-FACE/
├── app.py                    # Aplikasi Flask utama
├── face_engine.py            # Engine deteksi dan pengenalan wajah
├── requirements.txt          # Dependensi Python
├── database.db               # Database SQLite (auto-generated)
├── data/
│   └── database_wajah/       # Penyimpanan gambar wajah (LBPH)
├── model/
│   ├── embeddings.db         # Database embedding (InsightFace)
│   └── buffalo_l/            # Model InsightFace (auto-download)
├── templates/
│   ├── user.html
│   ├── admin_login.html
│   └── admin_dashboard.html
├── static/js/
│   ├── user.js
│   └── admin.js
├── README.md                 # Dokumentasi singkat
└── README_INSIGHTFACE.md     # Dokumentasi lengkap InsightFace
```

## 🛠️ Instalasi Cepat

```bash
# Clone repository
git clone https://github.com/lustresense/web-face.git
cd web-face

# Buat virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Jalankan aplikasi
python app.py
```

## 🔗 Akses Aplikasi

- **User**: http://127.0.0.1:5000/
- **Admin**: http://127.0.0.1:5000/admin/login
  - Username: `admin`
  - Password: `Cakra@123`

## 📊 Arsitektur Pipeline

```
Input Webcam → Deteksi (RetinaFace) → Alignment → 
Extract Embedding (ArcFace) → Normalize (L2) → 
Compare (Cosine Similarity) → Multi-Frame Voting → Output
```

## ⚙️ Konfigurasi

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `USE_INSIGHTFACE` | `1` | Set ke `0` untuk gunakan LBPH |
| `RECOGNITION_THRESHOLD` | `0.4` | Threshold similarity (0-1) |
| `DETECTION_THRESHOLD` | `0.5` | Threshold deteksi wajah |

## 📚 Dokumentasi Lengkap

Lihat **[README_INSIGHTFACE.md](README_INSIGHTFACE.md)** untuk:
- Setup detail
- Arsitektur sistem
- Tips meningkatkan akurasi
- API Reference
- Troubleshooting

## 🧪 Testing

```bash
python test_basic.py
python test_recognition_workflow.py
```

## 📝 Changelog

### v2.0.0 (Current)
- Migrasi ke InsightFace (RetinaFace + ArcFace)
- Face alignment dengan 5-point landmarks
- SQLite embedding storage
- Multi-frame voting dengan early stop
- Auto-fallback ke LBPH

### v1.0.0 (Legacy)
- Haar Cascade + LBPH

## 📄 Lisensi

Internal / Sesuai kebutuhan proyek.