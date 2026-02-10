import React, { useState, useRef, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { analyzeText } from '../lib/scamDetector';

// ── Helpers ─────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/gif'];

function validateFile(file) {
    if (!file) return 'No file selected.';
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Unsupported file type. Please upload a PNG, JPG, WebP, BMP, or GIF image.';
    if (file.size > 10 * 1024 * 1024) return 'File too large. Maximum size is 10 MB.';
    return null;
}

function getScoreColor(score) {
    if (score >= 60) return { text: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500' };
    if (score >= 30) return { text: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400' };
    return { text: 'text-green-400', border: 'border-green-400', bg: 'bg-green-400' };
}

// ── Sub-components ──────────────────────────────────────────────────

const DropZone = ({ onFile, isDragging, setIsDragging }) => {
    const inputRef = useRef(null);

    const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, [setIsDragging]);
    const handleDragLeave = useCallback(() => setIsDragging(false), [setIsDragging]);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
    }, [onFile, setIsDragging]);

    return (
        <div
            className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-red-500/50 hover:bg-gray-700/30'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-gray-300 font-medium">Drop an image here or click to upload</p>
            <p className="text-gray-500 text-sm mt-1">PNG, JPG, WebP, BMP, GIF — Max 10 MB</p>
        </div>
    );
};

const ProgressBar = ({ progress, statusText }) => (
    <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>{statusText}</span>
            <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
                className="h-3 rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
    </div>
);

const ScoreGauge = ({ score }) => {
    const color = getScoreColor(score);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const filled = (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <svg className="w-28 h-28" viewBox="0 0 100 100">
                <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
                <circle
                    className={color.text}
                    strokeWidth="10"
                    strokeDasharray={`${filled} ${circumference}`}
                    strokeDashoffset={circumference * 0.25}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                    style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
                />
            </svg>
            <p className={`text-4xl font-bold mt-2 ${color.text}`}>{score}<span className="text-lg">/100</span></p>
        </div>
    );
};

const AnalysisResults = ({ result }) => {
    const color = getScoreColor(result.score);

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mt-6 animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-gray-900 p-5 rounded-lg gap-4">
                <div className="text-center md:text-left">
                    <p className="text-gray-400 text-sm mb-1">Risk Score</p>
                    <p className={`text-lg font-bold ${color.text}`}>{result.status}</p>
                </div>
                <ScoreGauge score={result.score} />
            </div>

            {/* Reasons */}
            {result.reasons.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold text-white mb-3">⚡ Scam Indicators Found:</h3>
                    <ul className="space-y-2">
                        {result.reasons.map((r, i) => (
                            <li key={i} className="bg-gray-900/50 p-3 rounded-md border-l-4 border-red-500/60 flex items-start gap-3">
                                <span className="text-red-400 font-mono text-xs mt-0.5 shrink-0 bg-red-500/10 px-2 py-0.5 rounded">{r.category}</span>
                                <span className="text-gray-300 text-sm">{r.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommendation */}
            <div>
                <h3 className="text-xl font-semibold text-white mb-3">💡 Recommendation:</h3>
                <div className={`bg-gray-900/50 p-4 rounded-md border-l-4 ${color.border}`}>
                    <p className="text-gray-300">{result.recommendation}</p>
                </div>
            </div>
        </div>
    );
};

const ExtractedText = ({ text }) => (
    <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-2">📝 Extracted Text:</h3>
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
            <p className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">{text}</p>
        </div>
    </div>
);

// ── Main Component ──────────────────────────────────────────────────

export default function PhotoScanner() {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrStatus, setOcrStatus] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback((file) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setImageFile(file);
        setExtractedText('');
        setAnalysisResult(null);

        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    }, []);

    const handleScan = useCallback(async () => {
        if (!imageFile) return;

        setIsProcessing(true);
        setError('');
        setExtractedText('');
        setAnalysisResult(null);
        setOcrProgress(0);
        setOcrStatus('Initializing OCR engine…');

        try {
            const result = await Tesseract.recognize(imageFile, 'eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setOcrProgress(Math.round(m.progress * 100));
                        setOcrStatus('Recognizing text…');
                    } else if (m.status === 'loading language traineddata') {
                        setOcrProgress(Math.round(m.progress * 50));
                        setOcrStatus('Loading language data…');
                    } else {
                        setOcrStatus(m.status.charAt(0).toUpperCase() + m.status.slice(1) + '…');
                    }
                },
            });

            const text = result.data.text?.trim();

            if (!text || text.length < 3) {
                setError('No readable text was found in this image. Try a clearer image with visible text.');
                setIsProcessing(false);
                return;
            }

            setExtractedText(text);
            setOcrStatus('Analyzing for scam patterns…');
            setOcrProgress(100);

            // Small delay so the user sees 100% before results appear
            await new Promise((r) => setTimeout(r, 400));

            const analysis = analyzeText(text);
            setAnalysisResult(analysis);
        } catch (err) {
            console.error('OCR Error:', err);
            setError('Failed to process the image. Please try again with a different image.');
        } finally {
            setIsProcessing(false);
        }
    }, [imageFile]);

    const handleReset = useCallback(() => {
        setImageFile(null);
        setImagePreview(null);
        setExtractedText('');
        setAnalysisResult(null);
        setError('');
        setOcrProgress(0);
        setOcrStatus('');
    }, []);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Photo Scam Scanner</h2>
                <p className="text-gray-400">
                    Upload a screenshot of a suspicious message, email, or ad. Our scanner will extract the text and check it against known scam patterns — 100% free, 100% private.
                </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                {/* Upload area or preview */}
                {!imagePreview ? (
                    <DropZone onFile={handleFile} isDragging={isDragging} setIsDragging={setIsDragging} />
                ) : (
                    <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden border border-gray-600">
                            <img src={imagePreview} alt="Uploaded preview" className="w-full max-h-72 object-contain bg-gray-900" />
                        </div>

                        {!isProcessing && !analysisResult && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleScan}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                                >
                                    🔍 Scan for Scams
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 px-6 rounded-lg transition-all duration-300"
                                >
                                    Change Image
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress bar */}
                {isProcessing && <ProgressBar progress={ocrProgress} statusText={ocrStatus} />}

                {/* Error */}
                {error && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Extracted text */}
                {extractedText && <ExtractedText text={extractedText} />}

                {/* Analysis results */}
                {analysisResult && <AnalysisResults result={analysisResult} />}

                {/* Scan another */}
                {analysisResult && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleReset}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                        >
                            📷 Scan Another Image
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
