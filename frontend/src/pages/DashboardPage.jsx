import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-charcoal mb-2">Analysis Sessions & History</h1>
      <p className="text-xs text-charcoal-muted mb-8">
        Historical metrics populate only from authentic saved analysis sessions.
      </p>

      <div className="p-10 rounded-3xl bg-white border border-surface-border shadow-subtle text-center">
        <Activity className="w-10 h-10 text-brand-teal mx-auto mb-3" />
        <h3 className="text-base font-semibold text-charcoal">No Analysis History Found</h3>
        <p className="text-xs text-charcoal-muted max-w-sm mx-auto mt-1 mb-6">
          Capture an image and run an analysis to generate landmark coordinates, tone estimation, and tailored recommendations.
        </p>
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-medium hover:bg-brand-teal/90 transition"
        >
          Start First Scan
        </Link>
      </div>
    </div>
  );
}
