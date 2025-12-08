import cv2
import insightface
from insightface.app import FaceAnalysis

# =============================
# 1. Load model
# =============================
app = FaceAnalysis(name="buffalo_l", providers=['CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640))

antispoof = insightface.model_zoo.get_model("antifraud_2.7.onnx")
antispoof.prepare(ctx_id=0)

# =============================
# 2. Buka kamera
# =============================
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Kamera tidak bisa dibuka.")
    exit()

print("Press 'q' to quit")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Deteksi wajah
    faces = app.get(frame)

    for face in faces:
        x1, y1, x2, y2 = face.bbox.astype(int)
        crop = frame[y1:y2, x1:x2]

        # Convert to RGB sesuai format model
        crop_rgb = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)

        # Anti-spoof check
        result = antispoof.get(crop_rgb)
        label = result.get("label", "unknown")
        score = result.get("score", 0)

        # Tentukan warna bounding box
        color = (0, 255, 0) if label == "real" else (0, 0, 255)

        # Gambar bbox + label
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, f"{label} ({score:.2f})",
                    (x1, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7, color, 2)

    # Tampilkan frame
    cv2.imshow("Anti Spoof Realtime", frame)

    # Quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
