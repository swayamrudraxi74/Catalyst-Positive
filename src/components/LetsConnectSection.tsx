import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Send,
  X,
  AlertCircle,
  Sliders,
  Database,
  Trash2,
} from 'lucide-react';
import {
  SCRAPED_SITE_CONTENT,
  ROLE_TIERS,
  COMPETENCY_PILLARS,
  RoleTierOption,
} from '../data/catalystData';
import { MandateEstimatorTransfer } from './CompetencyEstimator';
import {
  LocalInquiryRecord,
  loadLocalDb,
  saveInquiryToDatabase,
  clearInquiriesFromDatabase,
  ENV_CONFIG,
} from '../services/localDatabase';

interface LetsConnectSectionProps {
  prefilledMandate: MandateEstimatorTransfer | null;
  forceOpenForm: boolean;
  initialTab?: 'inquiry' | 'estimator' | 'database';
  onToggleForm: (open: boolean) => void;
}

export const LetsConnectSection: React.FC<LetsConnectSectionProps> = ({
  prefilledMandate,
  forceOpenForm,
  initialTab = 'inquiry',
  onToggleForm,
}) => {
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'inquiry' | 'estimator' | 'database'>(
    initialTab
  );

  // Form state
  const [fullName, setFullName] = useState<string>('');
  const [workEmail, setWorkEmail] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [roleTier, setRoleTier] = useState<string>(ROLE_TIERS[0].label);
  const [geography, setGeography] = useState<'Pan-India' | 'International'>('Pan-India');
  const [isConfidential, setIsConfidential] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  // Estimator state inside drawer
  const [selectedTierId, setSelectedTierId] = useState<RoleTierOption['id']>('cxo');
  const [customOffsets, setCustomOffsets] = useState<Record<string, number>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [latestReceipt, setLatestReceipt] = useState<LocalInquiryRecord | null>(null);
  const [savedInquiries, setSavedInquiries] = useState<LocalInquiryRecord[]>([]);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Load saved inquiries from local database on mount
  useEffect(() => {
    const db = loadLocalDb();
    setSavedInquiries(db.inquiries);
  }, []);

  useEffect(() => {
    setIsFormExpanded(forceOpenForm);
  }, [forceOpenForm]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (prefilledMandate) {
      setIsFormExpanded(true);
      setActiveTab('inquiry');
      setRoleTier(prefilledMandate.roleTierLabel);
      setGeography(prefilledMandate.geography);
      setIsConfidential(prefilledMandate.isConfidential);
      setMessage(
        `Hiring Mandate Calibration:\n• Target Tier: ${prefilledMandate.roleTierLabel}\n• Geographic Scope: ${prefilledMandate.geography}\n• Discretion: ${prefilledMandate.isConfidential ? 'Confidential Assignment' : 'Standard Search'}\n• Estimated Shortlist Window: ${prefilledMandate.estimatedShortlist}\n• Priority Competency Pillars: ${prefilledMandate.topPillarsSummary}\n\nPlease share available consultation slots to discuss our role requirements.`
      );
      setLatestReceipt(null);
    }
  }, [prefilledMandate]);

  const currentEstimatorTier =
    ROLE_TIERS.find((t) => t.id === selectedTierId) || ROLE_TIERS[0];

  const getPillarScore = (pillarId: string, baseScore: number) => {
    const offset = customOffsets[pillarId] || 0;
    return Math.min(100, Math.max(50, baseScore + offset));
  };

  const applyEstimatorSelectionToInquiry = () => {
    const shortlist =
      geography === 'Pan-India'
        ? currentEstimatorTier.shortlistDaysPanIndia
        : currentEstimatorTier.shortlistDaysInternational;

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

    setRoleTier(currentEstimatorTier.label);
    setMessage(
      `Hiring Mandate Calibration:\n• Target Tier: ${currentEstimatorTier.label}\n• Geographic Scope: ${geography}\n• Discretion: ${isConfidential ? 'Confidential Assignment' : 'Standard Search'}\n• Estimated Shortlist Window: ${shortlist}\n• Priority Competency Pillars: ${topSummary}\n\nPlease share available consultation slots to discuss our role requirements.`
    );
    setActiveTab('inquiry');
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      nextErrors.fullName = 'Please enter your full name.';
    }
    if (!workEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail.trim())) {
      nextErrors.workEmail = 'Please enter a valid work email address.';
    }
    if (!organization.trim()) {
      nextErrors.organization = 'Please enter your organization name.';
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
      nextErrors.phone = 'Please enter a valid contact phone number.';
    }
    if (!message.trim() || message.trim().length < 10) {
      nextErrors.message = 'Please provide brief details about your hiring requirement.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const matchedTier =
      ROLE_TIERS.find((t) => t.label === roleTier) || ROLE_TIERS[0];
    const shortlist =
      geography === 'Pan-India'
        ? matchedTier.shortlistDaysPanIndia
        : matchedTier.shortlistDaysInternational;

    const refNumber = `CP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowFormatted = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const receipt: LocalInquiryRecord = {
      referenceId: refNumber,
      submittedAt: nowFormatted,
      fullName: fullName.trim(),
      workEmail: workEmail.trim(),
      organization: organization.trim(),
      phone: phone.trim(),
      roleTier,
      geography,
      isConfidential,
      estimatedShortlist: shortlist,
      message: message.trim(),
    };

    await saveInquiryToDatabase(receipt);
    const updatedDb = loadLocalDb();
    setSavedInquiries(updatedDb.inquiries);
    setLatestReceipt(receipt);
    setErrors({});
  };

  const handleCopyReceipt = () => {
    if (!latestReceipt) return;
    const summaryText = [
      `Catalyst Positive — Hiring Mandate Confirmation (${latestReceipt.referenceId})`,
      `Domain: ${ENV_CONFIG.domain}`,
      `Date: ${latestReceipt.submittedAt}`,
      `Client: ${latestReceipt.fullName} (${latestReceipt.organization})`,
      `Contact: ${latestReceipt.workEmail} | ${latestReceipt.phone}`,
      `Position Tier: ${latestReceipt.roleTier}`,
      `Scope: ${latestReceipt.geography} | ${latestReceipt.isConfidential ? 'Confidential Search' : 'Standard Search'}`,
      `Estimated Shortlist Window: ${latestReceipt.estimatedShortlist}`,
      `Brief: ${latestReceipt.message}`,
    ].join('\n');

    navigator.clipboard?.writeText(summaryText);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleClearDb = () => {
    clearInquiriesFromDatabase();
    setSavedInquiries([]);
  };

  return (
    <div id="lets-connect" className="w-full">
      {/* Bottom Action Button: Centered "Let's Connect" */}
      <div className="wp-block-buttons alignfull flex justify-center items-center">
        <div className="wp-block-button">
          <button
            type="button"
            onClick={() => {
              const nextState = !isFormExpanded;
              setIsFormExpanded(nextState);
              onToggleForm(nextState);
            }}
            className="wp-block-button__link has-text-align-center wp-element-button"
          >
            <strong>Let’s Connect</strong>
          </button>
        </div>
      </div>

      {/* Smooth Collapsible Inquiry, Estimator & Local Database Drawer */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out w-full max-w-[760px] mx-auto ${
          isFormExpanded ? 'max-h-[1800px] opacity-100 mt-12' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <div className="bg-[#1634c8]/95 backdrop-blur-md border border-white/25 p-6 sm:p-10 shadow-2xl text-left">
          {/* Top Navigation Tabs inside Drawer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/15">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('inquiry')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-roboto-mono transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'inquiry'
                    ? 'bg-white text-[#2544e3] font-medium'
                    : 'text-white/80 hover:text-white bg-[#2544e3]/40'
                }`}
              >
                <span>01. Hiring Inquiry Form</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('estimator')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-roboto-mono transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'estimator'
                    ? 'bg-white text-[#2544e3] font-medium'
                    : 'text-white/80 hover:text-white bg-[#2544e3]/40'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 shrink-0" />
                <span>02. Competency Mapping Estimator</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('database')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-roboto-mono transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'database'
                    ? 'bg-white text-[#2544e3] font-medium'
                    : 'text-white/80 hover:text-white bg-[#2544e3]/40'
                }`}
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>03. Local Database ({savedInquiries.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFormExpanded(false);
                onToggleForm(false);
              }}
              className="p-1.5 text-white/75 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Let's Connect panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {activeTab === 'database' ? (
            /* Tab 3: Local Database & .env Configuration Inspector */
            <div className="pt-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/15">
                <div>
                  <h3 className="text-base font-medium text-white tracking-wider">
                    <strong>Local Database Records &amp; .env Status</strong>
                  </h3>
                  <p className="text-xs text-white/80 mt-1">
                    Mode: <strong className="text-[#00d084] uppercase">{ENV_CONFIG.dataMode}</strong> ·
                    Domain: <span className="underline">{ENV_CONFIG.domain}</span>
                  </p>
                </div>
                {savedInquiries.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearDb}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#001d39] hover:bg-[#cf2e2e] text-white border border-white/20 text-xs font-roboto-mono transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Clear Local Records</span>
                  </button>
                )}
              </div>

              {savedInquiries.length === 0 ? (
                <div className="p-8 bg-[#001d39]/50 border border-white/15 text-center space-y-3">
                  <p className="text-xs text-white/85">
                    No hiring inquiries saved in your local database yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inquiry')}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-[#2544e3] font-roboto-mono text-xs font-medium cursor-pointer"
                  >
                    Create First Inquiry
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {savedInquiries.map((rec) => (
                    <div
                      key={rec.referenceId}
                      className="p-4 bg-[#001d39]/65 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-[#00d084] tabular-nums">{rec.referenceId}</strong>
                          <span>·</span>
                          <strong className="text-white">{rec.organization}</strong>
                          <span>·</span>
                          <span className="text-white/75">{rec.fullName}</span>
                        </div>
                        <div className="text-white/75">
                          {rec.roleTier} · {rec.geography} · {rec.submittedAt}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLatestReceipt(rec);
                          setActiveTab('inquiry');
                        }}
                        className="inline-flex items-center justify-center px-3.5 py-2 bg-white text-[#2544e3] font-roboto-mono text-xs font-medium hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        View Receipt
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'estimator' ? (
            /* Tab 2: Clean Competency Mapping Estimator */
            <div className="pt-7 space-y-6">
              <div>
                <h3 className="text-base font-medium text-white tracking-wider">
                  <strong>Executive Search &amp; Competency Mapping Calibration</strong>
                </h3>
                <p className="wp-block-paragraph text-xs text-white/80 mt-2">
                  Configure your target role seniority and scope to preview Catalyst Positive’s
                  structured 6-pillar evaluation weights and shortlist timeline.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {ROLE_TIERS.map((tier) => {
                  const selected = tier.id === selectedTierId;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`p-4 text-left border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-white text-[#2544e3] border-white'
                          : 'bg-[#2544e3]/40 text-white border-white/20 hover:border-white/45'
                      }`}
                    >
                      <div className="text-xs font-medium">{tier.label}</div>
                      <div
                        className={`text-[11px] mt-1 ${
                          selected ? 'text-[#2544e3]/80' : 'text-white/70'
                        }`}
                      >
                        {tier.examples}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <span className="block text-xs text-white/85 mb-2">Geographic Scope</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(['Pan-India', 'International'] as const).map((scope) => (
                      <button
                        key={scope}
                        type="button"
                        onClick={() => setGeography(scope)}
                        className={`py-2.5 px-3 text-xs border transition-colors cursor-pointer ${
                          geography === scope
                            ? 'bg-white text-[#2544e3] border-white font-medium'
                            : 'bg-[#2544e3]/30 text-white border-white/20'
                        }`}
                      >
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-white/85 mb-2">Assignment Discretion</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsConfidential(true)}
                      className={`py-2.5 px-3 text-xs border transition-colors cursor-pointer ${
                        isConfidential
                          ? 'bg-white text-[#2544e3] border-white font-medium'
                          : 'bg-[#2544e3]/30 text-white border-white/20'
                      }`}
                    >
                      Confidential
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfidential(false)}
                      className={`py-2.5 px-3 text-xs border transition-colors cursor-pointer ${
                        !isConfidential
                          ? 'bg-white text-[#2544e3] border-white font-medium'
                          : 'bg-[#2544e3]/30 text-white border-white/20'
                      }`}
                    >
                      Standard
                    </button>
                  </div>
                </div>
              </div>

              {/* 6-Pillar Sliders */}
              <div className="space-y-3.5 pt-2">
                {COMPETENCY_PILLARS.map((pillar) => {
                  const weight = getPillarScore(pillar.id, pillar.weights[selectedTierId]);
                  return (
                    <div key={pillar.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span>{pillar.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCustomOffsets((p) => ({
                                ...p,
                                [pillar.id]: (p[pillar.id] || 0) - 5,
                              }))
                            }
                            className="w-6 h-6 flex items-center justify-center border border-white/25 hover:bg-white hover:text-[#2544e3] cursor-pointer"
                          >
                            −
                          </button>
                          <span className="w-10 text-right tabular-nums">{weight}%</span>
                          <button
                            type="button"
                            onClick={() =>
                              setCustomOffsets((p) => ({
                                ...p,
                                [pillar.id]: (p[pillar.id] || 0) + 5,
                              }))
                            }
                            className="w-6 h-6 flex items-center justify-center border border-white/25 hover:bg-white hover:text-[#2544e3] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-[#001d39]/60 overflow-hidden">
                        <div
                          className="h-full bg-white transition-transform duration-200 origin-left"
                          style={{ transform: `scaleX(${weight / 100})` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-white/85">
                  Estimated Shortlist Window:{' '}
                  <strong className="text-[#00d084] tabular-nums">
                    {geography === 'Pan-India'
                      ? currentEstimatorTier.shortlistDaysPanIndia
                      : currentEstimatorTier.shortlistDaysInternational}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={applyEstimatorSelectionToInquiry}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#2544e3] font-roboto-mono text-xs font-medium hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <strong>Apply to Inquiry Form →</strong>
                </button>
              </div>
            </div>
          ) : latestReceipt ? (
            /* Instant Confirmation Receipt View */
            <div className="pt-7 space-y-6" role="status" aria-live="polite">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/15">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#00d084] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-[#00d084]">
                      Saved to Local Database · Instant Confirmation Receipt
                    </div>
                    <h3 className="text-lg font-medium text-white mt-1 tracking-normal">
                      <strong>Thank You, {latestReceipt.fullName}</strong>
                    </h3>
                  </div>
                </div>
                <div className="bg-[#001d39]/80 px-4 py-2.5 border border-white/20 text-right">
                  <div className="text-[11px] text-white/70">Reference ID</div>
                  <div className="text-sm font-medium text-[#00d084] tabular-nums">
                    {latestReceipt.referenceId}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#001d39]/55 p-5 border border-white/15 text-xs leading-relaxed">
                <div>
                  <span className="text-white/65 block">Organization &amp; Contact</span>
                  <strong className="text-white block mt-0.5">
                    {latestReceipt.organization} · {latestReceipt.fullName}
                  </strong>
                  <span className="text-white/80 block tabular-nums">
                    {latestReceipt.workEmail} · {latestReceipt.phone}
                  </span>
                </div>
                <div>
                  <span className="text-white/65 block">Role Scope &amp; Timeline</span>
                  <strong className="text-white block mt-0.5">{latestReceipt.roleTier}</strong>
                  <span className="text-[#00d084] block tabular-nums">
                    {latestReceipt.geography} · {latestReceipt.estimatedShortlist}
                  </span>
                </div>
                <div className="sm:col-span-2 pt-3 border-t border-white/10">
                  <span className="text-white/65 block mb-1">Hiring Brief</span>
                  <pre className="whitespace-pre-wrap font-roboto-mono text-xs text-white/90">
                    {latestReceipt.message}
                  </pre>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#001d39] text-white border border-white/25 text-xs cursor-pointer whitespace-nowrap"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-4 h-4 text-[#00d084] shrink-0" />
                      <span>Receipt Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 shrink-0" />
                      <span>Copy Receipt</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLatestReceipt(null);
                    setMessage('');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#2544e3] font-roboto-mono text-xs font-medium hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <strong>Submit Another Inquiry</strong>
                </button>
              </div>
            </div>
          ) : (
            /* Tab 1: Clean, Spacious Hiring Inquiry Form with Fixed Single-Line Send Inquiry Button */
            <form onSubmit={handleSubmit} noValidate className="pt-7 space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-white tracking-wider">
                  <strong>Connect with Catalyst Positive</strong>
                </h3>
                <p className="wp-block-paragraph text-xs text-white/80 mt-1.5">
                  Share your executive search or strategic talent requirement (
                  {SCRAPED_SITE_CONTENT.contactEmail} · {SCRAPED_SITE_CONTENT.contactPhoneFormatted}
                  ).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cp-name" className="block text-xs text-white/90 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="cp-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 bg-[#2544e3]/45 border border-white/30 text-white placeholder-white/45 text-xs focus:outline-none focus:border-white transition-colors"
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-[#fcb900] mt-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cp-email" className="block text-xs text-white/90 mb-2">
                    Work Email *
                  </label>
                  <input
                    id="cp-email"
                    type="email"
                    value={workEmail}
                    onChange={(e) => {
                      setWorkEmail(e.target.value);
                      if (errors.workEmail) setErrors({ ...errors, workEmail: '' });
                    }}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 bg-[#2544e3]/45 border border-white/30 text-white placeholder-white/45 text-xs focus:outline-none focus:border-white transition-colors"
                  />
                  {errors.workEmail && (
                    <p className="text-[11px] text-[#fcb900] mt-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.workEmail}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cp-org" className="block text-xs text-white/90 mb-2">
                    Organization *
                  </label>
                  <input
                    id="cp-org"
                    type="text"
                    value={organization}
                    onChange={(e) => {
                      setOrganization(e.target.value);
                      if (errors.organization) setErrors({ ...errors, organization: '' });
                    }}
                    placeholder="Company Name"
                    className="w-full px-4 py-3 bg-[#2544e3]/45 border border-white/30 text-white placeholder-white/45 text-xs focus:outline-none focus:border-white transition-colors"
                  />
                  {errors.organization && (
                    <p className="text-[11px] text-[#fcb900] mt-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.organization}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cp-tel" className="block text-xs text-white/90 mb-2">
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="cp-tel"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full px-4 py-3 bg-[#2544e3]/45 border border-white/30 text-white placeholder-white/45 text-xs focus:outline-none focus:border-white transition-colors tabular-nums"
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-[#fcb900] mt-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="cp-brief" className="block text-xs text-white/90 mb-2">
                  Position Details &amp; Hiring Requirement *
                </label>
                <textarea
                  id="cp-brief"
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  placeholder="Tell us about the role(s) you are looking to fill (e.g., CEO/CFO/CTO, VP, Director, Specialists), location, and timeline..."
                  className="w-full px-4 py-3 bg-[#2544e3]/45 border border-white/30 text-white placeholder-white/45 text-xs focus:outline-none focus:border-white leading-relaxed transition-colors"
                />
                {errors.message && (
                  <p className="text-[11px] text-[#fcb900] mt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>

              {/* Bottom Form Footer with Properly Aligned Single-Line Send Inquiry Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/15">
                <span className="text-[11px] text-white/70">
                  Saved directly to Local Database ({ENV_CONFIG.dataMode.toUpperCase()} mode)
                </span>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white text-[#2544e3] font-roboto-mono text-xs sm:text-sm font-medium tracking-wider hover:bg-white/95 hover:-translate-y-0.5 transition-all duration-200 shadow-lg cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="w-4 h-4 text-[#2544e3] shrink-0" />
                  <strong>Send Inquiry</strong>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
