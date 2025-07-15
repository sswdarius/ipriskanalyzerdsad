'use client';

import { useState, ChangeEvent } from 'react';

type HistoryItem = {
  prompt: string;
  riskLevel: number;
  explanation: string;
  type: 'text' | 'image';
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [riskLevel, setRiskLevel] = useState<number | null>(null);
  const [explanation, setExplanation] = useState('');
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setPrompt(''); // temizle, metinle karışmasın
      setRiskLevel(null);
      setExplanation('');
      setDetectedItems([]);
    }
  };

  const handleCheck = async () => {
    setLoading(true);
    setRiskLevel(null);
    setExplanation('');
    setDetectedItems([]);

    try {
      let body: any = {};
      if (imageFile) {
        const base64 = await toBase64(imageFile);
        body = { imageBase64: base64 };
      } else if (prompt.trim()) {
        body = { prompt };
      } else {
        setExplanation('Please enter text or select an image.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/check-ip-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.riskLevel !== undefined && data.explanation) {
        setRiskLevel(data.riskLevel);
        setExplanation(data.explanation);

        if (data.detectedItems && Array.isArray(data.detectedItems)) {
          setDetectedItems(data.detectedItems);
        } else {
          setDetectedItems([]);
        }
      } else {
        setExplanation(data.error || 'No response');
      }
    } catch {
      setExplanation('Error occurred while contacting the API.');
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  const getRiskColor = () => {
    if (riskLevel === null) return 'border-gray-300';
    if (riskLevel >= 80) return 'border-red-500';
    if (riskLevel >= 40) return 'border-yellow-500';
    return 'border-green-500';
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 px-4 py-12 animate-fade-in">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-10 tracking-tight text-gray-800">
        IP Risk Analyzer
      </h1>

      <div className="relative w-full max-w-3xl mb-6">
        <textarea
          className="w-full h-40 p-4 text-lg bg-white text-gray-900 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 transition resize-none"
          placeholder="Describe your idea or action. E.g., 'Creating a similar logo to Nike'"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            // Burada sonuçları silmiyoruz artık, sonuç kaybolmasın diye
          }}
          disabled={loading}
        />

        <img
          src="/ippy.png"
          alt="ippy mascot"
          className="absolute top-[-79px] right-2 w-[80px] h-[80px] cursor-pointer transition-transform"
          onMouseEnter={(e) => e.currentTarget.classList.add('jump')}
          onMouseLeave={(e) => e.currentTarget.classList.remove('jump')}
        />
      </div>

      <div className="w-full max-w-3xl mb-6">
        <label
          htmlFor="file-upload"
          className="inline-block cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2 font-semibold text-gray-700 shadow-sm hover:bg-gray-100 transition"
        >
          Upload Photo
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={loading}
          className="hidden"
        />
        {imageFile && (
          <div className="mt-2 text-gray-700">
            Selected file: <strong>{imageFile.name}</strong>
          </div>
        )}
      </div>

      <button
        onClick={handleCheck}
        disabled={loading}
        className="mt-2 px-10 py-4 bg-gray-200 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-gray-300 disabled:opacity-60 transition duration-300"
      >
        {loading ? 'Analyzing...' : 'Analyze Risk'}
      </button>

      {(riskLevel !== null || explanation) && (
        <div
          className={`mt-10 max-w-3xl w-full border-l-4 p-6 rounded-md bg-white ${getRiskColor()}`}
        >
          <div className="mb-4 font-semibold text-lg">Detected Items:</div>
          {detectedItems.length > 0 ? (
            <ul className="mb-6 flex flex-wrap gap-2">
              {detectedItems.map((item, idx) => (
                <li
                  key={idx}
                  className="bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mb-6 text-gray-500 italic">No specific detected items.</div>
          )}

          <div className="text-sm font-mono text-gray-500 mb-2">RISK LEVEL:</div>
          <div className="text-3xl font-bold mb-4">{riskLevel}%</div>
          <div className="text-sm font-mono text-gray-500 mb-2">EXPLANATION:</div>
          <p className="text-lg leading-relaxed text-gray-800">{explanation}</p>
        </div>
      )}
    </main>
  );
}
