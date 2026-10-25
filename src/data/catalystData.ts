export interface TestimonialItem {
  id: string;
  quote: string;
  authorRole: string;
  focusTag: string;
}

export interface FaqItem {
  id: string;
  number: string;
  question: string;
  answer: string;
  hasCompetencyLink?: boolean;
  category: 'roles' | 'timeline' | 'quality' | 'geography';
}

export interface CompetencyPillar {
  id: string;
  name: string;
  description: string;
  weights: {
    cxo: number;
    vp_director: number;
    specialist: number;
    entry_professional: number;
  };
}

export interface RoleTierOption {
  id: 'cxo' | 'vp_director' | 'specialist' | 'entry_professional';
  label: string;
  examples: string;
  shortlistDaysPanIndia: string;
  shortlistDaysInternational: string;
  evaluationDepth: string;
}

export interface CookieCategory {
  id: 'necessary' | 'functional' | 'analytics' | 'marketing' | 'unclassified';
  title: string;
  description: string;
  alwaysActive?: boolean;
  cookiesList: string;
}

export const SCRAPED_SITE_CONTENT = {
  siteTitle: 'Catalyst Positive',
  tagline: 'In search of Talent',
  location: 'Based in India',
  heroHeading:
    'We are in the business of finding the right Talent, to drive Your Organization Forward.',
  contactPhone: '+919481061014',
  contactPhoneFormatted: '+91 94810 61014',
  contactEmail: 'contact@catalystpositive.com',
  whatsappNumber: '919481061014',
  heroImage: '/assets/Catalyst-Positive-Logo-2026-1024x683.jpg',
  heroImageHiRes: '/assets/Catalyst-Positive-Logo-2026.jpg',
  squareLogo: '/assets/Catalyst_Positive_Logo_512x512-300x300.png',
};

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'testimonial-hr-director',
    quote:
      '“Catalyst Positive took the time to understand our business, our culture, and our long-term hiring goals. The candidates they introduced were genuinely aligned with our needs.”',
    authorRole: '— Director – Human Resources',
    focusTag: 'Cultural Alignment & Long-Term Hiring',
  },
  {
    id: 'testimonial-ta-head',
    quote:
      '“Catalyst Positive acted like a strategic hiring partner and appreciate their industry insight, and we look forward to working together again.”',
    authorRole: '— Head of Talent Acquisition',
    focusTag: 'Strategic Partnership & Industry Insight',
  },
];

export const FAQS: FaqItem[] = [
  {
    id: 'faq-positions',
    number: '01',
    question: 'What types of positions do you recruit for?',
    answer:
      'We recruit for a wide range of positions, from entry-level professionals to senior leadership roles, including CEO,CFO,CMO,CTO,etc,Vice President, Director, General Manager, Specialists, and niche domain experts.',
    category: 'roles',
  },
  {
    id: 'faq-timeline',
    number: '02',
    question: 'How long does it take to fill a position?',
    answer:
      'Timelines depend on the role, industry, and seniority. We work to present qualified candidates as quickly as possible without compromising quality.',
    category: 'timeline',
  },
  {
    id: 'faq-quality',
    number: '03',
    question: 'How do you ensure candidate quality ?',
    answer:
      'We do Competency mapping, candidate undergoes a structured evaluation based on skills, experience, communication, cultural fit, leadership potential, and role-specific requirements before being presented to our clients.',
    hasCompetencyLink: true,
    category: 'quality',
  },
  {
    id: 'faq-geography-confidential',
    number: '04',
    question:
      'Do you recruit across India and internationally?, Do you help with confidential hiring assignments ?',
    answer:
      'Yes. We support hiring across India and can assist organizations with international recruitment requirements. We manage confidential recruitment projects for strategic and leadership positions while maintaining complete discretion throughout the hiring process.',
    category: 'geography',
  },
];

export const ROLE_TIERS: RoleTierOption[] = [
  {
    id: 'cxo',
    label: 'C-Suite & Executive Leadership',
    examples: 'CEO, CFO, CMO, CTO, CHRO, Managing Director',
    shortlistDaysPanIndia: '14–21 Business Days',
    shortlistDaysInternational: '21–30 Business Days',
    evaluationDepth: 'Board-Level Competency & Strategic Vision Assessment',
  },
  {
    id: 'vp_director',
    label: 'Senior Leadership & General Management',
    examples: 'Vice President, Director, General Manager, Practice Head',
    shortlistDaysPanIndia: '10–16 Business Days',
    shortlistDaysInternational: '16–24 Business Days',
    evaluationDepth: 'P&L Execution, Cross-Functional Leadership & Cultural Fit',
  },
  {
    id: 'specialist',
    label: 'Niche Domain Experts & Specialists',
    examples: 'Principal Architect, Quantitative Lead, Regulatory Specialist, R&D Lead',
    shortlistDaysPanIndia: '7–12 Business Days',
    shortlistDaysInternational: '12–18 Business Days',
    evaluationDepth: 'Deep Technical Calibration & Role-Specific Competency Mapping',
  },
  {
    id: 'entry_professional',
    label: 'Core & Entry-Level Professionals',
    examples: 'Analysts, Associates, Operations & Growth Professionals',
    shortlistDaysPanIndia: '5–9 Business Days',
    shortlistDaysInternational: '10–14 Business Days',
    evaluationDepth: 'Foundational Skills, Communication & High-Growth Potential',
  },
];

export const COMPETENCY_PILLARS: CompetencyPillar[] = [
  {
    id: 'skills',
    name: '01. Core Functional Skills',
    description: 'Verified domain proficiency and hands-on technical or operational capability.',
    weights: {
      cxo: 85,
      vp_director: 90,
      specialist: 98,
      entry_professional: 92,
    },
  },
  {
    id: 'experience',
    name: '02. Relevant Industry Experience',
    description: 'Track record across comparable organizational scale, market complexity, and tenure.',
    weights: {
      cxo: 95,
      vp_director: 92,
      specialist: 90,
      entry_professional: 75,
    },
  },
  {
    id: 'communication',
    name: '03. Executive Communication',
    description: 'Clarity of thought, stakeholder articulation, and cross-functional influence.',
    weights: {
      cxo: 96,
      vp_director: 94,
      specialist: 84,
      entry_professional: 88,
    },
  },
  {
    id: 'cultural_fit',
    name: '04. Organizational & Cultural Fit',
    description: 'Alignment with company values, operating cadence, and long-term hiring goals.',
    weights: {
      cxo: 98,
      vp_director: 95,
      specialist: 88,
      entry_professional: 94,
    },
  },
  {
    id: 'leadership',
    name: '05. Leadership Potential',
    description: 'People mentorship, strategic ownership, and ability to scale high-performing teams.',
    weights: {
      cxo: 99,
      vp_director: 96,
      specialist: 82,
      entry_professional: 80,
    },
  },
  {
    id: 'role_specific',
    name: '06. Role-Specific Requirements',
    description: 'Custom mandate benchmarks, regulatory credentials, and domain-specific KPIs.',
    weights: {
      cxo: 94,
      vp_director: 93,
      specialist: 99,
      entry_professional: 90,
    },
  },
];

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'necessary',
    title: 'Necessary Cookies',
    description:
      'Necessary cookies enable essential site features like secure log-ins and consent preference adjustments. They do not store personal data.',
    alwaysActive: true,
    cookiesList: 'None',
  },
  {
    id: 'functional',
    title: 'Functional Cookies',
    description:
      'Functional cookies support features like content sharing on social media, collecting feedback, and enabling third-party tools.',
    cookiesList: 'None',
  },
  {
    id: 'analytics',
    title: 'Analytical Cookies',
    description:
      'Analytical cookies track visitor interactions, providing insights on metrics like visitor count, bounce rate, and traffic sources.',
    cookiesList: 'None',
  },
  {
    id: 'marketing',
    title: 'Advertisement Cookies',
    description:
      'Advertisement cookies deliver personalized ads based on your previous visits and analyze the effectiveness of ad campaigns.',
    cookiesList: 'None',
  },
  {
    id: 'unclassified',
    title: 'Unclassified Cookies',
    description:
      'Unclassified cookies are cookies that we are in the process of classifying, together with the providers of individual cookies.',
    cookiesList: 'None',
  },
];
