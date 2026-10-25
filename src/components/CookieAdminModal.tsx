import React, { useState, useEffect } from 'react';
import { X, Shield, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { COOKIE_CATEGORIES, CookieCategory } from '../data/catalystData';
import { loadLocalDb, saveLocalDb } from '../services/localDatabase';

interface CookieAdminModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const CookieAdminModal: React.FC<CookieAdminModalProps> = ({
  isOpen,
  onOpen,
  onClose,
}) => {
  const [preferences, setPreferences] = useState<Record<CookieCategory['id'], boolean>>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    unclassified: false,
  });

  const [expandedCat, setExpandedCat] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const db = loadLocalDb();
    if (db.cookiePreferences) {
      setPreferences({
        necessary: true,
        functional: !!db.cookiePreferences.functional,
        analytics: !!db.cookiePreferences.analytics,
        marketing: !!db.cookiePreferences.marketing,
        unclassified: !!db.cookiePreferences.unclassified,
      });
    }
  }, [isOpen]);

  const toggleCategoryExpand = (id: string) => {
    setExpandedCat((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePreference = (id: CookieCategory['id']) => {
    if (id === 'necessary') return;
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = (mode: 'reject' | 'save' | 'accept') => {
    let nextPrefs = { ...preferences };
    if (mode === 'reject') {
      nextPrefs = {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
        unclassified: false,
      };
      setStatusMessage('Saved to Local Database: Only Necessary Cookies active.');
    } else if (mode === 'accept') {
      nextPrefs = {
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true,
        unclassified: true,
      };
      setStatusMessage('Saved to Local Database: All Cookie Categories accepted.');
    } else {
      setStatusMessage('Your custom cookie preferences have been saved locally.');
    }

    setPreferences(nextPrefs);
    const db = loadLocalDb();
    db.cookiePreferences = {
      ...nextPrefs,
      updatedAt: new Date().toISOString(),
    };
    saveLocalDb(db);

    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 900);
  };

  return (
    <>
      {/* Subtle Bottom-Left Cookie Consent Trigger */}
      <div className="fixed bottom-6 left-6 z-30">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1634c8]/80 hover:bg-[#001d39] backdrop-blur-xs text-white/85 hover:text-white border border-white/15 font-roboto-mono text-[11px] transition-all duration-200 cursor-pointer whitespace-nowrap"
          aria-label="Customize Cookie Preferences"
        >
          <Shield className="w-3 h-3 text-white/70 shrink-0" />
          <span>Customize Cookies</span>
        </button>
      </div>

      {/* Full CookieAdmin Modal Replica */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookieadmin-modal-title"
          onClick={onClose}
        >
          <div
            className="w-full max-w-2xl bg-white text-[#001d39] border border-slate-200 shadow-2xl overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#001d39] text-white">
              <div>
                <h2
                  id="cookieadmin-modal-title"
                  className="font-roboto-mono text-base font-bold tracking-normal"
                >
                  Customize Consent Preferences
                </h2>
                <p className="text-xs text-white/75 mt-0.5">
                  Manage cookie categories for catalystpositive.com
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Cookie Preferences"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Feedback Toast inside modal */}
            {statusMessage && (
              <div className="px-6 py-2.5 bg-[#00d084]/15 border-b border-[#00d084]/40 text-[#001d39] text-xs font-roboto-mono flex items-center gap-2">
                <Check className="w-4 h-4 text-[#007cba] shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Categories List */}
            <div className="p-6 max-h-[60vh] overflow-y-auto divide-y divide-slate-200">
              {COOKIE_CATEGORIES.map((cat) => {
                const isExpanded = !!expandedCat[cat.id];
                const isChecked = preferences[cat.id];

                return (
                  <div
                    key={cat.id}
                    className="py-4 first:pt-0 last:pb-0"
                    role="region"
                    aria-labelledby={`cookieadmin-${cat.id}-heading`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => toggleCategoryExpand(cat.id)}
                        className="inline-flex items-center gap-2 text-left font-roboto-mono text-sm font-bold text-[#001d39] hover:text-[#2544e3] transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 shrink-0 text-[#985e23]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 shrink-0 text-[#985e23]" />
                        )}
                        <span id={`cookieadmin-${cat.id}-heading`}>{cat.title}</span>
                      </button>

                      {cat.alwaysActive ? (
                        <span className="text-xs font-roboto-mono font-semibold text-[#007cba] whitespace-nowrap">
                          Always Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isChecked}
                          onClick={() => togglePreference(cat.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                            isChecked ? 'bg-[#2544e3]' : 'bg-slate-300'
                          }`}
                          aria-label={`Toggle ${cat.title}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 ${
                              isChecked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-2 pl-6 leading-relaxed">
                      {cat.description}
                    </p>

                    {isExpanded && (
                      <div className="mt-2.5 ml-6 p-2.5 bg-slate-100 border border-slate-200 text-xs font-roboto-mono text-slate-600">
                        Active Cookies in Category:{' '}
                        <span className="font-semibold">{cat.cookiesList}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer with exact CookieAdmin buttons & #001d39 / #985e23 SVG wordmark */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSave('reject')}
                  className="px-4 py-2 text-xs font-roboto-mono font-semibold text-[#001d39] border border-slate-300 bg-white hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Reject All
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('save')}
                  className="px-4 py-2 text-xs font-roboto-mono font-semibold text-[#001d39] border border-[#001d39] bg-white hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Save My Preferences
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('accept')}
                  className="px-4 py-2 text-xs font-roboto-mono font-semibold text-white bg-[#2544e3] hover:bg-[#1634c8] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Accept All
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 shrink-0">
                <span>Powered by</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 829 137"
                  width="84"
                  height="14"
                  aria-label="CookieAdmin"
                >
                  <path
                    fill="#001d39"
                    d="m174.9 108.6q-10 0-18.2-4.7-8.1-4.8-12.9-13-4.7-8.3-4.7-18.3 0-10.2 4.6-18.4 4.6-8.2 12.6-12.8 8-4.7 18-4.7 5.4 0 10.6 1.3 5.2 1.3 8.9 3.7l-2.7 15.5q-7.2-2.7-13-2.7-8 0-12.3 4.7-4.3 4.6-4.3 13.3 0 8.5 4.5 13.3 4.6 4.7 12.7 4.7 3.1 0 5.8-0.6 2.7-0.6 6.6-2.2l2.8 15.8q-8.7 5.1-19 5.1zm52.4-0.8q-8.4 0-15-3.3-6.5-3.3-10.2-9.1-3.6-5.9-3.6-13.5 0-7.6 3.7-13.4 3.7-5.9 10.2-9.1 6.6-3.2 15-3.2 8.5 0 15 3.3 6.6 3.2 10.2 9 3.6 5.8 3.6 13.4 0 7.7-3.7 13.6-3.6 5.8-10.2 9.1-6.5 3.2-15 3.2zm0.2-15q4.1 0 6.7-3 2.7-3.1 2.7-7.9 0-4.8-2.7-7.8-2.6-3.1-6.7-3.1-4.1 0-6.8 3.1-2.6 3-2.6 7.8 0 4.8 2.6 7.9 2.7 3 6.8 3zm61.8 15q-8.4 0-15-3.3-6.5-3.3-10.2-9.1-3.6-5.9-3.6-13.5 0-7.6 3.7-13.4 3.7-5.9 10.2-9.1 6.6-3.2 15-3.2 8.5 0 15 3.3 6.6 3.2 10.2 9 3.6 5.8 3.6 13.4 0 7.7-3.7 13.6-3.6 5.8-10.2 9.1-6.5 3.2-15 3.2zm0.2-15q4.1 0 6.7-3 2.7-3.1 2.7-7.9 0-4.8-2.7-7.8-2.6-3.1-6.7-3.1-4.1 0-6.8 3.1-2.6 3-2.6 7.8 0 4.8 2.6 7.9 2.7 3 6.8 3zm85.8 15q-6.7 0-10.8-1.7-4-1.8-6.6-5.9-2.6-4.1-4.6-11.7l-5.9 4.7v13.8h-21.2l0.1-65.9 21.2-3.1-0.1 34.2 25.7-21 11.5 15.7-16.1 11.2q1.2 7.6 3.4 10.6 2.3 3 6.7 3 1.8 0 4.3-0.6l-2 16.4q-3 0.3-5.6 0.3zm32.3 0q-8.4 0-13.1-5.4-4.7-5.4-4.7-14.7v-30.8h21.2v29.9q0 2.3 1.2 3.6 1.3 1.2 3.3 1.2 2 0 4.1-1.2l1.1 13.9q-2.2 1.7-5.8 2.6-3.5 0.9-7.3 0.9zm-7.2-58.4q-4.7 0-8-2.9-3.2-3-3.2-7.3 0-4.3 3.4-7.2 3.4-2.9 7.8-2.9 4.6 0 7.9 3 3.4 3 3.4 7.1 0 4.4-3.4 7.3-3.4 2.9-7.9 2.9zm52.5 58.4q-8.3 0-14.8-3.3-6.4-3.4-10-9.2-3.6-5.9-3.6-13.3 0-7.6 3.7-13.5 3.7-5.9 10-9.1 6.3-3.2 14-3.2 7.4 0 12.6 3.3 5.3 3.2 7.9 8.8 2.6 5.5 2.6 12.4 0 1.8-0.2 2.6l-30 3.9q1.2 3.5 3.9 5.1 2.7 1.5 7.1 1.5 6.8 0 14.7-3.5l2.5 13.4q-9.3 4.1-20.4 4.1zm-8.6-29.8l15.5-3.4q-1.6-6.3-7.6-6.3-3.6 0-5.7 2.7-2.1 2.7-2.2 7z"
                  />
                  <path
                    fill="#985e23"
                    d="m477.5 107l19-68.8h30.4l19.9 68.8h-23.5l-2.6-13.2h-17.8l-2.9 13.2zm27.5-25.5h13.3l-6.5-30.1zm68.9 26.3q-6.8 0-12.4-3.6-5.5-3.6-8.7-9.5-3.2-6-3.2-12.7 0-7.1 3.3-13 3.4-6 9-9.4 5.7-3.4 12.1-3.4 5.8 0 9.8 2.4 4.1 2.4 6.6 7.7v-25.2l21.1-3.1v69h-21.1v-9.3q-4.7 10.1-16.5 10.1zm6.6-15.8q4.2 0 7-3 2.9-3 2.9-7v-0.4q0-3.9-3-6.7-3-2.9-6.9-2.9-4.2 0-7.1 3-2.8 2.9-2.8 7 0 4.2 2.9 7.1 3 2.9 7 2.9zm41.5 15v-49.4h20.1v10.2q3.4-5.9 7.7-8.7 4.4-2.9 10.4-2.9 5.9 0 10.2 3 4.4 2.9 6.6 7.9 6.4-10.9 18.6-10.9 5.8 0 10.1 3.1 4.4 3.1 6.8 9 2.4 5.8 2.4 13.7v25h-21.1v-25q0-5.1-1.8-7.7-1.7-2.6-4.8-2.6-3.4 0-5.9 2.9-2.4 2.9-2.4 7v25.4h-20.9v-25q0-5.1-1.8-7.7-1.7-2.6-4.9-2.6-3.4 0-5.8 2.9-2.4 2.9-2.4 7v25.4zm119.6 0.8q-8.4 0-13.1-5.4-4.7-5.4-4.7-14.7v-30.8h21.2v29.9q0 2.3 1.2 3.6 1.3 1.2 3.3 1.2 2 0 4.1-1.2l1.1 13.9q-2.2 1.7-5.8 2.6-3.5 0.9-7.3 0.9zm-7.2-58.4q-4.7 0-8-2.9-3.2-3-3.2-7.3 0-4.3 3.4-7.2 3.4-2.9 7.8-2.9 4.6 0 7.9 3 3.4 3 3.4 7.1 0 4.4-3.4 7.3-3.4 2.9-7.9 2.9zm26.6 57.6v-49.4h20.1v10.2q5.8-11.6 18.4-11.6 9.6 0 15 6.9 5.5 6.8 5.5 18.9v25h-21v-27.1q0-4.3-1.9-6.6-1.8-2.3-5.1-2.3-2.4 0-4.7 1.6-2.3 1.5-3.8 4.4-1.4 2.9-1.4 6.6v23.4z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
