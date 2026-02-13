package com.company.appearance.util.face;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Utility class for creating multipart form data for HTTP requests.
 */
@Component
public class MultipartUtil {

    /**
     * Creates a multipart body part from bytes with a filename.
     *
     * @param bytes File content
     * @param filename Filename
     * @return HttpEntity with ByteArrayResource
     */
    public HttpEntity<Resource> createFileEntity(byte[] bytes, String filename) {
        ByteArrayResource resource = new ByteArrayResource(bytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        
        return new HttpEntity<>(resource, headers);
    }

    /**
     * Creates a multipart body part from MultipartFile.
     *
     * @param file MultipartFile
     * @return HttpEntity with ByteArrayResource
     * @throws IOException if reading file fails
     */
    public HttpEntity<Resource> createFileEntity(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            filename = "image.jpg";
        }
        return createFileEntity(file.getBytes(), filename);
    }

    /**
     * Creates a multipart form body for file upload.
     *
     * @param paramName Parameter name for the file
     * @param fileEntity File entity
     * @return MultiValueMap for multipart body
     */
    public MultiValueMap<String, Object> createMultipartBody(String paramName, HttpEntity<Resource> fileEntity) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add(paramName, fileEntity);
        return body;
    }

    /**
     * Adds a string parameter to multipart body.
     *
     * @param body Multipart body
     * @param paramName Parameter name
     * @param value Parameter value
     */
    public void addTextPart(MultiValueMap<String, Object> body, String paramName, String value) {
        body.add(paramName, value);
    }

    /**
     * Adds a file part to multipart body.
     *
     * @param body Multipart body
     * @param paramName Parameter name
     * @param fileEntity File entity
     */
    public void addFilePart(MultiValueMap<String, Object> body, String paramName, HttpEntity<Resource> fileEntity) {
        body.add(paramName, fileEntity);
    }
}
