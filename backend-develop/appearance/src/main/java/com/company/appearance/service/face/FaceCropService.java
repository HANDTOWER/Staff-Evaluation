package com.company.appearance.service.face;

import com.company.appearance.config.face.FaceDetectionProperties;
import com.company.appearance.model.face.FaceBox;
import com.company.appearance.model.face.FaceDetectionResult;
import com.company.appearance.util.face.ImageIOUtil;

import org.bytedeco.opencv.opencv_core.Mat;
import org.bytedeco.opencv.opencv_core.Rect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service for cropping face regions from images.
 */
@Service
public class FaceCropService {

    private static final Logger logger = LoggerFactory.getLogger(FaceCropService.class);

    private final FaceDetectionProperties properties;
    private final ImageIOUtil imageIOUtil;

    public FaceCropService(FaceDetectionProperties properties, ImageIOUtil imageIOUtil) {
        this.properties = properties;
        this.imageIOUtil = imageIOUtil;
    }

    /**
     * Crops the face region from an image based on the detected bounding box.
     * Applies a configurable margin around the face.
     *
     * @param file Original image file
     * @param faceBox Detected face bounding box
     * @return Cropped face image as JPEG bytes
     */
    public byte[] cropFace(MultipartFile file, FaceBox faceBox) {
        try {
            Mat image = imageIOUtil.multipartFileToMat(file);
            return cropFace(image, faceBox);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read image for cropping", e);
        }
    }

    /**
     * Crops the face region from an OpenCV Mat.
     * Uses separate horizontal and vertical margins for rectangular cropping.
     *
     * @param image Original image
     * @param faceBox Detected face bounding box
     * @return Cropped face image as JPEG bytes
     */
    public byte[] cropFace(Mat image, FaceBox faceBox) {
        // Calculate margins separately for horizontal and vertical
        double marginHorizontal = properties.getMarginHorizontal();
        double marginVertical = properties.getMarginVertical();
        int marginX = (int) (faceBox.getWidth() * marginHorizontal);
        int marginY = (int) (faceBox.getHeight() * marginVertical);

        // Calculate crop region with margins, clamped to image bounds
        int cropX = Math.max(0, faceBox.getX() - marginX);
        int cropY = Math.max(0, faceBox.getY() - marginY);
        int cropWidth = Math.min(
            image.cols() - cropX,
            faceBox.getWidth() + 2 * marginX
        );
        int cropHeight = Math.min(
            image.rows() - cropY,
            faceBox.getHeight() + 2 * marginY
        );

        logger.debug("Cropping face: original box {}, margins [H={}%, V={}%], crop region [{}, {}, {}, {}]",
            faceBox, marginHorizontal * 100, marginVertical * 100, cropX, cropY, cropWidth, cropHeight);

        // Crop the region - create ROI view first
        Rect cropRect = new Rect(cropX, cropY, cropWidth, cropHeight);
        
        // Clone ROI to make it continuous in memory (fixes JPEG encoding corruption)
        Mat croppedMat;
        try (Mat roiMat = new Mat(image, cropRect)) {
            croppedMat = roiMat.clone();
            logger.debug("Cloned ROI Mat to ensure continuous memory for JPEG encoding");
        }

        // Convert to JPEG bytes
        byte[] croppedBytes = imageIOUtil.matToJpegBytes(croppedMat);
        croppedMat.release();
        
        return croppedBytes;
    }

    /**
     * Detects and crops face in one operation.
     *
     * @param image Image as Mat
     * @param faceBox Detected face box
     * @return FaceDetectionResult with box and cropped image
     */
    public FaceDetectionResult detectAndCrop(Mat image, FaceBox faceBox) {
        byte[] croppedImage = cropFace(image, faceBox);
        return new FaceDetectionResult(faceBox, croppedImage);
    }
}
