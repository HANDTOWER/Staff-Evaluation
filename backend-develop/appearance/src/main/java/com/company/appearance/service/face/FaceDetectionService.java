package com.company.appearance.service.face;

import com.company.appearance.config.face.FaceDetectionProperties;
import com.company.appearance.exception.face.FaceDetectionException;
import com.company.appearance.model.face.FaceBox;
import com.company.appearance.util.face.ImageIOUtil;

import org.bytedeco.opencv.opencv_core.Mat;
import org.bytedeco.opencv.opencv_core.Rect;
import org.bytedeco.opencv.opencv_core.RectVector;
import org.bytedeco.opencv.opencv_core.Size;
import org.bytedeco.opencv.opencv_objdetect.CascadeClassifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Service for detecting faces in images using OpenCV Haar cascades.
 * Supports frontal and profile face detection with configurable parameters.
 */
@Service
public class FaceDetectionService {

    private static final Logger logger = LoggerFactory.getLogger(FaceDetectionService.class);

    private static final String FRONTAL_CASCADE_PATH = "face-detection/haarcascade_frontalface_default.xml";
    private static final String PROFILE_CASCADE_PATH = "face-detection/haarcascade_profileface.xml";

    // Common locations for Haar cascade resources (depending on OpenCV packaging)
    private static final String[] FRONTAL_FALLBACKS = {
        "org/bytedeco/opencv/data/haarcascades/haarcascade_frontalface_default.xml",
        "opencv/data/haarcascades/haarcascade_frontalface_default.xml",
        "haarcascades/haarcascade_frontalface_default.xml"
    };
    private static final String[] PROFILE_FALLBACKS = {
        "org/bytedeco/opencv/data/haarcascades/haarcascade_profileface.xml",
        "opencv/data/haarcascades/haarcascade_profileface.xml",
        "haarcascades/haarcascade_profileface.xml"
    };

    private final FaceDetectionProperties properties;
    private final ImageIOUtil imageIOUtil;

    private CascadeClassifier frontalCascade;
    private CascadeClassifier profileCascade;

    /**
     * If cascade files are missing, we still allow the application to start.
     * In that mode, detection returns a fallback box (whole image) so the rest
     * of the pipeline can run (e.g. recognition against external Face API).
     */
    private boolean detectionEnabled = true;

    public FaceDetectionService(FaceDetectionProperties properties, ImageIOUtil imageIOUtil) {
        this.properties = properties;
        this.imageIOUtil = imageIOUtil;
    }

    @PostConstruct
    public void init() {
        try {
            frontalCascade = loadCascadeClassifier(FRONTAL_CASCADE_PATH, FRONTAL_FALLBACKS);
            logger.info("Loaded frontal face cascade classifier");

            profileCascade = loadCascadeClassifier(PROFILE_CASCADE_PATH, PROFILE_FALLBACKS);
            logger.info("Loaded profile face cascade classifier");
        } catch (Exception e) {
            detectionEnabled = false;
            frontalCascade = null;
            profileCascade = null;
            logger.error(
                "Failed to load cascade classifiers. Face detection is DISABLED. " +
                "To enable detection, add cascade XML files under src/main/resources/face-detection/ (see README).",
                e
            );
        }
    }

    private CascadeClassifier loadCascadeClassifier(String primaryResourcePath, String[] fallbackResourcePaths)
        throws IOException {

        ClassPathResource resource = new ClassPathResource(primaryResourcePath);
        if (!resource.exists()) {
            for (String fallback : fallbackResourcePaths) {
                ClassPathResource candidate = new ClassPathResource(fallback);
                if (candidate.exists()) {
                    resource = candidate;
                    logger.warn("Using fallback cascade resource: {}", fallback);
                    break;
                }
            }
        }

        if (!resource.exists()) {
            throw new FaceDetectionException(
                "Cascade file not found: " + primaryResourcePath + ". " +
                "Please download required XML files. See src/main/resources/face-detection/README.md"
            );
        }

        // OpenCV needs a file path, so extract to temp file
        Path tempFile = Files.createTempFile("cascade-", ".xml");
        tempFile.toFile().deleteOnExit();

        try (InputStream is = resource.getInputStream()) {
            Files.copy(is, tempFile, StandardCopyOption.REPLACE_EXISTING);
        }

        CascadeClassifier cascade = new CascadeClassifier(tempFile.toString());
        if (cascade.empty()) {
            throw new FaceDetectionException("Failed to load cascade from resource: " + resource.getPath());
        }

        return cascade;
    }

    public FaceBox detectBestFace(MultipartFile file) {
        try {
            Mat image = imageIOUtil.multipartFileToMat(file);
            return detectBestFace(image);
        } catch (IOException e) {
            throw new FaceDetectionException("Failed to read image file", e);
        }
    }

    public FaceBox detectBestFace(Mat image) {
        if (!detectionEnabled) {
            // Fallback: return full image bounds so pipeline can continue.
            return new FaceBox(0, 0, image.cols(), image.rows(), 0.0);
        }

        List<FaceBox> allFaces = new ArrayList<>();

        allFaces.addAll(detectFaces(image, frontalCascade, "frontal"));
        allFaces.addAll(detectFaces(image, profileCascade, "profile"));

        if (allFaces.isEmpty()) {
            throw new IllegalArgumentException(
                "No face detected in the image. Please ensure the image contains a clear, visible face.");
        }

        // Select best face: largest area, tie-break by confidence
        FaceBox bestFace = allFaces.stream()
            .max(Comparator.comparingInt(FaceBox::getArea)
                          .thenComparingDouble(FaceBox::getConfidence))
            .orElseThrow();

        logger.debug("Selected best face: {}", bestFace);
        return bestFace;
    }

    private List<FaceBox> detectFaces(Mat image, CascadeClassifier cascade, String cascadeType) {
        List<FaceBox> faces = new ArrayList<>();

        if (cascade == null || cascade.empty()) {
            return faces;
        }

        RectVector detections = new RectVector();
        int minSize = properties.getMinFaceSize();

        cascade.detectMultiScale(
            image,
            detections,
            1.1,
            3,
            0,
            new Size(minSize, minSize),
            new Size()
        );

        logger.debug("Detected {} face(s) with {} cascade", detections.size(), cascadeType);

        for (int i = 0; i < detections.size(); i++) {
            Rect rect = detections.get(i);
            faces.add(new FaceBox(rect.x(), rect.y(), rect.width(), rect.height(), 1.0));
        }

        return faces;
    }
}
