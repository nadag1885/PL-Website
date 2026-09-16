"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { brand, formEmail, isValidEmail } from "@/lib/content";
import { track } from "@/lib/analytics";
import { DOMAINS, getDomain, getFocus } from "@/lib/askFlow";
import RobotGuide from "@/components/RobotGuide";

// ─────────────────────────────────────────────────────────────────────────
// ASK POWERLINE — the engineering console.
// A guided, robot-led consultation. Instead of one long form, the visitor is
// walked through focused steps (Domain → Focus → Question → Contact → Review)
// while the robot guide reacts and their answers assemble into a live "brief".
//
// Delivery is UNCHANGED from the previous Ask form: a best-effort CRM capture
// (source "ask") to /api/crm-capture, plus a FormSubmit email to formEmail — the
// domain/focus become the "Topic:" line, the question is the message body, so
// both payload shapes match the old form (no recipient / CRM config change).
// Preserves analytics events ask_form_start + ask_form_submit.
// ─────────────────────────────────────────────────────────────────────────

const STEPS = ["Topic", "Focus", "Question", "Details", "Review"];
const meta = () => ({ page_path: typeof location !== "undefined" ? location.pathname : "" });

// One consistent stroke icon set, keyed by lib/askFlow icon ids.
function DomainIcon({ name }) {
  const paths = {
    board: <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M4 9h16M4 15h16M8 12h.01M8 18h.01" /></>,
    switchgear: <><rect x="3" y="3" width="18" height="18" rx="1.5" /><path d="M12 3v18M7 8v3M7 15v1M17 8v1M17 13v3" /></>,
    rmu: <><circle cx="7" cy="12" r="2.4" /><circle cx="17" cy="12" r="2.4" /><path d="M9.4 12h5.2M7 9.6V5M17 9.6V5" /></>,
    transformer: <><circle cx="9" cy="12" r="5" /><circle cx="15" cy="12" r="5" /></>,
    substation: <><path d="M3 21h18" /><rect x="5" y="9" width="14" height="12" rx="1" /><path d="M5 9l7-5 7 5M10 21v-5h4v5" /></>,
    capacitor: <><path d="M3 12h6M15 12h6M9 6v12M15 6v12" /></>,
    select: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11" /></>,
    spark: <path d="M13 2 3 14h9l-1 8 10-12h-9z" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.spark}
    </svg>
  );
}

const initialContact = { name: "", company: "", email: "", phone: "", jobTitle: "" };

export default function AskExperience() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1); // 1 forward, -1 back — drives transition direction
  const [status, setStatus] = useState("idle"); // idle | submitting | sent | failed
  const [domainId, setDomainId] = useState("");
  const [focusId, setFocusId] = useState("");
  const [question, setQuestion] = useState("");
  const [tags, setTags] = useState([]);
  const [contact, setContact] = useState(initialContact);
  const [errors, setErrors] = useState({});
  const started = useRef(false);
  const headingRef = useRef(null);

  const domain = getDomain(domainId);
  const focus = getFocus(domainId, focusId);

  // Fire ask_form_start once, on the first meaningful interaction.
  const onStart = useCallback(() => {
    if (!started.current) {
      started.current = true;
      track("ask_form_start", meta());
    }
  }, []);

  const goTo = useCallback((n, direction) => {
    setDir(direction);
    setStep(n);
  }, []);

  // Move focus to the active step's heading on every step/status change, so
  // keyboard + screen-reader users are anchored to the new question. Not on the
  // very first render (avoids stealing focus / scrolling on page load).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus?.({ preventScroll: true });
  }, [step, status]);

  const selectDomain = (id) => {
    onStart();
    if (id !== domainId) setFocusId(""); // domain changed → its old focus no longer applies
    setDomainId(id);
    track("ask_step_advance", { ...meta(), step: "focus", domain: id });
    goTo(1, 1);
  };

  const selectFocus = (id) => {
    setFocusId(id);
    goTo(2, 1);
  };

  const toggleTag = (t) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const clearErr = (k) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  const nextFromQuestion = () => {
    if (!question.trim()) {
      setErrors((e) => ({ ...e, question: "Tell us your question — even a sentence helps." }));
      headingRef.current?.parentElement?.querySelector("textarea")?.focus();
      return;
    }
    goTo(3, 1);
  };

  const nextFromContact = () => {
    const e = {};
    if (!contact.name.trim()) e.name = "Please enter your name";
    if (!isValidEmail(contact.email)) e.email = "Enter a valid email";
    if (Object.keys(e).length) {
      setErrors((prev) => ({ ...prev, ...e }));
      return;
    }
    goTo(4, 1);
  };

  const editFrom = (targetStep) => goTo(targetStep, -1);

  const submit = useCallback(async () => {
    if (status === "submitting") return; // guard against double-submit
    // Final safety validation — jump back to the earliest incomplete step.
    if (!domainId) return goTo(0, -1);
    if (!question.trim()) {
      setErrors((e) => ({ ...e, question: "Tell us your question — even a sentence helps." }));
      return goTo(2, -1);
    }
    const ce = {};
    if (!contact.name.trim()) ce.name = "Please enter your name";
    if (!isValidEmail(contact.email)) ce.email = "Enter a valid email";
    if (Object.keys(ce).length) {
      setErrors((prev) => ({ ...prev, ...ce }));
      return goTo(3, -1);
    }

    setStatus("submitting");
    track("ask_form_submit", meta());

    const domainLabel = domain?.label || "General enquiry";
    const focusLabel = focus?.label || "";
    const topicLine = focusLabel ? `${domainLabel} › ${focusLabel}` : domainLabel;
    const jt = contact.jobTitle.trim();
    const tagsStr = tags.join(", ");
    // Same message shape as the old form: starts "Topic: …", question as body.
    const message =
      `Topic: ${topicLine}` +
      (jt ? ` · ${jt}` : "") +
      (tagsStr ? `\nContext: ${tagsStr}` : "") +
      `\n\n${question.trim()}`;

    // Best-effort CRM capture (source "ask") — fire-and-forget, never blocks.
    fetch("/api/crm-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "ask",
        name: contact.name,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        message,
      }),
    }).catch(() => {});

    try {
      // FormSubmit from the browser (needs a real Referer). Same recipient +
      // pattern as the contact form; Topic/Context are extra table rows.
      const res = await fetch(`https://formsubmit.co/ajax/${formEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New Ask Powerline enquiry — ${contact.name}`,
          _template: "table",
          Topic: topicLine,
          Context: tagsStr || "-",
          Name: contact.name,
          Company: contact.company || "-",
          "Job title": jt || "-",
          Email: contact.email,
          Phone: contact.phone || "-",
          Message: question.trim(),
        }),
      });
      const out = await res.json().catch(() => ({}));
      setStatus(out.success === "true" || out.success === true ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }, [status, domainId, question, contact, tags, domain, focus, goTo]);

  const reset = () => {
    setStatus("idle");
    setDomainId("");
    setFocusId("");
    setQuestion("");
    setTags([]);
    setContact(initialContact);
    setErrors({});
    started.current = false;
    goTo(0, -1);
  };

  // Robot mood + gaze express the current phase.
  const mood =
    status === "sent" ? "celebrate" : status === "submitting" ? "thinking" : step === 2 ? "thinking" : step === 4 ? "happy" : "idle";
  const look = status === "sent" ? "center" : step >= 2 ? "down" : "right";

  const robotLine =
    status === "sent"
      ? "Question received. Our engineers will take it from here."
      : status === "submitting"
      ? "Sending your question to the team…"
      : step === 0
      ? "What are you working on? Pick a starting point — I’ll take it from there."
      : step === 1
      ? domain?.line || "Good — let’s narrow it down."
      : step === 2
      ? "Now, what are you trying to achieve? The more context, the sharper the answer."
      : step === 3
      ? "Almost there — where should we send the answer?"
      : "Here’s your brief. Look right? Send it my way.";

  // The assembling "brief" — each entry can be clicked to jump back and edit.
  const brief = [];
  if (domain) brief.push({ k: "System", v: domain.label, step: 0 });
  if (focus) brief.push({ k: "Focus", v: focus.label, step: 1 });
  if (tags.length) brief.push({ k: "Context", v: tags.join(" · "), step: 2 });
  if (question.trim())
    brief.push({ k: "Question", v: question.trim().length > 46 ? question.trim().slice(0, 46) + "…" : question.trim(), step: 2 });

  const stepLabel = STEPS[step];
  const chips = domain?.chips || [];

  return (
    <section className="ask">
      {/* Engineering environment: technical grid + faint single-line motif + glow */}
      <div className="env" aria-hidden="true">
        <div className="grid" />
        <svg className="sld" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <path d="M0 150 H360 M470 150 H1200" />
          <circle cx="415" cy="150" r="16" />
          <path d="M415 166 V300 H250 M415 300 H620" />
          <rect x="232" y="300" width="36" height="26" rx="2" />
          <path d="M1040 150 V640 H700" />
          <circle cx="1040" cy="150" r="6" className="node" />
          <circle cx="700" cy="640" r="6" className="node" />
        </svg>
        <div className="glow" />
      </div>

      <div className="wrap">
        {/* ── LEFT: the robot guide + assembling brief + progress ── */}
        <aside className="console">
          <div className="guide">
            <div className="bot">
              <RobotGuide mood={mood} look={look} />
            </div>
            <div className="say">
              <span className="kicker">Ask Powerline</span>
              <p className="line" key={robotLine}>{robotLine}</p>
            </div>
          </div>

          <div className="brief" aria-label="Your brief so far">
            {brief.length === 0 ? (
              <p className="brief-empty">Your brief builds here as we go.</p>
            ) : (
              <ul>
                {brief.map((b) => (
                  <li key={b.k}>
                    <button type="button" className="brief-item" onClick={() => editFrom(b.step)} disabled={status !== "idle"}>
                      <span className="bk">{b.k}</span>
                      <span className="bv">{b.v}</span>
                      <span className="bedit" aria-hidden="true">Edit</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rail" role="group" aria-label={`Step ${step + 1} of ${STEPS.length}: ${stepLabel}`}>
            {STEPS.map((s, i) => (
              <span key={s} className={`seg ${i < step ? "done" : ""} ${i === step ? "now" : ""}`}>
                <span className="dot" />
                <span className="slabel">{s}</span>
              </span>
            ))}
          </div>

          <div className="reach">
            <span className="reach-label">Prefer to talk?</span>
            <a className="reach-item" href={`tel:${brand.phone}`} aria-label={`Call Powerline on ${brand.phoneDisplay}`}>
              <span className="reach-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </span>
              <span className="reach-tx"><span className="rk">Call us</span><span className="rv">{brand.phoneDisplay}</span></span>
            </a>
            <a className="reach-item" href={`mailto:${formEmail}`} aria-label={`Email Powerline at ${formEmail}`}>
              <span className="reach-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              </span>
              <span className="reach-tx"><span className="rk">Email us</span><span className="rv">{formEmail}</span></span>
            </a>
          </div>
        </aside>

        {/* ── RIGHT: the active step ── */}
        <div className="stage">
          <p className="sr-only" role="status" aria-live="polite">{`Step ${step + 1} of ${STEPS.length}: ${stepLabel}`}</p>

          {status === "sent" ? (
            <div className="done-card" key="sent">
              <h2 className="q" ref={headingRef} tabIndex={-1}>Question received.</h2>
              <p className="done-sub">
                Thanks{contact.name ? `, ${contact.name.split(" ")[0]}` : ""}. Our engineering team will review your
                request and reply to <strong>{contact.email}</strong>. For anything urgent, call{" "}
                <a href={`tel:${brand.phone}`}>{brand.phoneDisplay}</a>.
              </p>
              <div className="done-brief">
                {brief.map((b) => (
                  <div key={b.k} className="db">
                    <span>{b.k}</span>
                    <strong>{b.v}</strong>
                  </div>
                ))}
              </div>
              <div className="nav">
                <button type="button" className="btn btn-ghost" onClick={reset}>Ask another question</button>
                <a className="btn btn-primary" href="/">Back to home</a>
              </div>
            </div>
          ) : (
            <div className={`stepwrap ${status === "submitting" ? "busy" : ""}`} key={step} data-dir={dir}>
              {/* STEP 0 — DOMAIN */}
              {step === 0 && (
                <>
                  <span className="eyebrow">Talk to a Powerline engineer</span>
                  <h1 className="q" ref={headingRef} tabIndex={-1}>What are you working on?</h1>
                  <p className="qsub">Choose a starting point. You can change it anytime.</p>
                  <div className="cards" role="group" aria-label="What are you working on?">
                    {DOMAINS.map((d, i) => (
                      <button
                        type="button"
                        key={d.id}
                        className={`card ${domainId === d.id ? "on" : ""}`}
                        style={{ "--d": `${i * 0.035}s` }}
                        onClick={() => selectDomain(d.id)}
                      >
                        <span className="cico"><DomainIcon name={d.icon} /></span>
                        <span className="ctext">
                          <span className="clabel">{d.label}</span>
                          <span className="chint">{d.hint}</span>
                        </span>
                        <span className="carr" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 1 — FOCUS */}
              {step === 1 && domain && (
                <>
                  <span className="eyebrow">{domain.label}</span>
                  <h1 className="q" ref={headingRef} tabIndex={-1}>{domain.line}</h1>
                  <p className="qsub">Pick the closest match — it helps us route your question.</p>
                  <div className="opts">
                    {domain.focus.map((f, i) => (
                      <button
                        type="button"
                        key={f.id}
                        className={`opt ${focusId === f.id ? "on" : ""}`}
                        style={{ "--d": `${i * 0.04}s` }}
                        onClick={() => selectFocus(f.id)}
                      >
                        <span className="orad" aria-hidden="true" />
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="nav">
                    <button type="button" className="btn btn-ghost back" onClick={() => goTo(0, -1)}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                      Back
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2 — QUESTION */}
              {step === 2 && (
                <>
                  <span className="eyebrow">Your question</span>
                  <h1 className="q" ref={headingRef} tabIndex={-1}>Tell us what you&rsquo;re trying to achieve.</h1>
                  <p className="qsub">Describe the application, specification or challenge. Add anything that helps our engineers understand it.</p>
                  <label className="qfield">
                    <span className="sr-only">Your question</span>
                    <textarea
                      value={question}
                      onChange={(e) => { setQuestion(e.target.value); clearErr("question"); }}
                      onFocus={onStart}
                      rows={5}
                      placeholder="e.g. I need a type-tested MDB up to 4000 A for a data-centre — which system fits and what lead time should I plan for?"
                      aria-invalid={errors.question ? true : undefined}
                      aria-describedby={errors.question ? "q-error" : undefined}
                    />
                  </label>
                  {errors.question && <em className="err" id="q-error" role="alert">{errors.question}</em>}

                  {chips.length > 0 && (
                    <div className="chipwrap">
                      <span className="chiplabel">Add context (optional)</span>
                      <div className="chips" role="group" aria-label="Add context tags">
                        {chips.map((c) => (
                          <button
                            type="button"
                            key={c}
                            className={`chip ${tags.includes(c) ? "on" : ""}`}
                            aria-pressed={tags.includes(c)}
                            onClick={() => toggleTag(c)}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="nav">
                    <button type="button" className="btn btn-ghost back" onClick={() => goTo(1, -1)}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                      Back
                    </button>
                    <button type="button" className="btn btn-primary" onClick={nextFromQuestion}>Continue &rarr;</button>
                  </div>
                </>
              )}

              {/* STEP 3 — CONTACT */}
              {step === 3 && (
                <>
                  <span className="eyebrow">Where to reply</span>
                  <h1 className="q" ref={headingRef} tabIndex={-1}>Where should we send the answer?</h1>
                  <p className="qsub">Just enough for our engineers to reach you.</p>
                  <div className="form">
                    <div className="row2">
                      <label className="field">
                        <span>Name *</span>
                        <input
                          value={contact.name} autoComplete="name"
                          onChange={(e) => { setContact((c) => ({ ...c, name: e.target.value })); clearErr("name"); }}
                          aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? "name-error" : undefined}
                        />
                        {errors.name && <em className="err" id="name-error" role="alert">{errors.name}</em>}
                      </label>
                      <label className="field">
                        <span>Company / Organization</span>
                        <input value={contact.company} autoComplete="organization" onChange={(e) => setContact((c) => ({ ...c, company: e.target.value }))} />
                      </label>
                    </div>
                    <div className="row2">
                      <label className="field">
                        <span>Email *</span>
                        <input
                          type="email" value={contact.email} autoComplete="email"
                          onChange={(e) => { setContact((c) => ({ ...c, email: e.target.value })); clearErr("email"); }}
                          onBlur={() => { if (contact.email && !isValidEmail(contact.email)) setErrors((er) => ({ ...er, email: "Enter a valid email" })); }}
                          aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "email-error" : undefined}
                        />
                        {errors.email && <em className="err" id="email-error" role="alert">{errors.email}</em>}
                      </label>
                      <label className="field">
                        <span>Phone</span>
                        <input type="tel" value={contact.phone} autoComplete="tel" onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} />
                      </label>
                    </div>
                    <label className="field">
                      <span>Job title <em className="optnote">(optional)</em></span>
                      <input value={contact.jobTitle} autoComplete="organization-title" onChange={(e) => setContact((c) => ({ ...c, jobTitle: e.target.value }))} />
                    </label>
                  </div>
                  <div className="nav">
                    <button type="button" className="btn btn-ghost back" onClick={() => goTo(2, -1)}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                      Back
                    </button>
                    <button type="button" className="btn btn-primary" onClick={nextFromContact}>Review &rarr;</button>
                  </div>
                </>
              )}

              {/* STEP 4 — REVIEW */}
              {step === 4 && (
                <>
                  <span className="eyebrow">Review &amp; send</span>
                  <h1 className="q" ref={headingRef} tabIndex={-1}>Here&rsquo;s your brief.</h1>
                  <p className="qsub">Check it over, then send it to our engineering team.</p>
                  <dl className="summary">
                    <div className="srow"><dt>System</dt><dd>{domain?.label || "—"}{focus ? ` · ${focus.label}` : ""}</dd><button type="button" className="sedit" onClick={() => editFrom(0)}>Edit</button></div>
                    {tags.length > 0 && <div className="srow"><dt>Context</dt><dd>{tags.join(" · ")}</dd><button type="button" className="sedit" onClick={() => editFrom(2)}>Edit</button></div>}
                    <div className="srow"><dt>Question</dt><dd className="sq">{question.trim()}</dd><button type="button" className="sedit" onClick={() => editFrom(2)}>Edit</button></div>
                    <div className="srow"><dt>Reply to</dt><dd>{contact.name}{contact.company ? ` · ${contact.company}` : ""}<br /><span className="smut">{contact.email}{contact.phone ? ` · ${contact.phone}` : ""}</span></dd><button type="button" className="sedit" onClick={() => editFrom(3)}>Edit</button></div>
                  </dl>

                  {status === "failed" && (
                    <p className="form-err" role="alert">
                      Sorry, we couldn&rsquo;t send your question just now. Please try again, or email{" "}
                      <a href={`mailto:${formEmail}`}>{formEmail}</a>.
                    </p>
                  )}

                  <div className="nav">
                    <button type="button" className="btn btn-ghost back" onClick={() => goTo(3, -1)} disabled={status === "submitting"}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                      Back
                    </button>
                    <button type="button" className="btn btn-primary send" onClick={submit} disabled={status === "submitting"}>
                      {status === "submitting" ? "Sending…" : "Send your question →"}
                    </button>
                  </div>
                  <p className="tiny">Your details are used only to respond to your enquiry and provide relevant technical guidance.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .ask {
          position: relative;
          isolation: isolate;
          min-height: 100svh;
          padding: clamp(6.5rem, 11vh, 9rem) 0 clamp(3rem, 6vh, 5rem);
          background: var(--bg);
          overflow: hidden;
        }
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
        }

        /* ── Engineering environment ── */
        .env { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
        .grid {
          position: absolute; inset: -2px;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.028) 1px, transparent 1px);
          background-size: 46px 46px;
          -webkit-mask-image: radial-gradient(120% 90% at 30% 0%, #000 30%, transparent 78%);
          mask-image: radial-gradient(120% 90% at 30% 0%, #000 30%, transparent 78%);
        }
        .sld {
          position: absolute; inset: 0; width: 100%; height: 100%;
          fill: none; stroke: rgba(232, 114, 42, 0.14); stroke-width: 1.5;
          opacity: 0.7;
        }
        .sld .node { fill: rgba(232, 114, 42, 0.5); stroke: none; animation: node 3.4s ease-in-out infinite; }
        @keyframes node { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.9; } }
        .glow {
          position: absolute; top: -12%; left: -6%;
          width: 60%; height: 70%;
          background: radial-gradient(closest-side, rgba(232, 114, 42, 0.13), transparent 72%);
          filter: blur(6px);
        }

        .wrap {
          position: relative; z-index: 1;
          width: 100%; max-width: 82rem; margin-inline: auto;
          padding-inline: var(--pad);
          display: grid;
          grid-template-columns: minmax(17rem, 21rem) 1fr;
          gap: clamp(2rem, 4vw, 4.5rem);
          align-items: start;
        }

        /* ── Console (left) ── */
        .console { display: flex; flex-direction: column; gap: 1.7rem; }
        .guide { display: flex; align-items: center; gap: 1.1rem; }
        .bot { flex: none; }
        .say { min-width: 0; }
        .kicker {
          font-family: var(--font-body); font-weight: 600; font-size: 0.64rem;
          letter-spacing: 0.24em; text-transform: uppercase; color: var(--orange);
        }
        .line {
          margin: 0.45rem 0 0; color: var(--text); font-size: 1.02rem; line-height: 1.5;
          font-weight: 400; max-width: 24ch;
          animation: lineIn 0.5s var(--ease) both;
        }
        @keyframes lineIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

        .brief {
          border: 1px solid var(--line); border-radius: 14px;
          background: linear-gradient(180deg, rgba(16, 16, 21, 0.7), rgba(9, 9, 12, 0.7));
          padding: 0.9rem; min-height: 4.5rem;
        }
        .brief-empty { margin: 0; padding: 0.5rem; color: var(--text-faint); font-size: 0.84rem; }
        .brief ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; }
        .brief-item {
          width: 100%; display: grid; grid-template-columns: 4.6rem 1fr auto; align-items: baseline; gap: 0.6rem;
          text-align: left; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--line);
          border-radius: 9px; padding: 0.5rem 0.7rem; cursor: pointer;
          animation: briefIn 0.4s var(--ease) both;
          transition: border-color 0.2s, background 0.2s;
        }
        @keyframes briefIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
        .brief-item:hover:not(:disabled) { border-color: rgba(232, 114, 42, 0.5); background: rgba(232, 114, 42, 0.06); }
        .brief-item:disabled { cursor: default; }
        .bk { font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-faint); }
        .bv { font-size: 0.85rem; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bedit { font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--orange); opacity: 0; transition: opacity 0.2s; }
        .brief-item:hover:not(:disabled) .bedit { opacity: 1; }

        .rail { display: flex; flex-direction: column; gap: 0; }
        .seg { display: flex; align-items: center; gap: 0.7rem; padding: 0.32rem 0; position: relative; }
        .seg .dot {
          flex: none; width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid var(--line); background: var(--bg-2); transition: all 0.3s var(--ease);
        }
        .seg::after {
          content: ""; position: absolute; left: 5px; top: 1.55rem; width: 2px; height: calc(100% - 0.7rem);
          background: var(--line); transition: background 0.3s;
        }
        .seg:last-child::after { display: none; }
        .seg.done .dot { border-color: var(--orange); background: var(--orange); }
        .seg.done::after { background: rgba(232, 114, 42, 0.55); }
        .seg.now .dot { border-color: var(--orange); background: var(--bg); box-shadow: 0 0 0 4px rgba(232, 114, 42, 0.18); }
        .slabel { font-size: 0.8rem; color: var(--text-faint); letter-spacing: 0.02em; transition: color 0.3s; }
        .seg.now .slabel { color: #fff; font-weight: 600; }
        .seg.done .slabel { color: var(--text-dim); }

        .reach {
          margin-top: 0.2rem; padding-top: 1.6rem; border-top: 1px solid var(--line);
          display: flex; flex-direction: column; gap: 1rem;
        }
        .reach-label { font-size: 0.64rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-faint); }
        .reach-item {
          display: flex; align-items: center; gap: 0.85rem; min-height: 44px;
          border-radius: 12px; -webkit-tap-highlight-color: transparent;
        }
        .reach-ico {
          flex: none; width: 42px; height: 42px; display: grid; place-items: center; border-radius: 11px;
          background: rgba(255, 255, 255, 0.04); border: 1px solid var(--line); color: var(--text);
          transition: color 0.25s var(--ease), border-color 0.25s var(--ease), background 0.25s var(--ease), box-shadow 0.3s var(--ease), transform 0.2s var(--ease);
        }
        .reach-ico svg { width: 18px; height: 18px; }
        .reach-tx { display: flex; flex-direction: column; gap: 0.15rem; line-height: 1.1; }
        .rk {
          font-family: var(--font-body); font-size: 0.62rem; font-weight: 500; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--text-faint); transition: color 0.25s var(--ease);
        }
        .rv {
          font-family: var(--font-head); font-weight: 700; font-size: 0.98rem; letter-spacing: 0.01em;
          color: #fff; transition: color 0.25s var(--ease);
        }
        .reach-item:hover .reach-ico, .reach-item:focus-visible .reach-ico {
          color: var(--orange-bright); border-color: rgba(232, 114, 42, 0.55);
          background: rgba(232, 114, 42, 0.1); box-shadow: 0 0 18px rgba(232, 114, 42, 0.25);
        }
        .reach-item:hover .rv, .reach-item:focus-visible .rv { color: var(--orange); }
        .reach-item:hover .rk, .reach-item:focus-visible .rk { color: var(--text-dim); }
        .reach-item:focus-visible { outline: 2px solid var(--orange); outline-offset: 4px; }
        .reach-item:active .reach-ico { transform: scale(0.94); }

        /* ── Stage (right) ── */
        .stage { position: relative; min-height: 26rem; }
        .stepwrap { animation: stepIn 0.42s var(--ease) both; }
        .stepwrap[data-dir="-1"] { animation-name: stepBack; }
        @keyframes stepIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes stepBack { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: none; } }
        .stepwrap.busy { opacity: 0.6; pointer-events: none; }

        .q {
          font-family: var(--font-head); font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.8rem, 3.6vw, 3rem); line-height: 1.02; letter-spacing: -0.015em;
          color: #fff; margin: 0.7rem 0 0; outline: none;
        }
        .q:focus-visible { outline: none; }
        .qsub { margin: 0.9rem 0 0; color: var(--text-dim); font-size: 1rem; line-height: 1.6; max-width: 52ch; }

        /* choice cards (domain) */
        .cards { margin-top: 1.6rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        .card {
          display: flex; align-items: center; gap: 0.9rem; text-align: left;
          background: linear-gradient(180deg, rgba(16, 16, 21, 0.6), rgba(10, 10, 13, 0.6));
          border: 1px solid var(--line); border-radius: 14px; padding: 1rem 1.05rem; cursor: pointer;
          min-height: 4.6rem; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          animation: cardIn 0.4s var(--ease) both; animation-delay: var(--d);
          transition: border-color 0.22s var(--ease), background 0.22s var(--ease), transform 0.16s var(--ease), box-shadow 0.22s var(--ease);
        }
        @keyframes cardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .card:hover { border-color: rgba(232, 114, 42, 0.5); background: rgba(232, 114, 42, 0.06); transform: translateY(-2px); }
        .card:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }
        .card:active { transform: scale(0.985); }
        .card.on { border-color: var(--orange); background: rgba(232, 114, 42, 0.1); box-shadow: 0 8px 30px rgba(232, 114, 42, 0.18); }
        .cico {
          flex: none; width: 2.7rem; height: 2.7rem; display: grid; place-items: center; border-radius: 11px;
          background: rgba(232, 114, 42, 0.1); border: 1px solid rgba(232, 114, 42, 0.28); color: var(--orange);
        }
        .cico svg { width: 1.4rem; height: 1.4rem; }
        .ctext { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
        .clabel { font-family: var(--font-head); font-weight: 700; font-size: 1.02rem; color: #fff; letter-spacing: 0.01em; }
        .chint { font-size: 0.82rem; color: var(--text-faint); }
        .carr { margin-left: auto; color: var(--text-faint); transition: color 0.2s, transform 0.2s var(--ease); }
        .card:hover .carr { color: var(--orange); transform: translateX(3px); }

        /* focus options */
        .opts { margin-top: 1.6rem; display: flex; flex-direction: column; gap: 0.6rem; }
        .opt {
          display: flex; align-items: center; gap: 0.85rem; text-align: left;
          background: var(--bg-2); border: 1px solid var(--line); border-radius: 12px;
          padding: 0.95rem 1.1rem; cursor: pointer; min-height: 3.4rem; color: var(--text);
          font-family: var(--font-body); font-size: 1rem; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          animation: cardIn 0.4s var(--ease) both; animation-delay: var(--d);
          transition: border-color 0.2s, background 0.2s, transform 0.16s var(--ease);
        }
        .opt:hover { border-color: rgba(232, 114, 42, 0.5); background: var(--bg-3); }
        .opt:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }
        .opt:active { transform: scale(0.99); }
        .opt.on { border-color: var(--orange); background: rgba(232, 114, 42, 0.1); color: #fff; }
        .orad { flex: none; width: 1.1rem; height: 1.1rem; border-radius: 50%; border: 2px solid var(--text-faint); position: relative; transition: border-color 0.2s; }
        .opt.on .orad { border-color: var(--orange); }
        .opt.on .orad::after { content: ""; position: absolute; inset: 3px; border-radius: 50%; background: var(--orange); }

        /* question */
        .qfield { display: block; margin-top: 1.5rem; }
        .qfield textarea {
          width: 100%; background: var(--bg-2); border: 1px solid var(--line); border-radius: 14px;
          padding: 1.1rem 1.15rem; color: #fff; font-family: var(--font-body); font-size: 1.02rem; line-height: 1.6;
          resize: vertical; min-height: 8.5rem;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .qfield textarea::placeholder { color: var(--text-faint); }
        .qfield textarea:focus { outline: none; border-color: var(--orange); box-shadow: 0 0 0 3px rgba(232, 114, 42, 0.16); }
        .chipwrap { margin-top: 1.2rem; }
        .chiplabel { display: block; font-size: 0.66rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 0.7rem; }
        .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .chip {
          font-family: var(--font-body); font-weight: 500; font-size: 0.85rem; color: var(--text-dim);
          background: var(--bg-2); border: 1px solid var(--line); border-radius: 100px;
          padding: 0.5rem 0.95rem; min-height: 40px; cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          transition: color 0.2s, border-color 0.2s, background 0.2s, transform 0.14s var(--ease);
        }
        .chip:hover { color: #fff; border-color: rgba(232, 114, 42, 0.5); }
        .chip:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }
        .chip:active { transform: scale(0.96); }
        .chip.on { color: #0a0a0a; background: var(--orange); border-color: var(--orange); font-weight: 600; }

        /* contact form */
        .form { margin-top: 1.5rem; }
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1rem; }
        .field { display: block; margin-bottom: 1rem; }
        .field > span { display: block; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.5rem; }
        .field .optnote { font-style: normal; color: var(--text-faint); font-weight: 400; }
        .field input {
          width: 100%; background: var(--bg-2); border: 1px solid var(--line); border-radius: 11px;
          padding: 0.85rem 1rem; color: #fff; font-family: var(--font-body); font-size: 0.98rem;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .field input:focus { outline: none; border-color: var(--orange); box-shadow: 0 0 0 3px rgba(232, 114, 42, 0.16); }

        .err { display: block; color: #ff6b5e; font-size: 0.78rem; font-style: normal; margin-top: 0.4rem; }
        .form-err { color: #ff6b5e; font-size: 0.9rem; margin-top: 1rem; }
        .form-err a { color: var(--orange); text-decoration: underline; }

        /* review summary */
        .summary { margin: 1.6rem 0 0; display: flex; flex-direction: column; gap: 0; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
        .srow { display: grid; grid-template-columns: 7rem 1fr auto; gap: 1rem; align-items: start; padding: 1rem 1.1rem; border-bottom: 1px solid var(--line); background: rgba(255, 255, 255, 0.015); }
        .srow:last-child { border-bottom: none; }
        .srow dt { font-size: 0.64rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-faint); padding-top: 0.15rem; }
        .srow dd { margin: 0; color: var(--text); font-size: 0.95rem; line-height: 1.55; min-width: 0; overflow-wrap: anywhere; }
        .srow dd.sq { color: #fff; }
        .smut { color: var(--text-faint); font-size: 0.85rem; }
        .sedit { align-self: start; background: none; border: none; color: var(--orange); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; padding: 0.15rem 0.2rem; }
        .sedit:hover { text-decoration: underline; }
        .sedit:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }

        /* nav row */
        .nav { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.8rem; flex-wrap: wrap; }
        .nav .back { padding: 0.85rem 1.3rem; }
        .nav .btn { min-height: 48px; }
        .send { min-width: 12rem; justify-content: center; }
        .nav .btn-primary { margin-left: auto; }
        .tiny { margin: 1rem 0 0; font-size: 0.74rem; line-height: 1.5; color: var(--text-faint); }

        /* success */
        .done-card { animation: stepIn 0.5s var(--ease) both; }
        .done-sub { margin: 1rem 0 0; color: var(--text-dim); font-size: 1.05rem; line-height: 1.65; max-width: 46ch; }
        .done-sub a { color: var(--orange); }
        .done-brief { margin: 1.6rem 0 0; display: flex; flex-wrap: wrap; gap: 0.6rem; }
        .db { border: 1px solid var(--line); border-radius: 10px; padding: 0.6rem 0.85rem; background: rgba(255, 255, 255, 0.02); }
        .db span { display: block; font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-faint); }
        .db strong { display: block; margin-top: 0.2rem; font-size: 0.88rem; color: #fff; font-weight: 600; max-width: 24ch; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .ask { min-height: 0; padding-top: clamp(5.5rem, 16vw, 7rem); }
          .wrap { grid-template-columns: 1fr; gap: 1.6rem; }
          .console { position: static; flex-direction: column; gap: 1.1rem; order: -1; }
          .guide { gap: 0.9rem; }
          .line { font-size: 0.95rem; max-width: none; }
          /* progress becomes a compact horizontal bar */
          .rail { flex-direction: row; gap: 0; }
          .seg { flex-direction: column; align-items: center; gap: 0.35rem; flex: 1; text-align: center; padding: 0; }
          .seg::after { left: auto; top: 5px; left: calc(50% + 8px); width: calc(100% - 16px); height: 2px; }
          .slabel { font-size: 0.62rem; }
          .reach { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 0.8rem 1.5rem; padding-top: 1.3rem; }
          .reach-label { width: 100%; }
          .rk { display: none; }
          .reach-ico { width: 38px; height: 38px; }
          .stage { min-height: 0; }
          .cards { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .row2 { grid-template-columns: 1fr; }
          .srow { grid-template-columns: 5.5rem 1fr; }
          .srow .sedit { grid-column: 2; justify-self: end; }
          .nav .btn { flex: 1; }
          .nav .back { flex: 0 0 auto; }
          .slabel { display: none; }
          .seg { padding: 0.2rem 0; }
        }
        @media (max-width: 380px) {
          .guide { flex-direction: row; align-items: center; }
        }

        @media (prefers-reduced-motion: reduce) {
          .stepwrap, .done-card, .card, .opt, .line, .brief-item { animation: none !important; }
          .sld .node { animation: none; }
          .card, .carr, .chip, .opt { transition: border-color 0.2s, background 0.2s, color 0.2s; }
        }
      `}</style>
    </section>
  );
}
