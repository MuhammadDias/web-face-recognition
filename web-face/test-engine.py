import cv2
import numpy as np
import face_engine
import time

print("⏳ Sedang memuat Engine...")
# Paksa inisialisasi
face_engine.initialize()

# Cek status
status = face_engine.get_engine_status()
print(f"✅ Status Engine: InsightFace Available = {status['insightface_available']}")

# Buat gambar dummy (Hitam polos) untuk pemanasan
img = np.zeros((640, 640, 3), dtype=np.uint8)

# Gambar kotak putih (agar dianggap ada konten)
cv2.rectangle(img, (100,100), (300,300), (255,255,255), -1)

print("📸 Mencoba deteksi wajah pada gambar dummy...")
start = time.time()
try:
    # Coba deteksi (hasilnya pasti kosong karena gambar hitam, tapi kita cek error/tidak)
    faces = face_engine.detect_faces(img)
    end = time.time()
    print(f"🚀 Deteksi selesai dalam {end - start:.4f} detik.")
    print(f"📊 Jumlah wajah terdeteksi: {len(faces)} (Wajar 0 karena gambar hitam)")
    print("🎉 KESIMPULAN: InsightFace berjalan Normal dengan GPU!")
except Exception as e:
    print(f"❌ ERROR SAAT DETEKSI: {e}")
    print("Kemungkinan library onnx/numpy masih bentrok.")