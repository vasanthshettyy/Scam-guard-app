import React, { useState, useEffect } from 'react';

// --- Helper Components ---

const Header = () => (
    <header className="bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-red-500"><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" /><path d="m18 18-6-6" /><path d="m12 18 6-6" /><line x1="12" x2="18" y1="12" y2="18" /></svg>
                ScamGuard AI
            </h1>
            <p className="text-sm text-gray-400">Your Investment Pitch Analyzer</p>
        </div>
    </header>
);

const Footer = () => (
    <footer className="bg-gray-900 text-white py-4 mt-12">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
            <p>&copy; 2025 ScamGuard AI. For educational purposes only. Not financial advice.</p>
        </div>
    </footer>
);

const Spinner = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
    </div>
);

const SamplePitchCard = ({ title, content, onClick }) => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-red-500 cursor-pointer transition-all duration-300" onClick={() => onClick(content)}>
        <h3 className="font-bold text-red-400 mb-2">{title}</h3>
        <p className="text-gray-400 text-sm line-clamp-3">{content}</p>
    </div>
);

const AnalysisResult = ({ result }) => {
    if (!result) return null;

    const getRiskColor = (score) => {
        if (score >= 8) return 'text-red-500 border-red-500';
        if (score >= 5) return 'text-yellow-500 border-yellow-500';
        return 'text-green-500 border-green-500';
    };

    const getRiskLabel = (score) => {
        if (score >= 8) return 'High Risk';
        if (score >= 5) return 'Medium Risk';
        return 'Low Risk';
    };

    const riskScore = parseInt(result.riskScore, 10);

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl mt-8 border border-gray-700 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-4">Analysis Result</h2>
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-gray-900 p-4 rounded-lg">
                <div className="text-center md:text-left mb-4 md:mb-0">
                    <p className="text-gray-400 text-sm">Overall Risk Score</p>
                    <p className={`text-5xl font-bold ${getRiskColor(riskScore)}`}>{riskScore}/10</p>
                    <p className={`text-lg font-semibold ${getRiskColor(riskScore)}`}>{getRiskLabel(riskScore)}</p>
                </div>
                <div className="w-full md:w-auto text-center">
                    <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100">
                        <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                        <circle
                            className={`${getRiskColor(riskScore)}`}
                            strokeWidth="10"
                            strokeDasharray={`${2 * Math.PI * 40 * (riskScore / 10)} ${2 * Math.PI * 40}`}
                            strokeDashoffset={2 * Math.PI * 40 * 0.25}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
                        />
                    </svg>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-white mb-3">Key Red Flags Identified:</h3>
                <ul className="space-y-3">
                    {result.redFlags.map((flag, index) => (
                        <li key={index} className="bg-gray-900/50 p-4 rounded-md border-l-4 border-red-500/50">
                            <p className="font-bold text-red-400">{flag.title}</p>
                            <p className="text-gray-300 text-sm">{flag.explanation}</p>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-3">Plain-English Summary:</h3>
                <div className="bg-gray-900/50 p-4 rounded-md border-l-4 border-gray-500">
                    <p className="text-gray-300">{result.summary}</p>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---

export default function App() {
    const [pitchText, setPitchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState('');

    const samplePitches = [
        {
            title: "Guaranteed Crypto Returns",
            content: "Invest in 'QuantumCoin', the new cryptocurrency that uses quantum computing to guarantee 100x returns in just 30 days! There is absolutely no risk. This is a limited time offer, so you must act now or you will miss out on generational wealth. Our team is anonymous to protect their privacy."
        },
        {
            title: "Eco-Friendly Drone Delivery",
            content: "We are developing a fleet of solar-powered drones for last-mile delivery. Our proprietary battery technology allows for 24/7 operation. We project capturing 15% of the North American market within two years. We need $2M to scale our manufacturing. Our team includes engineers from top aerospace companies."
        },
        {
            title: "Vague AI Health Platform",
            content: "Our revolutionary platform leverages synergistic AI and blockchain paradigms to disrupt the healthcare industry. We are building a holistic solution to empower users. The technology is very complex, but it is game-changing. We have a patent pending and project billions in revenue."
        },
    ];

    const handleAnalyze = async () => {
        if (!pitchText.trim()) {
            setError('Please enter an investment pitch to analyze.');
            return;
        }

        setIsLoading(true);
        setError('');
        setAnalysisResult(null);

        const systemPrompt = `
You are "ScamGuard AI," an expert investment analyst specializing in detecting scams, red flags, and deceptive language in investment pitches. Your task is to analyze the user-provided text with a highly critical eye.

Analyze the following investment pitch and provide the following in a JSON object:
1.  A "riskScore" from 1 (very safe) to 10 (very high risk/likely scam).
2.  An array of "redFlags", where each object has a "title" and a detailed "explanation" in plain English. Identify at least 3 distinct red flags.
3.  A final "summary" that provides a concise, easy-to-understand verdict on the investment's potential risks.

Focus on identifying common scam tactics such as:
- Guarantees of high or unrealistic returns.
- Claims of "no risk" or "secret" methods.
- High-pressure sales tactics and urgency (e.g., "act now," "limited time").
- Vague or overly complex technical explanations (buzzwords without substance).
- Lack of information about the team or anonymous founders.
- Unrealistic market projections.

Your tone should be cautious, educational, and direct. Do not provide financial advice, only risk analysis based on the text.
        `;

        const apiKey = AIzaSyB0vIqV9O9QaF35yUe2wPGxVuguC9s8uEs;
        if (!apiKey) {
            setError("API Key is missing. Please check your .env file.");
            setIsLoading(false);
            return;
        }
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: `User Pitch: "${pitchText}"` }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json",
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText}. Details: ${errorBody}`);
            }

            const result = await response.json();

            const candidate = result.candidates?.[0];
            if (candidate && candidate.content?.parts?.[0]?.text) {
                const jsonText = candidate.content.parts[0].text;
                const parsedJson = JSON.parse(jsonText);
                setAnalysisResult(parsedJson);
            } else {
                throw new Error("Invalid response structure from the AI model.");
            }

        } catch (err) {
            console.error(err);
            setError("Failed to analyze the pitch. The AI model might be unavailable or the request failed. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSampleClick = (content) => {
        setPitchText(content);
        setAnalysisResult(null);
        setError('');
    };

    // Add CSS for animations
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
            .line-clamp-3 {
                overflow: hidden;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);


    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans">
            <Header />

            <main className="container mx-auto px-6 py-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-2">Uncover Hidden Risks in Investment Pitches</h2>
                    <p className="text-gray-400 mb-8">
                        Paste any investment pitch, business plan, or crypto whitepaper below. Our AI will analyze it for common red flags, deceptive language, and potential scam tactics.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700">
                    <textarea
                        className="w-full h-48 p-4 bg-gray-900 text-gray-200 border border-gray-600 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none transition-all duration-300"
                        placeholder="Paste the investment pitch text here..."
                        value={pitchText}
                        onChange={(e) => setPitchText(e.target.value)}
                        disabled={isLoading}
                    />

                    {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}

                    <div className="mt-4 text-center">
                        <button
                            className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
                            onClick={handleAnalyze}
                            disabled={isLoading}
                        >
                            {isLoading ? <Spinner /> : 'Analyze Pitch'}
                        </button>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto mt-12">
                    <h3 className="text-lg font-semibold text-center text-gray-400 mb-4">Or, Try an Example:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {samplePitches.map(p => <SamplePitchCard key={p.title} {...p} onClick={handleSampleClick} />)}
                    </div>
                </div>

                {analysisResult && <AnalysisResult result={analysisResult} />}

            </main>

            <Footer />
        </div>
    );
}
