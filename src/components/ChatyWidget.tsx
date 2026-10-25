import React, { useState } from 'react';
import { X, MessageCircle, Mail, Phone, Copy, Check, Send } from 'lucide-react';
import { SCRAPED_SITE_CONTENT } from '../data/catalystData';

interface ChatyWidgetProps {
  onJumpToConnect: () => void;
}

type ActiveChannel = 'whatsapp' | 'email' | 'phone' | null;

export const ChatyWidget: React.FC<ChatyWidgetProps> = ({ onJumpToConnect }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showCtaTooltip, setShowCtaTooltip] = useState<boolean>(true);
  const [activeChannel, setActiveChannel] = useState<ActiveChannel>(null);
  const [quickMessage, setQuickMessage] = useState<string>('');
  const [quickSent, setQuickSent] = useState<boolean>(false);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleCopy = (val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedValue(val);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const handleQuickSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMessage.trim()) return;
    setQuickSent(true);
    setTimeout(() => {
      setQuickSent(false);
      setQuickMessage('');
    }, 2800);
  };

  return (
    <div
      className="fixed bottom-20 right-6 z-40 flex flex-col items-end gap-3"
      aria-label="Quick Contact Channels"
    >
      {/* In-App Channel Action Card (WhatsApp / Email / Phone) */}
      {activeChannel && (
        <div className="w-80 bg-[#001d39] border border-white/25 text-white p-4 wp-shadow-sharp mb-1">
          <div className="flex items-center justify-between pb-3 border-b border-white/15">
            <div className="flex items-center gap-2">
              {activeChannel === 'whatsapp' && (
                <span className="w-6 h-6 rounded-full bg-[#49E670] flex items-center justify-center text-[#001d39]">
                  <MessageCircle className="w-3.5 h-3.5" />
                </span>
              )}
              {activeChannel === 'email' && (
                <span className="w-6 h-6 rounded-full bg-[#FF485F] flex items-center justify-center text-white">
                  <Mail className="w-3.5 h-3.5" />
                </span>
              )}
              {activeChannel === 'phone' && (
                <span className="w-6 h-6 rounded-full bg-[#03E78B] flex items-center justify-center text-[#001d39]">
                  <Phone className="w-3.5 h-3.5" />
                </span>
              )}
              <span className="font-roboto-mono text-xs font-bold">
                {activeChannel === 'whatsapp' && 'WhatsApp Direct Desk'}
                {activeChannel === 'email' && 'Email Recruitment Desk'}
                {activeChannel === 'phone' && 'Direct Phone Line'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveChannel(null)}
              className="text-white/70 hover:text-white p-1"
              aria-label="Close channel card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-3 text-xs">
            {activeChannel === 'whatsapp' && (
              <>
                <div className="flex items-center justify-between bg-[#1634c8]/70 px-3 py-2 border border-white/15">
                  <span className="font-roboto-mono tabular-nums">
                    {SCRAPED_SITE_CONTENT.contactPhoneFormatted}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(SCRAPED_SITE_CONTENT.contactPhone)}
                    className="flex items-center gap-1 text-[#49E670] font-roboto-mono hover:underline"
                  >
                    {copiedValue === SCRAPED_SITE_CONTENT.contactPhone ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {quickSent ? (
                  <div className="p-3 bg-[#49E670]/20 border border-[#49E670] text-white font-roboto-mono text-xs">
                    Message queued for Catalyst Positive WhatsApp desk (
                    {SCRAPED_SITE_CONTENT.contactPhoneFormatted}).
                  </div>
                ) : (
                  <form onSubmit={handleQuickSend} className="space-y-2">
                    <input
                      type="text"
                      value={quickMessage}
                      onChange={(e) => setQuickMessage(e.target.value)}
                      placeholder="Write your message..."
                      className="w-full px-3 py-2 bg-[#1634c8]/50 border border-white/25 text-white placeholder-white/50 text-xs focus:outline-none focus:border-white"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#49E670] text-[#001d39] font-roboto-mono text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Message</span>
                    </button>
                  </form>
                )}
              </>
            )}

            {activeChannel === 'email' && (
              <div className="space-y-3">
                <p className="text-white/80">
                  Reach our executive search partners directly via email or use the structured
                  mandate form:
                </p>
                <div className="flex items-center justify-between bg-[#1634c8]/70 px-3 py-2.5 border border-white/15">
                  <span className="font-roboto-mono text-[11px] truncate mr-2">
                    {SCRAPED_SITE_CONTENT.contactEmail}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(SCRAPED_SITE_CONTENT.contactEmail)}
                    className="flex items-center gap-1 text-[#00d084] font-roboto-mono shrink-0 hover:underline"
                  >
                    {copiedValue === SCRAPED_SITE_CONTENT.contactEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveChannel(null);
                    setIsOpen(false);
                    onJumpToConnect();
                  }}
                  className="w-full py-2 bg-white text-[#2544e3] font-roboto-mono text-xs font-bold hover:bg-white/90 transition-colors"
                >
                  Open Let’s Connect Form
                </button>
              </div>
            )}

            {activeChannel === 'phone' && (
              <div className="space-y-3">
                <p className="text-white/80">
                  Direct India &amp; International Executive Search Consultation Line:
                </p>
                <div className="flex items-center justify-between bg-[#1634c8]/70 px-3 py-2.5 border border-white/15">
                  <span className="font-roboto-mono text-xs font-bold tabular-nums">
                    {SCRAPED_SITE_CONTENT.contactPhoneFormatted}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(SCRAPED_SITE_CONTENT.contactPhone)}
                    className="flex items-center gap-1 text-[#03E78B] font-roboto-mono shrink-0 hover:underline"
                  >
                    {copiedValue === SCRAPED_SITE_CONTENT.contactPhone ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveChannel(null);
                    setIsOpen(false);
                    onJumpToConnect();
                  }}
                  className="w-full py-2 bg-[#03E78B] text-[#001d39] font-roboto-mono text-xs font-bold hover:opacity-95 transition-opacity"
                >
                  Request a Call Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vertical Stack of 3 Scraped Channels (Phone #03E78B, Email #FF485F, WhatsApp #49E670) */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-1">
          {/* Phone Channel */}
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 bg-[#001d39] text-white font-roboto-mono text-xs border border-white/20 shadow-sm whitespace-nowrap">
              Phone · {SCRAPED_SITE_CONTENT.contactPhoneFormatted}
            </span>
            <button
              type="button"
              onClick={() =>
                setActiveChannel(activeChannel === 'phone' ? null : 'phone')
              }
              className="w-11 h-11 rounded-full bg-[#03E78B] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
              aria-label="Phone Contact"
            >
              <Phone className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Email Channel */}
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 bg-[#001d39] text-white font-roboto-mono text-xs border border-white/20 shadow-sm whitespace-nowrap">
              Email · {SCRAPED_SITE_CONTENT.contactEmail}
            </span>
            <button
              type="button"
              onClick={() =>
                setActiveChannel(activeChannel === 'email' ? null : 'email')
              }
              className="w-11 h-11 rounded-full bg-[#FF485F] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
              aria-label="Email Contact"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>

          {/* WhatsApp Channel */}
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 bg-[#001d39] text-white font-roboto-mono text-xs border border-white/20 shadow-sm whitespace-nowrap">
              WhatsApp · {SCRAPED_SITE_CONTENT.contactPhoneFormatted}
            </span>
            <button
              type="button"
              onClick={() =>
                setActiveChannel(activeChannel === 'whatsapp' ? null : 'whatsapp')
              }
              className="w-11 h-11 rounded-full bg-[#49E670] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
              aria-label="WhatsApp Contact"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* Main Launcher Row with exact Scraped CTA Tooltip ("Whatsapp / email / call" in #49E670) */}
      <div className="flex items-center gap-3">
        {showCtaTooltip && !isOpen && (
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-md shadow-md text-xs font-medium whitespace-nowrap"
            style={{ backgroundColor: '#49E670', color: '#333333' }}
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="font-system-sans font-semibold cursor-pointer"
            >
              Whatsapp / email / call
            </button>
            <button
              type="button"
              onClick={() => setShowCtaTooltip(false)}
              className="p-0.5 hover:opacity-70 transition-opacity"
              aria-label="Dismiss contact tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            const next = !isOpen;
            setIsOpen(next);
            if (!next) setActiveChannel(null);
          }}
          style={{ backgroundColor: '#86CD91' }}
          className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
          aria-label={isOpen ? 'Hide Contact Channels' : 'Open Whatsapp / email / call channels'}
        >
          {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5 fill-current" />}
        </button>
      </div>
    </div>
  );
};
