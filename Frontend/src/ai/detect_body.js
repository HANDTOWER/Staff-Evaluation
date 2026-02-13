import { AutoTokenizer } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.4";

// 코사인 유사도 계산 함수
function cosineSimilarity(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export class DetectBodyCLIP {
    constructor() {
        this.tokenizer = null;
        this.textSession = null;
        this.imageSession = null;
        this.textCache = {};

        this.labels = {
            top: [
                "a short-sleeve t-shirt with no collar",
                "a sleeveless tank top",
                "open jacket lapels with visible shirt underneath",
                "a light blue button-down shirt with a collar and rolled-up sleeves",
                "a white button-down shirt with a collar",
                "a person wearing a polo shirt with a folded collar",
                "a person wearing a denim shirt",
                "a person wearing a formal button-down shirt",
                "a person wearing a long-sleeve button-down dress shirt with collar",
                "a person wearing a short-sleeve button-down shirt with collar",
                "a light blue casual button-down shirt with a collar",
                "a linen shirt with rolled-up sleeves",
                "a white button-down shirt",
                "a person wearing a light blue button-down shirt with a collar and rolled-up sleeves",
                "a person wearing a white button-down shirt with a collar",
                "a person wearing a hoodie",
                "a person wearing a jacket",
                "a person wearing a tank top",
                "a person with a bare torso",
                "a person wearing a windbreaker",
                "a person wearing a formal uniform jacket"
            ],
            waist_side: [
                "waistband and belt are visibly separating shirt and pants",
                "shirt entered into the trousers",
                "a belt buckle sitting on the waist",
                "shirt hem hanging down over the hips",
                "shirt fabric covering the entire waist area",
                "no belt visible, shirt covers the pants waist",
                "untucked shirt tail",
                "messy shirt sticking out of pants",
                "uneven shirt hem line",
                "shirt pulled out of waistband"
            ],
            head_state: [
                "neatly combed hair (true)",
                "messy unkempt hair (false)",
                "wearing a hat or cap (false)"
            ],
            bottom_type: [
                "long trousers covering the entire legs",
                "short pants revealing knees and calves",
                "a skirt or dress revealing legs"
            ],
            top_condition: [
                "clean shirt with natural lighting shadows (true)",
                "intact fabric surface (true)",
                "shirt with normal fabric texture (true)",
                "heavily wrinkled unironed shirt (false)",
                "clothing with messy deep creases (false)",
                "crumpled fabric looking messy (false)",
                "clearly wrinkled shirt with visible fold lines across the torso (false)",
                "shirt with obvious wrinkles on the abdomen area (false)",
                "shirt with distinct colored stains (false)",
                "dirty clothing with mud spots (false)"
            ],
            sleeve_state: [
                "long sleeve covering the whole arm to the wrist",
                "full length dress shirt sleeve",
                "short sleeve t-shirt revealing the whole arm",
                "short sleeve polo shirt",
                "bare arm with short sleeves",
                "long sleeve shirt with rolled up sleeves",
                "folded shirt sleeves exposing the forearm",
                "sleeves rolled up to the elbow"
            ],
            bottom: [
                "a person wearing blue denim jeans",
                "a person wearing white pants or white trousers",
                "a person wearing light colored chinos or khakis",
                "a person wearing denim jeans pants",
                "a person wearing formal trousers",
                "a person wearing casual long pants",
                "a person wearing shorts or short pants",
                "a person wearing joggers or sweatpants",
            ],
            foot: [
                "a person wearing sneakers",
                "a person wearing boots",
                "a person wearing formal shoes",
                "a person wearing leather shoes",
                "a person wearing sandals",
                "a person wearing flip-flops",
                "completely bare feet",
                "no shoes, bare feet"
            ],
            head: [
                "a person wearing a straw fedora hat with a ribbon",
                "a person wearing a fedora hat",
                "a person wearing a baseball cap",
                "a person wearing a beanie",
                "a person wearing a sun hat",
                "a person with hair and no hat",
                "a person with a bald head",
                "a person's head with hair, no hat",
                "a person wearing a peaked cap"
            ],
            // [수정됨] 액세서리 라벨 구체화
            chest_accessory: [
                // 1. Necktie (넥타이 특징 강조)
                "a necktie hanging on a shirt",
                "a tie knot at the collar",
                "a person wearing a formal tie",
                "a bow tie",

                // 2. ID Card / Lanyard (줄, 카드 특징 강조)
                "a lanyard strap around the neck",
                "an identification badge hanging on the chest",
                "an employee ID card with a strap",
                "a plastic badge holder on a shirt",
                "a blue lanyard string",

                // 3. None (없음 상태를 더 강력하게 묘사)
                "a plain shirt without any accessories",
                "a clean chest area with no straps or ties",
                "an open collar shirt showing only skin",
                "a plain white button-down shirt",
                "just a shirt fabric, nothing else"
            ],
        };

        this.labelMap = {
            "a light blue button-down shirt with a collar and rolled-up sleeves": "casual shirt",
            "a white button-down shirt with a collar": "formal shirt",
            "a plain standard crew neck t-shirt, no buttons": "t-shirt",
            "a plain v-neck t-shirt, no buttons": "t-shirt",
            "a person wearing a long-sleeve button-down dress shirt with collar": "long-sleeve button-down dress shirt with collar",
            "a person wearing a short-sleeve button-down shirt with collar": "short-sleeve button-down shirt with collar",
            "a henley shirt with visible buttons on chest": "henley shirt",
            "a polo shirt with a folded collar": "shirt",
            "a formal button-down shirt": "formal shirt",
            "a tank top": "tank top",
            "a hoodie": "outerwear",
            "a jacket": "outerwear",
            "a windbreaker": "outerwear",
            "a formal uniform jacket": "outerwear",
            "a bare torso": "bare torso",
            "long trousers covering the entire legs": "long_pants",
            "short pants revealing knees and calves": "shorts",
            "a skirt or dress revealing legs": "shorts",

            "a casual solid color button-down shirt": "casual shirt",
            "a linen shirt with rolled up sleeves": "casual shirt",
            "blue denim jeans": "jeans",
            "white pants or white trousers": "white pants",
            "light colored chinos or khakis": "khaki pants",
            "formal trousers": "trousers",
            "casual long pants": "trousers",
            "shorts or short pants": "shorts",
            "joggers or sweatpants": "joggers",

            "sneakers": "sneakers",
            "leather shoes": "leather shoes",
            "formal shoes": "formal shoes",
            "sandals": "sandals",
            "flip-flops": "sandals",
            "bare feet": "bare feet",
            "no shoes, bare feet": "bare feet",

            "a baseball cap": "baseball cap",
            "peaked cap": "peaked cap",
            "a beanie": "beanie",
            "a sun hat": "sun hat",
            "hair and no hat": "no hat",
            "a bald head": "no hat",
            "head with hair, no hat": "no hat",
            "waistband and belt are visibly separating shirt and pants": "tucked",
            "shirt entered into the trousers": "tucked",
            "a belt buckle sitting on the waist": "tucked",

            "shirt hem hanging down over the hips": "untucked",
            "shirt fabric covering the entire waist area": "untucked",
            "no belt visible, shirt covers the pants waist": "untucked",
            "untucked shirt tail": "untucked",
            "messy shirt sticking out of pants": "untucked",
            "uneven shirt hem line": "untucked",
            "shirt pulled out of waistband": "untucked",

            "clean shirt with natural lighting shadows": "true",
            "intact fabric surface": "true",
            "shirt with normal fabric texture": "true",

            "heavily wrinkled unironed shirt": "false",
            "clothing with messy deep creases": "false",
            "crumpled fabric looking messy": "false",
            "clearly wrinkled shirt with visible fold lines across the torso": "false",
            "shirt with obvious wrinkles on the abdomen area": "false",

            "shirt with distinct colored stains": "false",
            "dirty clothing with mud spots": "false",

            // [수정됨] 액세서리 매핑 추가
            "a necktie hanging on a shirt": "necktie",
            "a tie knot at the collar": "necktie",
            "a person wearing a formal tie": "necktie",
            "a bow tie": "necktie",

            "a lanyard strap around the neck": "id_card",
            "an identification badge hanging on the chest": "id_card",
            "an employee ID card with a strap": "id_card",
            "a plastic badge holder on a shirt": "id_card",
            "a blue lanyard string": "id_card",

            "a plain shirt without any accessories": "none",
            "a clean chest area with no straps or ties": "none",
            "an open collar shirt showing only skin": "none",
            "a plain white button-down shirt": "none",
            "just a shirt fabric, nothing else": "none",

            "a person wearing a necktie": "necktie",
            "a close-up of a tie knot": "necktie",
            "a bow tie": "necktie",
            "a police officer wearing a uniform with metal badges and a necktie": "necktie",
            "a dark blue tie worn with a police uniform": "necktie",
            "a business man wearing a tie with a white shirt": "necktie",
            "a dark necktie contrasting on a light shirt": "necktie",
            "a visible tie hanging down the chest": "necktie",

            "an employee id card hanging on a lanyard": "id_card",
            "an identification badge holder on the chest": "id_card",

            "a lanyard strap around the neck": "lanyard",
            "a plastic id badge holder": "id_card",

            "an open collar shirt showing the neck": "none",
            "a white shirt with an open collar and absolutely no tie": "none",
            "a t-shirt or polo shirt": "none",
            "a bare chest or neck area": "none",
            "a white shirt with an open collar and absolutely no tie": "none",
            "a casual t-shirt": "none",
            "a polo shirt": "none",
            "a bare chest with no clothes": "none",
            "visible neck skin": "none",
            "an undershirt": "none",
            "open collar shirt revealing the neck and chest": "none",

            "torn pants with a hole revealing bare skin": "torn pants",
            "ripped trousers showing the knee cap": "torn pants",
            "shredded clothing with large gaps": "torn pants",

            "muddy pants with heavy dirt stains": "dirty pants",
            "dirty shirt with visible food stains": "dirty shirt",
            "clothing with dark dirt spots and mud": "dirty shirt",
        };
    }

    async init() {
        if (typeof ort === 'undefined') throw new Error("ONNX Runtime not found!");
        this.tokenizer = await AutoTokenizer.from_pretrained("tokenizer/", { use_fast: false });
        this.textSession = await ort.InferenceSession.create("models/Clip-model/text_encoder_quant.onnx", { executionProviders: ["wasm"] });
        this.imageSession = await ort.InferenceSession.create("models/Clip-model/image_encoder_quant.onnx", { executionProviders: ["wasm"] });
        console.log("✅ CLIP Body Detector (High Accuracy) Ready");
    }

    checkLegRegions(ctx, box) {
        if (!box || box.w <= 0 || box.h <= 0) return { legSkin: 0, ankleSkin: 0 };

        const scanY = box.y + (box.h * 0.35);
        const scanH = box.h * 0.30;
        const leftLegX = box.x + (box.w * 0.10);
        const rightLegX = box.x + (box.w * 0.70);
        const legW = box.w * 0.20;

        const leftSkin = this.getSkinRatio(ctx, { x: leftLegX, y: scanY, w: legW, h: scanH });
        const rightSkin = this.getSkinRatio(ctx, { x: rightLegX, y: scanY, w: legW, h: scanH });

        const ankleY = box.y + (box.h * 0.85);
        const ankleH = box.h * 0.15;
        const ankleSkin = this.getSkinRatio(ctx, { x: box.x, y: ankleY, w: box.w, h: ankleH });

        return {
            legSkin: Math.max(leftSkin, rightSkin),
            ankleSkin: ankleSkin
        };
    }

    getSkinRatio(ctx, box) {
        if (!window.cv || !box || box.w <= 0 || box.h <= 0) return 0;

        const x = Math.floor(box.x);
        const y = Math.floor(box.y);
        const w = Math.floor(box.w);
        const h = Math.floor(box.h);

        try {
            const imageData = ctx.getImageData(x, y, w, h);
            let src = cv.matFromImageData(imageData);
            let ycrcb = new cv.Mat();

            let tempRGB = new cv.Mat();
            cv.cvtColor(src, tempRGB, cv.COLOR_RGBA2RGB);
            cv.cvtColor(tempRGB, ycrcb, cv.COLOR_RGB2YCrCb);
            let low = new cv.Mat(ycrcb.rows, ycrcb.cols, ycrcb.type(), [60, 133, 77, 0]);
            let high = new cv.Mat(ycrcb.rows, ycrcb.cols, ycrcb.type(), [255, 173, 127, 255]);

            let mask = new cv.Mat();
            cv.inRange(ycrcb, low, high, mask);

            let kernel = cv.Mat.ones(5, 5, cv.CV_8U);
            cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);

            let skinPixels = cv.countNonZero(mask);
            let totalPixels = w * h;
            let ratio = totalPixels > 0 ? skinPixels / totalPixels : 0;

            src.delete(); tempRGB.delete(); ycrcb.delete();
            low.delete(); high.delete(); mask.delete(); kernel.delete();

            return ratio;
        } catch (err) {
            console.error("Error in getSkinRatio:", err);
            return 0;
        }
    }

    getFootwearCategory(label) {
        const closedShoes = ["sneakers", "leather_shoes", "boots", "formal_shoes", "shoes"];
        const openSandals = ["sandals", "flip-flops", "slippers"];
        const bareFeet = ["bare_feet"];

        if (bareFeet.includes(label)) return "BARE";
        if (openSandals.includes(label)) return "SANDAL";
        if (closedShoes.includes(label)) return "SHOE";

        return "UNKNOWN";
    }

    preprocessImage(ctx, x, y, w, h) {
        const canvas = document.createElement("canvas");
        canvas.width = 224; canvas.height = 224;
        const c = canvas.getContext("2d");

        c.fillStyle = "#777";
        c.fillRect(0, 0, 224, 224);

        const size = Math.max(w, h);
        const startX = (x + w / 2) - size / 2;
        const startY = (y + h / 2) - size / 2;

        c.drawImage(ctx.canvas, startX, startY, size, size, 0, 0, 224, 224);
        const img = c.getImageData(0, 0, 224, 224).data;
        const data = new Float32Array(3 * 224 * 224);

        const mean = [0.48145466, 0.4578275, 0.40821073];
        const std = [0.26862954, 0.26130258, 0.27577711];

        for (let i = 0; i < 224 * 224; i++) {
            data[i] = ((img[i * 4] / 255) - mean[0]) / std[0];
            data[i + 50176] = ((img[i * 4 + 1] / 255) - mean[1]) / std[1];
            data[i + 100352] = ((img[i * 4 + 2] / 255) - mean[2]) / std[2];
        }
        return new ort.Tensor("float32", data, [1, 3, 224, 224]);
    }

    async encodeText(category) {
        if (this.textCache[category]) return;
        const prompts = this.labels[category];
        const tokens = await this.tokenizer(prompts, { padding: true, truncation: true });
        const ids = new BigInt64Array(Array.from(tokens.input_ids.data).map(v => BigInt(v)));
        const input = new ort.Tensor("int64", ids, tokens.input_ids.dims);
        const output = await this.textSession.run({ input_ids: input });
        const data = output[this.textSession.outputNames.at(-1)].data;

        this.textCache[category] = prompts.map((label, i) => ({
            displayLabel: label.replace("a person wearing ", "").replace("a person with ", "").replace("a person's ", "").replace("completely ", ""),
            embedding: data.slice(i * 512, (i + 1) * 512)
        }));
    }

    async predict(ctx, box, category, returnDetailed = false) {
        if (!box || box.w <= 5) return "unknown";

        if (category === "foot") {
            const sr = this.getSkinRatio(ctx, box);
            console.log("Skin Foot", sr);
            if (sr > 0.5) return "bare feet";
        }

        await this.encodeText(category);
        const imageTensor = this.preprocessImage(ctx, box.x, box.y, box.w, box.h);
        const output = await this.imageSession.run({ pixel_values: imageTensor });
        const imageEmbedding = output[this.imageSession.outputNames.at(-1)].data;

        let best = { label: "unknown", score: -Infinity };
        for (const item of this.textCache[category]) {
            const score = cosineSimilarity(imageEmbedding, item.embedding);
            if (score > best.score) best = { label: item.displayLabel, score };
        }

        if (category === "foot" && best.label.includes("feet")) {
            const sr = this.getSkinRatio(ctx, box);
            if (sr < 0.10) return "shoes";
        }

        const mappedLabel = this.labelMap[best.label] || best.label;

        if (returnDetailed) {
            return `${best.label}(${mappedLabel})`;
        }

        return mappedLabel;
    }

    _getBox(lm, indices, w, h, padW = 0.1, padH = 0.1) {
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        let hasPoint = false;

        indices.forEach(i => {
            if (lm[i] && (lm[i].visibility === undefined || lm[i].visibility > 0.1)) {
                minX = Math.min(minX, lm[i].x);
                maxX = Math.max(maxX, lm[i].x);
                minY = Math.min(minY, lm[i].y);
                maxY = Math.max(maxY, lm[i].y);
                hasPoint = true;
            }
        });

        if (!hasPoint) {
            console.warn("Không tìm thấy điểm landmarks cho indices:", indices);
            return { x: 0, y: 0, w: 0, h: 0 };
        }

        const bw = (maxX - minX) * w;
        const bh = (maxY - minY) * h;

        let x = Math.max(0, (minX * w) - (bw * padW));
        let y = Math.max(0, (minY * h) - (bh * padH));
        let boxW = Math.min(w - x, bw * (1 + 2 * padW));
        let boxH = Math.min(h - y, bh * (1 + 2 * padH));

        return { x, y, w: boxW, h: boxH };
    }

    createBoxes(lm, w, h) {
        let headBox = this._getBox(lm, [1, 4, 7, 8, 0], w, h, 0.3, 0.1);
        if (headBox.w > 0) {
            const headHeight = headBox.h;
            const expandTop = headHeight * 1.2;
            headBox.y = Math.max(0, headBox.y - expandTop);
            headBox.h = headBox.h + expandTop;
        }

        // [수정됨] Chest Box 로직 개선 (가슴 상단 집중)
        let chestBox = { x: 0, y: 0, w: 0, h: 0 };
        if (lm[11] && lm[12] && lm[23] && lm[24]) {
            const shoulderCenterX = (lm[11].x + lm[12].x) / 2;
            const shoulderY = (lm[11].y + lm[12].y) / 2;
            const hipY = (lm[23].y + lm[24].y) / 2;

            // [수정] 너비를 좁게 (0.8 -> 0.7)
            const shoulderWidth = Math.abs(lm[11].x - lm[12].x);
            const boxW = (shoulderWidth * w) * 0.7;

            // [수정] 높이를 상체 상단 60%로 제한 (1.1 -> 0.6)
            const torsoHeight = Math.abs(hipY - shoulderY);
            const boxH = (torsoHeight * h) * 0.6;

            const boxX = (shoulderCenterX * w) - (boxW / 2);
            // [수정] 시작점(Y)을 어깨보다 살짝 위로
            const boxY = (shoulderY * h) - (boxH * 0.15);

            chestBox = {
                x: Math.max(0, boxX),
                y: Math.max(0, boxY),
                w: boxW,
                h: boxH
            };
        }

        const topTypeBox = this._getBox(lm, [11, 12, 23, 24], w, h, 0.15, 0.15);

        let waistLeft = { x: 0, y: 0, w: 0, h: 0 };
        let waistRight = { x: 0, y: 0, w: 0, h: 0 };
        let waistCenter = { x: 0, y: 0, w: 0, h: 0 };
        let topStateBox = { ...topTypeBox };

        if (topStateBox.w > 0) {
            const originY = topStateBox.y;
            const originH = topStateBox.h;
            topStateBox.y = originY + (originH * 0.75);

            topStateBox.h = originH * 0.4;

            const expandW = topStateBox.w * 0.15;
            topStateBox.x = Math.max(0, topStateBox.x - expandW);
            topStateBox.w = topStateBox.w + (expandW * 2);

            topStateBox.h = Math.min(h - topStateBox.y, topStateBox.h);

            const spotWidth = topStateBox.w * 0.30;

            waistLeft = {
                x: topStateBox.x,
                y: topStateBox.y,
                w: spotWidth,
                h: topStateBox.h
            };

            waistCenter = {
                x: topStateBox.x + (topStateBox.w / 2) - (spotWidth / 2),
                y: topStateBox.y,
                w: spotWidth,
                h: topStateBox.h
            };

            waistRight = {
                x: topStateBox.x + topStateBox.w - spotWidth,
                y: topStateBox.y,
                w: spotWidth,
                h: topStateBox.h
            };
        }
        const footLeft = this._getBox(lm, [27, 29, 31], w, h, 0.3, 0.3);
        const footRight = this._getBox(lm, [28, 30, 32], w, h, 0.3, 0.3);
        const sleeveLeft = this._getBox(lm, [11, 13, 15], w, h, 0.12, 0.1);
        const sleeveRight = this._getBox(lm, [12, 14, 16], w, h, 0.12, 0.1);

        return {
            top: topTypeBox,
            waist_left: waistLeft,
            waist_center: waistCenter,
            waist_right: waistRight,
            top_state: topStateBox,
            bottom: this._getBox(lm, [23, 24, 27, 28], w, h, 0.1, 0.05),
            head: headBox,
            foot: this._getBox(lm, [27, 28, 31, 32], w, h, 0.5, 0.4),
            chest: chestBox,
            foot_left: footLeft,
            foot_right: footRight,
            sleeve_left: sleeveLeft,
            sleeve_right: sleeveRight
        };
    }

    async detectBody(ctx, lm, w, h) {
        const boxes = this.createBoxes(lm, w, h);

        const top = await this.predict(ctx, boxes.top, "top");
        const bottom = await this.predict(ctx, boxes.bottom, "bottom");
        const foot = await this.predict(ctx, boxes.foot, "foot");
        const head = await this.predict(ctx, boxes.head, "head");
        const headState = await this.predict(ctx, boxes.head, "head_state");
        const accessory = await this.predict(ctx, boxes.chest, "chest_accessory");
        const leftState = await this.predict(ctx, boxes.waist_left, "waist_side");
        const centerState = await this.predict(ctx, boxes.waist_center, "waist_side");
        const topCondition = await this.predict(ctx, boxes.top, "top_condition", true);
        const rightState = await this.predict(ctx, boxes.waist_right, "waist_side");
        const leftLabel = await this.predict(ctx, boxes.foot_left, "foot");
        const rightLabel = await this.predict(ctx, boxes.foot_right, "foot");
        const leftCat = this.getFootwearCategory(leftLabel);
        const rightCat = this.getFootwearCategory(rightLabel);

        let footCheck = {
            isConsistent: true,
            message: "Pass (true)",
            details: `Left: ${leftLabel} (${leftCat}) - Right: ${rightLabel} (${rightCat})`
        };

        if ((leftCat === "BARE" && rightCat !== "BARE") ||
            (leftCat !== "BARE" && rightCat === "BARE")) {
            footCheck.isConsistent = false;
            footCheck.message = " One foot is bare, the other has footwear! (false)";
        }
        else if ((leftCat === "SHOE" && rightCat === "SANDAL") ||
            (leftCat === "SANDAL" && rightCat === "SHOE")) {
            footCheck.isConsistent = false;
            footCheck.message = " Mismatched footwear type (Shoe vs Sandal)! (false)";
        }
        else if (leftCat === rightCat && leftCat !== "BARE" && leftLabel !== rightLabel) {
            footCheck.isConsistent = false;
            footCheck.message = ` Mismatched style (${leftLabel} vs ${rightLabel})! (false)`;
        }

        if (!footCheck.isConsistent) {
            console.warn(footCheck.message, footCheck.details);
        }

        // Sleeve Logic
        let leftSleeveLabel = await this.predict(ctx, boxes.sleeve_left, "sleeve_state");
        let rightSleeveLabel = await this.predict(ctx, boxes.sleeve_right, "sleeve_state");

        const leftSkin = this.getSkinRatio(ctx, boxes.sleeve_left);
        const rightSkin = this.getSkinRatio(ctx, boxes.sleeve_right);

        const SKIN_THRESHOLD_LOW = 0.015;
        const SKIN_THRESHOLD_HIGH = 0.30;

        const correctSleeveLabel = (label, skinRatio) => {
            const upperLabel = label ? label.toUpperCase() : "";

            if (upperLabel.includes("SHORT") && skinRatio < SKIN_THRESHOLD_LOW) {
                console.warn(`[Auto-Correct] Label says SHORT but skin is ${skinRatio.toFixed(3)} -> Force LONG`);
                return "LONG";
            }

            if ((upperLabel.includes("LONG") || upperLabel.includes("FULL")) && skinRatio > SKIN_THRESHOLD_HIGH) {
                console.warn(`[Auto-Correct] Label says LONG but skin is ${skinRatio.toFixed(3)} (> 30%) -> Force SHORT`);
                return "SHORT";
            }

            if (upperLabel.includes("LONG") || upperLabel.includes("FULL")) return "LONG";
            if (upperLabel.includes("SHORT") || upperLabel.includes("BARE") || upperLabel.includes("SLEEVELESS")) return "SHORT";
            if (upperLabel.includes("ROLLED")) return "ROLLED";

            return label;
        };

        leftSleeveLabel = correctSleeveLabel(leftSleeveLabel, leftSkin);
        rightSleeveLabel = correctSleeveLabel(rightSleeveLabel, rightSkin);

        let sleeveCheck = {
            isConsistent: true,
            message: "Sleeves matched (true)",
            details: `L: ${leftSleeveLabel} (${leftSkin.toFixed(3)}) - R: ${rightSleeveLabel} (${rightSkin.toFixed(3)})`
        };

        if (leftSleeveLabel !== rightSleeveLabel) {
            sleeveCheck.isConsistent = false;
            sleeveCheck.message = " WARNING: Mismatched sleeve style! (false)";
        }

        console.log(`SLEEVE FINAL: Left[${leftSleeveLabel}] | Right[${rightSleeveLabel}]`);

        // Scoring Logic
        let score = 0;
        const getScore = (status) => {
            if (status === "tucked") return 1;
            if (status === "untucked") return -3;
            if (status === "messy") return -3;
            return 0;
        };

        score += getScore(centerState);
        score += getScore(leftState);
        score += getScore(rightState);

        let finalTopState = "Clothing is untucked (false)";

        if (score > 0) {
            finalTopState = "Clothing is tucked (true)";
        } else {
            finalTopState = "Clothing is untucked (false)";
        }

        console.log(`Scoring: L(${leftState}) + C(${centerState}) + R(${rightState}) = ${score} -> ${finalTopState}`);

        // Bottom Logic
        const rawType = await this.predict(ctx, boxes.bottom, "bottom_type");
        const bottomLabel_pred = await this.predict(ctx, boxes.bottom, "bottom");

        let finalBottomState = "Unknown";

        console.log("Bottom Prediction:", rawType);

        if (rawType === "shorts") {
            finalBottomState = "neat pants (true)";
        }
        else {
            const { legSkin, ankleSkin } = this.checkLegRegions(ctx, boxes.bottom);

            console.log(`Pants Analysis: LegSkin=${legSkin.toFixed(3)}, AnkleSkin=${ankleSkin.toFixed(3)}`);
            const TORN_THRESHOLD = 0.05;
            const ANKLE_THRESHOLD = 0.15;
            console.log(legSkin);
            if (legSkin > TORN_THRESHOLD) {
                finalBottomState = "torn pants (hole detected) (false)";
            }
            else if (ankleSkin > ANKLE_THRESHOLD) {
                finalBottomState = "The pants are rolled up. (false)";
            }
            else {
                finalBottomState = "neat pants (true)";
            }
        }

        return {
            top,
            bottom,
            foot,
            head,
            accessory,
            topState: finalTopState,
            bottomState: finalBottomState,
            topCondition,
            headState,
            footCheck: footCheck.message,
            sleeveCheck: sleeveCheck.message
        };
    }
}