package com.company.appearance.util.face;

import org.bytedeco.opencv.opencv_core.Mat;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.bytedeco.opencv.global.opencv_imgproc.COLOR_BGRA2BGR;
import static org.bytedeco.opencv.global.opencv_imgproc.COLOR_GRAY2BGR;
import static org.bytedeco.opencv.global.opencv_imgproc.cvtColor;

import static org.bytedeco.opencv.global.opencv_imgcodecs.IMREAD_COLOR;
import static org.bytedeco.opencv.global.opencv_imgcodecs.imdecode;

/**
 * Utility class for image I/O operations with OpenCV and Java ImageIO.
 */
@Component
public class ImageIOUtil {

    /**
     * Converts MultipartFile to OpenCV Mat.
     *
     * @param file MultipartFile containing image data
     * @return OpenCV Mat
     * @throws IOException if reading fails
     */
    public Mat multipartFileToMat(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        return bytesToMat(bytes);
    }

    /**
     * Converts byte array to OpenCV Mat.
     *
     * @param bytes Image bytes
     * @return OpenCV Mat
     */
    public Mat bytesToMat(byte[] bytes) {
        Mat mat = imdecode(new Mat(bytes), IMREAD_COLOR);
        if (mat.empty()) {
            throw new IllegalArgumentException("Failed to decode image bytes to Mat");
        }
        return mat;
    }

    /**
     * Converts OpenCV Mat to JPEG byte array.
     *
     * @param mat OpenCV Mat
     * @return JPEG bytes
     */
    public byte[] matToJpegBytes(Mat mat) {
        return matToBytesWithImageIO(mat, "jpg");
    }

    /**
     * Converts OpenCV Mat to PNG byte array.
     *
     * @param mat OpenCV Mat
     * @return PNG bytes
     */
    public byte[] matToPngBytes(Mat mat) {
        return matToBytesWithImageIO(mat, "png");
    }

    /**
     * Encodes an OpenCV Mat to bytes using Java ImageIO.
     *
     * Why ImageIO instead of OpenCV imencode?
     * - The JavaCPP OpenCV bindings have different imencode overloads across versions.
     * - ImageIO avoids signature mismatch errors (ByteBuffer vs Mat) and is stable.
     */
    private byte[] matToBytesWithImageIO(Mat mat, String format) {
        try {
            BufferedImage image = matToBufferedImage(mat);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            if (!ImageIO.write(image, format, baos)) {
                throw new IllegalStateException("No ImageIO writer found for format: " + format);
            }
            return baos.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to encode Mat to " + format.toUpperCase(), e);
        }
    }

    /**
     * Converts an OpenCV Mat to BufferedImage.
     * Supports grayscale (1ch), BGR (3ch) and BGRA (4ch).
     */
    private BufferedImage matToBufferedImage(Mat mat) {
        if (mat == null || mat.empty()) {
            throw new IllegalArgumentException("Mat is null or empty");
        }

        Mat bgr = mat;
        int channels = mat.channels();

        // Normalize to 3-channel BGR for consistent conversion
        if (channels == 1) {
            bgr = new Mat();
            cvtColor(mat, bgr, COLOR_GRAY2BGR);
        } else if (channels == 4) {
            bgr = new Mat();
            cvtColor(mat, bgr, COLOR_BGRA2BGR);
        } else if (channels != 3) {
            throw new IllegalArgumentException("Unsupported Mat channels: " + channels);
        }

        int width = bgr.cols();
        int height = bgr.rows();
        int bgrChannels = bgr.channels();

        byte[] source = new byte[width * height * bgrChannels];
        bgr.data().get(source);

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_3BYTE_BGR);
        byte[] target = ((DataBufferByte) image.getRaster().getDataBuffer()).getData();
        System.arraycopy(source, 0, target, 0, source.length);

        if (bgr != mat) {
            bgr.release();
        }

        return image;
    }

    /**
     * Converts BufferedImage to byte array (JPEG format).
     */
    public byte[] bufferedImageToBytes(BufferedImage image) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", baos);
        return baos.toByteArray();
    }

    /**
     * Converts byte array to BufferedImage.
     */
    public BufferedImage bytesToBufferedImage(byte[] bytes) throws IOException {
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        return ImageIO.read(bais);
    }
}
