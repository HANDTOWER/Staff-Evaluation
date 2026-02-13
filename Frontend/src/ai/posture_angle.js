
function calculateAngle(a, b, c) {
    const ba = a.map((v, i) => v - b[i]);
    const bc = c.map((v, i) => v - b[i]);

    const dot = ba.reduce((s, v, i) => s + v * bc[i], 0);
    const normBA = Math.hypot(...ba);
    const normBC = Math.hypot(...bc);

    if (normBA === 0 || normBC === 0) return 0;

    let cosine = dot / (normBA * normBC);
    cosine = Math.max(-1, Math.min(1, cosine));

    return 180 - (Math.acos(cosine) * 180 / Math.PI);
}


export function forwardHeadScoreFront(results) {
    const lm = results.poseLandmarks;
    if (!lm) return [0, 0];

    const nose = lm[0];
    const ls = lm[11];
    const rs = lm[12];
    const leftEar = lm[7];
    const rightEar = lm[8];

    const shoulderWidth = Math.hypot(ls.x - rs.x, ls.y - rs.y);
    if (shoulderWidth < 0.01) return [0, 0];

    const shoulderZ = (ls.z + rs.z) / 2;
    const rawForwardZ = shoulderZ - nose.z;
    const normalizedZScore = rawForwardZ / shoulderWidth;

    const earY = (leftEar.y + rightEar.y) / 2;
    const noseDrop = (nose.y - earY) / shoulderWidth;

    return [normalizedZScore, noseDrop];
}


export function shoulderAngle(results) {
    const lm = results.poseLandmarks;
    if (!lm) return 0;

    const ls = lm[11];
    const rs = lm[12];

    const dx = Math.abs(ls.x - rs.x);
    const dy = ls.y - rs.y;

    return Math.atan2(dy, dx) * 180 / Math.PI;
}


export function checkArmsStatus(results) {
    const lm = results.poseLandmarks;
    if (!lm) return [0, 0];

    const angles = [];
    for (const side of ["LEFT", "RIGHT"]) {
        const shoulder = lm[side === "LEFT" ? 11 : 12];
        const elbow = lm[side === "LEFT" ? 13 : 14];
        const wrist = lm[side === "LEFT" ? 15 : 16];

        const angle = calculateAngle(
            [shoulder.x, shoulder.y],
            [elbow.x, elbow.y],
            [wrist.x, wrist.y]
        );
        angles.push(angle);
    }
    return angles; 
}

export function backAngleFront(results) {
    const lm = results.poseLandmarks;
    if (!lm) return 0;

    const midShoulder = [
        (lm[11].x + lm[12].x) / 2,
        (lm[11].y + lm[12].y) / 2,
        (lm[11].z + lm[12].z) / 2
    ];

    const midHip = [
        (lm[23].x + lm[24].x) / 2,
        (lm[23].y + lm[24].y) / 2,
        (lm[23].z + lm[24].z) / 2
    ];

    const midKnee = [
        (lm[25].x + lm[26].x) / 2,
        (lm[25].y + lm[26].y) / 2,
        (lm[25].z + lm[26].z) / 2
    ];

    return calculateAngle(midShoulder, midHip, midKnee);
}

export function checkLegsStatus(results) {
    const lm = results.poseLandmarks;
    if (!lm) return [0, 0];

    const angles = [];
    for (const side of ["LEFT", "RIGHT"]) {
        const hip = lm[side === "LEFT" ? 23 : 24];
        const knee = lm[side === "LEFT" ? 25 : 26];
        const ankle = lm[side === "LEFT" ? 27 : 28];

        const angle = calculateAngle(
            [hip.x, hip.y, hip.z],
            [knee.x, knee.y, knee.z],
            [ankle.x, ankle.y, ankle.z]
        );
        angles.push(angle);
    }
    return angles; 
}

function calculateAngle2DPixel(a, b, c) {
    const ba = [a[0] - b[0], a[1] - b[1]];
    const bc = [c[0] - b[0], c[1] - b[1]];

    const dot = ba[0] * bc[0] + ba[1] * bc[1];
    const normBA = Math.hypot(...ba);
    const normBC = Math.hypot(...bc);

    if (normBA === 0 || normBC === 0) return 0;

    let cosine = dot / (normBA * normBC);
    cosine = Math.max(-1, Math.min(1, cosine));

    return 180 - (Math.acos(cosine) * 180 / Math.PI);
}


export function headAngle(results, w, h) {
    const lm = results.poseLandmarks;
    if (!lm) return 0;

    const nose = [lm[0].x * w, lm[0].y * h];
    const midShoulder = [
        ((lm[11].x + lm[12].x) / 2) * w,
        ((lm[11].y + lm[12].y) / 2) * h
    ];
    const midHip = [
        ((lm[23].x + lm[24].x) / 2) * w,
        ((lm[23].y + lm[24].y) / 2) * h
    ];

    return calculateAngle2DPixel(nose, midShoulder, midHip);
}

export function backTilt(results, w, h) {
    const lm = results.poseLandmarks;
    if (!lm) return 0;

    const midShoulder = [
        ((lm[11].x + lm[12].x) / 2) * w,
        ((lm[11].y + lm[12].y) / 2) * h
    ];
    const midHip = [
        ((lm[23].x + lm[24].x) / 2) * w,
        ((lm[23].y + lm[24].y) / 2) * h
    ];
    const midKnee = [
        ((lm[25].x + lm[26].x) / 2) * w,
        ((lm[25].y + lm[26].y) / 2) * h
    ];

    return calculateAngle2DPixel(midShoulder, midHip, midKnee);
}


export function convertScoreToDegree(score) {
    const baseline = 1.5;
    const excess = Math.max(0, score - baseline);
    return Math.min(excess * 30, 60);
}