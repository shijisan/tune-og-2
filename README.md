## Tune-OG

ytdlp as core, ffmpeg for normalizer, youtube.js as library search, react native expo for front. backend will be hosted privately and I only plan to let people I know use this.

# Getting Started

## Prerequisites

All Python commands should be run inside the virtual environment.

To activate the venv:
```
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

---

## Backend

Navigate to the backend directory and run both of the following:

```
cd backend
npm run dev
```

```
uvicorn core.main:app
```

---

## Frontend (Mobile)

Navigate to the Expo app directory and run:

```
cd frontend/tune-og
npx expo start -c
```

---

## Frontend (Optional - Basic HTML Testing)

For quick/early alpha testing using the plain HTML files, navigate to the frontend directory and run:

```
cd frontend
python -m http.server 5500
```

Note: This is for quick testing purposes only and may include unfinished or experimental features.