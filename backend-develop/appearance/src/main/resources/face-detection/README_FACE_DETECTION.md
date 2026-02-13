# Face Detection Cascade Files

This directory contains Haar Cascade XML files for face detection.

## Required Files

Download these files from OpenCV's GitHub repository:
https://github.com/opencv/opencv/tree/master/data/haarcascades

Required files:
1. `haarcascade_frontalface_default.xml` - For frontal face detection
2. `haarcascade_profileface.xml` - For profile face detection

## Installation

```bash
# Download frontal face cascade
curl -o src/main/resources/face-detection/haarcascade_frontalface_default.xml \
  https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml

# Download profile face cascade
curl -o src/main/resources/face-detection/haarcascade_profileface.xml \
  https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_profileface.xml
```

The application will fail-fast with clear error messages if these files are missing.
