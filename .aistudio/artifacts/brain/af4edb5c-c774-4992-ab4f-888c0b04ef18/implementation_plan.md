# Catalyst Positive — Layout Centering, Spacing & Widget Cleanup Plan

Refines the **Catalyst Positive (`catalystpositive.com`)** clone based on your screenshot review and preferences—removing the overlapping bottom-right chatbot button, keeping the native browser cursor, and fixing the horizontal centering and vertical breathing room of the headline and content sections beneath the hero logo.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions have been confirmed from your answers and screenshot feedback:

- **Confirmed Decision 1 — Keep Native Browser Cursor**: Skip the custom circular cursor follower to preserve a clean, native browsing feel.
- **Confirmed Decision 2 — Remove Overlapping Chatbot Widget**: Remove the floating `Talent Search Advisor` button/drawer from the bottom-right corner so the green `Whatsapp / email / call` quick-contact widget has zero visual overlap.
- **Confirmed Decision 3 — Center & Properly Space the Headline Below the Logo**:
  - **Root Cause Identified**: Unlayered `h1, h2 { margin: 0 }` and `p.wp-block-paragraph { margin: 0 }` rules in `src/index.css` overrode Tailwind v4 `@layer utilities` classes (`mx-auto`, `mt-*`, `mb-*`), pushing the `max-w-[900px]` headline to the left edge of the viewport instead of centering it under the logo.
  - **Fix**: Move base typography resets into `@layer base` and explicitly set `margin-inline: auto` on `.wp-block-heading`, `.wp-block-paragraph`, and constrained layout containers so every heading, divider (`..`), testimonial, and FAQ block is perfectly centered beneath the Catalyst Positive logo with balanced `6rem–8rem` vertical spacing and clean punctuation (`"Talent, to drive"`).

---

## 1. Overview & Core Concept

- **What It Does**: Delivers a faithful, airy, single-column replica of `catalystpositive.com` on its signature `#2544e3` royal-blue canvas with smooth `IntersectionObserver` scroll-reveal animations and zero widget overlap.
- **Key Value**: Ensures every section—Hero Logo, Value Proposition Headline, Testimonials, FAQ's, Let's Connect, and Footer—is aligned along the central vertical axis with generous, natural spacing.

---

## 2. User Experience & Visual Design

- **Key User Flows & Visual Fixes**:
  1. **Centered Hero & Value Proposition**: The Catalyst Positive logo (`max-w-[560px] mx-auto`) sits centered at the top of the viewport, followed by a balanced `clamp(5rem, 9vw, 7.5rem)` vertical gap and the centered `max-w-[860px] mx-auto text-center` headline: *"We are in the business of finding the right Talent, to drive Your Organization Forward."*
  2. **Generous Section Rhythm**: Smooth `IntersectionObserver` fade-in transitions reveal the centered `..` dividers, **Testimonials** (`max-w-[680px] mx-auto`), and **FAQ’s** (`max-w-[680px] mx-auto`) with fluid vertical spacing (`clamp(2.25rem, 4vw, 3.5rem)` between items and `clamp(5rem, 9vw, 8rem)` between major sections).
  3. **Uncluttered Bottom-Right Corner**: Only the `Whatsapp / email / call` quick-contact widget occupies the bottom-right corner, eliminating the overlapping dark button shown in your screenshot.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Using `@layer base` in Tailwind v4 for WordPress Theme Typography**
  - *Chosen Approach*: Place `h1–h6` and `p.wp-block-paragraph` base rules inside `@layer base` in `src/index.css` and enforce `margin-left: auto; margin-right: auto` on constrained blocks.
  - *Why*: Prevents unlayered CSS margin resets from overriding Tailwind's `mx-auto` and vertical spacing utilities, guaranteeing true horizontal centering across all viewport widths.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Layout Alignment Diagram**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                  Viewport Canvas (#2544e3 Royal Blue)                      │
│                                                                            │
│             ┌────────────────────────────────────────────────┐             │
│             │        Hero Logo Figure (560px Centered)       │             │
│             └────────────────────────────────────────────────┘             │
│                                     │                                      │
│                        clamp(5rem, 9vw, 7.5rem)                            │
│                                     ▼                                      │
│     ┌────────────────────────────────────────────────────────────────┐     │
│     │   "We are in the business of finding the right Talent, to      │     │
│     │          drive Your Organization Forward." (Centered)          │     │
│     └────────────────────────────────────────────────────────────────┘     │
│                                     │                                      │
│            ┌────────────────────────▼────────────────────────┐             │
│            │   Testimonials & FAQ's (680px Centered Column)  │             │
│            │     + IntersectionObserver Scroll Reveals       │             │
│            └────────────────────────┬────────────────────────┘             │
│                                     ▼                                      │
│            ┌─────────────────────────────────────────────────┐             │
│            │     "Let’s Connect" Button & Smooth Drawer      │             │
│            └─────────────────────────────────────────────────┘             │
│                                                                            │
│ [Customize Cookies]                              [Whatsapp / email / call] │
└────────────────────────────────────────────────────────────────────────────┘
```
