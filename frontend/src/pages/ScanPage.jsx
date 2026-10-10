import React, { useState } from 'react';
import CameraCapture from '../components/camera/CameraCapture';
import axios from 'axios';
import { Eye, ShieldCheck, Activity, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function ScanPage() {
  const [capturedData, setCapturedData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const handleCaptureComplete = (imageUri, quality) => {
    setCapturedData({ imageUri, quality });
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const runAnalysis = async () => {
    if (!capturedData?.imageUri) return;

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      // Convert DataURL to Blob for multipart upload
      const response = await fetch(capturedData.imageUri);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, 'capture.jpg');

      const res = await axios.post('http://127.0.0.1:8000/analyze/face', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.status === 'success') {
        setAnalysisResult(res.data);
      } else {
        setAnalysisError(res.data.message || 'Face localization could not detect clear facial landmarks.');
      }
    } catch (err) {
      console.error(err);
      setAnalysisError('Could not connect to AI service on http://127.0.0.1:8000. Ensure the FastAPI backend is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-charcoal">Spatial Skin Analysis</h1>
        <p className="mt-2 text-sm text-charcoal-muted">
          Capture your frame to extract anatomical zone polygons, CIELAB skin tone, and surface texture metrics.
        </p>
      </div>

      <CameraCapture onCaptureComplete={handleCaptureComplete} />

      {capturedData && !analysisResult && (
        <div className="mt-8 p-6 bg-white rounded-3xl border border-surface-border shadow-card flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-charcoal">Image Ready for Processing</h3>
            <p className="text-xs text-charcoal-muted">
              Luminance: {capturedData.quality.brightness}/255 • Status: {capturedData.quality.passed ? 'Compliant' : 'Warning'}
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-semibold hover:bg-brand-teal/90 transition shadow-sm disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Computing Geometry...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Analysis
              </>
            )}
          </button>
        </div>
      )}

      {analysisError && (
        <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Real Computed Analysis Results */}
      {analysisResult && (
        <div className="mt-8 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-surface-border shadow-card">
            <h2 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-teal" />
              Spatial Anatomical Zones & Optical Tone
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Preview with Geometric Overlays */}
              <div className="relative rounded-2xl overflow-hidden bg-charcoal aspect-[4/3]">
                <img src={capturedData.imageUri} alt="Analyzed face" className="w-full h-full object-cover" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${analysisResult.frame_dimensions.width} ${analysisResult.frame_dimensions.height}`}>
                  {Object.entries(analysisResult.spatial_geometry.regions).map(([name, data]) => {
                    const points = data.polygon.map(p => `${p[0]},${p[1]}`).join(' ');
                    return (
                      <polygon
                        key={name}
                        points={points}
                        className="fill-brand-teal/20 stroke-brand-teal stroke-[3]"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Real Metric Breakdown */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-surface-subtle">
                  <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">Perceptual CIELAB Tone</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-charcoal">{analysisResult.skin_tone_estimate.estimated_range}</span>
                    <span className="text-xs text-charcoal-muted">
                      (ITA: {analysisResult.skin_tone_estimate.individual_typology_angle}°, L*: {analysisResult.skin_tone_estimate.cielab.L})
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal-muted mt-1">{analysisResult.skin_tone_estimate.note}</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-subtle">
                  <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">Geometric Regions Analyzed</span>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(analysisResult.visible_features).map(([zone, feats]) => (
                      <div key={zone} className="p-2.5 rounded-xl bg-white border border-surface-border">
                        <span className="font-semibold text-charcoal capitalize">{zone.replace('_', ' ')}</span>
                        <div className="text-[11px] text-charcoal-muted mt-0.5">
                          Spots: <strong className="text-charcoal">{feats.visible_contrast_spots}</strong> | Tex: {feats.texture_variance}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-brand-sageLight/60 border border-brand-sage/20 text-xs text-charcoal flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-sage shrink-0" />
                  <span>Quality Validated: Sharpness ({analysisResult.quality.sharpness_score}) • Mean Lum ({analysisResult.quality.mean_luminance})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
