import React, { useState } from 'react';
import { ArrowRight, RotateCcw, Sliders, CheckCircle2 } from 'lucide-react';
import {
  ROLE_TIERS,
  COMPETENCY_PILLARS,
  RoleTierOption,
} from '../data/catalystData';

export interface MandateEstimatorTransfer {
  roleTierId: RoleTierOption['id'];
  roleTierLabel: string;
  geography: 'Pan-India' | 'International';
  isConfidential: boolean;
  estimatedShortlist: string;
  topPillarsSummary: string;
}

interface CompetencyEstimatorProps {
  onApplyToForm: (data: MandateEstimatorTransfer) => void;
  onOpenCompetencyLightbox: () => void;
}

export const CompetencyEstimator: React.FC<CompetencyEstimatorProps> = ({
  onApplyToForm,
  onOpenCompetencyLightbox,
}) => {
  const [selectedTierId, setSelectedTierId] = useState<RoleTierOption['id']>('cxo');
  const [geography, setGeography] = useState<'Pan-India' | 'International'>('Pan-India');
  const [isConfidential, setIsConfidential] = useState<boolean>(true);
  const [customOffsets, setCustomOffsets] = useState<Record<string, number>>({});
  const [justApplied, setJustApplied] = useState<boolean>(false);

  const currentTier =
    ROLE_TIERS.find((t) => t.id === selectedTierId) || ROLE_TIERS[0];

  const getPillarScore = (pillarId: string, baseScore: number) => {
    const offset = customOffsets[pillarId] || 0;
    return Math.min(100, Math.max(50, baseScore + offset));
  };

  const handleAdjustWeight = (pillarId: string, delta: number) => {
    setCustomOffsets((prev) => ({
      ...prev,
      [pillarId]: (prev[pillarId] || 0) + delta,
    }));
  };

  const handleReset = () => {
    setCustomOffsets({});
    setSelectedTierId('cxo');
    setGeography('Pan-India');
    setIsConfidential(true);
  };

  const estimatedShortlist =
    geography === 'Pan-India'
      ? currentTier.shortlistDaysPanIndia
      : currentTier.shortlistDaysInternational;

  const averageCalibration = Math.round(
    COMPETENCY_PILLARS.reduce(
      (acc, p) => acc + getPillarScore(p.id, p.weights[selectedTierId]),
      0
    ) / COMPETENCY_PILLARS.length
  );

  const handleTransfer = () => {
    const sortedPillars = [...COMPETENCY_PILLARS]
      .map((p) => ({
        name: p.name.replace(/^\d+\.\s*/, ''),
        score: getPillarScore(p.id, p.weights[selectedTierId]),
      }))
      .sort((a, b) => b.score - a.score);

    const topSummary = sortedPillars
      .slice(0, 3)
      .map((p) => `${p.name} (${p.score}%)`)
      .join(', ');

    onApplyToForm({
      roleTierId: selectedTierId,
      roleTierLabel: currentTier.label,
      geography,
      isConfidential,
      estimatedShortlist,
      topPillarsSummary: topSummary,
    });

    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 3000);
  };

  return (
    <section
      id="competency-mapping"
      className="w-full max-w-[900px] mx-auto my-20 px-4 sm:px-0"
      aria-labelledby="competency-estimator-heading"
    >
      <div className="bg-[#1634c8] border border-white/25 p-6 sm:p-10 wp-shadow-sharp">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/15">
          <div>
            <div className="text-xs font-roboto-mono text-white/75">
              Interactive Hiring Calibration · 6-Pillar Evaluation Matrix
            </div>
            <h2
              id="competency-estimator-heading"
              className="font-roboto-mono text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Executive Search &amp; Competency Mapping Estimator
            </h2>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenCompetencyLightbox}
              className="px-3.5 py-2 text-xs font-roboto-mono text-white border border-white/30 hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
            >
              View Protocol Diagram
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-xs font-roboto-mono text-white/80 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              title="Reset calibration defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Configuration Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left Column: Role & Scope Selection */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label className="block font-roboto-mono text-xs font-medium text-white/90 mb-2.5">
                01. Select Position Seniority Tier
              </label>
              <div className="space-y-2">
                {ROLE_TIERS.map((tier) => {
                  const isSelected = tier.id === selectedTierId;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`w-full text-left p-3.5 border transition-colors ${
                        isSelected
                          ? 'bg-white text-[#2544e3] border-white font-semibold'
                          : 'bg-[#2544e3]/50 text-white border-white/20 hover:border-white/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-roboto-mono text-sm">{tier.label}</span>
                        <span
                          className={`text-xs font-roboto-mono tabular-nums ${
                            isSelected ? 'text-[#1634c8]' : 'text-white/75'
                          }`}
                        >
                          {geography === 'Pan-India'
                            ? tier.shortlistDaysPanIndia.split(' ')[0]
                            : tier.shortlistDaysInternational.split(' ')[0]}{' '}
                          days
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          isSelected ? 'text-[#2544e3]/85 font-normal' : 'text-white/75'
                        }`}
                      >
                        {tier.examples}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Geography Segmented Control */}
            <div>
              <label className="block font-roboto-mono text-xs font-medium text-white/90 mb-2">
                02. Geographic Search Scope
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#001d39]/60 border border-white/15">
                {(['Pan-India', 'International'] as const).map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setGeography(scope)}
                    className={`py-2 px-3 text-xs font-roboto-mono transition-colors whitespace-nowrap shrink-0 ${
                      geography === scope
                        ? 'bg-white text-[#2544e3] font-semibold'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {scope} Search
                  </button>
                ))}
              </div>
            </div>

            {/* Discretion / Confidential Toggle */}
            <div>
              <label className="block font-roboto-mono text-xs font-medium text-white/90 mb-2">
                03. Assignment Discretion Posture
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#001d39]/60 border border-white/15">
                <button
                  type="button"
                  onClick={() => setIsConfidential(true)}
                  className={`py-2 px-3 text-xs font-roboto-mono transition-colors whitespace-nowrap shrink-0 ${
                    isConfidential
                      ? 'bg-white text-[#2544e3] font-semibold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Confidential Mandate
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfidential(false)}
                  className={`py-2 px-3 text-xs font-roboto-mono transition-colors whitespace-nowrap shrink-0 ${
                    !isConfidential
                      ? 'bg-white text-[#2544e3] font-semibold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Standard Search
                </button>
              </div>
            </div>

            {/* Mandate Summary Box */}
            <div className="p-4 bg-[#001d39]/80 border border-white/15 space-y-2">
              <div className="flex items-center justify-between text-xs font-roboto-mono text-white/75">
                <span>Estimated Shortlist Delivery</span>
                <span className="text-[#00d084] font-semibold tabular-nums">
                  {estimatedShortlist}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-roboto-mono text-white/75">
                <span>Composite Rigor Index</span>
                <span className="text-white font-semibold tabular-nums">
                  {averageCalibration}% Calibration
                </span>
              </div>
              <p className="text-xs text-white/80 pt-2 border-t border-white/10">
                {currentTier.evaluationDepth}
              </p>
            </div>
          </div>

          {/* Right Column: 6-Pillar Competency Mapping Matrix */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-[#2544e3]/40 border border-white/15 p-5 sm:p-6">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-white/80" />
                  <h3 className="font-roboto-mono text-sm font-semibold text-white">
                    Structured 6-Pillar Competency Mapping Profile
                  </h3>
                </div>
                <span className="text-xs font-roboto-mono text-white/75">
                  Click − / + to tune weights
                </span>
              </div>

              <div className="space-y-4 mt-5">
                {COMPETENCY_PILLARS.map((pillar) => {
                  const weight = getPillarScore(
                    pillar.id,
                    pillar.weights[selectedTierId]
                  );
                  return (
                    <div key={pillar.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-roboto-mono text-xs sm:text-sm font-medium text-white">
                          {pillar.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAdjustWeight(pillar.id, -5)}
                            className="w-6 h-6 flex items-center justify-center bg-[#001d39]/70 hover:bg-white hover:text-[#2544e3] text-white text-xs font-roboto-mono border border-white/20 transition-colors"
                            aria-label={`Decrease weight for ${pillar.name}`}
                          >
                            −
                          </button>
                          <span className="font-roboto-mono text-xs font-semibold text-white w-10 text-right tabular-nums">
                            {weight}%
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustWeight(pillar.id, 5)}
                            className="w-6 h-6 flex items-center justify-center bg-[#001d39]/70 hover:bg-white hover:text-[#2544e3] text-white text-xs font-roboto-mono border border-white/20 transition-colors"
                            aria-label={`Increase weight for ${pillar.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-white/75">{pillar.description}</p>
                      <div className="w-full h-2 bg-[#001d39]/80 overflow-hidden">
                        <div
                          className="h-full bg-white transition-transform duration-150 origin-left"
                          style={{ transform: `scaleX(${weight / 100})` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom CTA Transfer Bar */}
            <div className="mt-8 pt-5 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-white/85">
                <span>Scope: </span>
                <strong className="font-roboto-mono">{geography}</strong>
                <span> · </span>
                <strong className="font-roboto-mono">
                  {isConfidential ? 'Confidential Assignment' : 'Standard Search'}
                </strong>
              </div>

              <button
                type="button"
                onClick={handleTransfer}
                className="px-5 py-3 bg-white text-[#2544e3] font-roboto-mono text-xs sm:text-sm font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 wp-shadow-sharp"
              >
                {justApplied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#1634c8]" />
                    <span>Mandate Applied to Let’s Connect</span>
                  </>
                ) : (
                  <>
                    <span>Apply Mandate to Let’s Connect</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
