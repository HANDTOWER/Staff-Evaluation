import { env } from '@huggingface/transformers'
import { stabilitySingleImage } from '../ai/stability.js'
import { isFullBody } from '../ai/is_full_body.js'
import * as Posture from '../ai/posture_angle.js'
import { colorTop, colorBottom } from '../ai/get_color.js'
import { DetectBodyCLIP } from '../ai/detect_body.js'

// ==============================================================================
// 1. CONFIGURATION & CONSTANTS
// ==============================================================================

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = '/models/';

const POSTURE_THRESHOLDS = Object.freeze({
  BACK: { OK_MAX: 20, WARN_MAX: 40 },         
  HEAD_TILT: { OK_MAX: 10, WARN_MAX: 20 },    
  SHOULDER: { OK_MAX: 3, WARN_MAX: 10 },      
  FORWARD_HEAD: { OK_MAX: 2.2, WARN_MAX: 2.3 }, 
  ARMS: { OK_MAX: 10, WARN_MAX: 30 },         
  LEGS: { OK_MAX: 60, WARN_MAX: 80 },         
});

const POSTURE_MESSAGES = Object.freeze({
  BACK: { OK: 'Back posture is OK', WARN: 'Back slightly bent', ERROR: 'Back significantly bent' },
  HEAD: { OK: 'Head & Neck: Perfect', TILT_WARN: 'Neck slightly bent', TILT_ERROR: 'Bad neck posture', FORWARD_WARN: 'Head slightly forward', FORWARD_ERROR: 'High forward head' },
  SHOULDER: { OK: 'Shoulder posture is OK', WARN: 'Shoulder slightly tilted', ERROR: 'Shoulder posture incorrect' },
  LEGS: { OK: 'Legs are straight', WARN: 'Knees slightly bent', ERROR: 'Knees significantly bent' },
});

const INIT_CONFIG = Object.freeze({
  LIBRARY_CHECK_INTERVAL_MS: 100,
  LIBRARY_TIMEOUT_MS: 10000,
  POSE_MODEL_COMPLEXITY: 2,
  MIN_DETECTION_CONFIDENCE: 0.7,
  MIN_TRACKING_CONFIDENCE: 0.5,
  LANDMARK_VISIBILITY_THRESHOLD: 0.5,
});

const LM = Object.freeze({
  NOSE: 0, LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12, LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16, LEFT_HIP: 23, RIGHT_HIP: 24, LEFT_KNEE: 25,
  RIGHT_KNEE: 26, LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
});

const SKELETON_CONNECTIONS = Object.freeze([
  [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER], [LM.LEFT_SHOULDER, LM.LEFT_ELBOW], [LM.LEFT_ELBOW, LM.LEFT_WRIST],
  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW], [LM.RIGHT_ELBOW, LM.RIGHT_WRIST], [LM.LEFT_SHOULDER, LM.LEFT_HIP],
  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP], [LM.LEFT_HIP, LM.RIGHT_HIP], [LM.LEFT_HIP, LM.LEFT_KNEE],
  [LM.LEFT_KNEE, LM.LEFT_ANKLE], [LM.RIGHT_HIP, LM.RIGHT_KNEE], [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
]);

// ==============================================================================
// 2. ENGINE STATE
// ==============================================================================

const EngineStatus = Object.freeze({ IDLE: 'idle', LOADING: 'loading', READY: 'ready', ERROR: 'error' });

const engineState = {
  status: EngineStatus.IDLE,
  clipClassifier: null,
  pose: null,
  offCanvas: null,
  offCtx: null,
  error: null,
  initPromise: null,
};

let currentJobId = 0;
let pending = null;

const getPose = () => window.Pose;
const getCv = () => window.cv;

// ==============================================================================
// 3. MEMORY MANAGEMENT
// ==============================================================================

function safeDeleteMat(mat) {
  try { if (mat && typeof mat.delete === 'function' && !mat.isDeleted()) mat.delete(); } catch (e) {}
}

// ==============================================================================
// 4. INITIALIZATION
// ==============================================================================

function waitForLibraries() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkLibs = () => {
      if (window.cv?.Mat && window.Pose && window.ort) { resolve(true); return; }
      if (Date.now() - startTime >= INIT_CONFIG.LIBRARY_TIMEOUT_MS) { console.error('❌ AI Init Timeout'); resolve(false); return; }
      setTimeout(checkLibs, INIT_CONFIG.LIBRARY_CHECK_INTERVAL_MS);
    };
    checkLibs();
  });
}

export function initAIEngine() {
  if (engineState.status === EngineStatus.READY) return true;
  if (engineState.status === EngineStatus.LOADING && engineState.initPromise) return engineState.initPromise;
  
  engineState.status = EngineStatus.LOADING;
  engineState.initPromise = performInitialization();
  return engineState.initPromise;
}

// [추가됨] AI 엔진 상태를 강제로 초기화하는 함수
export function resetAIEngine() {
  if (engineState.pose) {
    // MediaPipe Pose의 내부 메모리(이전 프레임 기억)를 삭제합니다.
    engineState.pose.reset(); 
  }
  // 진행 중이던 작업이 있다면 취소 처리
  pending = null; 
  console.log("🔄 AI Engine State Reset Done.");
}

async function performInitialization() {
  try {
    console.log('⏳ AI Engine Loading...');
    const libsReady = await waitForLibraries();
    if (!libsReady) throw new Error('LIBRARY_LOAD_TIMEOUT');
    
    const clipClassifier = new DetectBodyCLIP();
    await clipClassifier.init();
    
    const PoseClass = getPose();
    const pose = new PoseClass({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
    
    pose.setOptions({
      modelComplexity: INIT_CONFIG.POSE_MODEL_COMPLEXITY,
      smoothLandmarks: true,
      minDetectionConfidence: INIT_CONFIG.MIN_DETECTION_CONFIDENCE,
      minTrackingConfidence: INIT_CONFIG.MIN_TRACKING_CONFIDENCE,
    });
    
    pose.onResults(handlePoseResults);
    
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
    
    engineState.clipClassifier = clipClassifier;
    engineState.pose = pose;
    engineState.offCanvas = offCanvas;
    engineState.offCtx = offCtx;
    engineState.status = EngineStatus.READY;
    
    console.log('✅ AI Engine Ready!');
    return true;
  } catch (error) {
    engineState.status = EngineStatus.ERROR;
    engineState.error = error;
    return false;
  }
}

// ==============================================================================
// 5. FULL BODY VALIDATION HELPERS
// ==============================================================================

function validateAnklesInFrame(lm, margin = 0.05) {
  const leftAnkle = lm[LM.LEFT_ANKLE];
  const rightAnkle = lm[LM.RIGHT_ANKLE];
  if (!leftAnkle || !rightAnkle) return false;
  const isLeftInFrame = leftAnkle.y > margin && leftAnkle.y < (1 - margin);
  const isRightInFrame = rightAnkle.y > margin && rightAnkle.y < (1 - margin);
  return isLeftInFrame || isRightInFrame;
}

function validateBodyProportion(lm, minRatio = 0.6) {
  const nose = lm[LM.NOSE];
  const leftAnkle = lm[LM.LEFT_ANKLE];
  const rightAnkle = lm[LM.RIGHT_ANKLE];
  if (!nose || !leftAnkle || !rightAnkle) return false;
  const lowestAnkleY = Math.max(leftAnkle.y, rightAnkle.y);
  const bodyHeight = lowestAnkleY - nose.y;
  return bodyHeight >= minRatio;
}

function validateFullBody(lm) {
  const basicCheck = isFullBody(lm);
  if (!basicCheck) return false;
  const anklesValid = validateAnklesInFrame(lm);
  const proportionValid = validateBodyProportion(lm);
  return basicCheck && anklesValid && proportionValid;
}

// ==============================================================================
// 6. CORE ANALYSIS LOGIC
// ==============================================================================

async function handlePoseResults(results) {
  if (!pending || pending.jobId !== currentJobId) return;
  const myPending = pending;
  pending = null;
  
  try {
    const result = await processResults(results, myPending.payload);
    myPending.resolve(result);
  } catch (e) {
    myPending.resolve({ ok: false, error: e?.message || String(e) });
  }
}

async function processResults(results, payload) {
  const { canvasElement } = payload;
  const w = canvasElement.width;
  const h = canvasElement.height;
  const ctx = canvasElement.getContext('2d');

  if (!results?.poseLandmarks) return { ok: false, error: 'NO_PERSON' };
  
  const lm = results.poseLandmarks;
  
  // 1. Draw frame
  drawImageToCanvas(ctx, results.image, w, h);

  // 2. Prepare offscreen canvas
  engineState.offCanvas.width = w;
  engineState.offCanvas.height = h;
  engineState.offCtx.clearRect(0, 0, w, h);
  engineState.offCtx.drawImage(results.image, 0, 0, w, h);
  
  const fullBodyCheck = validateFullBody(lm);
  const avgConfidence = averageVisibility(lm);
  
  // When not full body
  if (!fullBodyCheck) {
    drawLandmarks(ctx, lm, w, h);
    return createNotFullBodyResponse(lm, avgConfidence);
  }
  
  // Detailed analysis
  const analysisData = performDetailedAnalysis(results, lm, w, h);
  
  // 3. Run clothing analysis (DetectBodyCLIP Logic)
  let clothingData = await analyzeClothing(lm, results, w, h);
  
  // 4. Draw Skeleton
  drawLandmarks(ctx, lm, w, h);
  
  return createSuccessResponse(analysisData, clothingData, avgConfidence);
}

function performDetailedAnalysis(results, lm, w, h) {
  const angleHead = Posture.headAngle(results, w, h);
  const angleShoulder = Posture.shoulderAngle(results);
  const angleBack = Posture.backAngleFront(results);
  const [zScore] = Posture.forwardHeadScoreFront(results);
  const stabScore = stabilitySingleImage(results);
  
  const leftArmAngle = calculateAngle(lm[LM.LEFT_SHOULDER], lm[LM.LEFT_ELBOW], lm[LM.LEFT_WRIST]);
  const rightArmAngle = calculateAngle(lm[LM.RIGHT_SHOULDER], lm[LM.RIGHT_ELBOW], lm[LM.RIGHT_WRIST]);
  const maxArmAngle = Math.max(Math.abs(180 - leftArmAngle), Math.abs(180 - rightArmAngle));
  
  const leftLegAngle = calculateAngle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]);
  const rightLegAngle = calculateAngle(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]);
  const maxLegAngle = Math.max(Math.abs(180 - leftLegAngle), Math.abs(180 - rightLegAngle));
  
  return { angleHead, angleShoulder, angleBack, zScore, stabScore, maxArmAngle, maxLegAngle };
}

async function analyzeClothing(lm, results, w, h) {
  // DetectBodyCLIP may return strings with (true)/(false) tags.
  let clothingLabels = { 
      top: 'unknown', bottom: 'unknown', foot: 'unknown', head: 'unknown',
      accessory: 'none', topState: 'unknown', bottomState: 'unknown', 
      topCondition: 'unknown', headState: 'unknown',
      footCheck: 'Pass (true)', sleeveCheck: 'Pass (true)'
  };
  let topColor = 'unknown';
  let botColor = 'unknown';
  
  try {
    // Run DetectBodyCLIP
    clothingLabels = await engineState.clipClassifier.detectBody(
      engineState.offCtx, lm, w, h
    );
    
    // Extract colors via OpenCV
    const cv = getCv();
    const imgMat = cv.imread(engineState.offCanvas);
    
    try {
      cv.cvtColor(imgMat, imgMat, cv.COLOR_RGBA2BGR);
      topColor = colorTop(imgMat, results);
      botColor = colorBottom(imgMat, results);
    } finally {
      safeDeleteMat(imgMat);
    }
  } catch (err) {
    console.error('Clothing analysis warning:', err);
  }
  
  return { clothingLabels, topColor, botColor };
}

// ==============================================================================
// 7. HELPER FUNCTIONS
// ==============================================================================

function averageVisibility(lm) { 
  return lm ? parseFloat((lm.reduce((a, c) => a + (c?.visibility || 0), 0) / lm.length).toFixed(2)) : 0; 
}

function calculateAngle(a, b, c) { 
  if(!a||!b||!c) return 0; 
  const r = Math.atan2(c.y-b.y, c.x-b.x) - Math.atan2(a.y-b.y, a.x-b.x); 
  let d = Math.abs(r*180/Math.PI); 
  return d > 180 ? 360-d : d; 
}

function drawImageToCanvas(ctx, img, w, h) { 
  ctx.clearRect(0, 0, w, h); 
  ctx.drawImage(img, 0, 0, w, h); 
}

function drawLandmarks(ctx, lm, w, h) {
  ctx.save(); 
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; 
  ctx.lineWidth = 2; 
  ctx.fillStyle = 'red';
  
  SKELETON_CONNECTIONS.forEach(([i,j]) => { 
    if(lm[i]?.visibility > 0.5 && lm[j]?.visibility > 0.5) { 
      ctx.beginPath(); 
      ctx.moveTo(lm[i].x*w, lm[i].y*h); 
      ctx.lineTo(lm[j].x*w, lm[j].y*h); 
      ctx.stroke(); 
    }
  });
  
  lm.forEach(p => { 
    if(p?.visibility > 0.5) { 
      ctx.beginPath(); 
      ctx.arc(p.x*w, p.y*h, 4, 0, 2*Math.PI); 
      ctx.fill(); 
    }
  });
  
  ctx.restore();
}

function generatePostureLines(angleBack, angleHead, zScore, absShoulder, absLegs) {
  const lines = [];
  const T = POSTURE_THRESHOLDS;
  const M = POSTURE_MESSAGES;
  
  if (angleBack <= T.BACK.OK_MAX) lines.push({ level: 'ok', text: M.BACK.OK });
  else if (angleBack <= T.BACK.WARN_MAX) lines.push({ level: 'warn', text: M.BACK.WARN });
  else lines.push({ level: 'error', text: M.BACK.ERROR });
  
  const absHead = Math.abs(angleHead);
  let headIssues = false;
  if (absHead > T.HEAD_TILT.OK_MAX) {
    headIssues = true;
    if (absHead <= T.HEAD_TILT.WARN_MAX) lines.push({ level: 'warn', text: M.HEAD.TILT_WARN });
    else lines.push({ level: 'error', text: M.HEAD.TILT_ERROR });
  }
  if (zScore > T.FORWARD_HEAD.OK_MAX) {
    headIssues = true;
    if (zScore <= T.FORWARD_HEAD.WARN_MAX) lines.push({ level: 'warn', text: M.HEAD.FORWARD_WARN });
    else lines.push({ level: 'error', text: M.HEAD.FORWARD_ERROR });
  }
  if (!headIssues) lines.push({ level: 'ok', text: M.HEAD.OK });
  
  if (absShoulder <= T.SHOULDER.OK_MAX) lines.push({ level: 'ok', text: M.SHOULDER.OK });
  else if (absShoulder <= T.SHOULDER.WARN_MAX) lines.push({ level: 'warn', text: M.SHOULDER.WARN });
  else lines.push({ level: 'error', text: M.SHOULDER.ERROR });
  
  if (absLegs <= T.LEGS.OK_MAX) lines.push({ level: 'ok', text: M.LEGS.OK });
  else if (absLegs <= T.LEGS.WARN_MAX) lines.push({ level: 'warn', text: M.LEGS.WARN });
  else lines.push({ level: 'error', text: M.LEGS.ERROR });

  return lines;
}

function cleanLabel(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\s?\((true|false)\)/gi, '').trim();
}

function createNotFullBodyResponse(lm, confidence) {
   return { 
     ok: true, 
     personDetected: true, 
     confidence, 
     is_full_body: 'No', // Backend schema (String or Boolean handled by transform)
     stability_score: 0, 
     angles: {}, 
     pose: {}, 
     outfit: {}, 
     clothing: {}, 
     timestamp: new Date().toISOString(), 
     uiData: { 
       statusText: 'NOT FULL BODY', 
       postureLines: [], 
       colors: {} 
     } 
   };
}

function createSuccessResponse(analysis, clothing, confidence) {
  const { angleHead, angleShoulder, angleBack, zScore, stabScore, maxArmAngle, maxLegAngle} = analysis;
  const { clothingLabels, topColor, botColor } = clothing;
  const absHead = Math.abs(angleHead);
  const absShoulder = Math.abs(angleShoulder);
  
  return {
    ok: true, 
    source: 'web', 
    timestamp: Math.floor(Date.now() / 1000), 
    personDetected: true, 
    confidence, 
    
    // Backend requirement 1: is_full_body
    is_full_body: 'Yes', 
    stability_score: parseFloat(stabScore.toFixed(1)),
    
    // Legacy Pose object
    pose: { 
      headTilt: parseFloat(absHead.toFixed(1)), 
      shoulderTilt: parseFloat(absShoulder.toFixed(1)), 
      spineAngle: parseFloat(angleBack.toFixed(1)), 
      stabilityScore: parseFloat((stabScore / 100).toFixed(2)), 
      forwardHeadZ: parseFloat(zScore.toFixed(2)), 
      maxArmAngle: parseFloat(maxArmAngle.toFixed(1)), 
      maxLegAngle: parseFloat(maxLegAngle.toFixed(1)) 
    },
    
    // Backend requirement 2: angles object shape
    angles: { 
      head_deviation: parseFloat(absHead.toFixed(1)), 
      shoulder_tilt: parseFloat(absShoulder.toFixed(1)), 
      forward_head_z: parseFloat(zScore.toFixed(2)), 
      back_deviation: parseFloat(angleBack.toFixed(1)), 
      maxArmAngle: parseFloat(maxArmAngle.toFixed(1)), 
      maxLegAngle: parseFloat(maxLegAngle.toFixed(1)),
      stability_norm: parseFloat((stabScore / 100).toFixed(2)) 
    },
    
    // Legacy Outfit object (Clean labels for UI display fallback)
    outfit: { 
      top: cleanLabel(clothingLabels.top) || 'unknown', 
      bottom: cleanLabel(clothingLabels.bottom) || 'unknown', 
      footwear: cleanLabel(clothingLabels.foot) || 'unknown', 
      head: cleanLabel(clothingLabels.head) || 'unknown' 
    },
    
    // 🚀 Backend requirement 3: clothing object shape WITH TAGS preserved
    clothing: { 
      // Basic Types (Type classification usually doesn't have tags, so cleanLabel is fine, or keep raw)
      top: cleanLabel(clothingLabels.top) || 'unknown', 
      bottom: cleanLabel(clothingLabels.bottom) || 'unknown', 
      foot: cleanLabel(clothingLabels.foot) || 'unknown', 
      head: cleanLabel(clothingLabels.head) || 'unknown', 
      
      accessory: cleanLabel(clothingLabels.accessory) || 'none', 
      
      // ✅ VITAL: Do NOT use cleanLabel here. Keep (true)/(false) tags for backend scoring.
      // Set default values to include tags for safety.
      topState: clothingLabels.topState || "Unknown (false)", 
      bottomState: clothingLabels.bottomState || "Unknown (false)", 
      topCondition: clothingLabels.topCondition || "Unknown (false)", 
      headState: clothingLabels.headState || "Unknown (false)", 
      
      footCheck: clothingLabels.footCheck || "Pass (true)", 
      sleeveCheck: clothingLabels.sleeveCheck || "Pass (true)",
      
      top_color: topColor, 
      bottom_color: botColor 
    },
    
    uiData: { 
      statusText: 'FULL BODY', 
      postureLines: generatePostureLines(angleBack, angleHead, zScore, absShoulder, maxLegAngle), 
      colors: { top: topColor, bottom: botColor } 
    },
  };
}

export async function runAIAnalysis(imageElement, canvasElement) {
  if (engineState.status !== EngineStatus.READY) await initAIEngine();
  
  // [수정됨] 매 분석마다 Pose 모델을 리셋하여 잔상 제거
  engineState.pose.reset();

  currentJobId += 1;
  const jobId = currentJobId;
  pending = null;
  
  return new Promise((resolve, reject) => {
    pending = { jobId, resolve, reject, payload: { imageElement, canvasElement } };
    Promise.resolve(engineState.pose.send({ image: imageElement })).catch(e => {
      if (pending?.jobId === jobId) pending.resolve({ ok: false, error: 'POSE_SEND_FAILED' });
    });
  });
}