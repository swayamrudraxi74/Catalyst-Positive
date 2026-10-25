import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  RotateCcw,
  MessageSquare,
  Globe,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  LocalChatMessage,
  QUICK_SELECT_TILES,
  loadLocalDb,
  saveLocalDb,
  resetChatInDatabase,
  fetchWikipediaSummary,
  matchCatalystFaqOrKnowledge,
  ENV_CONFIG,
} from '../services/localDatabase';
import { FAQS } from '../data/catalystData';

interface TalentAdvisorChatProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onJumpToConnectForm: () => void;
}

type TileCategory = 'quick' | 'faqs' | 'wikipedia';

export const TalentAdvisorChat: React.FC<TalentAdvisorChatProps> = ({
  isOpen,
  onToggle,
  onJumpToConnectForm,
}) => {
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<TileCategory>('quick');
  const [selectedFaq, setSelectedFaq] = useState<string>('');

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const db = loadLocalDb();
    setMessages(db.chatMessages);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const appendMessagesToDb = (nextMessages: LocalChatMessage[]) => {
    const db = loadLocalDb();
    db.chatMessages = nextMessages;
    saveLocalDb(db);
    setMessages(nextMessages);
  };

  /**
   * Handles sending user prompts, pre-defined quick-select tiles, FAQ questions,
   * and on-demand Wikipedia API lookups for factual or company definitions.
   */
  const handleSend = async (customPrompt?: string, forceWikipedia = false) => {
    const textToSend = (customPrompt ?? input).trim();
    if (!textToSend || isSending) return;

    if (!customPrompt) setInput('');
    setIsSending(true);

    const nowStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: LocalChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: nowStr,
      source: 'local-db',
    };

    const currentDb = loadLocalDb();
    const updatedWithUser = [...currentDb.chatMessages, userMsg];
    appendMessagesToDb(updatedWithUser);

    try {
      // 1. Check if it matches a pre-defined Quick-Select response or Catalyst Positive FAQ (unless forceWikipedia is true)
      if (!forceWikipedia) {
        const localMatch = matchCatalystFaqOrKnowledge(
          textToSend,
          updatedWithUser
        );
        if (localMatch) {
          const botLocalMsg: LocalChatMessage = {
            id: `bot-${Date.now()}`,
            role: 'bot',
            text: localMatch,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            source: 'local-db',
          };
          appendMessagesToDb([...updatedWithUser, botLocalMsg]);
          return;
        }
      }

      // 2. Fetch and summarize definition or company info on demand via the Wikipedia API
      const wikiSummary = await fetchWikipediaSummary(textToSend);
      if (wikiSummary) {
        const botWikiMsg: LocalChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: wikiSummary.extract,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          source: 'wikipedia',
          wikiTitle: wikiSummary.title,
          wikiDescription: wikiSummary.description,
          wikiUrl: wikiSummary.url,
        };
        appendMessagesToDb([...updatedWithUser, botWikiMsg]);
        return;
      }

      // 3. Optional external API fallback if configured in .env
      if (ENV_CONFIG.dataMode === 'api' && ENV_CONFIG.chatApiEndpoint) {
        try {
          const url = `${ENV_CONFIG.apiBaseUrl}${ENV_CONFIG.chatApiEndpoint}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              domain: ENV_CONFIG.domain,
              message: textToSend,
              history: updatedWithUser,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.reply) {
              const botApiMsg: LocalChatMessage = {
                id: `bot-${Date.now()}`,
                role: 'bot',
                text: data.reply,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                source: 'external-api',
              };
              appendMessagesToDb([...updatedWithUser, botApiMsg]);
              return;
            }
          }
        } catch {
          // Continue to conversational fallback
        }
      }

      // 4. Open-ended conversational fallback
      const fallbackMsg: LocalChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: `Thank you for sharing that! At Catalyst Positive, we tailor every executive search and competency mapping assignment around your organization's goals across India and internationally.\n\nYou can also ask me to define any industry term or company (e.g., "What is Executive Search?" or "Tell me about Infosys") to fetch a live summary from Wikipedia.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        source: 'local-db',
      };
      appendMessagesToDb([...updatedWithUser, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFaqSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedFaq('');
    if (!val) return;
    handleSend(val, false);
  };

  const handleReset = () => {
    const fresh = resetChatInDatabase();
    setMessages(fresh);
  };

  const visibleTiles = QUICK_SELECT_TILES.filter(
    (tile) => tile.category === activeCategory
  );

  return (
    <>
      {/* Independent Circular Chat Bot Button directly below the Whatsapp / email / call button */}
      <div
        className="fixed bottom-5 right-6 z-40 flex items-center gap-3"
        aria-label="Independent Chat Bot Launcher"
      >
        <button
          type="button"
          onClick={() => onToggle(!isOpen)}
          className="w-11 h-11 rounded-full bg-[#001d39] border border-white/35 text-white flex items-center justify-center shadow-lg hover:scale-105 hover:border-[#00d084] transition-all cursor-pointer"
          title="Open Catalyst Positive Chat Bot"
          aria-label={isOpen ? 'Close Chat Bot' : 'Open Chat Bot'}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <MessageSquare className="w-5 h-5 text-[#00d084]" />
          )}
        </button>
      </div>

      {/* Spacious, Responsively Sized Chat Bot Modal */}
      {isOpen && (
        <div
          className="talent-advisor-backdrop fixed inset-0 z-50 flex items-center justify-center bg-[#001226]/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Catalyst Positive Chat Bot"
          onClick={() => onToggle(false)}
        >
          <div
            className="talent-advisor-window bg-[#041d37] border border-white/20 text-white shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Balanced Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#1634c8] border-b border-white/15 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#001d39]/90 border border-white/25 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#00d084]" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-roboto-mono text-xs sm:text-sm font-bold text-white tracking-wide">
                      Catalyst Positive
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-roboto-mono bg-[#001d39]/75 border border-[#00d084]/45 text-[#00d084]">
                      <Globe className="w-2.5 h-2.5 shrink-0" />
                      <span>Wikipedia API</span>
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-white/75 truncate mt-0.5">
                    Talent Advisor · Local DB &amp; On-Demand Knowledge
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onToggle(false);
                    onJumpToConnectForm();
                  }}
                  className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] sm:text-[11px] font-roboto-mono transition-colors cursor-pointer"
                  title="Open Let's Connect Form"
                >
                  <span className="hidden xs:inline sm:inline">Inquiry</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#00d084]" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-8 h-8 rounded-lg text-white/75 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Reset conversation"
                  aria-label="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggle(false)}
                  className="w-8 h-8 rounded-lg text-white/75 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close chat bot"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. Generous, Breathable Message Thread */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 text-left">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-white text-[#1634c8] font-medium rounded-br-xs'
                        : 'bg-[#1634c8] text-white border border-white/15 rounded-bl-xs'
                    }`}
                  >
                    {/* Wikipedia Summary Header Card if sourced from Wikipedia */}
                    {msg.wikiTitle && (
                      <div className="mb-2.5 pb-2 border-b border-white/15 flex items-center justify-between gap-2">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-xs font-roboto-mono font-bold text-[#00d084]">
                            <Globe className="w-3.5 h-3.5 shrink-0" />
                            <span>{msg.wikiTitle}</span>
                          </div>
                          {msg.wikiDescription && (
                            <div className="text-[11px] text-white/70 mt-0.5">
                              {msg.wikiDescription}
                            </div>
                          )}
                        </div>
                        {msg.wikiUrl && (
                          <a
                            href={msg.wikiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#001d39]/60 hover:bg-[#001d39] text-[11px] font-roboto-mono text-white hover:text-[#00d084] transition-colors shrink-0"
                          >
                            <span>Wikipedia</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        )}
                      </div>
                    )}

                    <div>{msg.text}</div>
                  </div>

                  <div className="mt-1.5 px-1 text-[10px] text-white/50 flex items-center gap-1.5 font-roboto-mono">
                    <span>
                      {msg.role === 'user' ? 'You' : 'Catalyst Positive'}
                    </span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                    <span>·</span>
                    <span
                      className={
                        msg.source === 'wikipedia' ? 'text-[#00d084]' : ''
                      }
                    >
                      {msg.source === 'wikipedia'
                        ? 'Wikipedia Summary'
                        : msg.source === 'local-db'
                        ? 'Local DB'
                        : 'Connected API'}
                    </span>
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex items-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-xs bg-[#1634c8]/60 border border-white/15 text-xs text-white/85 font-roboto-mono flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#00d084] animate-pulse" />
                    <span>Fetching answer...</span>
                  </div>
                </div>
              )}

              <div ref={threadEndRef} />
            </div>

            {/* 3. Streamlined, Perfectly Aligned Quick-Select Tiles & FAQ Selector */}
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-[#021426] border-t border-white/10 space-y-2.5 sm:space-y-3 shrink-0">
              {/* Top Row: Segmented Category Switcher + Compact FAQ Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="inline-flex items-center p-0.5 rounded-lg bg-[#041d37] border border-white/15 self-start">
                  {(
                    [
                      { id: 'quick', label: 'Quick Select' },
                      { id: 'faqs', label: 'All FAQs' },
                      { id: 'wikipedia', label: 'Wikipedia' },
                    ] as { id: TileCategory; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCategory(tab.id)}
                      className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] font-roboto-mono transition-all cursor-pointer ${
                        activeCategory === tab.id
                          ? 'bg-[#1634c8] text-white font-medium shadow-xs'
                          : 'text-white/65 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Compact FAQ Dropdown */}
                <select
                  aria-label="Jump to an FAQ question"
                  value={selectedFaq}
                  onChange={handleFaqSelect}
                  className="w-full sm:w-auto sm:max-w-[220px] px-3 py-1.5 rounded-lg bg-[#041d37] border border-white/20 text-white/90 text-[11px] font-roboto-mono focus:outline-none focus:border-[#00d084] cursor-pointer truncate"
                >
                  <option value="">Select an FAQ Question...</option>
                  {FAQS.map((faq) => (
                    <option key={faq.id} value={faq.question}>
                      {faq.number}. {faq.question}
                    </option>
                  ))}
                  <option value="Do you help with confidential hiring assignments ?">
                    05. Confidential hiring assignments?
                  </option>
                  <option value="What do clients say in your testimonials?">
                    06. Client testimonials &amp; reviews?
                  </option>
                </select>
              </div>

              {/* Interactive Quick-Select Tiles Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {visibleTiles.map((tile) => (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() =>
                      handleSend(tile.prompt, tile.category === 'wikipedia')
                    }
                    className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-roboto-mono whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                      tile.category === 'wikipedia'
                        ? 'bg-[#041d37] hover:bg-[#1634c8]/50 text-[#00d084] border-[#00d084]/35'
                        : 'bg-[#1634c8]/45 hover:bg-[#1634c8] text-white border-white/15 hover:border-white/35'
                    }`}
                  >
                    {tile.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Perfectly Aligned Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="px-4 sm:px-6 py-3 sm:py-4 bg-[#041d37] border-t border-white/15 flex items-center gap-2.5 sm:gap-3 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question, select a tile, or look up any topic on Wikipedia..."
                className="flex-1 min-w-0 h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl bg-[#021426] border border-white/20 text-white placeholder-white/45 text-xs focus:outline-none focus:border-[#00d084] transition-colors"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-white text-[#1634c8] font-roboto-mono text-xs font-bold inline-flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-45 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-[#1634c8] shrink-0" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
