import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

const navItems = [
  { label: "Services", target: "services" },
  { label: "Method", target: "method" },
  { label: "Examples", target: "examples" },
  { label: "FAQ", target: "faq" },
];

const painPoints = [
  {
    id: "reply",
    label: "Customer questions",
    title: "Reply to enquiries faster",
    category: "Build",
    visual: "/assets/nano/synqora-agents-nano.webp",
    problem: "New messages wait while your team asks the same follow-up questions.",
    build: "Synqora builds a simple intake helper that collects the details and drafts a first response.",
    result: "Faster replies with a human still approving what goes out.",
  },
  {
    id: "knowledge",
    label: "Company knowledge",
    title: "Find answers in company files",
    category: "Build",
    visual: "/assets/nano/synqora-rag-nano.webp",
    problem: "Policies, PDFs, notes, and website pages are spread across folders.",
    build: "A private helper answers from trusted material and shows where the answer came from.",
    result: "People stop hunting through files and still know what to trust.",
  },
  {
    id: "reports",
    label: "Operations",
    title: "Stop copy-paste reports",
    category: "Automate",
    visual: "/assets/nano/synqora-automation-nano.webp",
    problem: "Someone moves numbers between sheets, inboxes, and tools every week.",
    build: "A workflow gathers the information, prepares a clean summary, and flags decisions.",
    result: "Fewer missed updates and less manual admin.",
  },
  {
    id: "training",
    label: "Training",
    title: "Explain AI to the team",
    category: "Learn",
    visual: "/assets/nano/synqora-training-nano.webp",
    problem: "People have AI tools but do not know what to use them for at work.",
    build: "Plain English workshops with role examples, reusable prompts, and safety rules.",
    result: "Your non-technical team leaves with everyday AI workflows they can repeat.",
  },
  {
    id: "website",
    label: "Launch",
    title: "Build a useful website or tool",
    category: "Build",
    visual: "/assets/nano/synqora-website-tools-nano.webp",
    problem: "Your offer needs a clearer digital front door or one useful AI feature.",
    build: "A polished website, quote flow, intake form, dashboard, or simple tool around one job.",
    result: "Visitors understand the offer and send better enquiries.",
  },
  {
    id: "voice",
    label: "Calls and chat",
    title: "Collect better details before a human replies",
    category: "Build",
    visual: "/assets/nano/synqora-voice-chat-nano.webp",
    problem: "Calls and chats start with the same questions before anyone can help.",
    build: "A chat or voice intake flow gathers context, asks the right next question, and routes the request.",
    result: "Your team receives clearer enquiries with the basics already captured.",
  },
];

const methodSteps = [
  {
    title: "Learn",
    text: "We explain what AI can and cannot help with in plain English.",
    output: "Team playbook",
  },
  {
    title: "Choose",
    text: "We pick one slow, repeated, or confusing task that is worth improving first.",
    output: "Clear workflow map",
  },
  {
    title: "Build",
    text: "We create the helper, automation, website, or small tool around that task.",
    output: "Working first version",
  },
  {
    title: "Use",
    text: "We hand it over with simple instructions, safety checks, and owner training.",
    output: "Usable system",
  },
];

const examples = [
  {
    label: "Service business",
    title: "Leads stuck in WhatsApp",
    before: "New enquiries arrive in chats and wait until someone has time to ask follow-up questions.",
    after: "AI collects the key details, drafts a reply, and sends the right enquiry to the right person.",
    metric: "Faster first replies",
    time: "3-5 days",
  },
  {
    label: "Internal knowledge",
    title: "Team cannot find answers",
    before: "Policies, notes, and old files are spread across folders, so people keep asking the same questions.",
    after: "A private helper answers from trusted material and shows the source so people can check it.",
    metric: "Less folder hunting",
    time: "About 1 week",
  },
  {
    label: "Operations",
    title: "Manual reports every week",
    before: "Someone copies numbers between sheets, tools, and messages just to prepare a weekly update.",
    after: "The workflow gathers the information, prepares a clean summary, and flags what needs a human decision.",
    metric: "Hours saved weekly",
    time: "2-4 days",
  },
];

const faqs = [
  {
    question: "Is Synqora for technical teams?",
    answer:
      "No. The training is built for founders, admins, sales teams, school teams, creators, and service businesses that want AI to feel clear and useful without needing code knowledge.",
  },
  {
    question: "Do you only teach, or do you build too?",
    answer:
      "Both. We usually teach first so the team understands the opportunity, then build one practical tool around the work that matters most.",
  },
  {
    question: "What do we get at the end?",
    answer:
      "A working first version, simple instructions, safety guidance, and a clear owner inside your team. The goal is something people can actually use after we leave.",
  },
  {
    question: "How long does this take?",
    answer:
      "Training can run in 1-2 days. A first useful build can often be ready in 2-7 days, then improved into a fuller system over 2-4 weeks.",
  },
  {
    question: "What about privacy?",
    answer:
      "We start by mapping what data is needed, what should stay out, and who can access the tool. Sensitive work gets human approval steps and source visibility.",
  },
];

const quickChoices = [
  "Reply to enquiries faster",
  "Find answers in documents",
  "Automate a weekly report",
  "Teach my team AI basics",
];

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function resetLandingScroll() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  const resetTimers = [0, 50, 250, 700, 1200];
  resetTimers.forEach((delay) => {
    setTimeout(scrollToTop, delay);
  });
}

function scrollToSection(target) {
  document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function AppShellButton({ children, className = "", ...props }) {
  return (
    <button className={`shell-button ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}

function CursorFollower() {
  const followerRef = useRef(null);
  const dotRefs = useRef([]);
  const rafRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const cursorTrailHistoryRef = useRef([]);
  const trailsRef = useRef(
    Array.from({ length: 4 }, () => ({ x: 0, y: 0 })),
  );
  const hasMovedRef = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const follower = followerRef.current;

    if (!follower || prefersReduced.matches || !finePointer.matches) {
      return undefined;
    }

    function animate() {
      const current = currentRef.current;
      const target = pointerRef.current;
      current.x += (target.x - current.x) * 0.34;
      current.y += (target.y - current.y) * 0.34;
      follower.style.transform = `translate3d(${current.x - 5}px, ${current.y - 4}px, 0)`;

      const history = cursorTrailHistoryRef.current;
      history.unshift({ x: current.x, y: current.y });
      if (history.length > 42) {
        history.length = 42;
      }

      trailsRef.current.forEach((trail, index) => {
        const cursorTrailLag = 5 + index * 6;
        const cursorTrailBackOffset = 14 + index * 7;
        const historyPoint = history[Math.min(cursorTrailLag, history.length - 1)] ?? current;
        const previousPoint = history[Math.min(cursorTrailLag + 2, history.length - 1)] ?? historyPoint;
        const velocityX = historyPoint.x - previousPoint.x;
        const velocityY = historyPoint.y - previousPoint.y;
        const distance = Math.hypot(velocityX, velocityY) || 1;
        const source = {
          x: historyPoint.x - (velocityX / distance) * cursorTrailBackOffset,
          y: historyPoint.y - (velocityY / distance) * cursorTrailBackOffset,
        };
        trail.x += (source.x - trail.x) * (0.24 - index * 0.025);
        trail.y += (source.y - trail.y) * (0.24 - index * 0.025);
        const dot = dotRefs.current[index];
        if (dot) {
          dot.style.transform = `translate3d(${trail.x - 5}px, ${trail.y - 5}px, 0)`;
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    function handlePointerMove(event) {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (!hasMovedRef.current) {
        currentRef.current = { ...pointerRef.current };
        cursorTrailHistoryRef.current = Array.from({ length: 42 }, () => ({ ...pointerRef.current }));
        trailsRef.current = trailsRef.current.map(() => ({ ...pointerRef.current }));
        hasMovedRef.current = true;
      }
      follower.classList.add("is-visible");
      dotRefs.current.forEach((dot) => dot?.classList.add("is-visible"));
    }

    function handlePointerOver(event) {
      const target = event.target;
      if (target instanceof Element && target.closest("button, a, input, textarea, select, summary, .problem-card, .example-card")) {
        follower.classList.add("is-active");
        dotRefs.current.forEach((dot) => dot?.classList.add("is-active"));
      }
    }

    function handlePointerOut(event) {
      const target = event.target;
      if (target instanceof Element && target.closest("button, a, input, textarea, select, summary, .problem-card, .example-card")) {
        follower.classList.remove("is-active");
        dotRefs.current.forEach((dot) => dot?.classList.remove("is-active"));
      }
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerover", handlePointerOver, { passive: true });
    window.addEventListener("pointerout", handlePointerOut, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("pointerout", handlePointerOut);
    };
  }, []);

  return (
    <>
      <div className="cursor-follower" ref={followerRef} aria-hidden="true">
        <svg className="cursor-arrow" viewBox="0 0 38 38" focusable="false">
          <path d="M5 4L31 18L19 21L15 34L5 4Z" />
        </svg>
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <span
          className={`cursor-trail-dot cursor-trail-dot-${index + 1}`}
          key={index}
          ref={(node) => {
            dotRefs.current[index] = node;
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

function AnimatedShape({ tone = "green", label = "AI workflow motion" }) {
  return (
    <div className={`animated-shape animated-shape-${tone}`} aria-label={label}>
      <span className="shape-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="shape-core" aria-hidden="true" />
    </div>
  );
}

function KineticSpark() {
  return (
    <svg className="kinetic-spark" viewBox="0 0 180 180" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sparkGradient" x1="18" x2="154" y1="20" y2="154" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0cff62" />
          <stop offset="0.48" stopColor="#38dff7" />
          <stop offset="1" stopColor="#ff7ad9" />
        </linearGradient>
      </defs>
      <path d="M84 8c22 34 34 46 84 42-34 22-46 34-42 84-22-34-34-46-84-42 34-22 46-34 42-84Z" fill="url(#sparkGradient)" />
      <path d="M63 47c18 18 32 24 60 18-18 18-24 32-18 60-18-18-32-24-60-18 18-18 24-32 18-60Z" fill="rgba(255,252,225,0.28)" />
    </svg>
  );
}

function KineticHero({ onStart }) {
  return (
    <section className="kinetic-hero hero-mega" aria-labelledby="hero-title">
      <div className="hero-background-grid" aria-hidden="true" />
      <img
        className="hero-ambient-image"
        src="/assets/nano/synqora-hero-nano.webp"
        alt=""
        aria-hidden="true"
      />
      <span className="motion-orb motion-orb-one" aria-hidden="true" />
      <span className="motion-orb motion-orb-two" aria-hidden="true" />
      <span className="motion-orb motion-orb-three" aria-hidden="true" />
      <KineticSpark />
      <div className="hero-mega-inner">
        <p className="section-kicker hero-kicker">AI help for non-technical teams</p>
        <h1 id="hero-title" className="hero-title" aria-label="Make AI feel useful.">
          <span className="hero-line">
            <span className="hero-word" data-motion-word="Make">Make</span>
            <span className="hero-word" data-motion-word="AI">AI</span>
          </span>
          <span className="hero-line hero-line-offset hero-line-middle">
            <span className="hero-word" data-motion-word="feel">feel</span>
          </span>
          <span className="hero-line hero-line-offset hero-line-final">
            <span className="hero-word" data-motion-word="useful">useful.</span>
          </span>
        </h1>

        <div className="hero-bottom-row">
          <p className="hero-brace-copy">
            <span>{`{`}</span>
            Learn what AI can do, then build one tool your team actually uses.
            <span>{`}`}</span>
          </p>
          <div className="hero-actions">
            <button className="acid-pill" type="button" onClick={onStart}>
              Tell us what you need
            </button>
            <button className="ghost-pill secondary-action" type="button" onClick={() => scrollToSection("services")}>
              See what we can build
            </button>
          </div>
        </div>

        <div className="hero-proof-row" aria-label="Synqora method preview">
          <span>Teach the team</span>
          <span>Build the first tool</span>
          <span>Leave it usable</span>
        </div>
      </div>
    </section>
  );
}

function PainPointChooser({ activeId, onSelect }) {
  const active = painPoints.find((item) => item.id === activeId) ?? painPoints[0];

  return (
    <section className="site-section reveal-block" id="services" aria-labelledby="services-title">
      <div className="section-heading">
        <p className="section-kicker">What can we help with?</p>
        <h2 id="services-title">Start with one painful task.</h2>
        <p>
          You do not need to know what to build. Pick the work that feels slow, repeated,
          or unclear. Synqora turns that into a practical AI training or tool plan.
        </p>
      </div>

      <div className="pain-point-chooser service-rail">
        <div className="pain-tabs" role="tablist" aria-label="Choose a Synqora goal">
          {painPoints.map((item) => (
            <button
              key={item.id}
              className={item.id === active.id ? "pain-tab service-rail-card is-active" : "pain-tab service-rail-card"}
              type="button"
              role="tab"
              aria-selected={item.id === active.id}
              aria-controls="pain-panel"
              onClick={() => onSelect(item.id)}
            >
              <span>{item.label}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>

        <article className="pain-panel" id="pain-panel">
          <div className="pain-panel-image">
            <img src={active.visual} alt={`${active.title} visual`} />
          </div>
          <div className="pain-panel-copy">
            <p className="section-kicker">{active.category}</p>
            <h3>{active.title}</h3>
            <dl>
              <div>
                <dt>Problem</dt>
                <dd>{active.problem}</dd>
              </div>
              <div>
                <dt>Synqora builds</dt>
                <dd>{active.build}</dd>
              </div>
              <div>
                <dt>Result</dt>
                <dd>{active.result}</dd>
              </div>
            </dl>
            <button className="ghost-pill" type="button" onClick={() => scrollToSection("contact")}>
              Plan this
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

function ProblemOutcomeCard({ item }) {
  return (
    <article className="problem-card">
      <div>
        <p className="card-label">{item.category}</p>
        <h3>{item.title}</h3>
        <p className="card-intro">{item.problem}</p>
      </div>
      <div className="card-outcome">
        <span>Result</span>
        <p>{item.result}</p>
      </div>
      <button className="card-link" type="button" onClick={() => scrollToSection("contact")}>
        Tell us about this
      </button>
    </article>
  );
}

function ProblemOutcomeSection() {
  return (
    <section className="site-section reveal-block" aria-labelledby="problem-title">
      <div className="section-marquee" aria-hidden="true">
        <span>Useful AI. Plain English. One real workflow. Useful AI. Plain English.</span>
      </div>
      <div className="section-heading compact">
        <p className="section-kicker">Simple offers</p>
        <h2 id="problem-title">AI work explained by the problem it solves.</h2>
      </div>
      <div className="problem-grid">
        {painPoints.slice(0, 5).map((item) => (
          <ProblemOutcomeCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function MethodStrip() {
  return (
    <section className="site-section reveal-block" id="method" aria-labelledby="method-title">
      <div className="method-strip">
        <div className="method-intro">
          <p className="section-kicker">How we work</p>
          <h2 id="method-title">Teach first. Build beside you. Leave it working.</h2>
          <p>
            Synqora is not slide-deck only. We help your team understand AI, pick the right
            first use case, and ship a tool with clear instructions.
          </p>
        </div>
        <div className="method-steps">
          {methodSteps.map((step, index) => (
            <article className="method-step" key={step.title}>
              <span className="method-step-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              <span className="method-output">{step.output}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExampleTransformations() {
  return (
    <section className="site-section reveal-block" id="examples" aria-labelledby="examples-title">
      <div className="section-heading">
        <p className="section-kicker">Examples</p>
        <h2 id="examples-title">Real work turned into simple tools.</h2>
        <p>
          The best first AI project is usually one messy daily task. These are the kinds
          of problems Synqora can make clearer.
        </p>
      </div>
      <div className="example-grid">
        {examples.map((example) => (
          <article className="example-card" key={example.title}>
            <p className="card-label">{example.label}</p>
            <h3>{example.title}</h3>
            <div className="before-after">
              <div>
                <span>Before</span>
                <p>{example.before}</p>
              </div>
              <div>
                <span>After</span>
                <p>{example.after}</p>
              </div>
            </div>
            <footer>
              <strong>{example.metric}</strong>
              <span>{example.time}</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function FaqSection({ openIndex, onToggle }) {
  return (
    <section className="site-section reveal-block faq-section" id="faq" aria-labelledby="faq-title">
      <div className="section-heading compact">
        <p className="section-kicker">Plain answers</p>
        <h2 id="faq-title">Questions people ask before starting.</h2>
      </div>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <details
            key={faq.question}
            open={openIndex === index}
            onToggle={(event) => {
              if (event.currentTarget.open) {
                onToggle(index);
              }
            }}
          >
            <summary>
              <span>{faq.question}</span>
              <b aria-hidden="true">+</b>
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactBrief({ selectedTitle, status, onSubmit, onQuickChoice }) {
  return (
    <section className="site-section reveal-block contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-brief">
        <div className="contact-copy">
          <p className="section-kicker">Start with the work</p>
          <h2 id="contact-title">Tell Synqora what feels slow, repeated, or unclear.</h2>
          <p>
            You do not need a technical idea. Share the work that takes too long, who handles
            it now, and the tools your team already uses.
          </p>
          <div className="contact-note">
            <span>Best first brief</span>
            <strong>{selectedTitle}</strong>
          </div>
        </div>

        <form className="brief-form" onSubmit={onSubmit}>
          <div className="brief-form-header">
            <span>Synqora brief</span>
            <strong>{status}</strong>
          </div>
          <div className="quick-choice-row" aria-label="Quick choices">
            {quickChoices.map((choice) => (
              <button key={choice} type="button" onClick={() => onQuickChoice(choice)}>
                {choice}
              </button>
            ))}
          </div>

          <label>
            <span>Name</span>
            <input name="name" placeholder="Your name" autoComplete="name" required />
          </label>

          <label>
            <span>What work takes too much time?</span>
            <textarea
              name="slowWork"
              rows="5"
              placeholder="Example: replying to enquiries, preparing weekly reports, finding answers in documents..."
              required
            />
          </label>

          <div className="brief-form-grid">
            <label>
              <span>Who does this work now?</span>
              <input name="owner" placeholder="Founder, admin, sales..." />
            </label>
            <label>
              <span>What tools do you already use?</span>
              <input name="tools" placeholder="WhatsApp, Gmail, Sheets..." />
            </label>
          </div>

          <label>
            <span>What do you want first?</span>
            <select name="firstStep" defaultValue="Teach us what to use">
              <option>Teach us what to use</option>
              <option>Build a small working version</option>
              <option>Map our workflow first</option>
              <option>Not sure yet</option>
            </select>
          </label>

          <button className="acid-pill form-submit" type="submit">
            Tell us what you need
          </button>
        </form>
      </div>
    </section>
  );
}

function SplitFooterWord({ word }) {
  return (
    <span className="footer-split-word" aria-label={word}>
      {word.split("").map((char, index) => (
        <span className="footer-split-char" aria-hidden="true" key={`${char}-${index}`}>
          {char}
        </span>
      ))}
    </span>
  );
}

function SplitFooter() {
  return (
    <footer className="split-footer">
      <div className="footer-poster">
        <p className="footer-poster-line">
          <SplitFooterWord word="Learn" />
          <SplitFooterWord word="Build" />
          <SplitFooterWord word="Use" />
        </p>
      </div>
      <div className="footer-meta">
        <div>
          <img src="/assets/brand/synqora-gradient-wordmark.svg" alt="Synqora" />
          <p>AI training and useful tools for people who want AI to feel clear.</p>
        </div>
        <nav aria-label="Footer navigation">
          {navItems.map((item) => (
            <button type="button" key={item.target} onClick={() => scrollToSection(item.target)}>
              {item.label}
            </button>
          ))}
        </nav>
        <a href="mailto:hello@synqora.ai">hello@synqora.ai</a>
      </div>
    </footer>
  );
}

export function App() {
  const rootRef = useRef(null);
  const gsapScaleHero = true;
  const [activeId, setActiveId] = useState("reply");
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const [briefStatus, setBriefStatus] = useState("New request");

  const activePoint = useMemo(
    () => painPoints.find((item) => item.id === activeId) ?? painPoints[0],
    [activeId],
  );

  useEffect(() => {
    resetLandingScroll();

    const handleHashChange = () => resetLandingScroll();
    const handleLandingRestore = () => resetLandingScroll();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("pageshow", handleLandingRestore);
    window.addEventListener("load", handleLandingRestore);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReduced.matches || !rootRef.current) {
      return () => {
        window.removeEventListener("hashchange", handleHashChange);
        window.removeEventListener("pageshow", handleLandingRestore);
        window.removeEventListener("load", handleLandingRestore);
      };
    }

    const ctx = gsap.context(() => {
      gsap.set(".hero-word", { yPercent: 115, rotate: 2 });
      gsap.to(".hero-word", {
        yPercent: 0,
        rotate: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power4.out",
      });

      gsap.from(".hero-actions > *, .hero-proof-row span", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        delay: 0.25,
        stagger: 0.12,
        ease: "power3.out",
      });

      gsap.from(".hero-brace-copy", {
        y: 24,
        opacity: 0,
        duration: 0.85,
        delay: 0.42,
        stagger: 0.08,
        ease: "power3.out",
      });

      gsap.from(".kinetic-spark", {
        scale: 0.35,
        rotate: -48,
        opacity: 0,
        duration: 1.15,
        delay: 0.18,
        ease: "elastic.out(1, 0.7)",
      });

      gsap.to(".kinetic-spark", {
        y: -14,
        rotate: 10,
        duration: 4.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".motion-orb", {
        y: (index) => [-20, 18, -12][index] ?? -16,
        x: (index) => [12, -18, 10][index] ?? 8,
        scale: (index) => [1.12, 0.92, 1.08][index] ?? 1,
        duration: (index) => [5.5, 6.2, 4.8][index] ?? 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.18,
      });

      gsap.to(".shape-orbit", {
        rotate: 360,
        duration: 22,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });

      gsap.to(".section-marquee span", {
        xPercent: -32,
        duration: 18,
        repeat: -1,
        ease: "none",
      });

      gsap.from(".footer-split-char", {
        yPercent: 100,
        opacity: 0,
        duration: 0.72,
        stagger: 0.012,
        ease: "power3.out",
      });
    }, rootRef);

    const revealBlocks = gsap.utils.toArray(".reveal-block", rootRef.current);
    gsap.set(revealBlocks, { y: 42, opacity: 0 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          gsap.to(entry.target, {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
          });

          const animatedChildren = entry.target.querySelectorAll(
            ".service-rail-card, .problem-card, .method-step, .example-card, .contact-brief",
          );
          if (animatedChildren.length) {
            gsap.fromTo(
              animatedChildren,
              { y: 28, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.72,
                stagger: 0.055,
                ease: "power3.out",
              },
            );
          }

          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    revealBlocks.forEach((block) => observer.observe(block));

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("pageshow", handleLandingRestore);
      window.removeEventListener("load", handleLandingRestore);
      ctx.revert();
    };
  }, []);

  function handleBriefSubmit(event) {
    event.preventDefault();
    setBriefStatus("Ready to send");
  }

  function handleQuickChoice(choice) {
    setBriefStatus(choice);
    const textarea = document.querySelector('textarea[name="slowWork"]');
    if (textarea) {
      textarea.value = choice;
      textarea.focus();
    }
  }

  return (
    <div className="app-shell" ref={rootRef}>
      <CursorFollower />
      <header className="site-header">
        <div className="site-header-shell">
          <button className="brand-button" type="button" onClick={scrollToTop} aria-label="Synqora home">
            <img src="/assets/brand/synqora-gradient-wordmark.svg" alt="Synqora" />
          </button>

          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <AppShellButton className="nav-link" key={item.target} onClick={() => scrollToSection(item.target)}>
                {item.label}
              </AppShellButton>
            ))}
            <button className="acid-pill nav-cta" type="button" onClick={() => scrollToSection("contact")}>
              Start
              <span aria-hidden="true">-&gt;</span>
            </button>
          </nav>

          <button
            className="mobile-menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
          </button>
        </div>
      </header>

      {menuOpen ? (
        <nav className="mobile-menu" id="mobile-menu" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                scrollToSection(item.target);
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              scrollToSection("contact");
            }}
          >
            Start
          </button>
        </nav>
      ) : null}

      <main>
        {gsapScaleHero ? <KineticHero onStart={() => scrollToSection("contact")} /> : null}
        <section className="ticker" aria-label="Synqora focus areas">
          <span>Beginner AI training</span>
          <span>Company knowledge helpers</span>
          <span>Customer intake</span>
          <span>Weekly report automation</span>
          <span>Simple AI websites</span>
          <span>Useful team workflows</span>
        </section>
        <PainPointChooser activeId={activeId} onSelect={setActiveId} />
        <ProblemOutcomeSection />
        <MethodStrip />
        <ExampleTransformations />
        <FaqSection openIndex={faqOpen} onToggle={setFaqOpen} />
        <ContactBrief
          selectedTitle={activePoint.title}
          status={briefStatus}
          onSubmit={handleBriefSubmit}
          onQuickChoice={handleQuickChoice}
        />
      </main>

      <SplitFooter />
    </div>
  );
}
