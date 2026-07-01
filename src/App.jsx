import { lazy, Suspense, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

const CONTACT_EMAIL = "info@synqora.tech";
const CONTACT_EMAIL_HREF = "mailto:info@synqora.tech";
const serviceFocusItems = ["Websites", "AI tools", "Automation"];
const workProjects = [
  {
    id: "work-exkitchens",
    label: "ExKitchens",
    eyebrow: "Selected work",
    title: "ExKitchens",
    copy: "A premium marketplace for ex-display kitchens, built around trust, product discovery, and upfront savings.",
    note: "Luxury marketplace. Product listings. Sustainability story.",
    url: "https://www.exkitchens.com",
    image: "/images/work/exkitchens-desktop.jpg",
    imageAlt: "ExKitchens live website preview",
    kind: "work",
    tone: "work",
    align: "left",
  },
  {
    id: "work-holditdown",
    label: "Hold It Down",
    eyebrow: "Selected work",
    title: "Hold It Down",
    copy: "A community organisation site for programmes, events, donations, impact, and a clear public mission.",
    note: "CIC website. Programmes. Events. Donation flow.",
    url: "https://www.holditdown.uk",
    image: "/images/work/holditdown-desktop.jpg",
    imageAlt: "Hold It Down live website preview",
    kind: "work",
    tone: "workAlt",
    align: "right",
  },
];

const LazyShaderGradientCanvas = lazy(() => (
  import("@shadergradient/react").then((module) => ({ default: module.ShaderGradientCanvas }))
));

const LazyShaderGradient = lazy(() => (
  import("@shadergradient/react").then((module) => ({ default: module.ShaderGradient }))
));

const textScreens = [
  {
    id: "hero",
    label: "Start",
    eyebrow: "Synqora AI agency",
    title: "Websites and AI systems.",
    copy: "Bring us the messy problem. We'll turn it into a website, AI tool, or workflow people can use.",
    cta: "Start a build",
    tone: "hero",
    align: "center",
  },
  {
    id: "services",
    label: "Services",
    eyebrow: "Services",
    title: "Build the digital system your business needs next.",
    copy: "Websites, AI assistants, automations, internal tools, lead flows, and knowledge systems designed around real business work.",
    note: "Web presence, AI workflows, and business tools.",
    tone: "services",
    align: "right",
  },
  {
    id: "method",
    label: "Method",
    eyebrow: "Method",
    title: "Clear strategy. Fast build. Practical handoff.",
    copy: "We understand the goal, shape the simplest useful solution, build it properly, and leave you with a system your team can run.",
    note: "Discovery, design, build, launch.",
    tone: "method",
    align: "left",
  },
  ...workProjects,
  {
    id: "answers",
    label: "Answers",
    eyebrow: "Plain ownership",
    title: "Built with taste, clarity, and ownership.",
    copy: "You know what is being built, how it works, what it costs, what data it uses, and how it can grow after launch.",
    note: "Premium work without vague tech theatre.",
    tone: "answers",
    align: "left",
  },
  {
    id: "contact",
    label: "Contact",
    eyebrow: "Start a build",
    title: "Tell us what you want to build.",
    copy: "Send the website, workflow, or AI idea you have in mind. We will suggest the clearest path to a useful first version.",
    tone: "contact",
    align: "right",
  },
];
const storyScreens = textScreens.filter((screen) => screen.id !== "contact");
const contactScreen = textScreens.find((screen) => screen.id === "contact");

function EmailLink() {
  return (
    <a className="email-link" href={CONTACT_EMAIL_HREF}>
      {CONTACT_EMAIL}
    </a>
  );
}

function ContactForm() {
  return (
    <form
      className="contact-form"
      action={CONTACT_EMAIL_HREF}
      method="post"
      encType="text/plain"
      aria-label="Start a Synqora build"
    >
      <div className="contact-field-row">
        <label className="contact-field">
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" placeholder="Your name" />
        </label>
        <label className="contact-field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" placeholder="you@company.com" />
        </label>
      </div>

      <label className="contact-field mobile-optional-field">
        <span>Project type</span>
        <select name="project">
          <option>Website</option>
          <option>AI assistant</option>
          <option>Automation</option>
          <option>Internal tool</option>
        </select>
      </label>

      <div className="contact-field-row">
        <label className="contact-field mobile-optional-field">
          <span>Budget</span>
          <input name="budget" type="text" inputMode="text" placeholder="Your range" />
        </label>
        <label className="contact-field mobile-optional-field">
          <span>Timeline</span>
          <input name="timeline" type="text" placeholder="When should it launch?" />
        </label>
      </div>

      <label className="contact-field">
        <span>What should we build?</span>
        <textarea
          name="message"
          rows="4"
          placeholder="A short note about the website, workflow, AI idea, or tool you have in mind."
        />
      </label>

      <button className="contact-submit" type="submit">
        Send enquiry
      </button>
      <p className="contact-trust">We reply within 24 hours with the clearest first build path.</p>
    </form>
  );
}

function ScreenCta({ children }) {
  return (
    <a className="screen-cta" href="#contact">
      {children}
    </a>
  );
}

function SelectedWorkPreview({ project }) {
  return (
    <a
      className="selected-work-preview"
      href={project.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Visit ${project.title}`}
    >
      <img
        className="selected-work-image"
        src={project.image}
        alt={project.imageAlt}
        loading="lazy"
        decoding="async"
      />
    </a>
  );
}

function useElementVisibility(targetRef, { rootMargin = "0px", threshold = 0.72 } = {}) {
  const visibilityStore = useMemo(() => {
    let visible = true;

    return {
      getSnapshot: () => visible,
      subscribe: (notify) => {
        const element = targetRef.current;
        if (!element || typeof IntersectionObserver === "undefined") return () => {};

        const observer = new IntersectionObserver(
          ([entry]) => {
            const nextVisible = entry.isIntersecting;
            if (visible === nextVisible) return;
            visible = nextVisible;
            notify();
          },
          { rootMargin, threshold },
        );

        observer.observe(element);
        return () => observer.disconnect();
      },
    };
  }, [rootMargin, targetRef, threshold]);

  return useSyncExternalStore(
    visibilityStore.subscribe,
    visibilityStore.getSnapshot,
    () => true,
  );
}

function useMediaQuery(query, serverSnapshot = false) {
  return useSyncExternalStore(
    (notify) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return () => {};
      }

      const media = window.matchMedia(query);
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", notify);
        return () => media.removeEventListener("change", notify);
      }

      media.addListener(notify);
      return () => media.removeListener(notify);
    },
    () => (
      typeof window !== "undefined"
      && typeof window.matchMedia === "function"
      && window.matchMedia(query).matches
    ),
    () => serverSnapshot,
  );
}

function HeroShaderGradient() {
  const shaderRef = useRef(null);
  const shaderActive = useElementVisibility(shaderRef);
  const allowWebGL = useMediaQuery("(min-width: 761px)");
  const renderShader = allowWebGL && shaderActive;

  return (
    <div className="hero-shader-backdrop" aria-hidden="true" ref={shaderRef}>
      <div className="hero-shader-fallback" />
      {renderShader ? (
        <Suspense fallback={null}>
          <LazyShaderGradientCanvas
            className="hero-shader-canvas"
            fov={45}
            lazyLoad
            pixelDensity={1}
            pointerEvents="none"
            powerPreference="high-performance"
            preserveDrawingBuffer={false}
            rootMargin="240px"
          >
            <LazyShaderGradient
              animate="on"
              axesHelper="off"
              brightness={1.2}
              cAzimuthAngle={180}
              cDistance={3.6}
              cPolarAngle={90}
              cameraZoom={1}
              color1="#ff5005"
              color2="#dbba95"
              color3="#d0bce1"
              control="props"
              destination="onCanvas"
              embedMode="off"
              envPreset="city"
              format="gif"
              frameRate={10}
              gizmoHelper="hide"
              grain="off"
              lightType="3d"
              positionX={-1.4}
              positionY={0}
              positionZ={0}
              range="disabled"
              rangeEnd={40}
              rangeStart={0}
              reflection={0.1}
              rotationX={0}
              rotationY={10}
              rotationZ={50}
              shader="defaults"
              type="plane"
              uAmplitude={1}
              uDensity={1.3}
              uFrequency={5.5}
              uSpeed={0.4}
              uStrength={4}
              uTime={0}
              wireframe={false}
            />
          </LazyShaderGradientCanvas>
        </Suspense>
      ) : null}
      <div className="hero-shader-tint" />
    </div>
  );
}

function DepthMotionField({ align, tone }) {
  return (
    <div className="depth-motion-field" data-depth-align={align} data-depth-tone={tone} aria-hidden="true">
      <div className="depth-motion-orbit">
        <span className="depth-motion-plane depth-motion-plane-primary" />
        <span className="depth-motion-plane depth-motion-plane-secondary" />
        <span className="depth-motion-plane depth-motion-plane-tertiary" />
        <span className="depth-motion-node depth-motion-node-one" />
        <span className="depth-motion-node depth-motion-node-two" />
      </div>
      <div className="depth-thread-field">
        <span className="depth-thread-line depth-thread-line-one" />
        <span className="depth-thread-line depth-thread-line-two" />
        <span className="depth-thread-line depth-thread-line-three" />
        <span className="depth-thread-line depth-thread-line-four" />
      </div>
    </div>
  );
}

function DepthStageController() {
  useEffect(() => {
    const root = document.documentElement;
    const stage = document.querySelector(".depth-scroll-stage");
    const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia?.("(min-width: 761px)");
    const panels = [...document.querySelectorAll(".depth-scroll-stage .text-screen")];
    const fields = [];
    for (const panel of panels) {
      const field = panel.querySelector(".depth-motion-field");
      if (field) {
        fields.push({
          align: panel.getAttribute("data-align") ?? "center",
          field,
        });
      }
    }

    if (!stage || panels.length === 0 || fields.length === 0) return undefined;

    let frame = 0;
    let enabled = false;
    let mobileEnabled = false;
    let viewportHeight = Math.max(window.innerHeight, 1);
    let stageTop = stage.offsetTop;
    let stageTravel = Math.max(stage.offsetHeight - viewportHeight, 1);
    let targetProgress = 0;
    let currentProgress = 0;
    let previousProgress = 0;
    let velocity = 0;

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const lerp = (from, to, amount) => from + (to - from) * amount;
    const prefersReducedMotion = () => reducedMotionQuery?.matches ?? false;
    const prefersDesktopDepth = () => desktopQuery?.matches ?? true;

    const clearFieldStyles = () => {
      fields.forEach(({ field }) => {
        field.removeAttribute("style");
      });
    };

    const clearPanelStyles = () => {
      panels.forEach((panel) => {
        panel.removeAttribute("style");
        panel.removeAttribute("inert");
        panel.querySelectorAll(".screen-copy, .selected-work-preview").forEach((element) => {
          element.removeAttribute("style");
        });
      });
    };

    const collectStageGeometry = () => {
      viewportHeight = Math.max(window.innerHeight, 1);
      stageTop = stage.offsetTop;
      stageTravel = Math.max(stage.offsetHeight - viewportHeight, 1);
    };

    const getProgressFromScroll = () => (
      clamp((window.scrollY - stageTop) / stageTravel, 0, 1) * (panels.length - 1)
    );

    const clearStageStyles = () => {
      clearPanelStyles();
      clearFieldStyles();
    };

    const setEnabledState = () => {
      enabled = prefersDesktopDepth() && !prefersReducedMotion();
      mobileEnabled = !prefersDesktopDepth() && !prefersReducedMotion();
      root.setAttribute("data-depth-stage", enabled ? "active" : mobileEnabled ? "mobile" : "native");
      collectStageGeometry();

      if (!enabled && !mobileEnabled) {
        clearStageStyles();
        return;
      }

      if (mobileEnabled) {
        clearPanelStyles();
        scheduleFrame();
        return;
      }

      targetProgress = getProgressFromScroll();
      currentProgress = targetProgress;
      previousProgress = currentProgress;
      velocity = 0;
      scheduleFrame();
    };

    const render = () => {
      frame = 0;

      if (!enabled && !mobileEnabled) return;

      if (mobileEnabled) {
        viewportHeight = Math.max(window.innerHeight, 1);

        fields.forEach(({ field }, index) => {
          const panel = panels[index];
          const rect = panel.getBoundingClientRect();
          const centerOffset = ((rect.top + rect.bottom) / 2 - viewportHeight / 2) / viewportHeight;
          const progress = clamp(centerOffset, -1, 1);
          const presence = clamp(1 - Math.abs(progress) * 1.25, 0, 1);
          const x = clamp(progress * -42, -44, 44);
          const y = clamp(progress * 34, -36, 36);
          const rotate = clamp(progress * -4, -4, 4);
          const scale = 0.96 + presence * 0.08;
          const opacity = 0.34 + presence * 0.42;

          field.style.cssText = [
            `transform: translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotateX(58deg) rotateZ(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
            `opacity: ${opacity.toFixed(3)}`,
          ].join("; ");

          panel.querySelectorAll(".screen-copy, .selected-work-preview").forEach((element) => {
            const contentY = clamp(progress * -18, -20, 20);
            const contentOpacity = 0.78 + presence * 0.22;

            element.style.cssText = [
              `opacity: ${contentOpacity.toFixed(3)}`,
              `transform: translate3d(0, ${contentY.toFixed(1)}px, 0)`,
            ].join("; ");
          });
        });

        return;
      }

      targetProgress = getProgressFromScroll();
      currentProgress = lerp(currentProgress, targetProgress, 0.42);
      velocity = lerp(velocity, currentProgress - previousProgress, 0.18);
      previousProgress = currentProgress;

      const normalizedVelocity = clamp(velocity, -0.9, 0.9);

      panels.forEach((panel, index) => {
        const distance = index - currentProgress;
        const absDistance = Math.abs(distance);
        const presence = clamp(1 - absDistance * 1.68, 0, 1);
        const panelOpacity = clamp(1 - absDistance * 0.72, 0, 1);
        const contentOpacity = clamp(presence * presence, 0, 1);
        const contentY = clamp(distance * 22 + normalizedVelocity * -12, -34, 34);

        panel.style.cssText = [
          "transform: translate3d(0, 0, 0)",
          `opacity: ${panelOpacity.toFixed(3)}`,
          `pointer-events: ${absDistance < 0.5 ? "auto" : "none"}`,
          `visibility: ${panelOpacity > 0.04 ? "visible" : "hidden"}`,
          `z-index: ${Math.round((1 - absDistance) * 100)}`,
        ].join("; ");
        panel.toggleAttribute("inert", absDistance >= 0.56);

        panel.querySelectorAll(".screen-copy, .selected-work-preview").forEach((element) => {
          const transform = element.classList.contains("selected-work-preview")
            ? `translateY(calc(-50% + ${contentY.toFixed(1)}px))`
            : `translate3d(0, ${contentY.toFixed(1)}px, 0)`;

          element.style.cssText = [
            `opacity: ${contentOpacity.toFixed(3)}`,
            `transform: ${transform}`,
          ].join("; ");
        });
      });

      fields.forEach(({ align, field }, index) => {
        const distance = index - currentProgress;
        const absDistance = Math.abs(distance);
        const presence = clamp(1 - absDistance * 0.54, 0, 1);
        const side = align === "right" ? -1 : align === "left" ? 1 : 0.25;
        const x = clamp((distance * -142 + normalizedVelocity * 118) * side, -168, 168);
        const y = clamp(distance * -86 + normalizedVelocity * -62, -128, 128);
        const rotate = clamp(distance * 9 + normalizedVelocity * 16, -16, 16);
        const scale = 0.94 + presence * 0.09;
        const opacity = 0.32 + presence * 0.6;

        field.style.cssText = [
          `transform: translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotateX(58deg) rotateZ(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
          `opacity: ${opacity.toFixed(3)}`,
        ].join("; ");
      });

      if (Math.abs(targetProgress - currentProgress) > 0.002 || Math.abs(velocity) > 0.002) {
        scheduleFrame();
      }
    };

    const scheduleFrame = () => {
      if (frame || (!enabled && !mobileEnabled)) return;
      frame = window.requestAnimationFrame(render);
    };

    const handleScroll = () => {
      targetProgress = getProgressFromScroll();
      scheduleFrame();
    };

    const handleResize = () => {
      collectStageGeometry();
      handleScroll();
    };

    setEnabledState();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    reducedMotionQuery?.addEventListener?.("change", setEnabledState);
    desktopQuery?.addEventListener?.("change", setEnabledState);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      reducedMotionQuery?.removeEventListener?.("change", setEnabledState);
      desktopQuery?.removeEventListener?.("change", setEnabledState);
      root.removeAttribute("data-depth-stage");
      clearStageStyles();
    };
  }, []);

  return null;
}

function TextScreen({ screen, index }) {
  const titleId = `${screen.id}-title`;
  const Heading = index === 0 ? "h1" : "h2";

  return (
    <section
      className={`text-screen screen-gradient screen-gradient-${screen.tone}`}
      data-align={screen.align}
      data-screen-kind={screen.kind}
      id={screen.id}
      aria-labelledby={titleId}
    >
      {index === 0 ? <HeroShaderGradient /> : null}
      <DepthMotionField align={screen.align} tone={screen.tone} />
      <div className="screen-ambient" aria-hidden="true" />
      {screen.id === "contact" ? <ContactForm /> : null}
      {screen.kind === "work" ? <SelectedWorkPreview project={screen} /> : null}
      <div className="screen-copy">
        <p className="screen-eyebrow">{screen.eyebrow}</p>
        <Heading className="screen-title" id={titleId}>
          {screen.title}
        </Heading>
        <p className="screen-copy-line">{screen.copy}</p>
        {screen.id === "services" ? (
          <ul className="service-focus-list" aria-label="Synqora service focus">
            {serviceFocusItems.map((item) => (
              <li className="service-focus-item" key={item}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        {screen.note ? (
          <p className="screen-note">{screen.note === CONTACT_EMAIL ? <EmailLink /> : screen.note}</p>
        ) : null}
        {screen.kind === "work" ? (
          <a className="selected-work-link" href={screen.url} target="_blank" rel="noreferrer">
            Visit live site
          </a>
        ) : null}
        {screen.cta ? <ScreenCta>{screen.cta}</ScreenCta> : null}
      </div>
    </section>
  );
}

function CrowdCanvas({ src = "/images/peeps/all-peeps.png", rows = 15, cols = 7 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    const stage = { width: 0, height: 0, dpr: 1 };
    const sprite = new Image();
    const peeps = [];
    const frameRef = { current: 0 };
    const visibleRef = { current: true };
    let disposed = false;
    let spriteReady = false;
    let lastTime = 0;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const colors = ["#111316", "#ff5005", "#7d5ee6", "#16a6b7", "#f4c65f", "#d75982"];

    const randomRange = (min, max) => min + Math.random() * (max - min);
    const easeIn = (value) => value * value;

    const resetPeep = (peep, distribute = false) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const displayWidth = peep.width * peep.displayScale;
      const displayHeight = peep.height * peep.displayScale;
      const offsetY = 12 + 54 * easeIn(Math.random());

      peep.scaleX = direction;
      peep.speed = randomRange(70, 160) * direction;
      peep.y = stage.height - displayHeight + offsetY;
      peep.anchorY = peep.y + displayHeight;
      peep.x = distribute
        ? randomRange(-displayWidth, stage.width + displayWidth)
        : direction > 0
          ? -displayWidth
          : stage.width + displayWidth;
      peep.phase = randomRange(0, Math.PI * 2);
    };

    const createPeeps = () => {
      peeps.length = 0;
      const total = rows * cols;
      const rectWidth = spriteReady ? sprite.naturalWidth / rows : 44;
      const rectHeight = spriteReady ? sprite.naturalHeight / cols : 82;

      for (let index = 0; index < total; index += 1) {
        const peep = spriteReady
          ? {
            image: sprite,
            rect: [
              (index % rows) * rectWidth,
              Math.floor(index / rows) * rectHeight,
              rectWidth,
              rectHeight,
            ],
            width: rectWidth,
            height: rectHeight,
            displayScale: randomRange(0.34, 0.56),
          }
          : {
            fallback: true,
            width: 44,
            height: 82,
            displayScale: randomRange(0.72, 1.12),
            fill: colors[Math.floor(randomRange(0, colors.length))],
            detail: colors[Math.floor(randomRange(0, colors.length))],
            radius: randomRange(5, 9),
          };

        resetPeep(peep, true);
        peeps.push(peep);
      }
    };

    const drawFallbackPeep = (peep, time) => {
      const bob = Math.sin(time * 0.007 + peep.phase) * 5;
      const headY = -peep.height + peep.radius * 1.4;

      context.save();
      context.translate(peep.x, peep.y + peep.height + bob);
      context.scale(peep.scaleX * peep.displayScale, peep.displayScale);
      context.lineCap = "round";
      context.lineJoin = "round";

      context.fillStyle = peep.fill;
      context.beginPath();
      context.roundRect(-peep.width / 2, -peep.height * 0.72, peep.width, peep.height * 0.62, peep.width * 0.42);
      context.fill();

      context.strokeStyle = peep.fill;
      context.lineWidth = Math.max(3, peep.width * 0.16);
      context.beginPath();
      context.moveTo(-peep.width * 0.24, -peep.height * 0.12);
      context.lineTo(-peep.width * 0.34, 0);
      context.moveTo(peep.width * 0.2, -peep.height * 0.12);
      context.lineTo(peep.width * 0.34, 0);
      context.stroke();

      context.fillStyle = "#f5d0ba";
      context.beginPath();
      context.arc(0, headY, peep.radius, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = peep.detail;
      context.beginPath();
      context.arc(-peep.radius * 0.12, headY - peep.radius * 0.72, peep.radius * 0.92, Math.PI, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const drawSpritePeep = (peep, time) => {
      const bob = Math.sin(time * 0.007 + peep.phase) * 6;

      context.save();
      context.translate(peep.x, peep.y + bob);
      context.scale(peep.scaleX * peep.displayScale, peep.displayScale);
      context.drawImage(
        peep.image,
        peep.rect[0],
        peep.rect[1],
        peep.rect[2],
        peep.rect[3],
        0,
        0,
        peep.width,
        peep.height,
      );
      context.restore();
    };

    const paint = (time = 0, advance = true, delta = 16) => {
      context.setTransform(stage.dpr, 0, 0, stage.dpr, 0, 0);
      context.clearRect(0, 0, stage.width, stage.height);
      context.imageSmoothingEnabled = true;
      peeps.sort((a, b) => a.anchorY - b.anchorY);

      for (const peep of peeps) {
        if (advance && !reducedMotion?.matches) {
          const displayWidth = peep.width * peep.displayScale;
          peep.x += peep.speed * (delta / 1000);
          if (peep.speed > 0 && peep.x > stage.width + displayWidth) resetPeep(peep);
          if (peep.speed < 0 && peep.x < -displayWidth) resetPeep(peep);
        }

        if (peep.fallback) drawFallbackPeep(peep, time);
        else drawSpritePeep(peep, time);
      }
    };

    const tick = (time) => {
      if (!visibleRef.current || reducedMotion?.matches) {
        frameRef.current = 0;
        paint(time, false);
        return;
      }
      const delta = lastTime ? Math.min(48, time - lastTime) : 16;
      lastTime = time;
      paint(time, true, delta);
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (frameRef.current || reducedMotion?.matches) {
        paint(performance.now(), false);
        return;
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!frameRef.current) return;
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };

    const resize = () => {
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      stage.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(stage.width * stage.dpr));
      canvas.height = Math.max(1, Math.round(stage.height * stage.dpr));
      if (spriteReady || peeps.length > 0) createPeeps();
      paint(performance.now(), false);
      start();
    };

    const visibilityObserver = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
        ([entry]) => {
          visibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) start();
          else stop();
        },
        { rootMargin: "180px 0px", threshold: 0.01 },
      );

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    resizeObserver?.observe(canvas);
    visibilityObserver?.observe(canvas);
    resize();

    sprite.onload = () => {
      if (disposed) return;
      spriteReady = true;
      createPeeps();
      paint(performance.now(), false);
      start();
    };
    sprite.onerror = () => {
      if (disposed) return;
      spriteReady = false;
      createPeeps();
      paint(performance.now(), false);
      start();
    };
    sprite.decoding = "async";
    sprite.src = src;

    return () => {
      disposed = true;
      stop();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
    };
  }, [cols, rows, src]);

  return <canvas className="crowd-canvas" data-crowd-source={src} ref={canvasRef} />;
}

function CrowdFooter() {
  return (
    <footer className="site-crowd-footer" aria-labelledby="crowd-footer-title">
      <div className="crowd-footer-copy">
        <h2 className="crowd-footer-title" id="crowd-footer-title">
          <span>Stay</span>
          <span>extraordinary.</span>
          <span>Don't be</span>
          <span>the same.</span>
        </h2>
      </div>
      <div className="crowd-canvas-wrap" aria-hidden="true">
        <CrowdCanvas src="/images/peeps/all-peeps.png" rows={15} cols={7} />
      </div>
      <p className="crowd-footer-email">
        <EmailLink />
      </p>
    </footer>
  );
}

export function App() {
  return (
    <div className="site-shell">
      <DepthStageController />
      <header className="site-header">
        <p className="wordmark">Synqora</p>
      </header>

      <main>
        <div className="depth-scroll-stage" aria-label="Synqora story">
          <div className="depth-scroll-sticky">
            {storyScreens.map((screen, index) => (
              <TextScreen screen={screen} index={index} key={screen.id} />
            ))}
          </div>
        </div>
        {contactScreen ? (
          <TextScreen screen={contactScreen} index={textScreens.indexOf(contactScreen)} />
        ) : null}
      </main>
      <CrowdFooter />
    </div>
  );
}
