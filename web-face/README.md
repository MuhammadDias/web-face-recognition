# WEB-FACE - Sistem Deteksi dan Pengenalan Wajah Akurat

Aplikasi web Flask untuk registrasi dan verifikasi wajah pasien rumah sakit. Menggunakan **InsightFace (RetinaFace + ArcFace)** untuk deteksi dan pengenalan wajah dengan akurasi tinggi, serta mendukung akselerasi GPU NVIDIA.

## 🚀 Fitur Utama

- **Deteksi Wajah Akurat**: RetinaFace untuk deteksi real-time yang presisi.
- **Pengenalan Wajah Modern**: ArcFace embedding (512 dimensi) untuk membedakan identitas.
- **Multi-Frame Voting**: Meningkatkan akurasi dengan menganalisis multiple frame sebelum mengambil keputusan.
- **Face Alignment**: Normalisasi posisi wajah (5-point landmarks) untuk hasil optimal.
- **Auto-Fallback**: Otomatis beralih ke metode ringan (LBPH) jika model berat gagal dimuat.
- **GPU Acceleration**: Mendukung NVIDIA RTX/GTX untuk performa super cepat (Real-time).

## 📁 Struktur Direktori

```text
WEB-FACE/
├── app.py                    # Aplikasi Flask utama
├── face_engine.py            # Engine deteksi dan pengenalan wajah
├── requirements.txt          # Dependensi Python (Versi Stabil)
├── database.db               # Database SQLite (auto-generated)
├── data/
│   └── database_wajah/       # Penyimpanan gambar wajah (LBPH/Backup)
├── model/
│   ├── embeddings.db         # Database embedding (InsightFace)
│   └── buffalo_l/            # Model InsightFace (auto-download)
├── templates/
│   ├── user.html             # Interface pengguna (Kiosk)
│   ├── admin_login.html      # Login Admin
│   └── admin_dashboard.html  # Dashboard Admin
├── static/js/
│   ├── user.js
│   └── admin.js
├── README.md                 # Dokumentasi utama
└── README_INSIGHTFACE.md     # Dokumentasi teknis InsightFace
```

## 🛠️ Instalasi Cepat (CPU Only)

Jika Anda hanya ingin menjalankan tanpa GPU (lebih lambat untuk InsightFace), ikuti langkah ini:

# Clone repository

git clone [https://github.com/MuhammadDias/web-face-recognition.git](https://github.com/MuhammadDias/web-face-recognition.git)
cd web-face-recognition

# Buat virtual environment

```bash
python -m venv .venv
```

# Windows:

```bash
.venv\Scripts\activate
```

# Install dependencies

```bash
pip install -r requirements.txt
```

# Jalankan aplikasi

```bash
python app.py
```

## 🚀 Instalasi GPU Support (Wajib untuk Performa Tinggi)

Aplikasi ini dioptimalkan untuk CUDA 11.8. Ikuti langkah ini agar GPU NVIDIA terbaca.

## 📋 Prasyarat Hardware

Laptop/PC dengan GPU NVIDIA (RTX/GTX).

Driver NVIDIA terbaru.

## 🛠️ Langkah 1: Install CUDA Toolkit 11.8

Versi library yang digunakan di project ini membutuhkan CUDA 11.8 (Bukan 12.x).

-Download CUDA Toolkit 11.8.
-Install exe (local) pilih mode Express.

## 📦 Langkah 2: Lengkapi File DLL (cuDNN & Zlib)

CUDA Installer tidak menyertakan cuDNN dan zlibwapi. Anda harus menambahkannya manual agar Python bisa membacanya.

Download:

-cuDNN v8.x (untuk CUDA 11.x) dari NVIDIA Developer.
-zlibwapi.dll (x64) dari sumber terpercaya (misal: dll-files.com).

Copy & Paste:
-Extract cuDNN, ambil semua file di folder bin (seperti cudnn64_8.dll, dll).
-Ambil file zlibwapi.dll.

Paste semuanya ke dalam folder instalasi CUDA:
**C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin**

## 🐍 Langkah 3: Setup Python Environment

Pastikan menggunakan versi library yang tepat (sudah diatur di [requirements.txt]).

-Buat & Aktifkan Venv

```bash
python -m venv .venv
.venv\Scripts\activate
```

-Install Library (Versi dikunci agar stabil)

# Ini akan menginstall onnxruntime-gpu versi 1.16.3 yang kompatibel dengan CUDA 11.8

```bash
pip install -r requirements.txt
```

## ✅ Langkah 4: Jalankan

```bash
python app.py
```

Jika sukses, log terminal akan menampilkan: INFO:FaceEngine:InsightFace app initialized successfully with GPU

## 🔗 Akses Aplikasi

- **User**: http://127.0.0.1:5000/
- **Admin**: http://127.0.0.1:5000/admin/login
  - Username: `admin`
  - Password: `Cakra@123`

## 📊 Arsitektur Pipeline

```
graph LR
A[Input Webcam] --> B[Deteksi RetinaFace]
B --> C[Alignment & Preprocess]
C --> D[Extract Embedding ArcFace]
D --> E[Normalize L2]
E --> F[Compare Cosine Similarity]
F --> G[Multi-Frame Voting]
G --> H[Output Hasil]
```

## ⚙️ Konfigurasi

| Variable                | Default | Deskripsi                     |
| ----------------------- | ------- | ----------------------------- |
| `USE_INSIGHTFACE`       | `1`     | Set ke `0` untuk gunakan LBPH |
| `RECOGNITION_THRESHOLD` | `0.4`   | Threshold similarity (0-1)    |
| `DETECTION_THRESHOLD`   | `0.5`   | Threshold deteksi wajah       |

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

## v2.1.0 (Current)

Fix: Kompatibilitas penuh dengan CUDA 11.8 & cuDNN 8.

Fix: Menyelesaikan konflik versi NumPy 2.0 dan OpenCV.

Feat: Dashboard Admin menampilkan status real-time penggunaan Hardware (GPU/CPU).

Feat: Dukungan Dark Mode pada UI User dan Admin.

### v2.0.0

- Migrasi ke InsightFace (RetinaFace + ArcFace)
- Face alignment dengan 5-point landmarks
- SQLite embedding storage
- Multi-frame voting dengan early stop
- Auto-fallback ke LBPH

### v1.0.0 (Legacy)

- Haar Cascade + LBPH

## 📄 Lisensi

Internal / Sesuai kebutuhan proyek.
