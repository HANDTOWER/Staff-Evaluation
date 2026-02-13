# 👔 Edge AI Staff Evaluation System

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![SpringBoot](https://img.shields.io/badge/springboot-%236DB33F.svg?style=for-the-badge&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **CodeComplete Global Internship Project (2026.01)**
> **Topic:** AI Computer Vision 기반 직원 용모 자동 평가 시스템

<br/>

## 📖 프로젝트 개요 (Project Overview)

**Staff Evaluation System**은 기업 내 직원들의 복장 및 용모 평가를 자동화하여 객관적인 기준을 확립하고, 관리 효율성을 높이기 위해 개발된 웹/모바일 플랫폼입니다.

기존의 주관적인 육안 평가 방식에서 벗어나, **AI 컴퓨터 비전 기술**을 활용하여 직원의 유니폼 착용 여부, 명찰 패용, 두발 상태 등을 실시간으로 분석합니다. 특히, 서버 비용 절감과 빠른 응답 속도를 위해 **Edge AI (On-Device AI)** 기술을 도입하여, AI 추론이 클라이언트(웹 브라우저)에서 직접 수행되도록 설계되었습니다.

<br/>

## 🌟 핵심 기능 (Key Features)

| 기능 | 설명 |
| :--- | :--- |
| **🤖 AI Grooming Assessment** | • 웹캠을 통해 실시간으로 사용자의 복장 상태를 분석합니다.<br>• **MediaPipe**와 **CLIP 모델**을 활용하여 자세(Posture)와 복장 속성을 판단합니다.<br>• AI 모델을 경량화하여 웹 브라우저 내에서 직접 구동합니다. |
| **👤 Face Recognition** | • 출근 시 직원의 얼굴을 인식하여 신원을 확인하고 로그인을 수행합니다.<br>• OpenCV.js를 활용한 이미지 전처리(Face Crop & Resize)를 수행합니다. |
| **📊 Evaluation Dashboard** | • 관리자 및 직원이 자신의 평가 점수와 히스토리를 확인할 수 있습니다.<br>• 날짜별, 항목별 평가 결과를 시각화된 그래프로 제공합니다. |

<br/>

## 🛠 시스템 아키텍처 (Architecture)

본 프로젝트는 **Monorepo** 구조로 관리되며, 프론트엔드와 백엔드가 분리되어 있습니다.

### 📂 Repository Structure
```bash
Staff-Evaluation/
├── frontend/          # React + Vite + TensorFlow.js (Edge AI Client)
│   ├── public/models/ # ONNX & TFLite AI Models
│   └── src/           # UI Components & AI Logic
└── backend/           # Java Spring Boot (API Server)
    ├── src/main/java/ # Controller, Service, DTO
    └── pom.xml        # Maven Dependencies


🔧 기술 스택 (Tech Stack)
Frontend (Web Client & Edge AI)
Core: JavaScript (ES6+), React 18, Vite

AI Engine: TensorFlow.js, ONNX Runtime Web, MediaPipe Pose

UI/UX: Tailwind CSS, Stitch UI

Communication: Axios

Backend (API Server)
Framework: Java 17, Spring Boot 3.x

Build Tool: Maven

Database: MySQL / MariaDB (Project Default)

API Docs: Swagger UI

👨‍💻 팀원 및 역할 (Team & Role)
CodeComplete Internship Team (Total 6 Members)

Backend: 2명 (Spring Boot Server & DB Design)

Web Frontend: 2명 (React UI & On-Device AI Implementation)

Mobile App: 2명 (Flutter Application)
