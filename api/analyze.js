export default async function handler(req, res) {
    // 1️⃣ HTTP method guard
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2️⃣ Validate request body
    const { pitchText, systemPrompt } = req.body;
    if (!pitchText || !systemPrompt) {
        return res.status(400).json({ error: 'Missing pitchText or systemPrompt' });
    }

    // Read API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set');
        return res.status(500).json({ error: 'Server configuration error' });
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
            console.error(`Gemini API Error: ${response.status} ${response.statusText}`, errorBody);
            return res.status(response.status).json({ error: 'AI service unavailable' });
        }

        const result = await response.json();

        const candidate = result.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            const jsonText = candidate.content.parts[0].text;
            const parsedJson = JSON.parse(jsonText);

            // 3️⃣ Explicit JSON response header
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(parsedJson);
        } else {
            console.error('Invalid response structure from Gemini API');
            return res.status(500).json({ error: 'Invalid AI response' });
        }

    } catch (err) {
        console.error('Error calling Gemini API:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
