import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Upload, AlertCircle, CheckCircle2, SwitchCamera } from 'lucide-react';

export default function CameraCapture({ onCaptureComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [qualityCheck, setQualityCheck] = useState({ passed: true, brightness: 0, message: '' });
  const [isInitializing, setIsInitializing] = useState(false);

  const stopTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError(null);
    stopTracks();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment. Please use image upload.');
      }

      let mediaStream = null;

      // Primary attempt: targeted facingMode
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (primaryErr) {
        // Fallback attempt: any accessible video capture device
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera detection error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied by browser permissions.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No physical camera device was detected on your system. Please use the upload feature below.');
      } else {
        setCameraError(err.message || 'Unable to access camera hardware.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, stopTracks]);

  useEffect(() => {
    startCamera();
    return () => {
      stopTracks();
    };
  }, [facingMode]);

  const evaluateQuality = (canvas) => {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let totalLuminance = 0;
    const pixelCount = width * height;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuminance += luminance;
    }

    const avgLuminance = totalLuminance / pixelCount;
    let passed = true;
    let message = 'Lighting is balanced and ready for spatial geometry analysis.';

    if (avgLuminance < 45) {
      passed = false;
      message = 'Lighting is too low. Move to a well-lit area for clear landmark tracking.';
    } else if (avgLuminance > 220) {
      passed = false;
      message = 'Image is overexposed. Soften direct glare or step back slightly.';
    }

    return {
      passed,
      brightness: Math.round(avgLuminance),
      message,
    };
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const quality = evaluateQuality(canvas);
    setQualityCheck(quality);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopTracks();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setQualityCheck({ passed: true, brightness: 0, message: '' });
    startCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (.jpg, .png, .webp).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const quality = evaluateQuality(canvas);
        setQualityCheck(quality);
        setCapturedImage(event.target.result);
        stopTracks();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 border border-surface-border shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal">Optical Capture Studio</h2>
          <p className="text-xs text-charcoal-muted">Align your face inside the framing guide in even light.</p>
        </div>
        {!capturedImage && !cameraError && (
          <button
            onClick={toggleFacingMode}
            className="p-2 rounded-xl border border-surface-border text-charcoal hover:bg-surface-subtle transition"
            title="Switch Camera"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal/95 flex items-center justify-center">
        {cameraError ? (
          <div className="p-6 text-center text-white max-w-sm">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm mb-4 leading-relaxed">{cameraError}</p>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-charcoal text-xs font-semibold cursor-pointer hover:bg-surface-subtle transition shadow-sm">
              <Upload className="w-4 h-4 text-brand-teal" />
              Upload Image Instead
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captured skin area" className="w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-dashed border-white/40 m-10 rounded-[40%] pointer-events-none flex items-center justify-center">
              <span className="text-[11px] text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                Center Target Region
              </span>
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {capturedImage && (
        <div
          className={`mt-4 p-3.5 rounded-xl flex items-start gap-3 border text-xs ${
            qualityCheck.passed
              ? 'bg-brand-sageLight/60 border-brand-sage/20 text-charcoal'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          {qualityCheck.passed ? (
            <CheckCircle2 className="w-4 h-4 text-brand-sage shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{qualityCheck.passed ? 'Quality Check Passed' : 'Luminance Warning'}</p>
            <p className="text-charcoal-muted mt-0.5">{qualityCheck.message}</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-border text-xs font-medium text-charcoal hover:bg-surface-subtle transition">
          <Upload className="w-3.5 h-3.5 text-brand-teal" />
          Upload Image
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>

        <div className="flex items-center gap-2">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-surface-border text-xs font-medium text-charcoal hover:bg-surface-subtle transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-charcoal-muted" />
                Retake
              </button>
              <button
                onClick={() => onCaptureComplete && onCaptureComplete(capturedImage, qualityCheck)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-medium hover:bg-brand-teal/90 transition shadow-sm"
              >
                Ready for Analysis
              </button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              disabled={isInitializing || !!cameraError}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-charcoal text-white text-xs font-medium hover:bg-charcoal/90 transition disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              Capture Frame
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
