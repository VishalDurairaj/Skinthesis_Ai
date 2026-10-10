import React, { useState } from 'react';
import CameraCapture from '../components/camera/CameraCapture';
import { ArrowRight, UserCheck } from 'lucide-react';

export default function ScanPage() {
  const [capturedData, setCapturedData] = useState(null);

  const handleCaptureComplete = (imageUri, quality) => {
    setCapturedData({ imageUri, quality });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-charcoal">Skin Capture & Pre-Check</h1>
        <p className="mt-2 text-sm text-charcoal-muted">
          Capture your live frame or upload an existing image to begin landmark geometry extraction.
        </p>
      </div>

      <CameraCapture onCaptureComplete={handleCaptureComplete} />

      {capturedData && (
        <div className="mt-8 p-6 bg-white rounded-3xl border border-surface-border shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-tealLight text-brand-teal flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-charcoal">Frame Captured & Evaluated</h3>
                <p className="text-xs text-charcoal-muted">
                  Mean luminance index: {capturedData.quality.brightness}/255 • Status: {capturedData.quality.passed ? 'Compliant' : 'Check Warning'}
                </p>
              </div>
            </div>
            <button
              onClick={() => alert('Phase 1 verified! Phase 2 will route this frame directly to the MediaPipe & FastAPI vision service.')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal text-white text-xs font-medium hover:bg-charcoal/90 transition shrink-0"
            >
              Verify Capture Hand-Off <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
