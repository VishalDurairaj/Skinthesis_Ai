import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, LayoutDashboard, History } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Scan & Analyze', path: '/scan', icon: Camera },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center font-bold text-lg shadow-sm">
            S
          </div>
          <span className="font-semibold text-lg tracking-tight text-charcoal">
            SKINTHESIS <span className="text-xs text-brand-teal font-normal uppercase tracking-wider">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-surface-subtle text-charcoal shadow-sm'
                    : 'text-charcoal-muted hover:text-charcoal hover:bg-surface-subtle/50'
                }`}
              >
                <Icon className="w-4 h-4 text-brand-teal" />
                <span className="hidden sm:inline">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
