# ScamGuard AI

ScamGuard AI is an intelligent investment pitch analyzer that helps users detect potential scams and red flags in investment proposals using Google's Gemini AI.

## Features

- **Risk Analysis**: Assigns a risk score (1-10) to investment pitches.
- **Red Flag Detection**: Identifies specific deceptive tactics and explains them.
- **Plain English Summary**: Provides a simplified explanation of the risks.
- **Sample Pitches**: Includes examples to demonstrate functionality.

## Setup Instructions

### Prerequisites

- Node.js installed on your machine.
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1.  **Clone the repository** (if applicable) or download the source code.
2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Configuration

1.  **Create a `.env` file** in the root directory of the project.
2.  **Add your API Key**:
    Copy the content from `.env.example` to `.env` and replace `YOUR_API_KEY_HERE` with your actual API key.
    ```env
    VITE_GEMINI_API_KEY=your_actual_api_key_starts_with_AIza...
    ```
    > **Note:** Do not commit your `.env` file to version control. It is already added to `.gitignore`.

### Running the Application

1.  **Start the development server**:
    ```bash
    npm run dev
    ```
2.  **Open your browser**:
    Navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## Usage

1.  Paste an investment pitch into the text area.
2.  Click "Analyze Pitch".
3.  Review the Risk Score, Red Flags, and Summary.

## Technologies

- React
- Vite
- Tailwind CSS
- Google Gemini API
