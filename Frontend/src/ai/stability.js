
const PoseLandmark = {
  NOSE: 0,
  LEFT_EYE_INNER: 1, LEFT_EYE: 2, LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4, RIGHT_EYE: 5, RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7, RIGHT_EAR: 8,
  MOUTH_LEFT: 9, MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_PINKY: 17, RIGHT_PINKY: 18,
  LEFT_INDEX: 19, RIGHT_INDEX: 20,
  LEFT_THUMB: 21, RIGHT_THUMB: 22,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
  LEFT_HEEL: 29, RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31, RIGHT_FOOT_INDEX: 32
};

export function stabilitySingleImage(results) {
  if (!results.poseLandmarks) return 0;

  const lm = results.poseLandmarks;

  const ls = lm[PoseLandmark.LEFT_SHOULDER];
  const rs = lm[PoseLandmark.RIGHT_SHOULDER];
  const lh = lm[PoseLandmark.LEFT_HIP];
  const rh = lm[PoseLandmark.RIGHT_HIP];
  const nose = lm[PoseLandmark.NOSE];

  const shoulderWidth = Math.abs(ls.x - rs.x);
  if (shoulderWidth < 0.05) return 0;

  const midShoulderX = (ls.x + rs.x) / 2;
  const midHipX = (lh.x + rh.x) / 2;

  const rawShoulder = Math.abs(ls.y - rs.y) / shoulderWidth;
  const normShoulderSym = Math.max(0, rawShoulder - 0.02);

  const rawHip = Math.abs(lh.y - rh.y) / shoulderWidth;
  const normHipSym = Math.max(0, rawHip - 0.05);

  const rawHeadOff = Math.abs(nose.x - midShoulderX) / shoulderWidth;
  const normHeadOffset = Math.max(0, rawHeadOff - 0.04);

  const rawBodyOff = Math.abs(midShoulderX - midHipX) / shoulderWidth;
  const normBodyOffset = Math.max(0, rawBodyOff - 0.04);

  const midShoulderZ = (ls.z + rs.z) / 2;
  const rawForwardLean = midShoulderZ - nose.z;
  const rawRatioZ = Math.max(0, rawForwardLean / shoulderWidth);

  const baselineZ = 1.5;
  const excessLean = Math.max(0, rawRatioZ - baselineZ);
  const forwardHeadPenalty = excessLean * 15;

  const penalty =
    normShoulderSym * 150 +
    normHipSym * 100 +
    normHeadOffset * 120 +
    normBodyOffset * 120 +
    forwardHeadPenalty;

  const score = 100 - penalty;
  return Math.max(0, Math.round(score * 10) / 10);
}