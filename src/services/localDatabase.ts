import { FAQS, ROLE_TIERS, COMPETENCY_PILLARS, TESTIMONIALS } from '../data/catalystData';

export interface LocalInquiryRecord {
  referenceId: string;
  submittedAt: string;
  fullName: string;
  workEmail: string;
  organization: string;
  phone: string;
  roleTier: string;
  geography: 'Pan-India' | 'International';
  isConfidential: boolean;
  estimatedShortlist: string;
  message: string;
}

export interface LocalChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
  source: 'local-db' | 'wikipedia' | 'external-api';
  wikiTitle?: string;
  wikiDescription?: string;
  wikiUrl?: string;
}

export interface LocalDatabaseSchema {
  domain: string;
  dataMode: 'local' | 'api';
  inquiries: LocalInquiryRecord[];
  chatMessages: LocalChatMessage[];
  cookiePreferences: {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    unclassified: boolean;
    updatedAt?: string;
  };
}

export interface QuickSelectTile {
  id: string;
  label: string;
  prompt: string;
  category: 'quick' | 'faqs' | 'wikipedia';
}

export const QUICK_SELECT_TILES: QuickSelectTile[] = [
  // Primary Quick-Select Tiles
  {
    id: 'tile-exec-search',
    label: 'Executive Search',
    prompt: 'Tell me about your Executive Search & C-Suite recruitment services.',
    category: 'quick',
  },
  {
    id: 'tile-comp-mapping',
    label: 'Competency Mapping',
    prompt: 'How does your 6-pillar Competency Mapping evaluation work?',
    category: 'quick',
  },
  {
    id: 'tile-career-inquiry',
    label: 'Career Inquiry',
    prompt: 'I have a Career Inquiry — how can candidates apply or share their resume?',
    category: 'quick',
  },
  {
    id: 'tile-timelines',
    label: 'Search Timelines',
    prompt: 'How long does it take to fill a position?',
    category: 'quick',
  },
  {
    id: 'tile-confidential',
    label: 'Confidential Hiring',
    prompt: 'Do you help with confidential hiring assignments ?',
    category: 'quick',
  },

  // All Scraped Website FAQs
  {
    id: 'faq-positions',
    label: 'Positions Recruited',
    prompt: 'What types of positions do you recruit for?',
    category: 'faqs',
  },
  {
    id: 'faq-time',
    label: 'Time to Fill',
    prompt: 'How long does it take to fill a position?',
    category: 'faqs',
  },
  {
    id: 'faq-quality',
    label: 'Candidate Quality',
    prompt: 'How do you ensure candidate quality ?',
    category: 'faqs',
  },
  {
    id: 'faq-global',
    label: 'Pan-India & Global',
    prompt: 'Do you recruit across India and internationally?',
    category: 'faqs',
  },
  {
    id: 'faq-testimonials',
    label: 'Client Testimonials',
    prompt: 'What do clients say in your testimonials?',
    category: 'faqs',
  },

  // On-Demand Wikipedia Definitions & Lookups
  {
    id: 'wiki-exec',
    label: 'Wiki: Executive Search',
    prompt: 'What is Executive search?',
    category: 'wikipedia',
  },
  {
    id: 'wiki-comp',
    label: 'Wiki: Competency Model',
    prompt: 'What is Competency architecture?',
    category: 'wikipedia',
  },
  {
    id: 'wiki-ta',
    label: 'Wiki: Talent Acquisition',
    prompt: 'What is Recruitment?',
    category: 'wikipedia',
  },
  {
    id: 'wiki-hrm',
    label: 'Wiki: HR Management',
    prompt: 'What is Human resource management?',
    category: 'wikipedia',
  },
];

const STORAGE_KEY = 'catalyst_positive_local_db_v4';

export const ENV_CONFIG = {
  domain:
    (import.meta.env.VITE_APP_DOMAIN as string) ||
    'https://www.catalystpositive.com',
  dataMode:
    ((import.meta.env.VITE_DATA_MODE as string) || 'local').toLowerCase() ===
    'api'
      ? ('api' as const)
      : ('local' as const),
  apiBaseUrl: ((import.meta.env.VITE_API_BASE_URL as string) || '').replace(
    /\/$/,
    ''
  ),
  chatApiEndpoint:
    (import.meta.env.VITE_CHAT_API_ENDPOINT as string) || '/api/chat',
  inquiryApiEndpoint:
    (import.meta.env.VITE_INQUIRY_API_ENDPOINT as string) || '/api/inquiries',
  contactEmail:
    (import.meta.env.VITE_CONTACT_EMAIL as string) ||
    'contact@catalystpositive.com',
  contactPhone:
    (import.meta.env.VITE_CONTACT_PHONE as string) || '+919481061014',
  whatsappNumber:
    (import.meta.env.VITE_WHATSAPP_NUMBER as string) || '919481061014',
};

const INITIAL_BOT_MESSAGE: LocalChatMessage = {
  id: 'msg-welcome',
  role: 'bot',
  text: 'Hello! Welcome to Catalyst Positive. Select any quick topic below, pick an FAQ from the dropdown, or ask any factual or hiring question—Wikipedia is integrated for live definitions and company insights.',
  timestamp: 'Just now',
  source: 'local-db',
};

function getDefaultDb(): LocalDatabaseSchema {
  return {
    domain: ENV_CONFIG.domain,
    dataMode: ENV_CONFIG.dataMode,
    inquiries: [],
    chatMessages: [INITIAL_BOT_MESSAGE],
    cookiePreferences: {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      unclassified: false,
    },
  };
}

export function loadLocalDb(): LocalDatabaseSchema {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultDb();
    const parsed = JSON.parse(raw) as Partial<LocalDatabaseSchema>;
    return {
      domain: ENV_CONFIG.domain,
      dataMode: ENV_CONFIG.dataMode,
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
      chatMessages:
        Array.isArray(parsed.chatMessages) && parsed.chatMessages.length > 0
          ? parsed.chatMessages
          : [INITIAL_BOT_MESSAGE],
      cookiePreferences:
        parsed.cookiePreferences || getDefaultDb().cookiePreferences,
    };
  } catch {
    return getDefaultDb();
  }
}

export function saveLocalDb(db: LocalDatabaseSchema): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    fetch('/api/local-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db),
    }).catch(() => {
      // Pure client-side localStorage remains authoritative even if offline
    });
  } catch {
    // Ignore storage quota errors
  }
}

export async function saveInquiryToDatabase(
  inquiry: LocalInquiryRecord
): Promise<LocalInquiryRecord> {
  const db = loadLocalDb();
  db.inquiries = [inquiry, ...db.inquiries];
  saveLocalDb(db);

  if (ENV_CONFIG.dataMode === 'api' && ENV_CONFIG.inquiryApiEndpoint) {
    try {
      const url = `${ENV_CONFIG.apiBaseUrl}${ENV_CONFIG.inquiryApiEndpoint}`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: ENV_CONFIG.domain,
          inquiry,
        }),
      });
    } catch {
      // Local DB copy is already safely stored
    }
  }

  return inquiry;
}

export function clearInquiriesFromDatabase(): void {
  const db = loadLocalDb();
  db.inquiries = [];
  saveLocalDb(db);
}

export function resetChatInDatabase(): LocalChatMessage[] {
  const db = loadLocalDb();
  db.chatMessages = [INITIAL_BOT_MESSAGE];
  saveLocalDb(db);
  return db.chatMessages;
}

export interface WikipediaSummaryResult {
  title: string;
  description?: string;
  extract: string;
  url: string;
}

/**
 * Queries the public Wikipedia API to fetch and summarize definitions or company info on demand.
 */
export async function fetchWikipediaSummary(
  rawQuery: string
): Promise<WikipediaSummaryResult | null> {
  try {
    const cleanedQuery = rawQuery
      .replace(/^(wikipedia|wiki)\s*[:\-]?\s*/i, '')
      .replace(
        /^(what\s+is\s+a|what\s+is\s+an|what\s+is|what\s+are|who\s+is|who\s+was|tell\s+me\s+about|explain|define|definition\s+of|company\s+info\s+on|search\s+for|look\s+up)\s+/i,
        ''
      )
      .replace(/[?!.]+$/g, '')
      .trim();

    if (!cleanedQuery || cleanedQuery.length < 2) return null;

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanedQuery
    )}&utf8=&format=json&origin=*&srlimit=1`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const topHit = searchData?.query?.search?.[0];
    if (!topHit?.title) return null;

    const title: string = topHit.title;
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title
    )}`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) return null;
    const summaryData = await summaryRes.json();

    const extract: string = summaryData?.extract || '';
    const description: string | undefined = summaryData?.description;
    const pageUrl: string =
      summaryData?.content_urls?.desktop?.page ||
      `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;

    if (!extract) return null;

    // Concisely summarize to 2-3 clean sentences if the extract is very long
    const sentences = extract.match(/[^.!?]+[.!?]+/g) || [extract];
    const conciseSummary = sentences.slice(0, 3).join(' ').trim();

    return {
      title,
      description,
      extract: conciseSummary || extract,
      url: pageUrl,
    };
  } catch {
    return null;
  }
}

/**
 * Matches pre-defined quick-select tiles, official website FAQs, and Catalyst Positive inquiries.
 */
export function matchCatalystFaqOrKnowledge(
  userText: string,
  history: LocalChatMessage[] = []
): string | null {
  const clean = userText.trim();
  const q = clean.toLowerCase();
  const userTurnCount = history.filter((m) => m.role === 'user').length;

  // Let explicit "Wikipedia:" / "Wiki:" queries go directly to Wikipedia
  if (/^(wikipedia|wiki)\s*[:\-]/i.test(clean)) {
    return null;
  }

  // Exact FAQ 1: "What types of positions do you recruit for?"
  if (
    q.includes('what types of positions do you recruit') ||
    (q.includes('position') && q.includes('recruit')) ||
    (q.includes('types of') && (q.includes('role') || q.includes('position')))
  ) {
    return FAQS[0].answer;
  }

  // Exact FAQ 2: "How long does it take to fill a position?"
  if (
    q.includes('how long does it take to fill') ||
    q.includes('search timelines') ||
    (q.includes('how long') && (q.includes('fill') || q.includes('position') || q.includes('hire')))
  ) {
    return FAQS[1].answer;
  }

  // Exact FAQ 3: "How do you ensure candidate quality ?"
  if (
    q.includes('how do you ensure candidate quality') ||
    q.includes('candidate quality') ||
    q.includes('ensure quality')
  ) {
    return FAQS[2].answer;
  }

  // Exact FAQ 4: "Do you recruit across India and internationally?, Do you help with confidential hiring assignments ?"
  if (
    q.includes('do you recruit across india and internationally') ||
    q.includes('do you help with confidential hiring assignments') ||
    q.includes('pan-india') ||
    q.includes('internationally') ||
    q.includes('confidential hiring') ||
    q.includes('confidential')
  ) {
    return FAQS[3].answer;
  }

  // Quick-Select Tile 1: Executive Search
  if (
    q.includes('executive search & c-suite recruitment') ||
    (q.includes('executive search') && !q.startsWith('what is')) ||
    q.includes('c-suite')
  ) {
    return `${FAQS[0].answer}\n\n• ${ROLE_TIERS[0].label}: ${ROLE_TIERS[0].examples}\n• ${ROLE_TIERS[1].label}: ${ROLE_TIERS[1].examples}`;
  }

  // Quick-Select Tile 2: Competency Mapping
  if (
    q.includes('6-pillar competency mapping') ||
    (q.includes('competency mapping') && !q.startsWith('what is'))
  ) {
    const pillarsList = COMPETENCY_PILLARS.map(
      (p) => `• ${p.name}: ${p.description}`
    ).join('\n');
    return `${FAQS[2].answer}\n\n${pillarsList}`;
  }

  // Quick-Select Tile 3: Career Inquiry
  if (
    q.includes('career inquiry') ||
    q.includes('looking for a job') ||
    q.includes('need a job') ||
    q.includes('my resume') ||
    q.includes('my cv') ||
    q.includes('apply')
  ) {
    return `We welcome Career Inquiries from professionals and executives across India and internationally.\n\n• Email your CV / Resume: ${ENV_CONFIG.contactEmail}\n• Direct WhatsApp / Phone: +91 94810 61014`;
  }

  // Testimonials
  if (q.includes('testimonial') || q.includes('what do clients say') || q.includes('reviews')) {
    return TESTIMONIALS.map((t) => `${t.quote}\n${t.authorRole}`).join('\n\n');
  }

  // About Catalyst Positive
  if (q.includes('catalyst positive') || q.includes('who are you') || q.includes('what do you do')) {
    return `We are in the business of finding the right Talent, to drive Your Organization Forward.\n\n${FAQS[0].answer}\n\n${FAQS[3].answer}`;
  }

  // Greetings
  if (/^(hi+|hello+|hey+|hola|namaste|good\s*(morning|afternoon|evening)|greetings)[\s!.,?]*$/i.test(clean)) {
    const greetings = [
      'Hi there! Welcome to Catalyst Positive — "In search of Talent". You can select any quick topic or FAQ below, or ask me any question!',
      'Hello! Great to connect with you. How can I assist you with your talent search, FAQ question, or Wikipedia lookup today?',
    ];
    return greetings[userTurnCount % greetings.length];
  }

  if (q.includes('how are you') || q.includes('how is it going')) {
    return "I'm doing great, thank you! Ready to help with our FAQs, executive search, competency mapping, career inquiries, or live Wikipedia definitions. How can I help you today?";
  }

  if (
    q.includes('contact') ||
    q.includes('email') ||
    q.includes('phone') ||
    q.includes('whatsapp') ||
    q.includes('location') ||
    q.includes('where are you based')
  ) {
    return `Catalyst Positive is based in India and supports hiring pan-India and internationally.\n\n• Email: ${ENV_CONFIG.contactEmail}\n• Phone / WhatsApp: +91 94810 61014`;
  }

  return null;
}
