// User front-end: FINAL FIXED (Strict Liveness + Reset Manual + Modern Logging)
(() => {
  // --- DOM Elements ---
  const pageHome = document.getElementById('page-home');
  const pageRegistrasi = document.getElementById('page-registrasi');
  const pagePoli = document.getElementById('page-poli');
  const pagePoliGateway = document.getElementById('page-poli-gateway');

  const navHome = document.getElementById('nav-home');
  const navRegistrasi = document.getElementById('nav-registrasi');
  const navPoli = document.getElementById('nav-poli');
  const btnHomeRegistrasi = document.getElementById('btn-home-registrasi');
  const btnHomeKePoli = document.getElementById('btn-home-ke-poli');

  // Registrasi
  const formRegistrasi = document.getElementById('form-registrasi');
  const inputNik = document.getElementById('reg-nik');
  const inputNama = document.getElementById('reg-nama');
  const inputDob = document.getElementById('reg-ttl');
  const inputAlamat = document.getElementById('reg-alamat');
  const videoReg = document.getElementById('video-reg');
  const statusReg = document.getElementById('status-reg');
  const countReg = document.getElementById('count-reg');

  // Verifikasi UI
  const videoVerif = document.getElementById('video-verif');
  const btnScan = document.getElementById('btn-scan'); // Tombol Manual
  const verifResult = document.getElementById('verif-result');
  const verifData = document.getElementById('verif-data');
  const verifNikBox = document.getElementById('verif-nik');
  const statusVerif = document.getElementById('status-verif');
  const livenessHint = document.getElementById('liveness-hint');
  const btnLanjutForm = document.getElementById('btn-lanjut-form');
  const btnDetailData = document.getElementById('btn-detail-data');
  const btnSwitchCamReg = document.getElementById('btn-switch-cam-reg');
  const btnSwitchCamVerif = document.getElementById('btn-switch-cam-verif');

  // Elements UI Lingkaran & Status
  const overlayAuto = document.getElementById('auto-scan-overlay');
  const textCountdown = document.getElementById('auto-scan-countdown');
  const circleProgress = document.getElementById('auto-scan-circle');
  const focusBox = document.getElementById('verif-focus-box');
  const livenessStatusText = document.getElementById('liveness-status-text');

  // LOG CONTAINER
  const livenessLogContainer = document.getElementById('liveness-log-container');

  // Poli gateway, Modals, dll
  const formPoliGateway = document.getElementById('form-poli-gateway');
  const gwNama = document.getElementById('gw-nama');
  const gwUmur = document.getElementById('gw-umur');
  const gwAlamat = document.getElementById('gw-alamat');
  const gwPoli = document.getElementById('gw-poli');
  const gwKeluhan = document.getElementById('gw-keluhan');
  const modalAlert = document.getElementById('modal-alert');
  const alertMessage = document.getElementById('alert-message');
  const btnAlertOk = document.getElementById('btn-modal-alert-ok');
  const modalLoading = document.getElementById('modal-loading');
  const loadingText = document.getElementById('loading-text');
  const progressInner = document.getElementById('progress-inner');
  const modalAntrian = document.getElementById('modal-antrian');
  const antrianPoli = document.getElementById('antrian-poli');
  const antrianNomor = document.getElementById('antrian-nomor');
  const btnAntrianTutup = document.getElementById('btn-modal-antrian-tutup');
  const modalRegisSuccess = document.getElementById('modal-regis-success');
  const btnModalRegisTutup = document.getElementById('btn-modal-regis-tutup');
  const btnModalLanjutPoli = document.getElementById('btn-modal-lanjut-poli');
  const modalCameraPermission = document.getElementById('modal-camera-permission');
  const btnCameraPermission = document.getElementById('btn-camera-permission');
  const btnCameraPermissionLater = document.getElementById('btn-camera-permission-later');
  const cameraStatus = document.getElementById('camera-status');
  const cameraStatusDot = document.getElementById('camera-status-dot');
  const cameraStatusText = document.getElementById('camera-status-text');

  // -- STATE VARIABLES --
  let streamReg = null;
  let streamVerif = null;
  let currentFacingMode = 'user';
  let activeStreamMode = null;
  let activePatient = null;
  let verificationStartTime = null;
  let nextScanTimer = null;
  let isScanning = false;

  // ==========================================
  // LIVENESS VARIABLES
  // ==========================================
  let faceMesh = null;
  let camera = null;
  let livenessStartTime = 0;
  let isLivenessCheckActive = false;

  const BLINK_THRESHOLD = 0.26;
  let blinkCount = 0;
  let blinkFlag = false;

  const LEFT_EYE = [33, 160, 158, 133, 153, 144];
  const RIGHT_EYE = [362, 385, 387, 263, 373, 380];
  const REQUIRED_LIVENESS_TIME = 3500; // 3.5 Detik
  const CIRCLE_FULL = 264;

  // --- LOGGING FUNCTION (MODERN UI) ---
  function addLivenessLog(message, type = 'info') {
    if (!livenessLogContainer) return;

    // Clear initial message
    if (livenessLogContainer.firstElementChild && livenessLogContainer.firstElementChild.classList.contains('italic')) {
      livenessLogContainer.innerHTML = '';
    }

    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let bgClass, textClass, iconSVG;

    if (type === 'success') {
      bgClass = 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800';
      textClass = 'text-green-700 dark:text-green-300';
      iconSVG = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    } else if (type === 'error') {
      bgClass = 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800';
      textClass = 'text-red-700 dark:text-red-300';
      iconSVG = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    } else if (type === 'warning') {
      bgClass = 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800';
      textClass = 'text-yellow-700 dark:text-yellow-300';
      iconSVG = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    } else {
      bgClass = 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700';
      textClass = 'text-gray-600 dark:text-gray-400';
      iconSVG = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }

    const logItem = document.createElement('div');
    logItem.className = `flex items-start gap-3 p-2.5 rounded-lg border ${bgClass} animate-fade-in transition-all`;

    logItem.innerHTML = `
          <div class="mt-0.5 shrink-0 ${textClass}">${iconSVG}</div>
          <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold ${textClass} mb-0.5 leading-none">${message}</p>
              <p class="text-[10px] text-gray-400 dark:text-gray-500">${time}</p>
          </div>
      `;

    livenessLogContainer.appendChild(logItem);
    livenessLogContainer.scrollTop = livenessLogContainer.scrollHeight;
  }

  // --- NAVIGATION ---
  function showPage(id) {
    stopLivenessCheck();
    stopNextScanCountdown();

    [pageHome, pageRegistrasi, pagePoli, pagePoliGateway].forEach((p) => p && p.classList.add('hidden'));
    document.querySelectorAll('.nav-button').forEach((b) => b.classList.remove('active'));

    if (id === 'page-home') pageHome.classList.remove('hidden');
    if (id === 'page-registrasi') {
      pageRegistrasi.classList.remove('hidden');
      if (navRegistrasi) navRegistrasi.classList.add('active');
    }
    if (id === 'page-poli') {
      pagePoli.classList.remove('hidden');
      if (navPoli) navPoli.classList.add('active');
      resetVerif();
    }
    if (id === 'page-poli-gateway') {
      pagePoliGateway.classList.remove('hidden');
      if (navPoli) navPoli.classList.add('active');
    }
  }

  function resetVerif() {
    if (verifResult) verifResult.classList.add('hidden');
    if (statusVerif) {
      statusVerif.textContent = 'Menunggu wajah...';
      statusVerif.className = 'text-lg font-bold text-gray-600 dark:text-gray-400';
    }
    if (verifData) verifData.innerHTML = '';

    // Reset Log Container with Dummy Text
    if (livenessLogContainer) {
      livenessLogContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-gray-400 text-xs italic">
            <svg class="w-8 h-8 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Sistem siap. Menunggu wajah...
        </div>`;
    }

    isScanning = false;
    stopNextScanCountdown();
    resetCountdownUI();

    ensureCamera('verif').then(() => {
      if (!pagePoli.classList.contains('hidden')) {
        addLivenessLog('Kamera aktif. Memulai modul FaceMesh...', 'info');
        initMediaPipe();
      }
    });
  }

  // --- MATH HELPERS ---
  function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
  function calculateEAR(landmarks, indices) {
    const p = indices.map((i) => landmarks[i]);
    const A = distance(p[1], p[5]);
    const B = distance(p[2], p[4]);
    const C = distance(p[0], p[3]);
    return (A + B) / (2.0 * C);
  }

  // --- MEDIAPIPE ---
  async function initMediaPipe() {
    if (faceMesh) return;
    addLivenessLog('Memuat model AI...', 'warning');

    faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    faceMesh.onResults(onFaceResults);

    if (videoVerif) {
      camera = new Camera(videoVerif, {
        onFrame: async () => {
          if (!videoVerif.paused && !videoVerif.ended && !pagePoli.classList.contains('hidden')) {
            await faceMesh.send({ image: videoVerif });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
      addLivenessLog('Model AI Siap.', 'success');
    }
  }

  function stopLivenessCheck() {
    isLivenessCheckActive = false;
    blinkCount = 0;
    resetCountdownUI();
  }

  // --- LOGIKA UTAMA (STRICT) ---
  function onFaceResults(results) {
    if (pagePoli.classList.contains('hidden') || isScanning || !verifResult.classList.contains('hidden')) return;

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];

      // 1. Hitung Kedipan
      const leftEAR = calculateEAR(landmarks, LEFT_EYE);
      const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
      const avgEAR = (leftEAR + rightEAR) / 2.0;

      if (avgEAR < BLINK_THRESHOLD) {
        if (!blinkFlag) blinkFlag = true;
      } else {
        if (blinkFlag) {
          blinkCount++;
          blinkFlag = false;
          addLivenessLog(`Kedipan terdeteksi! (Total: ${blinkCount})`, 'success');
        }
      }

      // 2. STATE MACHINE
      if (!isLivenessCheckActive) {
        // START TIMER
        isLivenessCheckActive = true;
        livenessStartTime = Date.now();
        blinkCount = 0;

        if (statusVerif) statusVerif.textContent = 'Tahan & Silakan Kedip...';
        if (livenessStatusText) {
          livenessStatusText.textContent = 'Mendeteksi...';
          livenessStatusText.className = 'mt-6 font-bold px-6 py-2 rounded-full hidden transition-all duration-300 shadow-lg text-white text-sm bg-gray-700 border border-white border-opacity-20 block animate-pulse';
          livenessStatusText.classList.remove('hidden');
        }
        addLivenessLog('Wajah ditemukan. Memulai timer Liveness...', 'warning');
      } else {
        // RUNNING TIMER
        const elapsed = Date.now() - livenessStartTime;
        const remainingTime = Math.max(0, REQUIRED_LIVENESS_TIME - elapsed);

        // Update Lingkaran
        updateCountdownUI(elapsed, REQUIRED_LIVENESS_TIME);

        // UI Feedback Kedip (Update Text di Dalam Overlay)
        if (blinkCount > 0) {
          // KEDIPAN OK (HIJAU)
          livenessStatusText.textContent = `Liveness OK (${blinkCount} kedip)`;
          livenessStatusText.className = 'mt-6 font-bold px-6 py-2 rounded-full hidden transition-all duration-300 shadow-lg text-white text-sm bg-green-600 border border-white border-opacity-20 block';

          // Kotak Fokus Hijau
          focusBox.classList.remove('border-red-600', 'border-primary-500');
          focusBox.classList.add('border-green-500');
        } else {
          // BELUM KEDIP (MERAH/KUNING)
          livenessStatusText.textContent = 'SILAKAN BERKEDIP SEKARANG!';
          livenessStatusText.className = 'mt-6 font-bold px-6 py-2 rounded-full hidden transition-all duration-300 shadow-lg text-white text-sm bg-red-600 border border-white border-opacity-20 animate-pulse block';

          // Kotak Fokus Merah
          focusBox.classList.remove('border-green-500', 'border-primary-500');
          focusBox.classList.add('border-red-600');
        }

        // FINISH
        if (elapsed >= REQUIRED_LIVENESS_TIME) {
          if (blinkCount >= 1) {
            addLivenessLog('Liveness Lolos. Mengirim ke server...', 'success');
            triggerAutoScan(); // SUCCESS
          } else {
            addLivenessLog('Liveness Gagal: Tidak ada kedipan.', 'error');
            handleSpoofDetection(); // FAILED -> LOG SPOOF
          }
        }
      }
    } else {
      // No Face
      if (isLivenessCheckActive) {
        addLivenessLog('Wajah hilang dari frame.', 'warning');
      }
      stopLivenessCheck();
      if (statusVerif) statusVerif.textContent = 'Menunggu wajah...';
      if (livenessStatusText) livenessStatusText.classList.add('hidden');
    }
  }

  // --- LAPOR KE SERVER (PENTING!) ---
  async function handleSpoofDetection() {
    // 1. Reset
    isLivenessCheckActive = false;
    resetCountdownUI();

    // 2. Kirim Log ke Backend
    try {
      addLivenessLog('Melaporkan insiden Spoofing ke Admin...', 'error');
      await fetch('/api/log_spoof', { method: 'POST' });
      console.log('Spoof reported to server.');
    } catch (e) {
      console.error('Gagal lapor spoof:', e);
    }

    // 3. UI Merah (Hukuman)
    if (statusVerif) {
      statusVerif.textContent = 'TERDETEKSI FOTO PALSU!';
      statusVerif.className = 'text-lg font-bold text-red-600 animate-pulse';
    }

    if (livenessStatusText) {
      livenessStatusText.textContent = 'GAGAL: TIDAK ADA KEDIPAN';
      livenessStatusText.className = 'mt-8 font-bold px-6 py-2 rounded-full hidden transition-all duration-300 shadow-lg text-white text-sm bg-red-800 border border-white border-opacity-20 block';
      livenessStatusText.classList.remove('hidden');
    }

    focusBox.classList.remove('border-green-500', 'border-primary-500');
    focusBox.classList.add('border-red-600'); // Merah tebal

    // Freeze 3 detik
    isScanning = true;
    setTimeout(() => {
      isScanning = false;
      if (statusVerif) {
        statusVerif.textContent = 'Menunggu wajah...';
        statusVerif.className = 'text-lg font-bold text-gray-600 dark:text-gray-400';
      }
      if (focusBox) {
        focusBox.classList.remove('border-red-600');
        focusBox.classList.add('border-primary-500');
      }
      if (livenessStatusText) livenessStatusText.classList.add('hidden');
      addLivenessLog('Sistem reset. Siap scan ulang.', 'info');
    }, 3000);
  }

  // --- UI CIRCLE HELPER ---
  function updateCountdownUI(current, total) {
    if (overlayAuto) overlayAuto.classList.remove('hidden');
    const remainingSeconds = Math.ceil((total - current) / 1000);
    if (textCountdown) textCountdown.textContent = remainingSeconds > 0 ? remainingSeconds : 'Scan';
    if (circleProgress) {
      const percentage = Math.min(current / total, 1);
      // Animasi mundur (stroke offset)
      const offset = CIRCLE_FULL - percentage * CIRCLE_FULL;
      circleProgress.style.strokeDashoffset = offset;
    }
  }

  function resetCountdownUI() {
    if (overlayAuto) overlayAuto.classList.add('hidden');
    if (textCountdown) textCountdown.textContent = '3';
    if (circleProgress) circleProgress.style.strokeDashoffset = CIRCLE_FULL;
    if (focusBox) {
      focusBox.classList.remove('border-green-500', 'border-red-600');
      focusBox.classList.add('border-primary-500');
    }
    if (livenessStatusText) livenessStatusText.classList.add('hidden');
  }

  // --- CAMERA & OTHERS (Standard) ---
  async function initWebcam(videoEl, mode = 'user') {
    if (videoEl.srcObject) videoEl.srcObject.getTracks().forEach((t) => t.stop());
    const constraints = { video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoEl.srcObject = stream;
      if (mode === 'environment') videoEl.classList.add('video-back-cam');
      else videoEl.classList.remove('video-back-cam');
      return stream;
    } catch (e) {
      if (mode === 'environment') return initWebcam(videoEl, 'user');
      showAlert('Gagal akses kamera: ' + e.message);
      return null;
    }
  }

  async function ensureCamera(type) {
    if (localStorage.getItem('cameraPermissionStatus') !== 'granted') {
      showCameraPermissionModal();
      return;
    }
    if (type === 'verif' && streamVerif && streamVerif.active && activeStreamMode === currentFacingMode) return;
    if (type === 'reg' && streamReg && streamReg.active && activeStreamMode === currentFacingMode) return;
    if (type === 'reg') streamReg = await initWebcam(videoReg, currentFacingMode);
    if (type === 'verif') streamVerif = await initWebcam(videoVerif, currentFacingMode);
    activeStreamMode = currentFacingMode;
    updateCameraStatus('granted');
  }

  async function switchCamera() {
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    activeStreamMode = null;
    if (!pageRegistrasi.classList.contains('hidden')) await ensureCamera('reg');
    else if (!pagePoli.classList.contains('hidden')) await ensureCamera('verif');
  }

  if (btnSwitchCamReg)
    btnSwitchCamReg.addEventListener('click', (e) => {
      e.preventDefault();
      switchCamera();
    });
  if (btnSwitchCamVerif)
    btnSwitchCamVerif.addEventListener('click', (e) => {
      e.preventDefault();
      switchCamera();
    });

  // --- FORCE VERIFY BUTTON (RESET LOGIC) ---
  btnScan.addEventListener('click', async () => {
    addLivenessLog('Memulai ulang verifikasi manual...', 'info');
    resetVerif(); // Force Reset to initial state (Liveness required)
  });

  async function triggerAutoScan() {
    isScanning = true;
    isLivenessCheckActive = false;
    resetCountdownUI();
    if (statusVerif) {
      statusVerif.textContent = 'Verifikasi Wajah...';
      statusVerif.className = 'text-lg font-bold text-blue-600 animate-pulse';
    }
    showLoading('Liveness OK. Memverifikasi identitas...');
    verificationStartTime = Date.now();
    const frames = await captureFrames(videoVerif, 3, 100, null, 'Verifikasi', 0.7);
    updateProgress(3, 3, 'Memproses');
    const fd = new FormData();
    frames.forEach((b, i) => fd.append('frames[]', b, `scan_${i}.jpg`));
    try {
      const r = await fetch('/api/recognize', { method: 'POST', body: fd });
      const d = await r.json();
      hideLoading();
      if (!d.ok || !d.found) {
        statusVerif.textContent = 'Gagal: Wajah Tidak Dikenali';
        statusVerif.className = 'text-lg font-bold text-yellow-600';
        addLivenessLog('Gagal: Wajah tidak ada di database.', 'error');
        showAlert(d.msg || 'Wajah tidak dikenali di database.');
        activePatient = null;
        isScanning = false;
        setTimeout(() => {
          isScanning = false;
        }, 2000);
        return;
      }
      const elapsed = ((Date.now() - verificationStartTime) / 1000).toFixed(1);
      statusVerif.textContent = 'Berhasil';
      statusVerif.className = 'text-lg font-bold text-green-600';
      addLivenessLog(`Berhasil! Pasien: ${d.name} (${elapsed}s)`, 'success');
      activePatient = { nik: d.nik, name: d.name, address: d.address, dob: d.dob, age: d.age };
      verifData.innerHTML = `
        <div class="space-y-2"><p><strong>NIK:</strong> <span class="font-mono">${d.nik}</span></p><p><strong>Nama:</strong> ${d.name}</p><p><strong>Tanggal Lahir:</strong> ${d.dob || '-'}</p><p><strong>Umur:</strong> ${
        d.age
      }</p><p><strong>Alamat:</strong> ${d.address}</p><p><strong>Waktu Proses:</strong> ${elapsed} detik</p>
        <div class="bg-blue-50 dark:bg-[#1e293b] text-blue-800 dark:text-blue-300 text-sm px-4 py-2 rounded-lg mt-2 flex items-center gap-2 animate-pulse border dark:border-border"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span id="next-scan-text-dynamic" class="font-medium">Verifikasi selanjutnya dalam 10 detik...</span></div></div>`;
      verifResult.classList.remove('hidden');
      startNextScanCountdown();
    } catch (err) {
      hideLoading();
      showAlert('Error: ' + err.message);
      isScanning = false;
    }
  }

  function startNextScanCountdown() {
    stopNextScanCountdown();
    let seconds = 10;
    const updateText = () => {
      const el = document.getElementById('next-scan-text-dynamic');
      if (el) el.textContent = `Verifikasi selanjutnya dalam ${seconds} detik...`;
    };
    updateText();
    nextScanTimer = setInterval(() => {
      seconds--;
      updateText();
      if (seconds <= 0) {
        stopNextScanCountdown();
        resetVerif();
      }
    }, 1000);
  }
  function stopNextScanCountdown() {
    if (nextScanTimer) {
      clearInterval(nextScanTimer);
      nextScanTimer = null;
    }
  }
  function captureFrames(videoEl, total = 3, gap = 150, counterEl = null, label = 'Frame', quality = 0.7) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames = [];
      let taken = 0;
      const targetWidth = 400;
      const scale = targetWidth / videoEl.videoWidth;
      canvas.width = targetWidth;
      canvas.height = videoEl.videoHeight * scale;
      const grab = () => {
        if (!videoEl.videoWidth) return requestAnimationFrame(grab);
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (b) => {
            frames.push(b);
            taken++;
            if (counterEl) counterEl.textContent = taken;
            updateProgress(taken, total, label);
            if (taken >= total) resolve(frames);
            else setTimeout(grab, gap);
          },
          'image/jpeg',
          quality
        );
      };
      grab();
    });
  }
  function showAlert(msg) {
    if (alertMessage) alertMessage.textContent = msg;
    if (modalAlert) modalAlert.classList.remove('hidden');
  }
  function showLoading(text) {
    if (loadingText) loadingText.textContent = text;
    if (progressInner) progressInner.style.width = '0%';
    if (modalLoading) modalLoading.classList.remove('hidden');
  }
  function hideLoading() {
    if (modalLoading) modalLoading.classList.add('hidden');
  }
  function updateProgress(c, t, label) {
    const pct = Math.round((c / t) * 100);
    if (progressInner) progressInner.style.width = pct + '%';
    if (loadingText) loadingText.textContent = `${label} ${c}/${t} (${pct}%)`;
  }
  function computeAge(dob) {
    if (!dob) return '-';
    const d = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return `${age} Tahun`;
  }

  formRegistrasi.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nikVal = inputNik.value.trim();
    if (localStorage.getItem('cameraPermissionStatus') !== 'granted') {
      showCameraPermissionModal();
      return;
    }
    await ensureCamera('reg');
    if (!streamReg) {
      statusReg.textContent = 'Gagal kamera';
      return;
    }
    statusReg.textContent = 'Mengambil foto...';
    countReg.textContent = '0';
    showLoading('Registrasi: mengambil foto...');
    const frames = await captureFrames(videoReg, 15, 100, countReg, 'Foto', 0.8);
    updateProgress(15, 15, 'Mengirim');
    const fd = new FormData();
    fd.append('nik', nikVal);
    fd.append('name', inputNama.value.trim());
    fd.append('dob', inputDob.value);
    fd.append('address', inputAlamat.value.trim());
    frames.forEach((b, i) => fd.append('frames[]', b, `frame_${i}.jpg`));
    try {
      const r = await fetch('/api/register', { method: 'POST', body: fd });
      const d = await r.json();
      hideLoading();
      if (!d.ok) {
        showAlert(d.msg || 'Gagal');
        statusReg.textContent = 'Gagal';
        return;
      }
      activePatient = { nik: nikVal, name: inputNama.value.trim(), address: inputAlamat.value.trim(), dob: inputDob.value };
      formRegistrasi.reset();
      countReg.textContent = '0';
      if (modalRegisSuccess) modalRegisSuccess.classList.remove('hidden');
    } catch (err) {
      hideLoading();
      showAlert('Error: ' + err.message);
    }
  });
  if (btnModalRegisTutup)
    btnModalRegisTutup.addEventListener('click', () => {
      if (modalRegisSuccess) modalRegisSuccess.classList.add('hidden');
      showPage('page-home');
    });
  if (navHome) navHome.addEventListener('click', () => showPage('page-home'));
  if (navRegistrasi) navRegistrasi.addEventListener('click', () => showPage('page-registrasi'));
  if (navPoli) navPoli.addEventListener('click', () => showPage('page-poli'));
  if (btnHomeRegistrasi) btnHomeRegistrasi.addEventListener('click', () => showPage('page-registrasi'));
  if (btnHomeKePoli) btnHomeKePoli.addEventListener('click', () => showPage('page-poli'));
  if (btnAlertOk) btnAlertOk.addEventListener('click', () => modalAlert.classList.add('hidden'));
  if (btnAntrianTutup)
    btnAntrianTutup.addEventListener('click', () => {
      modalAntrian.classList.add('hidden');
      showPage('page-home');
    });
  if (btnDetailData) btnDetailData.addEventListener('click', stopNextScanCountdown);
  if (btnLanjutForm)
    btnLanjutForm.addEventListener('click', () => {
      stopNextScanCountdown();
      if (activePatient) {
        gwNama.textContent = activePatient.name;
        gwUmur.textContent = activePatient.age || computeAge(activePatient.dob);
        gwAlamat.textContent = activePatient.address;
        showPage('page-poli-gateway');
      }
    });
  if (btnModalLanjutPoli)
    btnModalLanjutPoli.addEventListener('click', () => {
      if (modalRegisSuccess) modalRegisSuccess.classList.add('hidden');
      if (activePatient) {
        gwNama.textContent = activePatient.name;
        gwUmur.textContent = computeAge(activePatient.dob);
        gwAlamat.textContent = activePatient.address;
        showPage('page-poli-gateway');
      }
    });
  if (formPoliGateway)
    formPoliGateway.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activePatient) return;
      showLoading('Mengambil antrian...');
      try {
        const r = await fetch('/api/queue/assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ poli: gwPoli.value }) });
        const d = await r.json();
        hideLoading();
        if (d.ok) {
          antrianPoli.textContent = d.poli;
          antrianNomor.textContent = d.nomor;
          modalAntrian.classList.remove('hidden');
          formPoliGateway.reset();
          activePatient = null;
        } else {
          showAlert('Gagal ambil nomor');
        }
      } catch (err) {
        hideLoading();
        showAlert('Error: ' + err.message);
      }
    });
  function showCameraPermissionModal() {
    if (modalCameraPermission) modalCameraPermission.classList.remove('hidden');
  }
  function hideCameraPermissionModal() {
    if (modalCameraPermission) modalCameraPermission.classList.add('hidden');
  }
  function updateCameraStatus(s) {
    if (!cameraStatus) return;
  }
  if (btnCameraPermission)
    btnCameraPermission.addEventListener('click', async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        s.getTracks().forEach((t) => t.stop());
        localStorage.setItem('cameraPermissionStatus', 'granted');
        hideCameraPermissionModal();
        showAlert('Kamera diizinkan!');
        updateCameraStatus('granted');
      } catch (e) {
        localStorage.setItem('cameraPermissionStatus', 'denied');
        hideCameraPermissionModal();
        showAlert('Akses ditolak.');
        updateCameraStatus('denied');
      }
    });
  if (btnCameraPermissionLater) btnCameraPermissionLater.addEventListener('click', () => hideCameraPermissionModal());
  if (localStorage.getItem('cameraPermissionStatus') !== 'granted') setTimeout(showCameraPermissionModal, 1500);

  showPage('page-home');
})();
