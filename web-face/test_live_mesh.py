import cv2
import mediapipe as mp
import numpy as np
import time
from collections import deque

mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Webcam tidak bisa dibuka.")
    exit()

# ---------------------------------------------------------
# SETUP BUFFER & VARIABEL BLINK
# ---------------------------------------------------------
history_length = 20
ear_history = deque(maxlen=history_length)
mar_history = deque(maxlen=history_length)

# --- SENSITIVITAS ANTI-SPOOF ---
MOUTH_MOTION_THRESHOLD = 0.035 
EYE_MOTION_THRESHOLD = 0.035

# --- SETUP KEDIPAN (BLINK) ---
BLINK_THRESHOLD = 0.24  # Jika EAR di bawah ini, dianggap merem
blink_count = 0
blink_flag = False      # Status: False = Melek, True = Sedang Merem

# ---------------------------------------------------------
# FUNGSI PERHITUNGAN
# ---------------------------------------------------------

def calculate_ear(landmarks, indices):
    pts = np.array([(landmarks[i].x, landmarks[i].y) for i in indices])
    A = np.linalg.norm(pts[1] - pts[5])
    B = np.linalg.norm(pts[2] - pts[4])
    C = np.linalg.norm(pts[0] - pts[3])
    return (A + B) / (2.0 * C)

def calculate_mar(landmarks, indices):
    pts = np.array([(landmarks[i].x, landmarks[i].y) for i in indices])
    A = np.linalg.norm(pts[1] - pts[7])
    B = np.linalg.norm(pts[2] - pts[6])
    C = np.linalg.norm(pts[3] - pts[5])
    D = np.linalg.norm(pts[0] - pts[4])
    return (A + B + C) / (2.0 * D)

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
MOUTH = [61, 37, 267, 314, 291, 84, 181, 17] 

prev_time = 0

while cap.isOpened():
    ret, image = cap.read()
    if not ret:
        break

    image = cv2.flip(image, 1)
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    status_text = "Mencari wajah..."
    color = (255, 255, 255)
    debug_text_1 = ""
    debug_text_2 = ""

    if result.multi_face_landmarks:
        lm = result.multi_face_landmarks[0].landmark

        # 1. Hitung EAR & MAR
        left_ear = calculate_ear(lm, LEFT_EYE)
        right_ear = calculate_ear(lm, RIGHT_EYE)
        avg_ear = (left_ear + right_ear) / 2.0
        avg_mar = calculate_mar(lm, MOUTH)

        # -------------------------------------------------
        # LOGIKA HITUNG KEDIPAN (BLINK COUNTER)
        # -------------------------------------------------
        # Jika EAR turun di bawah threshold (mata tertutup)
        if avg_ear < BLINK_THRESHOLD:
            if not blink_flag:
                blink_flag = True  # Tandai sedang merem
        else:
            # Jika EAR naik lagi (mata terbuka) DAN sebelumnya sedang merem
            if blink_flag:
                blink_count += 1   # Hitung 1 kedipan
                blink_flag = False # Reset status

        # -------------------------------------------------
        # LOGIKA ANTI-SPOOF (HISTORY)
        # -------------------------------------------------
        ear_history.append(avg_ear)
        mar_history.append(avg_mar)
        
        is_spoof = False
        
        if len(ear_history) > 10:
            ear_std = np.std(ear_history)
            mar_std = np.std(mar_history)

            # Jika variasi gerakan kecil sekali (diam patung/foto) -> FAKE
            if ear_std < EYE_MOTION_THRESHOLD and mar_std < MOUTH_MOTION_THRESHOLD:
                is_spoof = True
                reason = "Static"
            else:
                is_spoof = False
                reason = "Liveness"

            debug_text_1 = f"Eye Var: {ear_std:.4f}"
            debug_text_2 = f"Mouth Var: {mar_std:.4f}"

            if is_spoof:
                status_text = "PALSU / FOTO"
                color = (0, 0, 255) # Merah
            else:
                status_text = "ASLI (LIVE)"
                color = (0, 255, 0) # Hijau
        else:
            status_text = "Mengumpulkan data..."
            color = (255, 255, 0)

        # Gambar Mesh
        mp_drawing.draw_landmarks(
            image=image,
            landmark_list=result.multi_face_landmarks[0],
            connections=mp_face_mesh.FACEMESH_TESSELATION,
            landmark_drawing_spec=None,
            connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_tesselation_style()
        )

    # UI DISPLAY
    # Kotak Background diperbesar sedikit ke bawah untuk muat teks Blink
    cv2.rectangle(image, (0, 0), (300, 190), (0, 0, 0), -1) 
    
    cv2.putText(image, status_text, (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
    cv2.putText(image, debug_text_1, (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
    cv2.putText(image, debug_text_2, (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
    
    # Tampilkan Jumlah Kedipan
    cv2.putText(image, f"Blinks: {blink_count}", (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

    cv2.imshow("Anti-Spoof + Blink Counter", image)

    if cv2.waitKey(5) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()