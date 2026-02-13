
function hsvToLabel(h, s, v) {
    if (v < 60) return "black";
    if (v > 200 && s < 40) return "white";
    if (s < 40) return "gray";

    if (h < 10 || h >= 160) return "red";

    if (h >= 10 && h < 25) {
        if (v < 120) return "brown";
        return "orange";
    }

    if (h >= 25 && h < 35) return "kaki";
    if (h >= 35 && h < 85) return "green";
 if (h >= 85 && h < 130) {
    if (v < 100) return "darkblue";
    return "blue";
}


    if (h >= 130 && h < 160) return "purple";

    return "unknown";
}


export function getDominantColor(roi) {
    if (!roi || roi.empty()) return "unknown";

    const hsv = new cv.Mat();
    cv.cvtColor(roi, hsv, cv.COLOR_BGR2HSV);

    const channels = new cv.MatVector();
    cv.split(hsv, channels);

    const hMat = channels.get(0);
    const sMat = channels.get(1);
    const vMat = channels.get(2);

    let colorCount = 0;
    let lowSatCount = 0;
    let sSum = 0, vSum = 0;
    const hVals = [];

    for (let i = 0; i < hMat.rows; i++) {
        for (let j = 0; j < hMat.cols; j++) {
            const s = sMat.ucharPtr(i, j)[0];
            const v = vMat.ucharPtr(i, j)[0];
            const h = hMat.ucharPtr(i, j)[0];

            if (v < 40) continue;

            if (s < 30 && v > 150) {
                lowSatCount++;
            }

            if (s > 50 && v > 60) {
                hVals.push(h);
                sSum += s;
                vSum += v;
                colorCount++;
            }
        }
    }

    const totalPixels = roi.rows * roi.cols;

    // ⭐ WHITE / GRAY ưu tiên
    if (lowSatCount > totalPixels * 0.4) {
        hsv.delete(); channels.delete(); hMat.delete(); sMat.delete(); vMat.delete();
        return "white";
    }

    if (colorCount < totalPixels * 0.05) {
        hsv.delete(); channels.delete(); hMat.delete(); sMat.delete(); vMat.delete();
        return "gray";
    }

    const hist = new Array(180).fill(0);
    for (const hv of hVals) hist[hv]++;

    const dominantH = hist.indexOf(Math.max(...hist));
    const avgS = sSum / colorCount;
    const avgV = vSum / colorCount;

    hsv.delete(); channels.delete(); hMat.delete(); sMat.delete(); vMat.delete();

    return hsvToLabel(dominantH, avgS, avgV);
}



export function colorTop(image, results) {
    if (!results.poseLandmarks) return "unknown";

    const lm = results.poseLandmarks;
    const hImg = image.rows;
    const wImg = image.cols;

    const pts = [lm[11], lm[12], lm[23], lm[24]];

    let xs = pts.map(p => Math.floor(p.x * wImg));
    let ys = pts.map(p => Math.floor(p.y * hImg));

    let x1 = Math.max(0, Math.min(...xs));
    let x2 = Math.min(wImg, Math.max(...xs));
    let y1 = Math.max(0, Math.min(...ys));
    let y2 = Math.min(hImg, Math.max(...ys));

    const roiW = x2 - x1;
    const roiH = y2 - y1;

    // crop trên dưới
    y1 += roiH * 0.25;
    y2 -= roiH * 0.15;

    // ⭐ LOẠI TRỪ VÙNG GIỮA (tie zone)
    const centerLeft = x1 + roiW * 0.3;
    const centerRight = x2 - roiW * 0.3;

    if (centerLeft >= centerRight) return "unknown";

    const leftROI = image.roi(new cv.Rect(
        x1,
        y1,
        centerLeft - x1,
        y2 - y1
    ));

    const rightROI = image.roi(new cv.Rect(
        centerRight,
        y1,
        x2 - centerRight,
        y2 - y1
    ));

    const leftColor = getDominantColor(leftROI);
    const rightColor = getDominantColor(rightROI);

    leftROI.delete();
    rightROI.delete();

    // nếu 2 bên giống nhau → áo
    if (leftColor === rightColor) return leftColor;

    // ưu tiên màu sáng hơn
    if (leftColor === "white" || leftColor === "gray") return leftColor;
    if (rightColor === "white" || rightColor === "gray") return rightColor;

    return leftColor;
}



export function colorBottom(image, results) {
    if (!results.poseLandmarks) return "unknown";

    const lm = results.poseLandmarks;
    const hImg = image.rows;
    const wImg = image.cols;

    const pts = [lm[23], lm[24], lm[25], lm[26]]; 
    let xs = pts.map(p => Math.floor(p.x * wImg));
    let ys = pts.map(p => Math.floor(p.y * hImg));

    let x1 = Math.max(0, Math.min(...xs));
    let x2 = Math.min(wImg, Math.max(...xs));
    let y1 = Math.max(0, Math.min(...ys));
    let y2 = Math.min(hImg, Math.max(...ys));

    const roiW = x2 - x1;
    const roiH = y2 - y1;

    x1 = Math.floor(x1 + roiW * 0.3);
    x2 = Math.floor(x2 - roiW * 0.3);
    y1 = Math.floor(y1 + roiH * 0.2);
    y2 = Math.floor(y2 - roiH * 0.2);

    if (x1 >= x2 || y1 >= y2) return "unknown";

    const roi = image.roi(new cv.Rect(x1, y1, x2 - x1, y2 - y1));
    const color = getDominantColor(roi);
    roi.delete();
    return color;
}