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

## 🛠️ Instalasi Cepat (CPU Only)

Jika Anda hanya ingin menjalankan tanpa GPU (lebih lambat untuk InsightFace), ikuti langkah ini:

# Clone repository

git clone [https://github.com/MuhammadDias/web-face-recognition.git](https://github.com/MuhammadDias/web-face-recognition.git)
cd web-face

# Buat virtual environment

python -m venv .venv

# Windows:

.venv\Scripts\activate

# Linux/Mac:

source .venv/bin/activate

# Install dependencies

pip install -r requirements.txt

# Jalankan aplikasi

python app.py

## instalasi GPU support

🛠️ Langkah 1: Install CUDA Toolkit

1. Download CUDA Toolkit 12.x (Disarankan versi 12.6 atau 11.8).
2. Link: NVIDIA CUDA Toolkit Archive.
3. Install exe (local) seperti biasa sampai selesai.

Langkah 2: Install Library Python
Pastikan Anda berada di dalam virtual environment (.venv) dan hapus library versi CPU jika ada.

1. Hapus versi lama/CPU (wajib)

```bash
pip uninstall onnxruntime onnxruntime-gpu -y
```

2. Install versi stabil yang kompatibel
   Versi 1.18.0 dipilih karena paling stabil dengan cuDNN 8

```bash
pip install onnxruntime-gpu==1.18.0
```

## 📦 Langkah 3: Siapkan File "Obat" (DLL)

Agar Python bisa mendeteksi GPU tanpa error path, kita butuh dua komponen tambahan:

cuDNN v8.x (Untuk CUDA 12.x):
Download di NVIDIA cuDNN Archive.
Pilih versi 8.9.7 (jangan versi 9.x agar kompatibel dengan onnxruntime 1.18).
Download file zip (Windows Local).
zlibwapi.dll:
Download file zlibwapi.dll (versi x64).
Bisa didapat dari dll-files.com atau sumber terpercaya lainnya.

## 🧪 Langkah 4: Penyatuan File (PENTING)

Ini adalah langkah kunci agar GPU terbaca di VS Code/Terminal tanpa ribet setting Environment Variable Windows.

Extract file zip cuDNN yang sudah didownload.
Masuk ke folder bin hasil extract cuDNN, copy semua file yang berawalan cudnn\*.dll (contoh: cudnn64_8.dll, cudnn_ops_infer64_8.dll, dll).
Ambil juga file **zlibwapi.dll** yang sudah didownload.
PASTE semua file DLL tersebut ke dalam folder Scripts virtual environment proyek Anda:
Lokasi: Project_Folder\.venv\Scripts\ (Paste tepat di sebelah file python.exe)

## ✅ Langkah 5: Verifikasi Instalasi

Jalankan script cek GPU sederhana untuk memastikan instalasi berhasil.
Buat file cek_gpu.py:

```bash
import onnxruntime as ort
print(ort.get_available_providers())
```

Jalankan:
**python cek_gpu.py**
Output Sukses: Harus muncul CUDAExecutionProvider di urutan awal.
['TensorrtExecutionProvider', 'CUDAExecutionProvider', 'CPUExecutionProvider']

## =============Troubleshooting================

Jika output masih ['CPUExecutionProvider'] atau ['AzureExecutionProvider'...]:
Pastikan Anda menginstall onnxruntime-gpu==1.18.0 (bukan 1.23.x).
Pastikan file zlibwapi.dll sudah ada di folder .venv\Scripts.
Pastikan file cudnn64_8.dll sudah ada di folder .venv\Scripts.

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
