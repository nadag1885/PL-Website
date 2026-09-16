"use client";

import { useState } from "react";
import { formEmail, isValidEmail } from "@/lib/content";
import { track } from "@/lib/analytics";

// The "Ask Powerline" enquiry form. A technical enquiry, not a quotation-first
// contact form and not a wizard: one topic choice, the question itself, and
// basic contact details. Delivery mirrors the existing contact form exactly — a
// best-effort CRM capture (source "ask") plus a FormSubmit email to
// info@powerline.com.eg — so no recipients or CRM config change.
const TOPICS = [
  "Product Selection",
  "Technical Specifications",
  "LV / MV Systems",
  "Transformers",
  "Compact Substations",
  "Power Factor Correction",
  "Electrical Standards",
  "Value Engineering",
  "Existing Installations",
  "Industry Knowledge",
  "Other",
];

const meta = () => ({ page_path: typeof location !== "undefined" ? location.pathname : "" });

export default function AskForm() {
  const [status, setStatus] = useState("idle"); // idle | invalid | submitting | sent | failed
  const [errors, setErrors] = useState({});
  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);

  const onStart = () => {
    if (!started) {
      setStarted(true);
      track("ask_form_start", meta());
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "submitting") return;
    const data = Object.fromEntries(new FormData(e.currentTarget));

    const err = {};
    if (!topic) err.topic = "Please choose a topic";
    if (!data.message?.trim()) err.message = "Tell us your question";
    if (!data.name?.trim()) err.name = "Please enter your name";
    if (!isValidEmail(data.email)) err.email = "Enter a valid email";
    setErrors(err);
    if (Object.keys(err).length) {
      setStatus("invalid");
      return;
    }

    setStatus("submitting");
    track("ask_form_submit", meta());
    // Topic + optional job title travel with the question in the CRM message so
    // the CRM payload shape stays exactly as the contact form's (no config change).
    const jt = data.jobTitle?.trim();
    const message = `Topic: ${topic}${jt ? ` · ${jt}` : ""}\n\n${data.message.trim()}`;

    // Best-effort CRM lead capture (source "ask") — fire-and-forget so it never
    // blocks or breaks the email path. Secret stays server-side in the route.
    fetch("/api/crm-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "ask",
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        message,
      }),
    }).catch(() => {});

    try {
      // Post to FormSubmit from the browser (a real Referer is required — a
      // server-side fetch strips it and FormSubmit rejects). Same recipient and
      // pattern as the contact form.
      const res = await fetch(`https://formsubmit.co/ajax/${formEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New Ask Powerline enquiry — ${data.name}`,
          _template: "table",
          Topic: topic,
          Name: data.name,
          Company: data.company || "-",
          "Job title": jt || "-",
          Email: data.email,
          Phone: data.phone || "-",
          Message: data.message,
        }),
      });
      const out = await res.json().catch(() => ({}));
      // FormSubmit returns success:"false" until the recipient inbox activates
      // the form on first use; once activated this resolves to "true".
      setStatus(out.success === "true" || out.success === true ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <div className="sent">
        <div className="check" aria-hidden="true">✓</div>
        <h3>Thank you — your question is on its way.</h3>
        <p>
          Our engineers will get back to you shortly. For anything urgent, email{" "}
          <a href={`mailto:${formEmail}`}>{formEmail}</a>.
        </p>
        <style jsx>{`
          .sent { text-align: center; padding: 3rem 1rem; border: 1px solid var(--line); border-radius: 16px; background: rgba(10, 10, 13, 0.6); }
          .check { width: 60px; height: 60px; border-radius: 50%; background: var(--orange); color: #fff; display: grid; place-items: center; font-size: 1.6rem; margin: 0 auto 1.2rem; box-shadow: 0 0 30px rgba(232, 114, 42, 0.5); }
          h3 { font-family: var(--font-head); font-weight: 800; text-transform: uppercase; font-size: 1.5rem; color: #fff; }
          p { color: var(--text-dim); margin-top: 0.8rem; }
          a { color: var(--orange); }
        `}</style>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onFocus={onStart} onChange={onStart} noValidate>
      <fieldset className="hw">
        <legend>What is your question about? *</legend>
        <div
          className="chips"
          role="radiogroup"
          aria-label="What is your question about?"
          aria-invalid={errors.topic ? true : undefined}
          aria-describedby={errors.topic ? "topic-error" : undefined}
        >
          {TOPICS.map((h) => (
            <button
              type="button"
              key={h}
              role="radio"
              aria-checked={topic === h}
              className={`chip ${topic === h ? "on" : ""}`}
              onClick={() => { setTopic(h); onStart(); }}
            >
              {h}
            </button>
          ))}
        </div>
        {errors.topic && <em className="err" id="topic-error">{errors.topic}</em>}
      </fieldset>

      <label className="field">
        <span>Tell us your question *</span>
        <textarea
          name="message"
          rows={5}
          placeholder="Describe your question, application, specification, project requirement, or technical challenge. The more context you provide, the more relevant our answer can be."
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && <em className="err" id="message-error">{errors.message}</em>}
      </label>

      <div className="row2">
        <label className="field">
          <span>Name *</span>
          <input name="name" autoComplete="name" aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? "name-error" : undefined} />
          {errors.name && <em className="err" id="name-error">{errors.name}</em>}
        </label>
        <label className="field">
          <span>Company / Organization</span>
          <input name="company" autoComplete="organization" />
        </label>
      </div>
      <div className="row2">
        <label className="field">
          <span>Email *</span>
          <input name="email" type="email" autoComplete="email" aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "email-error" : undefined} />
          {errors.email && <em className="err" id="email-error">{errors.email}</em>}
        </label>
        <label className="field">
          <span>Phone</span>
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
      </div>
      <label className="field">
        <span>Job title <em className="opt">(optional)</em></span>
        <input name="jobTitle" autoComplete="organization-title" />
      </label>

      <button type="submit" className="btn btn-primary submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send your question →"}
      </button>
      {status === "invalid" && <p className="form-err" role="alert">Please fix the highlighted fields.</p>}
      {status === "failed" && (
        <p className="form-err" role="alert">
          Sorry, we couldn&apos;t send your question just now. Please try again, or email{" "}
          <a href={`mailto:${formEmail}`}>{formEmail}</a>.
        </p>
      )}
      <p className="tiny">Your information will only be used to respond to your enquiry and provide relevant technical guidance.</p>

      <style jsx>{`
        .hw { border: 0; padding: 0; margin: 0 0 1.4rem; }
        .hw legend { padding: 0; font-size: 0.8rem; color: var(--text-dim); letter-spacing: 0.02em; margin-bottom: 0.7rem; }
        .chips { display: flex; flex-wrap: wrap; gap: 0.55rem; }
        .chip {
          display: inline-flex; align-items: center;
          font-family: var(--font-body); font-weight: 500; font-size: 0.85rem;
          color: var(--text); background: var(--bg-2); border: 1px solid var(--line);
          border-radius: 9px; padding: 0.55rem 0.9rem; min-height: 40px; cursor: pointer;
          -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          transition: color 0.25s var(--ease), border-color 0.25s var(--ease),
            background 0.25s var(--ease), box-shadow 0.25s var(--ease), transform 0.15s var(--ease);
        }
        .chip:hover { color: #fff; background: var(--bg-3); border-color: rgba(232, 114, 42, 0.5); }
        .chip:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }
        .chip:active { transform: scale(0.97); }
        .chip.on {
          color: #0a0a0a; background: var(--orange); border-color: var(--orange);
          font-weight: 600; box-shadow: 0 4px 18px rgba(232, 114, 42, 0.28);
        }
        .field .opt { font-style: normal; color: var(--text-faint); font-weight: 400; }
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1rem; }
        .submit { margin-top: 0.7rem; width: 100%; justify-content: center; min-height: 48px; }
        .tiny { margin: 0.9rem 0 0; font-size: 0.74rem; line-height: 1.5; color: var(--text-faint); }
        @media (max-width: 560px) { .row2 { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .chip { transition: color 0.2s, background 0.2s, border-color 0.2s; } .chip:active { transform: none; } }
      `}</style>
    </form>
  );
}
