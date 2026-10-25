import React, { useState } from 'react';
import {
  SCRAPED_SITE_CONTENT,
  TESTIMONIALS,
  FAQS,
} from './data/catalystData';
import { LightboxModal, LightboxTarget } from './components/LightboxModal';
import { MandateEstimatorTransfer } from './components/CompetencyEstimator';
import { LetsConnectSection } from './components/LetsConnectSection';
import { ChatyWidget } from './components/ChatyWidget';
import { CookieAdminModal } from './components/CookieAdminModal';
import { ScrollReveal } from './components/ScrollReveal';
import { TalentAdvisorChat } from './components/TalentAdvisorChat';

export default function App() {
  const [lightboxTarget, setLightboxTarget] = useState<LightboxTarget>(null);
  const [cookieModalOpen, setCookieModalOpen] = useState<boolean>(false);
  const [chatBotOpen, setChatBotOpen] = useState<boolean>(false);
  const [prefilledMandate] = useState<MandateEstimatorTransfer | null>(null);
  const [forceConnectOpen, setForceConnectOpen] = useState<boolean>(false);
  const [connectInitialTab, setConnectInitialTab] = useState<
    'inquiry' | 'estimator' | 'database'
  >('inquiry');
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false);

  // Smooth interactive toggle for FAQ answers (all open by default to match live site, click question to toggle)
  const [collapsedFaqs, setCollapsedFaqs] = useState<Record<string, boolean>>({});

  const toggleFaq = (id: string) => {
    setCollapsedFaqs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToConnect = (
    tab: 'inquiry' | 'estimator' | 'database' = 'inquiry'
  ) => {
    setConnectInitialTab(tab);
    setForceConnectOpen(true);
    setTimeout(() => {
      const el = document.getElementById('lets-connect');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  return (
    <div
      id="top"
      className="min-h-screen w-full bg-[#2544e3] text-white selection:bg-white selection:text-[#2544e3]"
    >
      {/* Exact WordPress Skip Link */}
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#2544e3]"
        id="wp-skip-link"
        href="#wp--skip-link--target"
      >
        Skip to content
      </a>

      {/* Exact WordPress .wp-site-blocks Root Structure */}
      <div className="wp-site-blocks">
        <div className="wp-block-cover is-light has-contrast-color has-text-color">
          <div className="wp-block-cover__inner-container">
            {/* Hero Image Block — Centered 560px Constrained Width */}
            <ScrollReveal delayMs={50} distancePx={18} className="w-full">
              <figure className="wp-block-image size-large w-full max-w-[560px] mx-auto mb-0">
                {!imageLoadFailed ? (
                  <img
                    width={1024}
                    height={683}
                    src={SCRAPED_SITE_CONTENT.heroImage}
                    alt="Catalyst Positive"
                    referrerPolicy="no-referrer"
                    onError={() => setImageLoadFailed(true)}
                    onClick={() => setLightboxTarget('img1')}
                    className="w-full h-auto block mx-auto cursor-pointer transition-opacity duration-300 hover:opacity-95"
                    title="Click to inspect Catalyst Positive emblem in high resolution"
                  />
                ) : (
                  <div
                    onClick={() => setLightboxTarget('img1')}
                    className="w-full aspect-3/2 bg-white text-[#001d39] p-12 flex flex-col items-center justify-center cursor-pointer mx-auto"
                  >
                    <div className="font-roboto-mono text-2xl font-medium tracking-widest text-[#001d39]">
                      CATALYST POSITIVE
                    </div>
                    <p className="font-roboto-mono text-xs text-[#985e23] mt-3">
                      In search of Talent
                    </p>
                  </div>
                )}
              </figure>
            </ScrollReveal>

            {/* Vertical Flex Group Container */}
            <div className="wp-block-group alignfull w-full flex flex-col items-center justify-between">
              {/* Main Content Column — Centered & Properly Spaced Below the Logo */}
              <main
                id="wp--skip-link--target"
                className="wp-block-group wp-main-container is-layout-constrained"
              >
                {/* Core Value Proposition Heading — Centered Directly Beneath the Logo */}
                <ScrollReveal delayMs={100} distancePx={26} className="w-full">
                  <h2
                    className="wp-block-heading text-center w-full max-w-[820px] mx-auto px-4"
                    style={{ textWrap: 'balance' }}
                  >
                    <strong>{SCRAPED_SITE_CONTENT.heroHeading}</strong>
                  </h2>
                </ScrollReveal>

                {/* Verbatim ".." Divider & Fluid Section Spacing */}
                <ScrollReveal delayMs={160} distancePx={20} className="w-full">
                  <div className="wp-block-group wp-section-block w-full max-w-[680px] mx-auto text-center">
                    <p className="text-center wp-block-paragraph">..</p>
                  </div>
                </ScrollReveal>

                {/* Testimonials & FAQ's Section — Centered Along the Vertical Axis */}
                <div className="wp-section-block w-full max-w-[680px] mx-auto px-4 sm:px-0">
                  <ScrollReveal delayMs={100} distancePx={26} className="w-full">
                    <h1
                      id="testimonials"
                      className="wp-block-heading text-center w-full mx-auto mb-12"
                    >
                      <strong>Testimonials</strong>
                    </h1>
                  </ScrollReveal>

                  {/* Testimonials & FAQ's Flow Group using fluid .is-layout-flow */}
                  <div className="wp-block-group w-full mx-auto is-layout-flow">
                    {TESTIMONIALS.map((item, idx) => (
                      <ScrollReveal
                        key={item.id}
                        delayMs={120 + idx * 140}
                        distancePx={24}
                        className="w-full"
                      >
                        <p className="wp-block-paragraph text-left">
                          <strong>{item.quote}</strong>
                          <br />
                          <strong className="inline-block mt-2">
                            {item.authorRole}
                          </strong>
                        </p>
                      </ScrollReveal>
                    ))}

                    {/* Verbatim ".." Divider before FAQ's */}
                    <ScrollReveal delayMs={100} distancePx={16} className="w-full">
                      <div className="py-4 text-center">
                        <p className="text-center wp-block-paragraph">..</p>
                      </div>
                    </ScrollReveal>

                    {/* FAQ's Heading */}
                    <ScrollReveal delayMs={120} distancePx={22} className="w-full">
                      <p
                        id="faqs"
                        className="text-center wp-block-paragraph text-lg"
                      >
                        <strong>FAQ’s</strong>
                      </p>
                    </ScrollReveal>

                    {/* FAQ Items — Generous Fluid Block Gap & IntersectionObserver Reveal */}
                    <div className="is-layout-flow w-full">
                      {FAQS.map((faq, idx) => {
                        const isCollapsed = !!collapsedFaqs[faq.id];
                        return (
                          <ScrollReveal
                            key={faq.id}
                            delayMs={100 + idx * 110}
                            distancePx={24}
                            className="w-full"
                          >
                            <div className="wp-faq-pair text-left">
                              {/* Question Paragraph (Clickable for smooth expand/collapse) */}
                              <p
                                onClick={() => toggleFaq(faq.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    toggleFaq(faq.id);
                                  }
                                }}
                                aria-expanded={!isCollapsed}
                                className="wp-block-paragraph cursor-pointer hover:opacity-85 transition-opacity select-none"
                                title="Click to toggle answer"
                              >
                                <strong>{faq.question}</strong>
                              </p>

                              {/* Answer Paragraph */}
                              <div
                                className={`overflow-hidden transition-all duration-400 ease-out ${
                                  isCollapsed
                                    ? 'max-h-0 opacity-0'
                                    : 'max-h-[450px] opacity-100'
                                }`}
                              >
                                {faq.hasCompetencyLink ? (
                                  <p className="wp-block-paragraph">
                                    <strong>
                                      We do{' '}
                                      <a
                                        href="#competency-mapping"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setLightboxTarget('img2');
                                        }}
                                        className="underline hover:no-underline cursor-pointer"
                                      >
                                        Competency mapping
                                      </a>
                                      , candidate undergoes a structured evaluation
                                      based on skills, experience, communication,
                                      cultural fit, leadership potential, and
                                      role-specific requirements before being
                                      presented to our clients.
                                    </strong>
                                  </p>
                                ) : (
                                  <p className="wp-block-paragraph">
                                    <strong>{faq.answer}</strong>
                                  </p>
                                )}
                              </div>
                            </div>
                          </ScrollReveal>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Let's Connect Button & Collapsible Local DB Drawer */}
                <ScrollReveal delayMs={150} distancePx={24} className="w-full">
                  <div className="wp-section-block w-full">
                    <LetsConnectSection
                      prefilledMandate={prefilledMandate}
                      forceOpenForm={forceConnectOpen}
                      initialTab={connectInitialTab}
                      onToggleForm={(open) => setForceConnectOpen(open)}
                    />
                  </div>
                </ScrollReveal>
              </main>

              {/* Exact WordPress Footer Template Part */}
              <ScrollReveal delayMs={120} distancePx={20} className="w-full">
                <footer className="wp-block-template-part w-full">
                  <div
                    style={{ height: 'var(--wp--preset--spacing--80)' }}
                    aria-hidden="true"
                    className="wp-block-spacer"
                  />
                  <div className="wp-block-group w-full max-w-[680px] mx-auto px-4">
                    <div
                      className="wp-block-group is-layout-flow text-center"
                      style={{
                        paddingTop: 'var(--wp--preset--spacing--60)',
                        paddingBottom: 'var(--wp--preset--spacing--60)',
                      }}
                    >
                      <h1 className="text-center wp-block-site-title mx-auto">
                        <a
                          href="#top"
                          onClick={(e) => {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="hover:underline"
                        >
                          {SCRAPED_SITE_CONTENT.siteTitle}
                        </a>
                      </h1>

                      <nav
                        className="flex justify-center wp-block-navigation"
                        aria-label="Navigation"
                      >
                        <ul className="flex justify-center list-none m-0 p-0">
                          <li className="wp-block-navigation-item">
                            <a
                              className="wp-block-navigation-item__content hover:underline"
                              href="#top"
                              onClick={(e) => {
                                e.preventDefault();
                                scrollToConnect('estimator');
                              }}
                            >
                              <span className="wp-block-navigation-item__label">
                                {SCRAPED_SITE_CONTENT.tagline}
                              </span>
                            </a>
                          </li>
                        </ul>
                      </nav>

                      <ul className="flex justify-center list-none m-0 p-0">
                        <li className="text-white">
                          <a
                            href="#lets-connect"
                            onClick={(e) => {
                              e.preventDefault();
                              scrollToConnect('inquiry');
                            }}
                            className="inline-flex items-center justify-center hover:scale-110 transition-transform"
                            aria-label="X"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                              focusable="false"
                              fill="currentColor"
                            >
                              <path d="M13.982 10.622 20.54 3h-1.554l-5.693 6.618L8.745 3H3.5l6.876 10.007L3.5 21h1.554l6.012-6.989L15.868 21h5.245l-7.131-10.378Zm-2.128 2.474-.697-.997-5.543-7.93H8l4.474 6.4.697.996 5.815 8.318h-2.387l-4.745-6.787Z" />
                            </svg>
                            <span className="sr-only">X</span>
                          </a>
                        </li>
                      </ul>

                      <p className="text-center wp-block-paragraph">
                        <strong>{SCRAPED_SITE_CONTENT.location}</strong>
                      </p>
                    </div>
                  </div>
                </footer>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal (#img1 Brand Emblem & #img2 6-Pillar Competency Mapping Matrix) */}
      <LightboxModal
        activeTarget={lightboxTarget}
        onClose={() => setLightboxTarget(null)}
        onSwitchTarget={(target) => setLightboxTarget(target)}
        onSelectMandateCTA={() => scrollToConnect('estimator')}
      />

      {/* Local-Database Chat Bot Modal (Opened by the "Chat Bot" button down below) */}
      <TalentAdvisorChat
        isOpen={chatBotOpen}
        onToggle={(open) => setChatBotOpen(open)}
        onJumpToConnectForm={() => scrollToConnect('inquiry')}
      />

      {/* Scraped Chaty Floating Quick-Contact Widget (Bottom-Right, Zero Overlap) */}
      <ChatyWidget onJumpToConnect={() => scrollToConnect('inquiry')} />

      {/* Scraped CookieAdmin Consent Preferences Modal & Trigger */}
      <CookieAdminModal
        isOpen={cookieModalOpen}
        onOpen={() => setCookieModalOpen(true)}
        onClose={() => setCookieModalOpen(false)}
      />
    </div>
  );
}
