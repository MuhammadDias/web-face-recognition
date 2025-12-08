import cv2
import mediapipe as mp
import numpy as np
from insightface.app import FaceAnalysis
from scipy.spatial.distance import cosine
import json
import os

class VideoCamera(object):
    def __init__(self):
        self.video = cv2.VideoCapture(0) # 0 untuk Webcam default
        
        # --- 1. SETUP AI (Load sekali aja biar ringan) ---
        print("Loading AI Models...")
        
        # InsightFace
        self.face_app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        self.face_app.prepare(ctx_id=0, det_size=(640, 640))
        
        # MediaPipe (Liveness)
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=True)
        
        # Status & Config
        self.liveness_detected = False
        self.blink_threshold = 0.25
        self.recognition_threshold = 0.5
        
        # Load Database User ke Memory
        self.users_db = self.load_database()

    def __del__(self):
        self.video.release()

    def load_database(self):
        # Cek file database ada atau tidak
        if not os.path.exists('database/users.json'):
            return []
        try:
            with open('database/users.json', 'r') as f:
                return json.load(f)
        except:
            return []

    def calculate_ear(self, landmarks):
        # Index mata kiri & kanan (MediaPipe)
        LEFT_EYE = [362, 385, 387, 263, 373, 380]
        RIGHT_EYE = [33, 160, 158, 133, 153, 144]
        
        def eye_aspect_ratio(indices):
            p1 = np.array([landmarks[indices[0]].x, landmarks[indices[0]].y])
            p2 = np.array([landmarks[indices[1]].x, landmarks[indices[1]].y])
            p3 = np.array([landmarks[indices[2]].x, landmarks[indices[2]].y])
            p4 = np.array([landmarks[indices[3]].x, landmarks[indices[3]].y])
            p5 = np.array([landmarks[indices[4]].x, landmarks[indices[4]].y])
            p6 = np.array([landmarks[indices[5]].x, landmarks[indices[5]].y])
            vertical_1 = np.linalg.norm(p2 - p6)
            vertical_2 = np.linalg.norm(p3 - p5)
            horizontal = np.linalg.norm(p1 - p4)
            return (vertical_1 + vertical_2) / (2.0 * horizontal)

        left_ear = eye_aspect_ratio(LEFT_EYE)
        right_ear = eye_aspect_ratio(RIGHT_EYE)
        return (left_ear + right_ear) / 2.0

    def get_frame(self):
        success, frame = self.video.read()
        if not success:
            return None

        frame = cv2.flip(frame, 1) # Mirror effect
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # --- LOGIKA UTAMA ---
        
        # STEP 1: Cek Liveness (Kalau belum terdeteksi hidup)
        if not self.liveness_detected:
            results = self.face_mesh.process(rgb_frame)
            cv2.putText(frame, "MOHON KEDIPKAN MATA", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            
            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    ear = self.calculate_ear(face_landmarks.landmark)
                    if ear < self.blink_threshold:
                        self.liveness_detected = True # Manusia Asli!
        
        # STEP 2: Recognition (Kalau sudah terbukti hidup)
        else:
            cv2.putText(frame, "LIVENESS OK! SCANNING...", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            
            # Deteksi Wajah dengan InsightFace
            faces = self.face_app.get(frame)
            
            if len(faces) > 0:
                user_embedding = faces[0].embedding
                
                # Bandingkan dengan Database
                found_name = "Unknown"
                min_dist = 100
                
                for user in self.users_db:
                    # Convert list di JSON balik ke Numpy Array
                    db_embedding = np.array(user['embedding'], dtype=np.float32)
                    dist = cosine(user_embedding, db_embedding)
                    
                    if dist < min_dist:
                        min_dist = dist
                        if dist < self.recognition_threshold:
                            found_name = user['name']
                
                # Gambar Kotak & Nama
                box = faces[0].bbox.astype(int)
                color = (0, 255, 0) if found_name != "Unknown" else (0, 0, 255)
                cv2.rectangle(frame, (box[0], box[1]), (box[2], box[3]), color, 2)
                cv2.putText(frame, f"{found_name} ({min_dist:.2f})", (box[0], box[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

        # Convert ke JPG untuk dikirim ke Browser
        ret, jpeg = cv2.imencode('.jpg', frame)
        return jpeg.tobytes()

    def reset_liveness(self):
        self.liveness_detected = False