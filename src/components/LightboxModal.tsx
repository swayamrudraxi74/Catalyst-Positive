import React, { useEffect } from 'react';
import { X, ZoomIn, ShieldCheck, Globe, Award, Layers } from 'lucide-react';
import { SCRAPED_SITE_CONTENT, COMPETENCY_PILLARS } from '../data/catalystData';

export type LightboxTarget = 'img1' | 'img2' | null;

interface LightboxModalProps {
  activeTarget: LightboxTarget;
  onClose: () => void;
  onSwitchTarget: (target: 'img1' | 'img2') => void;
  onSelectMandateCTA: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  activeTarget,
  onClose,
  onSwitchTarget,
  onSelectMandateCTA,
}) => {
  useEffect(() => {
    if (!activeTarget) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTarget, onClose]);

  if (!activeTarget) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#001d39]/90 backdrop-blur-sm p-4 md:p-8 transition-opacity duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Catalyst Positive Visual Lightbox"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#1634c8] border border-white/25 wp-shadow-sharp text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Lightbox Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-[#001d39] border-b border-white/15">
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-[#00d084] shrink-0" />
            <span className="font-roboto-mono text-sm font-medium tracking-tight">
              {activeTarget === 'img1'
                ? 'Catalyst Positive — Brand Identity & Vision (#img1)'
                : 'Catalyst Positive — 6-Pillar Competency Mapping Architecture (#img2)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSwitchTarget('img1')}
              className={`px-3 py-1.5 text-xs font-roboto-mono transition-colors whitespace-nowrap shrink-0 ${
                activeTarget === 'img1'
                  ? 'bg-white text-[#2544e3] font-medium'
                  : 'bg-[#2544e3]/50 text-white/80 hover:text-white'
              }`}
            >
              01. Brand Emblem (#img1)
            </button>
            <button
              type="button"
              onClick={() => onSwitchTarget('img2')}
              className={`px-3 py-1.5 text-xs font-roboto-mono transition-colors whitespace-nowrap shrink-0 ${
                activeTarget === 'img2'
                  ? 'bg-white text-[#2544e3] font-medium'
                  : 'bg-[#2544e3]/50 text-white/80 hover:text-white'
              }`}
            >
              02. Competency Matrix (#img2)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-2 p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lightbox Body */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          {activeTarget === 'img1' ? (
            <div className="space-y-6">
              <div className="bg-white p-4 md:p-6 flex items-center justify-center border border-white/20">
                <img
                  src={SCRAPED_SITE_CONTENT.heroImageHiRes}
                  alt="Catalyst Positive — In search of Talent"
                  referrerPolicy="no-referrer"
                  className="max-h-[460px] w-auto object-contain"
                />
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-white/15">
                <div>
                  <h3 className="font-roboto-mono text-lg font-medium text-white">
                    {SCRAPED_SITE_CONTENT.siteTitle} · {SCRAPED_SITE_CONTENT.tagline}
                  </h3>
                  <p className="text-sm text-white/80 mt-1">
                    {SCRAPED_SITE_CONTENT.heroHeading} ({SCRAPED_SITE_CONTENT.location})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectMandateCTA();
                  }}
                  className="px-5 py-2.5 bg-white text-[#2544e3] font-roboto-mono text-xs font-medium hover:bg-white/90 transition-colors whitespace-nowrap shrink-0"
                >
                  Initiate Hiring Mandate
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#001d39] border border-white/15 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/15">
                  <div>
                    <p className="text-xs font-roboto-mono text-[#00d084]">
                      Structured Candidate Evaluation Standard
                    </p>
                    <h3 className="font-roboto-mono text-xl font-medium text-white mt-1">
                      Catalyst Positive 6-Pillar Competency Mapping Protocol
                    </h3>
                  </div>
                  <div className="text-xs text-white/75 font-roboto-mono">
                    Pan-India · International · Confidential Search
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {COMPETENCY_PILLARS.map((pillar) => (
                    <div
                      key={pillar.id}
                      className="p-4 bg-[#1634c8]/60 border border-white/15 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="font-roboto-mono text-sm font-medium text-white">
                          {pillar.name}
                        </h4>
                        <p className="text-xs text-white/80 mt-2 leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-roboto-mono text-white/90 tabular-nums">
                        <span>CXO Benchmark</span>
                        <span className="text-[#00d084] font-medium">{pillar.weights.cxo}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/15 text-xs">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#00d084] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-roboto-mono font-medium text-white">
                        Complete Discretion
                      </div>
                      <div className="text-white/75 mt-0.5">
                        Confidential leadership replacement & strategic search mandates.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-[#00d084] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-roboto-mono font-medium text-white">
                        Pan-India & Global Reach
                      </div>
                      <div className="text-white/75 mt-0.5">
                        Domestic metropolitan hubs and cross-border executive sourcing.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-[#00d084] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-roboto-mono font-medium text-white">
                        Pre-Vetted Shortlists
                      </div>
                      <div className="text-white/75 mt-0.5">
                        Every candidate is calibrated across all 6 competency dimensions.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-white/75 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-white/60" />
                  <span>Grounded in Catalyst Positive’s official candidate quality methodology</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectMandateCTA();
                  }}
                  className="px-5 py-2.5 bg-white text-[#2544e3] font-roboto-mono text-xs font-medium hover:bg-white/90 transition-colors whitespace-nowrap shrink-0"
                >
                  Configure Your Role Mandate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
