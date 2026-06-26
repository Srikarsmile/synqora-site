import { useEffect, useMemo, useRef, useState } from "react";

const stageServices = [
  {
    id: "training",
    title: "AI Training for Beginners",
    short: "Learn",
    eyebrow: "Plain English workshops",
    copy: "Learn how to use AI for writing, research, planning, admin, and decisions without code or confusing terms.",
    image: "/assets/nano/synqora-training-nano.webp",
    accent: "cyan",
    tag: "Education",
    stat: "1-2 days",
  },
  {
    id: "agents",
    title: "AI Assistants",
    short: "Assist",
    eyebrow: "Helpful task support",
    copy: "Build simple assistants that help with leads, replies, documents, customer questions, and repetitive admin work.",
    image: "/assets/nano/synqora-agents-nano.webp",
    accent: "green",
    tag: "Build",
    stat: "Most requested",
  },
  {
    id: "automation",
    title: "Repetitive Work Automation",
    short: "Automate",
    eyebrow: "Less manual work",
    copy: "Connect the tools you already use so reports, updates, reminders, and handoffs happen with less manual effort.",
    image: "/assets/nano/synqora-automation-nano.webp",
    accent: "red",
    tag: "Automation",
    stat: "Hours returned",
  },
  {
    id: "apps",
    title: "AI Websites and Simple Tools",
    short: "Build",
    eyebrow: "Websites and tools",
    copy: "Launch a clear website, quote tool, intake form, dashboard, or simple AI feature for your business.",
    image: "/assets/nano/synqora-website-tools-nano.webp",
    accent: "violet",
    tag: "Build",
    stat: "0 -> 1 launches",
  },
];

const serviceMeta = [
  {
    title: "AI Assistant for Daily Tasks",
    tag: "Build",
    copy: "For teams that answer the same questions, sort the same requests, or draft the same replies.",
    problem: "Repeated questions, lead replies, and admin follow-ups take too much time.",
    build: "A simple AI helper that drafts, sorts, and prepares the next step for review.",
    result: "Less busywork, faster replies, and a clearer queue with a person still in control.",
    time: "3-5 days",
    youGet: "Task helper + simple guide",
    visual: "/assets/nano/synqora-agents-nano.webp",
    accent: "cyan",
    icon: "ri-robot-2-line",
  },
  {
    title: "Company Knowledge Helper",
    tag: "Build",
    copy: "For teams that waste time hunting through PDFs, folders, messages, and old notes.",
    problem: "Important answers are buried across documents, policies, notes, and website pages.",
    build: "A private helper that answers from your material and shows where it found the answer.",
    result: "People get trusted answers faster without digging through folders.",
    time: "1 week",
    youGet: "Answer helper + source list",
    visual: "/assets/nano/synqora-rag-nano.webp",
    accent: "green",
    icon: "ri-database-2-line",
  },
  {
    title: "Repetitive Work Automation",
    tag: "Automate",
    copy: "For teams moving information between apps, sheets, forms, and inboxes by hand.",
    problem: "Reports, reminders, approvals, and updates are copied from place to place manually.",
    build: "A connected workflow that moves information between the tools you already use.",
    result: "Fewer missed updates and less manual copy-paste work every week.",
    time: "2-3 days",
    youGet: "Working automation + map",
    visual: "/assets/nano/synqora-automation-nano.webp",
    accent: "red",
    icon: "ri-flow-chart",
  },
  {
    title: "AI Website or Simple App",
    tag: "Build",
    copy: "For founders and service businesses that need a useful digital front door.",
    problem: "People do not understand the offer, or every enquiry needs manual back-and-forth.",
    build: "A clear website, quote form, intake flow, dashboard, or small AI feature.",
    result: "A polished place to explain the offer and collect better enquiries.",
    time: "1-2 weeks",
    youGet: "Website or tool + launch notes",
    visual: "/assets/nano/synqora-website-tools-nano.webp",
    accent: "violet",
    icon: "ri-window-2-line",
  },
  {
    title: "Chat or Voice Intake",
    tag: "Build",
    copy: "For teams that need better lead capture, support intake, or booking questions.",
    problem: "Customers ask the same first questions before your team has enough context.",
    build: "A chat or voice flow that collects details and sends people to the right next step.",
    result: "Better enquiries arrive with useful context before a person replies.",
    time: "5-7 days",
    youGet: "Intake flow + question list",
    visual: "/assets/nano/synqora-voice-chat-nano.webp",
    accent: "amber",
    icon: "ri-chat-voice-line",
  },
  {
    title: "AI Training for Non-Tech Teams",
    tag: "Learn",
    copy: "For non-technical teams that need plain English training and everyday AI workflows, not theory or buzzwords.",
    problem: "People have AI tools but do not know what to use them for at work.",
    build: "Plain English training with examples for writing, research, planning, and admin.",
    result: "Each role leaves with repeatable workflows, safety rules, and usable templates.",
    time: "1-2 days",
    youGet: "Training + team cheat sheets",
    visual: "/assets/nano/synqora-training-nano.webp",
    accent: "cyan",
    icon: "ri-graduation-cap-line",
  },
];

const processOutputs = [
  "Simple AI playbook",
  "Clear workflow map",
  "First working version",
  "Simple instructions",
];

const processSteps = [
  {
    title: "Teach",
    copy: "Show your team what AI can help with and what it should not do.",
    output: processOutputs[0],
  },
  {
    title: "Map",
    copy: "Find the slow, repetitive, or confusing work that is worth improving first.",
    output: processOutputs[1],
  },
  {
    title: "Build",
    copy: "Create the assistant, automation, website, or simple tool around that work.",
    output: processOutputs[2],
  },
  {
    title: "Use",
    copy: "Launch it with simple instructions, safety checks, and owner training.",
    output: processOutputs[3],
  },
];

const proofCards = [
  {
    title: "Leads stuck in WhatsApp",
    meta: "Service business",
    before: "New enquiries arrive in chats and wait until someone has time to ask follow-up questions.",
    after: "AI collects the key details, drafts a reply, and sends the right enquiry to the right person.",
    output: "Faster first replies",
    speed: "3-5 days",
  },
  {
    title: "Team cannot find answers",
    meta: "Internal knowledge",
    before: "Policies, notes, and old files are spread across folders, so people keep asking the same questions.",
    after: "A private helper answers from trusted material and shows the source so people can check it.",
    output: "Less folder hunting",
    speed: "About 1 week",
  },
  {
    title: "Manual reports every week",
    meta: "Operations",
    before: "Someone copies numbers between sheets, tools, and messages just to prepare a weekly update.",
    after: "The workflow gathers the information, prepares a clean summary, and flags what needs a human decision.",
    output: "Hours saved weekly",
    speed: "2-4 days",
  },
];

const filters = ["All", "Learn", "Build", "Automate"];

const sectionTabs = [
  ["services", "Services"],
  ["method", "Method"],
  ["work", "Work"],
  ["faq", "FAQ"],
  ["contact", "Start"],
];

const heroSteps = [
  ["Learn", "Understand what AI can help with in plain English."],
  ["Build", "Turn one useful workflow into a working tool."],
  ["Use", "Leave with simple instructions your team can follow."],
];

const briefOptions = [
  "Teach my team AI",
  "Help with daily tasks",
  "Automate repeated work",
  "Improve my website",
];

const faqs = [
  {
    question: "How long does a typical engagement take?",
    answer:
      "Training usually takes 1-2 days. Build work starts with a small first version in 2-7 days, then improves from there. Most simple systems can be ready within 2-4 weeks.",
  },
  {
    question: "What do we get at the end?",
    answer:
      "You get simple instructions, role-based cheat sheets, safety rules, and owner training so your team knows how to use the tool after launch.",
  },
  {
    question: "Is this training or building? Can I get both?",
    answer:
      "Both. We can teach your team first, build the tool for you, or do both together so people learn while the system is being made.",
  },
  {
    question: "How do you handle our data and privacy?",
    answer:
      "We only use the files and tools needed for the project, prefer your own accounts where possible, and keep private company knowledge separate. Nothing is used to train outside models without permission.",
  },
  {
    question: "Do we need an in-house AI team to maintain it?",
    answer:
      "No. The goal is to make AI useful for the team you already have. We keep the setup understandable, add human approval where needed, and document how it works.",
  },
  {
    question: "How do we start?",
    answer:
      "Tell us what work feels slow or messy, what tools you use, and who does the work today. We reply with a simple first plan.",
  },
];

const footerServices = [
  "AI Training for Beginners",
  "AI Assistants",
  "Repetitive Work Automation",
  "Company Knowledge Helper",
  "AI Websites and Simple Tools",
];

const footerNav = [
  ["services", "Services"],
  ["method", "Method"],
  ["work", "Work"],
  ["faq", "FAQ"],
  ["contact", "Start"],
];

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetLandingScroll() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  if (window.history.scrollRestoration) {
    window.history.scrollRestoration = "manual";
  }

  if (window.location.hash) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  scrollToTop();
  window.requestAnimationFrame(scrollToTop);
  window.setTimeout(scrollToTop, 120);
}

function SecondaryButtonIcon() {
  return <span className="secondary-button-icon" aria-hidden="true"></span>;
}

function ReactBitsBackdrop() {
  return (
    <div className="react-bits-backdrop" aria-hidden="true">
      <span className="bits-grid-layer"></span>
      <span className="bits-beam-layer"></span>
      <span className="bits-vignette-layer"></span>
    </div>
  );
}

function SplitFooterWord({ children, className = "" }) {
  return (
    <span className={`footer-split-word ${className}`} aria-hidden="true">
      {[...children].map((char, index) => (
        <span className="footer-split-char" style={{ "--char-index": index }} key={`${children}-${index}-${char}`}>
          {char}
        </span>
      ))}
    </span>
  );
}

function TutorialCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    if (reducedMotion.matches || coarsePointer.matches) {
      return undefined;
    }

    const preview = cursor.querySelector(".tutorial-cursor-preview");
    const previewImage = cursor.querySelector(".tutorial-cursor-preview img");
    const echoes = Array.from(cursor.querySelectorAll(".cursor-echo")).map((dot, index) => ({
      element: dot,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      speed: [0.62, 0.42, 0.26][index] ?? 0.24,
      offsetX: [10, 18, 26][index] ?? 24,
      offsetY: [13, 17, 21][index] ?? 18,
    }));
    const previewState = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      speed: 0.22,
    };

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let frame = 0;

    const animate = () => {
      echoes.forEach((dot) => {
        dot.x += (targetX + dot.offsetX - dot.x) * dot.speed;
        dot.y += (targetY + dot.offsetY - dot.y) * dot.speed;
        dot.element.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`;
      });

      previewState.x += (targetX + 34 - previewState.x) * previewState.speed;
      previewState.y += (targetY + 42 - previewState.y) * previewState.speed;
      if (preview) {
        const rotation = Math.max(-10, Math.min(10, (targetX + 34 - previewState.x) * 0.08));
        preview.style.transform = `translate3d(${previewState.x}px, ${previewState.y}px, 0) rotate(${rotation}deg)`;
      }

      frame = window.requestAnimationFrame(animate);
    };

    const show = () => cursor.classList.add("is-visible");
    const hide = () => cursor.classList.remove("is-visible");
    const clearTarget = () => cursor.classList.remove("is-targeting");

    const setTarget = (target) => {
      const image = target?.dataset.cursorImage;
      if (!image || !previewImage) return;
      if (previewImage.getAttribute("src") !== image) {
        previewImage.setAttribute("src", image);
      }
      cursor.classList.add("is-targeting");
    };

    const handlePointerTravel = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      const shouldSnap = !cursor.classList.contains("is-visible");
      targetX = event.clientX;
      targetY = event.clientY;

      if (shouldSnap) {
        echoes.forEach((dot) => {
          dot.x = targetX + dot.offsetX;
          dot.y = targetY + dot.offsetY;
          dot.element.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`;
        });
        previewState.x = targetX + 34;
        previewState.y = targetY + 42;
      }

      show();

      if (!frame) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    const handlePointerOver = (event) => {
      const target = event.target.closest?.("[data-cursor-image]");
      if (target) setTarget(target);
    };

    const handlePointerOut = (event) => {
      const target = event.target.closest?.("[data-cursor-image]");
      if (target && !target.contains(event.relatedTarget)) clearTarget();
    };

    window.addEventListener("pointermove", handlePointerTravel, { passive: true });
    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerOut);
    document.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      window.removeEventListener("pointermove", handlePointerTravel);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("mouseleave", hide);
      window.removeEventListener("blur", hide);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="tutorial-cursor" ref={cursorRef} aria-hidden="true">
      <figure className="tutorial-cursor-preview">
        <img src="/assets/nano/synqora-hero-nano.webp" alt="" width="760" height="428" />
      </figure>
      <span className="cursor-echo cursor-echo-one"></span>
      <span className="cursor-echo cursor-echo-two"></span>
      <span className="cursor-echo cursor-echo-three"></span>
    </div>
  );
}

export function App() {
  const [activeStage, setActiveStage] = useState(stageServices[0].id);
  const [activeFilter, setActiveFilter] = useState("All");
  const [hoveredService, setHoveredService] = useState(serviceMeta[0].title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [briefStatus, setBriefStatus] = useState("");
  const [selectedBrief, setSelectedBrief] = useState("");

  const activeService = stageServices.find((service) => service.id === activeStage) ?? stageServices[0];

  const filteredServices = useMemo(() => {
    return activeFilter === "All"
      ? serviceMeta
      : serviceMeta.filter((service) => service.tag === activeFilter);
  }, [activeFilter]);

  const previewService =
    filteredServices.find((service) => service.title === hoveredService) ?? filteredServices[0] ?? serviceMeta[0];

  useEffect(() => {
    resetLandingScroll();

    window.addEventListener("hashchange", resetLandingScroll);
    return () => window.removeEventListener("hashchange", resetLandingScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key.toLowerCase() === "e" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        scrollToId("contact");
      }

      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const handleBitsSpotlight = (event) => {
      const target = event.target instanceof Element ? event.target.closest(".bits-spotlight") : null;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      target.style.setProperty("--bits-x", `${event.clientX - rect.left}px`);
      target.style.setProperty("--bits-y", `${event.clientY - rect.top}px`);
    };

    window.addEventListener("pointermove", handleBitsSpotlight, { passive: true });
    return () => window.removeEventListener("pointermove", handleBitsSpotlight);
  }, []);

  const handleBriefSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const slowWork = String(form.get("slowWork") ?? "").trim();

    if (!name || !slowWork) {
      setBriefStatus("Add your name and the work that takes too much time.");
      return;
    }

    setBriefStatus(`Thanks ${name}. Synqora would reply with a simple first plan.`);
    event.currentTarget.reset();
    setSelectedBrief("");
  };

  const handleBriefChoice = (option) => {
    setSelectedBrief(option);
    setBriefStatus(`${option} selected. Add the work details below and send it.`);
  };

  return (
    <main className="site-shell">
      <ReactBitsBackdrop />
      <TutorialCursor />
      <nav className="topbar" aria-label="Main navigation">
        <button className="brand-mark" onClick={() => scrollToId("top")} aria-label="Go to top">
          <img className="brand-logo" src="/assets/brand/synqora-gradient-wordmark.svg" alt="" width="165" height="42" />
          <span className="sr-only">Synqora AI</span>
        </button>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="nav-links"
        >
          <i className="ri-menu-4-line" aria-hidden="true"></i>
        </button>

        <div id="nav-links" className={`nav-links ${menuOpen ? "is-open" : ""}`}>
          <button type="button" onClick={() => { setMenuOpen(false); scrollToId("services"); }}>Services</button>
          <button type="button" onClick={() => { setMenuOpen(false); scrollToId("method"); }}>Method</button>
          <button type="button" onClick={() => { setMenuOpen(false); scrollToId("work"); }}>Work</button>
          <button type="button" onClick={() => { setMenuOpen(false); scrollToId("faq"); }}>FAQ</button>
          <button type="button" className="nav-cta bits-star-border" onClick={() => { setMenuOpen(false); scrollToId("contact"); }}>
            <span>Start</span>
            <span className="cta-glyph" aria-hidden="true">↗</span>
          </button>
        </div>
      </nav>

      <section id="top" className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy hero-simple-grid">
          <div className="hero-main">
            <p className="eyebrow">AI training and tools for non-technical teams</p>
            <h1 id="hero-title">Understand AI. Use it at work. Get useful tools built.</h1>
            <p className="hero-lede">
              Learn what AI can do, then get simple tools built around the work your team already does.
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-action bits-star-border" onClick={() => scrollToId("contact")}>
                <span>Tell us what you need</span>
                <span className="cta-glyph" aria-hidden="true">↗</span>
              </button>
              <button type="button" className="secondary-action" onClick={() => scrollToId("services")}>
                <SecondaryButtonIcon />
                <span>See practical examples</span>
              </button>
            </div>
          </div>

          <div className="hero-visual-card">
            <img
              src="/assets/nano/synqora-hero-nano.webp"
              alt="AI workbench interface preview"
              width="1280"
              height="720"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          <div className="hero-step-grid" aria-label="How Synqora helps">
            {heroSteps.map(([title, copy]) => (
              <div className="hero-step-card" key={title}>
                <span>{title}</span>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ticker-band" aria-label="Synqora service ticker">
        <div>
          <span>AI Assistants</span>
          <span>Repetitive Work Automation</span>
          <span>Company Knowledge Helper</span>
          <span>AI Websites</span>
          <span>Chat Intake</span>
          <span>Beginner Training</span>
        </div>
      </section>

      <nav className="section-tabs shadcn-tabs" aria-label="Synqora sections">
        {sectionTabs.map(([id, label]) => (
          <button type="button" key={id} onClick={() => scrollToId(id)}>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <section
        className="service-stage"
        aria-labelledby="stage-title"
      >
        <div className="section-heading">
          <p className="eyebrow">What can we help with?</p>
          <h2 id="stage-title">
            <span className="stage-title-line">Choose a goal.</span>
            <span className="stage-title-line">See the next step.</span>
          </h2>
        </div>

        <div className="stage-grid">
          {stageServices.map((service) => (
            <button
              key={service.id}
              type="button"
              className={`stage-item bits-spotlight accent-${service.accent} ${
                activeStage === service.id ? "is-active" : ""
              }`}
              onPointerEnter={() => setActiveStage(service.id)}
              onFocus={() => setActiveStage(service.id)}
              onClick={() => setActiveStage(service.id)}
              data-cursor-image={service.image}
            >
              <i className="bits-spotlight-glow" aria-hidden="true"></i>
              <img src={service.image} alt="" aria-hidden="true" width="760" height="428" loading="lazy" decoding="async" />
              <span>{service.title}</span>
              <small>{service.stat}</small>
            </button>
          ))}
        </div>

        <div className={`stage-panel accent-${activeService.accent}`}>
          <span>{activeService.tag}</span>
          <h3>{activeService.title}</h3>
          <p>{activeService.copy}</p>
        </div>
      </section>

      <section id="services" className="content-section" aria-labelledby="services-title">
        <div className="section-heading">
          <p className="eyebrow">AI help for non-technical teams</p>
          <h2 id="services-title">Start with the work people already do.</h2>
        </div>

        <div className="service-tools">
          <div className="service-browser-controls">
            <div className="filter-row shadcn-toggle-group" role="list" aria-label="Service filters">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={activeFilter === filter ? "is-active" : ""}
                  onClick={() => setActiveFilter(filter)}
                >
                  <span>{filter}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="service-index" aria-live="polite">
            <p>Currently showing</p>
            <strong>{previewService.title}</strong>
          </div>
        </div>

        <div className="service-browser">
          <div className="service-card-grid">
            {filteredServices.map((service) => (
              <article
                className={`service-card glass-blog-card bits-spotlight accent-${service.accent}`}
                key={service.title}
                tabIndex="0"
                onPointerEnter={() => setHoveredService(service.title)}
                onFocus={() => setHoveredService(service.title)}
                data-cursor-image={service.visual}
              >
                <i className="bits-spotlight-glow" aria-hidden="true"></i>
                <div className="service-card-media">
                  <img src={service.visual} alt="" aria-hidden="true" width="760" height="428" loading="lazy" decoding="async" />
                </div>

                <div className="service-card-body">
                  <div className="service-card-top">
                    <span className="ui-badge">
                      <i className={service.icon} aria-hidden="true"></i>
                      {service.tag}
                    </span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.copy}</p>

                  <div className="service-card-summary">
                    <div>
                      <span>Problem</span>
                      <p>{service.problem}</p>
                    </div>
                    <div>
                      <span>Result</span>
                      <p>{service.result}</p>
                    </div>
                  </div>

                  <button type="button" className="service-card-action" onClick={() => scrollToId("contact")}>
                    <span>Plan this</span>
                    <span className="cta-glyph" aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className={`service-preview-panel shadcn-popover accent-${previewService.accent}`} aria-live="polite">
            <img src={previewService.visual} alt="" aria-hidden="true" width="760" height="428" loading="lazy" decoding="async" />
            <div>
              <i className={previewService.icon} aria-hidden="true"></i>
              <span>{previewService.tag}</span>
            </div>
            <h3>{previewService.title}</h3>
            <p>{previewService.build}</p>
            <dl>
              <div>
                <dt>Time</dt>
                <dd>{previewService.time}</dd>
              </div>
              <div>
                <dt>You get</dt>
                <dd>{previewService.youGet}</dd>
              </div>
            </dl>
            <button type="button" className="secondary-action" onClick={() => scrollToId("contact")}>
              <SecondaryButtonIcon />
              <span>Plan this</span>
            </button>
          </aside>
        </div>
      </section>

      <section id="method" className="method-section" aria-labelledby="method-title">
        <div className="section-heading">
          <p className="eyebrow">How we work</p>
          <h2 id="method-title">Teach first. Build beside you. Leave the system working.</h2>
        </div>

        <div className="method-spine" aria-hidden="true"></div>
        <div className="method-grid">
          {processSteps.map((step) => (
            <article className="method-step bits-spotlight" key={step.title}>
              <i className="bits-spotlight-glow" aria-hidden="true"></i>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
              <div className="method-output">
                <span>Output</span>
                <b>{step.output}</b>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="work" className="proof-section" aria-labelledby="work-title">
        <div className="proof-copy">
          <p className="eyebrow">Examples</p>
          <h2 id="work-title">Real problems Synqora can turn into simple tools.</h2>
          <p>
            The work usually starts with one messy daily task. We make it easier, teach the team, and leave clear instructions.
          </p>
        </div>

        <div className="proof-grid">
          {proofCards.map((card) => (
            <article className="proof-card glass-blog-card bits-spotlight" key={card.title}>
              <i className="bits-spotlight-glow" aria-hidden="true"></i>
              <div className="proof-card-main">
                <span className="proof-card-meta">{card.meta}</span>
                <h3>{card.title}</h3>
                <div className="proof-comparison">
                  <div>
                    <span>Before</span>
                    <p>{card.before}</p>
                  </div>
                  <div>
                    <span>After</span>
                    <p>{card.after}</p>
                  </div>
                </div>
              </div>
              <div className="proof-card-footer">
                <div>
                  <span>{card.output}</span>
                  <b>{card.speed}</b>
                </div>
                <button type="button" className="proof-card-action" onClick={() => scrollToId("contact")}>
                  <span className="cta-glyph" aria-hidden="true">↗</span>
                  <span>Plan similar</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="faq-section" aria-labelledby="faq-title">
        <div className="faq-copy">
          <p className="eyebrow">Engagements · how it works</p>
          <h2 id="faq-title">Practical questions, answered plainly.</h2>
          <p>
            How the work runs, what you keep, and how training fits with implementation.
          </p>
        </div>

        <div className="faq-list shadcn-accordion">
          {faqs.map((faq, index) => (
            <details className="faq-item" key={faq.question} open={index === 0}>
              <summary>
                <span className="faq-question">{faq.question}</span>
                <i className="ri-add-line faq-icon" aria-hidden="true"></i>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contact" className="contact-section" aria-labelledby="contact-title">
        <div>
          <p className="eyebrow">Start with the work</p>
          <h2 id="contact-title">Tell Synqora what feels slow, repetitive, or unclear.</h2>
          <p>
            You do not need a technical idea. Share the work that takes too long, who handles it now, and the tools your team already uses.
          </p>
        </div>

        <form className="brief-form ai-composer bits-spotlight" onSubmit={handleBriefSubmit}>
          <i className="bits-spotlight-glow" aria-hidden="true"></i>
          <div className="composer-head">
            <div>
              <span>Tell us what you need</span>
              <b>{selectedBrief || "New request"}</b>
            </div>
            <i className="ri-sparkling-2-line" aria-hidden="true"></i>
          </div>

          <div className="brief-options selector-chips" role="group" aria-label="Quick choices">
            {briefOptions.map((option) => (
              <button
                type="button"
                className={`brief-choice ${selectedBrief === option ? "is-selected" : ""}`}
                key={option}
                onClick={() => handleBriefChoice(option)}
              >
                <span>{option}</span>
                <i className={selectedBrief === option ? "ri-check-line" : "ri-add-line"} aria-hidden="true"></i>
              </button>
            ))}
          </div>

          <input type="hidden" name="quickBrief" value={selectedBrief} />

          <label className="composer-field">
            <span>Name</span>
            <input name="name" type="text" placeholder="Your name" />
          </label>

          <label className="composer-field composer-prompt">
            <span>What work takes too much time?</span>
            <textarea name="slowWork" rows="4" placeholder="Example: replying to enquiries, preparing weekly reports, finding answers in documents, collecting booking details..." />
          </label>

          <div className="composer-field-grid">
            <label className="composer-field">
              <span>Who does this work now?</span>
              <input name="owner" type="text" placeholder="Founder, admin, sales..." />
            </label>

            <label className="composer-field">
              <span>What tools do you already use?</span>
              <input name="tools" type="text" placeholder="WhatsApp, Gmail, Sheets..." />
            </label>
          </div>

          <div className="composer-toolbar">
            <label>
              <span>What do you want first?</span>
              <select name="fit" defaultValue="Teach us what to use">
                <option>Teach us what to use</option>
                <option>Build a helpful assistant</option>
                <option>Automate repeated work</option>
                <option>Improve our website</option>
                <option>Help us find answers in files</option>
              </select>
            </label>

            <button type="submit" className="composer-send bits-star-border" aria-label="Send request">
              <span>Send request</span>
              <span className="cta-glyph" aria-hidden="true">↑</span>
            </button>
          </div>

          <p className="brief-status" role="status">{briefStatus}</p>
        </form>
      </section>

      <footer className="site-footer split-footer" aria-labelledby="footer-title">
        <div className="footer-poster" aria-label="Synqora footer poster">
          <figure className="footer-poster-bg" aria-hidden="true">
            <img src="/assets/nano/synqora-hero-nano.webp" alt="" width="1280" height="720" loading="lazy" decoding="async" />
          </figure>
          <div className="footer-poster-meta" aria-hidden="true">
            <span>Details</span>
            <span>Structure</span>
            <span>Clarity</span>
          </div>
          <p className="footer-poster-caption">AI training and tools for teams who want the work to feel lighter.</p>
          <h2 id="footer-title" className="footer-split-title" aria-label="Learn, build, use.">
            <SplitFooterWord className="footer-split-learn">Learn</SplitFooterWord>
            <span className="footer-poster-line"></span>
            <SplitFooterWord className="footer-split-build">Build</SplitFooterWord>
            <span className="footer-poster-line"></span>
            <SplitFooterWord className="footer-split-use">Use</SplitFooterWord>
          </h2>
          <p className="footer-poster-note">Understand AI, use it at work, and launch simple tools your team can actually operate.</p>
        </div>

        <div className="footer-panel">
          <div className="footer-brand">
            <button className="brand-mark" onClick={() => scrollToId("top")} aria-label="Go to top">
              <img className="brand-logo" src="/assets/brand/synqora-gradient-wordmark.svg" alt="" width="165" height="42" />
              <span className="sr-only">Synqora AI</span>
            </button>
            <p>Plain-English AI training and practical builds for non-technical teams.</p>
          </div>

          <div className="footer-link-grid">
          <nav className="footer-col" aria-label="Footer navigation">
            <span className="footer-label">Navigate</span>
            {footerNav.map(([id, label]) => (
              <button type="button" key={id} onClick={() => scrollToId(id)}>
                {label}
              </button>
            ))}
          </nav>

          <div className="footer-col">
            <span className="footer-label">Services</span>
            {footerServices.map((service) => (
              <p key={service}>{service}</p>
            ))}
          </div>

          <div className="footer-col footer-contact">
            <span className="footer-label">Start the work</span>
            <button type="button" className="primary-action bits-star-border" onClick={() => scrollToId("contact")}>
              <span>Tell us what you need</span>
              <span className="cta-glyph" aria-hidden="true">↗</span>
            </button>
            <a href="mailto:hello@synqora.ai">hello@synqora.ai</a>
          </div>
          </div>
        </div>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} Synqora AI · AI training and practical tools</span>
          <span>Built for people who want AI to feel clear, useful, and manageable.</span>
        </div>
      </footer>
    </main>
  );
}
