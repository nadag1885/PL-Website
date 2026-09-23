"use client";

import { useEffect } from "react";
import { brand, formEmail } from "@/lib/content";
import { track } from "@/lib/analytics";
import RobotGuide from "@/components/RobotGuide";

// ─────────────────────────────────────────────────────────────────────────
// ASK POWERLINE — chat assistant.
// The page IS the chatbot: a branded header + the Chatbase assistant embedded
// inline (iframe) so the visitor talks to it directly. A phone/email fallback
// sits below. The bot's own theme/colours are configured in Chatbase.
// The iframe is always visible (its onLoad is unreliable for streaming embeds);
// a subtle loader sits BEHIND it and is covered as soon as the chat paints.
// ─────────────────────────────────────────────────────────────────────────
const CHATBOT_SRC = "https://www.chatbase.co/chatbot-iframe/GTXWwV81kOPxm9yQkgeul";

export default function AskExperience() {
  useEffect(() => {
    track("ask_chat_view", { page_path: typeof location !== "undefined" ? location.pathname : "" });
  }, []);

  return (
    <section className="ask">
      <div className="env" aria-hidden="true">
        <div className="grid" />
        <div className="glow" />
      </div>

      <div className="ask-wrap">
        <header className="ask-head">
          <span className="ask-avatar" aria-hidden="true">
            <RobotGuide mood="happy" look="center" compact />
          </span>
          <span className="eyebrow">Ask Powerline</span>
          <h1 className="ask-h">
            Chat with a <em>Powerline</em> engineer
          </h1>
          <p className="ask-lead">
            Ask about product selection, technical specifications, standards, or a project
            challenge — our assistant answers instantly, and our engineers follow up when it counts.
          </p>
        </header>

        <div className="ask-chat">
          <div className="ask-loading" aria-hidden="true">
            <span className="ask-spinner" />
            <span>Starting the assistant…</span>
          </div>
          <iframe
            className="ask-frame"
            src={CHATBOT_SRC}
            title="Ask Powerline — chat assistant"
            width="100%"
            style={{ height: "100%", minHeight: "700px" }}
            frameBorder="0"
            allow="microphone"
          />
        </div>

        <div className="ask-reach">
          <span className="ask-reach-label">Prefer to talk?</span>
          <a className="ask-reach-item" href={`tel:${brand.phone}`} aria-label={`Call Powerline on ${brand.phoneDisplay}`}>
            <span className="ask-reach-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            </span>
            {brand.phoneDisplay}
          </a>
          <a className="ask-reach-item" href={`mailto:${formEmail}`} aria-label={`Email Powerline at ${formEmail}`}>
            <span className="ask-reach-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
            </span>
            {formEmail}
          </a>
        </div>
      </div>

      <style jsx>{`
        .ask {
          position: relative;
          isolation: isolate;
          min-height: 100svh;
          padding: clamp(7rem, 12vh, 9.5rem) 0 clamp(3rem, 6vh, 5rem);
          background: var(--bg);
          overflow: hidden;
        }

        /* engineering environment */
        .env { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
        .grid {
          position: absolute; inset: -2px;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.028) 1px, transparent 1px);
          background-size: 46px 46px;
          -webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 28%, transparent 78%);
          mask-image: radial-gradient(120% 90% at 50% 0%, #000 28%, transparent 78%);
        }
        .glow {
          position: absolute; top: -14%; left: 50%; transform: translateX(-50%);
          width: 70%; height: 60%;
          background: radial-gradient(closest-side, rgba(232, 114, 42, 0.14), transparent 72%);
          filter: blur(6px);
        }

        .ask-wrap {
          position: relative; z-index: 1;
          width: 100%; max-width: 64rem; margin-inline: auto;
          padding-inline: var(--pad);
          text-align: center;
        }

        /* header */
        .ask-head { display: flex; flex-direction: column; align-items: center; }
        .ask-avatar { display: inline-block; margin-bottom: 0.4rem; }
        .ask-head :global(.eyebrow) { justify-content: center; }
        .ask-h {
          font-family: var(--font-head); font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.9rem, 4.4vw, 3.1rem); line-height: 1; letter-spacing: -0.015em;
          color: #fff; margin: 0.9rem 0 0;
        }
        .ask-h em { font-style: normal; color: var(--orange); text-shadow: 0 0 26px rgba(232, 114, 42, 0.4); }
        .ask-lead {
          margin: 1rem auto 0; color: var(--text-dim);
          font-size: clamp(0.98rem, 1.2vw, 1.08rem); line-height: 1.6; max-width: 46ch;
        }

        /* chat panel */
        .ask-chat {
          position: relative;
          margin: clamp(1.8rem, 4vh, 2.8rem) auto 0;
          width: 100%; max-width: none;
          height: min(80svh, 50rem);
          min-height: 700px;
          background: var(--bg-2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.55);
          overflow: hidden;
        }
        .ask-chat::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 2;
          background: linear-gradient(90deg, var(--orange-deep), var(--orange), var(--orange-bright));
          box-shadow: 0 0 16px rgba(232, 114, 42, 0.4);
        }
        .ask-frame {
          position: relative; z-index: 1;
          width: 100%; border: 0; display: block;
          background: var(--bg-2);
        }

        /* loader sits BEHIND the iframe; covered once the chat paints */
        .ask-loading {
          position: absolute; inset: 0; z-index: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.9rem;
          color: var(--text-faint); font-size: 0.9rem;
        }
        .ask-spinner {
          width: 34px; height: 34px; border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.12); border-top-color: var(--orange);
          animation: askSpin 0.8s linear infinite;
        }
        @keyframes askSpin { to { transform: rotate(360deg); } }

        /* contact fallback */
        .ask-reach {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
          gap: 0.6rem 1.6rem; margin-top: clamp(1.4rem, 3vh, 2rem);
        }
        .ask-reach-label { font-size: 0.64rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-faint); }
        .ask-reach-item {
          display: inline-flex; align-items: center; gap: 0.6rem; min-height: 44px;
          font-family: var(--font-head); font-weight: 700; font-size: 0.98rem; color: #fff;
          transition: color 0.25s var(--ease);
        }
        .ask-reach-ico {
          flex: none; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255, 255, 255, 0.04); border: 1px solid var(--line); color: var(--text);
          transition: color 0.25s var(--ease), border-color 0.25s var(--ease), background 0.25s var(--ease);
        }
        .ask-reach-ico svg { width: 17px; height: 17px; }
        .ask-reach-item:hover, .ask-reach-item:focus-visible { color: var(--orange); }
        .ask-reach-item:hover .ask-reach-ico, .ask-reach-item:focus-visible .ask-reach-ico {
          color: var(--orange-bright); border-color: rgba(232, 114, 42, 0.55); background: rgba(232, 114, 42, 0.1);
        }
        .ask-reach-item:focus-visible { outline: 2px solid var(--orange); outline-offset: 4px; border-radius: 8px; }

        @media (max-width: 560px) {
          .ask-chat { border-radius: 14px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ask-spinner { animation-duration: 1.6s; }
        }
      `}</style>
    </section>
  );
}
