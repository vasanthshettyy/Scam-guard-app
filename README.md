# ScamGuard AI

ScamGuard AI is a scam detection suite that helps users identify potential scams through two tools: an **AI-powered investment pitch analyzer** (Gemini API) and a **zero-cost Photo Scam Scanner** (client-side OCR + rule-based detection).

## Features

### 📝 Text Analyzer (AI-Powered)
- **Risk Analysis**: Assigns a risk score (1–10) to investment pitches using Gemini AI.
- **Red Flag Detection**: Identifies specific deceptive tactics and explains them.
- **Plain English Summary**: Provides a simplified explanation of the risks.
- **Sample Pitches**: Includes examples to demonstrate functionality.

### 📷 Photo Scam Scanner (Zero-Cost)
- **Image Upload**: Drag-and-drop or click-to-upload with preview.
- **Client-Side OCR**: Extracts text from images using Tesseract.js — no server processing.
- **Rule-Based Scam Detection**: Scores text (0–100) against 60+ patterns across 7 categories.
- **Detailed Results**: Shows risk score gauge, matched scam indicators, and actionable recommendations.
- **Fully Private**: All processing happens in the browser — no data leaves the device.

### 🔒 Security
- **Secure Architecture**: API keys safely stored on the backend, never exposed to the browser.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **AI (Text Analyzer)**: Google Gemini API (called from backend only)
- **OCR (Photo Scanner)**: Tesseract.js (runs entirely in the browser)

The Text Analyzer uses a serverless architecture — the frontend sends pitch text to `/api/analyze`, which calls the Gemini API and returns the analysis. The Photo Scanner is fully client-side: Tesseract.js extracts text from uploaded images, then a rule-based engine (`scamDetector.js`) scores the text against known scam patterns.

## Setup Instructions

### Prerequisites

- Node.js installed on your machine.
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1. **Clone the repository** (if applicable) or download the source code.
2. **Install dependencies**:
   ```bash
   npm install
   ```

### Configuration

1. **Create a `.env` file** in the root directory of the project.
2. **Add your API Key**:
   Copy the content from `.env.example` to `.env` and replace `YOUR_API_KEY_HERE` with your actual API key.
   ```env
   GEMINI_API_KEY=your_actual_api_key_starts_with_AIza...
   ```
   > **Important:** This API key is used by the backend only and is never exposed to the browser. Do not commit your `.env` file to version control. It is already added to `.gitignore`.

### Running the Application

#### Option 1: Local Development with Vercel CLI (Recommended)

To test both frontend and backend locally:

1. **Install Vercel CLI** (one-time setup):
   ```bash
   npm install -g vercel
   ```

2. **Start the development server**:
   ```bash
   vercel dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000` (or the URL shown in the terminal).

#### Option 2: Deploy to Vercel

For production or preview deployment:

1. **Push your code to GitHub** (or GitLab/Bitbucket).

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Add environment variable: `GEMINI_API_KEY=your_actual_api_key`
   - Deploy

3. **Access your deployed app** at the URL provided by Vercel.

> **Note:** Running `npm run dev` alone will NOT work for local testing because Vite doesn't handle serverless functions. Use `vercel dev` instead.

## Usage

### Text Analyzer
1. Select the **"📝 Text Analyzer"** tab.
2. Paste an investment pitch into the text area (or click a sample).
3. Click **"Analyze Pitch"**.
4. Review the Risk Score, Red Flags, and Summary.

### Photo Scanner
1. Select the **"📷 Photo Scanner"** tab.
2. Drag-and-drop or click to upload an image (screenshot of a suspicious email, text, ad, etc.).
3. Click **"🔍 Scan for Scams"**.
4. Wait for OCR to extract text (progress bar shown).
5. Review the Risk Score (0–100), scam indicators, and recommendation.

## Project Structure

```
scamguard-app/
├── api/
│   └── analyze.js              # Serverless function (Gemini API backend)
├── src/
│   ├── components/
│   │   └── PhotoScanner.jsx    # Photo upload + OCR + scam analysis UI
│   ├── lib/
│   │   └── scamDetector.js     # Rule-based scam detection engine
│   ├── app.jsx                 # Main React component (tab navigation)
│   ├── index.css               # Tailwind CSS imports
│   └── main.jsx                # Entry point
├── .env                        # API key (DO NOT COMMIT)
├── .env.example                # Template for environment variables
└── package.json
```

## Technologies

- **Frontend**: React 18, Vite 5, Tailwind CSS 3
- **Backend**: Vercel Serverless Functions
- **AI**: Google Gemini API
- **OCR**: Tesseract.js (client-side)
- **Deployment**: Vercel (free tier compatible)

## Security

- API keys are stored securely on the backend
- Frontend never has access to the API key
- All API calls to Gemini are made server-side
- HTTP method validation (POST only)
- Request body validation

