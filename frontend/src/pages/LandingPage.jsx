import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Eye, Sparkles, Activity } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-lavenderLight text-brand-lavender text-xs font-semibold mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        Spatial Skin Analysis & Intelligent Skincare
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-charcoal leading-tight max-w-3xl mx-auto">
        Understand Your Skin. <br />
        <span className="text-brand-teal">Personalize Your Care.</span>
      </h1>

      <p className="mt-6 text-base sm:text-lg text-charcoal-muted max-w-2xl mx-auto leading-relaxed">
        Real-time anatomical landmark geometry and visible surface analysis — engineered with calibrated image-quality checks, ethical privacy defaults, and age-aware skincare science.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/scan"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-charcoal text-white font-medium hover:bg-charcoal/90 transition shadow-card flex items-center justify-center gap-2"
        >
          Begin Skin Analysis
        </Link>
        <Link
          to="/dashboard"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-surface-border text-charcoal font-medium hover:bg-surface-subtle transition shadow-subtle"
        >
          View Dashboard
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="p-6 rounded-2xl bg-white border border-surface-border shadow-subtle">
          <div className="w-10 h-10 rounded-lg bg-brand-sageLight text-brand-sage flex items-center justify-center mb-4">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-charcoal mb-2">Geometric Landmark Mapping</h3>
          <p className="text-sm text-charcoal-muted leading-relaxed">
            Segments forehead, cheeks, chin, and perioral zones via coordinate-normalized anatomical geometry.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-surface-border shadow-subtle">
          <div className="w-10 h-10 rounded-lg bg-brand-lavenderLight text-brand-lavender flex items-center justify-center mb-4">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-charcoal mb-2">Calibrated Quality Checks</h3>
          <p className="text-sm text-charcoal-muted leading-relaxed">
            Checks luminance consistency, sharpness, and framing before initiating analysis.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-surface-border shadow-subtle">
          <div className="w-10 h-10 rounded-lg bg-brand-tealLight text-brand-teal flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-charcoal mb-2">Privacy & Age-Aware Care</h3>
          <p className="text-sm text-charcoal-muted leading-relaxed">
            Declared date-of-birth routing, ephemeral processing options, and strict guardian controls for minors.
          </p>
        </div>
      </div>
    </div>
  );
}
