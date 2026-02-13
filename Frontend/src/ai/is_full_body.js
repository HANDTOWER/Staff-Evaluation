

export function isFullBody(poseLandmarks, visibilityThresh = 0.5, margin = 0.05) {
    if (!poseLandmarks || poseLandmarks.length === 0) {
        return false;
    }

    // MediaPipe Pose landmark indices
    const REQUIRED_LANDMARKS = [
        0,  
        11, 
        12, 
        23, 
        24, 
        25, 
        26, 
        27, 
        28  
    ];

    for (const idx of REQUIRED_LANDMARKS) {
        const lm = poseLandmarks[idx];
        if (!lm || lm.visibility < visibilityThresh) {
            return false;
        }
    }

    const HEAD_LANDMARKS = [
        0, 
        2, 
        5, 
        7, 
        8  
    ];

    let visibleHead = 0;

    for (const idx of HEAD_LANDMARKS) {
        const lm = poseLandmarks[idx];
        if (!lm || lm.visibility < visibilityThresh) continue;

        if (lm.x < margin || lm.x > 1 - margin) continue;
        if (lm.y < margin || lm.y > 1 - margin) continue;

        visibleHead++;
    }

    return visibleHead >= 3;
}
