# 👔 Edge AI Staff Evaluation - Web Frontend

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![ONNX Runtime](https://img.shields.io/badge/ONNX-005CED?style=for-the-badge&logo=onnx&logoColor=white)

## 📌 프로젝트 소개 (Project Overview)

**Edge AI Staff Evaluation System**의 웹 프론트엔드 애플리케이션입니다.  
기업 내 직원의 복장 및 용모를 객관적으로 평가하기 위해 구축되었습니다.  
백엔드 서버의 부하를 최소화하고 실시간 처리 속도를 극대화하기 위해, 무거운 AI 비전 모델을 클라이언트의 브라우저 단에서 직접 구동하는 **On-Device AI (Edge AI)** 아키텍처를 적용한 것이 가장 큰 특징입니다.

## ✨ 주요 기능 및 구현 포인트 (Key Features)

### 1. 웹 브라우저 기반 On-Device AI 추론 (`aiEngine.js`)
- **MediaPipe Pose:** 웹캠 스트리밍에서 실시간으로 사용자의 신체 랜드마크(관절 위치, 자세 각도)를 추정합니다. (`posture_angle.js`, `detect_body.js`)
- **ONNX Runtime Web (CLIP Model):** Python으로 학습된 CLIP 모델을 `.onnx` 포맷으로 변환하여 `public/models`에 적재 후, JavaScript 환경에서 직원의 복장 상태를 분석합니다.
- **메모리 & 렌더링 최적화:** 브라우저 캔버스 렌더링 시 발생하는 AI 잔상(Ghosting) 현상을 `pose.reset()` 및 최적화 로직으로 해결했습니다.

### 2. 컴포넌트 기반 반응형 UI/UX
- **Stitch UI**와 **Tailwind CSS**를 활용하여 직관적이고 일관성 있는 디자인 시스템을 구축했습니다.
- AI 로딩 상태, 웹캠 권한 요청, 실시간 분석 피드백 등을 고려한 사용자 중심의 UI를 제공합니다.

### 3. 유연한 데이터 파이프라인 연동
- 클라이언트에서 1차 가공된 AI 추론 결과(자세, 색상, 복장 규정 준수 여부 등)를 구조화된 **JSON 포맷**으로 백엔드(FastAPI) API에 전송합니다.

## 📂 파일 구조 (Directory Structure)

```text
frontend/
├── public/
│   └── models/               # 브라우저 구동용 AI 모델 (Edge AI)
│       └── clip-model/       # ONNX로 변환된 CLIP 모델 및 Tokenizer 파일
├── src/
│   ├── ai/                   # 세부 AI 분석 로직 모듈
│   │   ├── detect_body.js    # 신체 감지
│   │   ├── get_color.js      # 의상 색상 추출
│   │   ├── is_full_body.js   # 전신 노출 여부 판단
│   │   ├── posture_angle.js  # 관절 각도 계산
│   │   └── stability.js      # 자세 안정성 검증
│   ├── components/           # 재사용 가능한 UI 컴포넌트
│   │   ├── AppHeader.jsx
│   │   ├── CameraInput.jsx   # 웹캠 스트리밍 제어
│   │   ├── EmployeeDirectory.jsx
│   │   └── ImageUpload.jsx
│   ├── lib/
│   │   └── aiEngine.js       # 핵심 엔진: AI 모델 로드 및 전체 파이프라인 오케스트레이션
│   ├── pages/                # 라우팅 단위 페이지 컴포넌트
│   │   ├── AssessmentPage.jsx          # 용모 평가 페이지
│   │   ├── EmployeeManagementPage.jsx
│   │   ├── EvaManagement.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegistrationPage.jsx
│   │   └── SignUpPage.jsx
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## 🛠 기술 스택 (Tech Stack)

### Frontend Core
- Language: JavaScript (ES6+), HTML5, CSS3
- Framework / Build: React 18, Vite
- Styling: Tailwind CSS, CSS Modules

### Edge AI & Computer Vision
- TensorFlow.js: 브라우저 내 머신러닝 연산 환경 구축
- ONNX Runtime Web: 경량화된 딥러닝 모델(quant.onnx) 추론
- MediaPipe Pose: 고성능 실시간 자세 추정
- OpenCV.js: 클라이언트 사이드 이미지 전처리 (캡처 및 크롭)

### API & State Management
- Fetch API / Axios: RESTful API 통신
- Swagger UI: 백엔드 팀과의 API 인터페이스 규격 협의

## 🚀 로컬 실행 방법 (Getting Started)

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

서버가 실행되면 브라우저에서 `http://localhost:5173` 으로 접속합니다.  
AI 평가 기능을 사용하기 위해서는 웹 브라우저의 카메라(웹캠) 접근 권한이 허용되어야 합니다.

## 👨‍💻 나의 역할 및 기여도 (My Contributions)

- Web Frontend 개발 (기여도 50%)
- Stitch UI 기반 컴포넌트 구성 및 Tailwind CSS 커스터마이징
- On-Device AI 파이프라인 설계 (핵심 기여)
- `aiEngine.js`를 주도적으로 개발하여 React 라이프사이클과 외부 AI 라이브러리(TF.js, ONNX, MediaPipe) 간의 통합 구현
- AI 모델의 로컬 추론 결과값을 API 요청 규격(JSON)에 맞게 정제하는 로직 구현
