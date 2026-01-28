# ScamGuard AI

ScamGuard AI is an intelligent investment pitch analyzer that helps users detect potential scams and red flags in investment proposals using Google's Gemini AI.

## Features

- **Risk Analysis**: Assigns a risk score (1-10) to investment pitches.
- **Red Flag Detection**: Identifies specific deceptive tactics and explains them.
- **Plain English Summary**: Provides a simplified explanation of the risks.
- **Sample Pitches**: Includes examples to demonstrate functionality.
- **Secure Architecture**: API keys safely stored on the backend, never exposed to the browser.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **AI**: Google Gemini API (called from backend only)

The application uses a serverless architecture where the API key is securely stored on the backend. The frontend sends pitch text to the `/api/analyze` endpoint, which then communicates with the Gemini API and returns the analysis.

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

1. Paste an investment pitch into the text area.
2. Click "Analyze Pitch".
3. Review the Risk Score, Red Flags, and Summary.

## Project Structure

```
scamguard-app/
├── api/
│   └── analyze.js          # Serverless function (backend)
├── src/
│   ├── app.jsx             # Main React component
│   └── main.jsx            # Entry point
├── .env                    # API key (DO NOT COMMIT)
├── .env.example            # Template for environment variables
└── package.json
```

## Technologies

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Security

- API keys are stored securely on the backend
- Frontend never has access to the API key
- All API calls to Gemini are made server-side
- HTTP method validation (POST only)
- Request body validation

