import { lazy, Suspense, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

const CONTACT_EMAIL = "info@synqora.tech";
const CONTACT_EMAIL_HREF = "mailto:info@synqora.tech";

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
    copy: "Founder-led builds from idea to launch.",
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
  {
    id: "examples",
    label: "Examples",
    eyebrow: "Examples",
    title: "From idea to working product.",
    copy: "A better website, a smarter enquiry flow, an AI assistant for your team, a private knowledge tool, or an automation that removes repeated work.",
    note: "Sharper presence. Smarter operations.",
    tone: "examples",
    align: "right",
  },
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

      <label className="contact-field">
        <span>Project type</span>
        <select name="project">
          <option>Website</option>
          <option>AI assistant</option>
          <option>Automation</option>
          <option>Internal tool</option>
        </select>
      </label>

      <div className="contact-field-row">
        <label className="contact-field">
          <span>Budget</span>
          <input name="budget" type="text" inputMode="text" placeholder="Your range" />
        </label>
        <label className="contact-field">
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
    </form>
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

function HeroShaderGradient() {
  const shaderRef = useRef(null);
  const shaderActive = useElementVisibility(shaderRef);

  return (
    <div className="hero-shader-backdrop" aria-hidden="true" ref={shaderRef}>
      <div className="hero-shader-fallback" />
      {shaderActive ? (
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
              animate={shaderActive ? "on" : "off"}
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
    </div>
  );
}

function DepthScrollController({ panelCount }) {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const panels = [...document.querySelectorAll(".text-screen")];
    const maxDepthIndex = Math.max(panelCount - 1, 1);
    let frame = 0;
    let viewportHeight = Math.max(window.innerHeight, 1);
    let scrollTarget = Math.min(maxDepthIndex, Math.max(0, window.scrollY / viewportHeight));
    let scrollCurrent = scrollTarget;
    let previousScrollCurrent = scrollCurrent;
    let velocity = 0;
    const scrollSmoothing = reducedMotion ? 1 : 0.12;
    const velocityDamping = 0.12;
    const velocityMax = 1.5;
    const nativeScrollIntoView = Element.prototype.scrollIntoView;
    const rootStyleCache = new Map();
    const panelStyleCaches = panels.map(() => new Map());

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const lerp = (from, to, amount) => from + (to - from) * amount;
    const readScrollBehavior = (options) => {
      if (options && typeof options === "object" && "behavior" in options) {
        return options.behavior === "instant" ? "auto" : options.behavior;
      }

      return "auto";
    };
    const setCachedProperty = (style, cache, name, value) => {
      if (cache.get(name) === value) return;
      cache.set(name, value);
      style.setProperty(name, value);
    };

    const setScrollVariables = ({
      progress = 0,
      velocity = 0,
    } = {}) => {
      const clampedProgress = Math.max(0, Math.min(1, progress));
      const clampedVelocity = Math.max(-2.2, Math.min(2.2, velocity));
      const intensity = Math.min(1, Math.abs(clampedVelocity) * 0.26);

      setCachedProperty(root.style, rootStyleCache, "--scroll-progress", clampedProgress.toFixed(3));
      setCachedProperty(root.style, rootStyleCache, "--scroll-velocity", clampedVelocity.toFixed(3));
      setCachedProperty(root.style, rootStyleCache, "--scroll-intensity", intensity.toFixed(3));
      setCachedProperty(root.style, rootStyleCache, "--scroll-drift-x", `${(clampedVelocity * 10).toFixed(1)}px`);
      setCachedProperty(root.style, rootStyleCache, "--scroll-drift-y", `${(clampedVelocity * -16).toFixed(1)}px`);
      setCachedProperty(root.style, rootStyleCache, "--depth-scroll-target", scrollTarget.toFixed(3));
      setCachedProperty(root.style, rootStyleCache, "--depth-scroll-current", scrollCurrent.toFixed(3));
      setCachedProperty(root.style, rootStyleCache, "--depth-active-index", String(Math.round(clamp(scrollTarget, 0, maxDepthIndex))));
    };

    const setPanelVariables = () => {
      const velocityIntensity = Math.min(1, Math.abs(velocity) / velocityMax);
      const activeIndex = Math.round(clamp(scrollTarget, 0, maxDepthIndex));

      panels.forEach((panel, index) => {
        const distance = index - scrollCurrent;
        const absDistance = Math.min(2, Math.abs(distance));
        const isRenderable = Math.abs(index - activeIndex) <= 1 || absDistance < 1.35;
        const cache = panelStyleCaches[index];
        const style = panel.style;

        if (!isRenderable) {
          const parkedDistance = index < scrollCurrent ? "-2.000" : "2.000";
          const parkedY = index < scrollCurrent ? "-96px" : "96px";

          setCachedProperty(style, cache, "--screen-distance", parkedDistance);
          setCachedProperty(style, cache, "--screen-copy-opacity", "0");
          setCachedProperty(style, cache, "--screen-copy-y", parkedY);
          setCachedProperty(style, cache, "--screen-copy-scale", "0.870");
          setCachedProperty(style, cache, "--screen-depth-z", "-360px");
          setCachedProperty(style, cache, "--screen-gradient-opacity", "0.180");
          setCachedProperty(style, cache, "--screen-ambient-opacity", "0.220");
          setCachedProperty(style, cache, "--depth-field-opacity", "0.100");
          setCachedProperty(style, cache, "--depth-field-y", parkedY);
          setCachedProperty(style, cache, "--screen-layer", String(70 + index));
          return;
        }

        const closeDistance = Math.min(1, absDistance);
        const presence = clamp(1 - closeDistance * 0.9, 0, 1);
        const copyOpacity = clamp(1 - Math.max(0, absDistance - 0.08) * 1.28, 0, 1);
        const depthScale = 1 - Math.min(absDistance * 0.065, 0.13);
        const copyY = distance * 46 - velocity * 112;
        const depthZ = -absDistance * 190;
        const layer = 100 + panels.length - Math.round(absDistance * 16);

        setCachedProperty(style, cache, "--screen-distance", distance.toFixed(3));
        setCachedProperty(style, cache, "--screen-copy-opacity", copyOpacity.toFixed(3));
        setCachedProperty(style, cache, "--screen-copy-y", `${copyY.toFixed(1)}px`);
        setCachedProperty(style, cache, "--screen-copy-scale", depthScale.toFixed(3));
        setCachedProperty(style, cache, "--screen-depth-z", `${depthZ.toFixed(1)}px`);
        setCachedProperty(style, cache, "--screen-layer", String(layer));
        setCachedProperty(style, cache, "--screen-gradient-opacity", (0.28 + presence * 0.2 + velocityIntensity * 0.08).toFixed(3));
        setCachedProperty(style, cache, "--screen-ambient-opacity", (0.32 + presence * 0.24).toFixed(3));
        setCachedProperty(style, cache, "--depth-field-opacity", (0.3 + presence * 0.44).toFixed(3));
        setCachedProperty(style, cache, "--depth-field-y", `${(distance * 30 - velocity * 150).toFixed(1)}px`);
      });
    };

    const raf = (time) => {
      void time;
      scrollTarget = clamp(window.scrollY / viewportHeight, 0, maxDepthIndex);
      scrollCurrent = lerp(scrollCurrent, scrollTarget, scrollSmoothing);

      const rawVelocity = scrollCurrent - previousScrollCurrent;
      velocity = lerp(velocity, rawVelocity, velocityDamping);
      velocity = clamp(velocity, -velocityMax, velocityMax);
      if (Math.abs(velocity) < 0.0001) velocity = 0;

      setScrollVariables({
        progress: clamp(scrollCurrent / maxDepthIndex, 0, 1),
        velocity,
      });
      setPanelVariables();

      previousScrollCurrent = scrollCurrent;
      frame = window.requestAnimationFrame(raf);
    };

    const handleResize = () => {
      viewportHeight = Math.max(window.innerHeight, 1);
    };

    Element.prototype.scrollIntoView = function scrollIntoViewWithDepthPanels(options) {
      const panelIndex = panels.indexOf(this);
      if (panelIndex >= 0) {
        window.scrollTo({
          top: panelIndex * viewportHeight,
          behavior: readScrollBehavior(options),
        });
        return;
      }

      nativeScrollIntoView.call(this, options);
    };

    root.setAttribute("data-depth-scroll", reducedMotion ? "reduced" : "active");
    setScrollVariables();
    setPanelVariables();
    frame = window.requestAnimationFrame(raf);
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      Element.prototype.scrollIntoView = nativeScrollIntoView;
      root.removeAttribute("data-depth-scroll");
      setScrollVariables();
    };
  }, [panelCount]);

  return null;
}

function TextScreen({ screen, index }) {
  const titleId = `${screen.id}-title`;
  const Heading = index === 0 ? "h1" : "h2";

  return (
    <section
      className={`text-screen screen-gradient screen-gradient-${screen.tone}`}
      data-align={screen.align}
      id={screen.id}
      aria-labelledby={titleId}
    >
      {index === 0 ? <HeroShaderGradient /> : null}
      <DepthMotionField align={screen.align} tone={screen.tone} />
      <div className="screen-ambient" aria-hidden="true" />
      {screen.id === "contact" ? <ContactForm /> : null}
      <div className="screen-copy">
        <p className="screen-eyebrow">{screen.eyebrow}</p>
        <Heading className="screen-title" id={titleId}>
          {screen.title}
        </Heading>
        <p className="screen-copy-line">{screen.copy}</p>
        {screen.note ? (
          <p className="screen-note">{screen.note === CONTACT_EMAIL ? <EmailLink /> : screen.note}</p>
        ) : null}
      </div>
    </section>
  );
}

function SitePet() {
  const petRef = useRef(null);

  const petCompanion = () => {
    const pet = petRef.current;
    if (!pet) return;

    pet.dataset.petState = "petted";
  };

  useEffect(() => {
    const pet = petRef.current;
    if (!pet) return undefined;

    const root = document.documentElement;
    const sections = [...document.querySelectorAll(".text-screen")];
    let alignTimer = 0;
    let movementTimer = 0;
    let stateTimer = 0;
    let lastX = 0;
    let lastY = 0;
    let targetIndex = 0;
    let activePetAlign = "center";
    let activeFooterLift = 0;
    let footerIsVisible = false;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const crowdFooter = document.querySelector(".site-crowd-footer");
    const crowdCanvasWrap = crowdFooter?.querySelector(".crowd-canvas-wrap");

    const getPetAvoidSide = () => (activePetAlign === "left" || activePetAlign === "right" ? activePetAlign : "none");
    const getPetSafeSide = () => (activePetAlign === "right" ? "left" : "right");
    const getPetFooterState = () => (activeFooterLift > 0 ? "above-crowd" : "clear");
    const isMobileFooterMode = () => footerIsVisible && activeFooterLift > 0 && window.innerWidth <= 760;

    const setPosition = (x, y, state = "roaming") => {
      if (state === "roaming") {
        const dx = x - lastX;
        const dy = y - lastY;
        pet.dataset.petDirection = Math.abs(dx) >= Math.abs(dy)
          ? dx >= 0 ? "right" : "left"
          : dy >= 0 ? "down" : "up";
      }
      pet.style.setProperty("--pet-x", `${Math.round(x)}px`);
      pet.style.setProperty("--pet-y", `${Math.round(y)}px`);
      pet.dataset.petAvoid = getPetAvoidSide();
      pet.dataset.petFooter = getPetFooterState();
      pet.dataset.petState = state;
      lastX = x;
      lastY = y;
    };

    const getBounds = () => {
      const size = pet.offsetWidth || 78;
      const pad = Math.max(16, Math.min(window.innerWidth, window.innerHeight) * 0.02);
      const maxY = window.innerHeight - size - pad - activeFooterLift;
      return {
        maxX: Math.max(pad, window.innerWidth - size - pad),
        maxY: Math.max(pad, maxY),
        minX: pad,
      };
    };

    const edgeTargets = (bounds, side = getPetSafeSide()) => {
      const travel = bounds.maxX - bounds.minX;
      const size = pet.offsetWidth || 78;

      if (isMobileFooterMode()) {
        const centerX = Math.round(window.innerWidth / 2 - size / 2);
        return [
          { x: centerX, y: bounds.maxY },
          { x: Math.max(bounds.minX, centerX - 26), y: bounds.maxY },
          { x: Math.min(bounds.maxX, centerX + 26), y: bounds.maxY },
        ];
      }

      const safeMinX = Math.round(bounds.maxX - travel * 0.34);
      const safeMaxX = Math.round(bounds.minX + travel * 0.34);

      if (side === "left") {
        return [
          { x: bounds.minX, y: bounds.maxY },
          { x: Math.round(bounds.minX + travel * 0.14), y: bounds.maxY },
          { x: safeMaxX, y: bounds.maxY },
          { x: Math.round(bounds.minX + travel * 0.24), y: bounds.maxY },
        ];
      }

      return [
        { x: bounds.maxX, y: bounds.maxY },
        { x: Math.round(bounds.maxX - travel * 0.14), y: bounds.maxY },
        { x: safeMinX, y: bounds.maxY },
        { x: Math.round(bounds.maxX - travel * 0.24), y: bounds.maxY },
      ];
    };

    const settleHome = () => {
      const bounds = getBounds();
      const size = pet.offsetWidth || 78;
      const homeX = isMobileFooterMode()
        ? Math.round(window.innerWidth / 2 - size / 2)
        : getPetSafeSide() === "left" ? bounds.minX : bounds.maxX;
      setPosition(homeX, bounds.maxY, "idle");
    };

    const roam = () => {
      const bounds = getBounds();
      const targets = edgeTargets(bounds, getPetSafeSide());
      targetIndex = (targetIndex + 1) % targets.length;
      const { x, y } = targets[targetIndex];
      window.clearTimeout(stateTimer);
      setPosition(x, y, "roaming");
      stateTimer = window.setTimeout(() => {
        if (pet.dataset.petState === "roaming") {
          pet.dataset.petState = Math.random() > 0.78 ? "sleeping" : "idle";
        }
      }, 1750);
    };

    const setActivePetAlign = (align) => {
      if (activePetAlign === align) return;
      activePetAlign = align;
      targetIndex = 0;
      settleHome();
    };

    const syncActivePetAlign = () => {
      const activeIndex = Math.round(Number(root.style.getPropertyValue("--depth-active-index")) || 0);
      const activeSection = sections[Math.max(0, Math.min(sections.length - 1, activeIndex))];
      setActivePetAlign(activeSection?.getAttribute("data-align") || "center");
    };

    const readFooterLift = () => {
      if (!footerIsVisible) return 0;

      const crowdLift = Math.round(crowdCanvasWrap?.offsetHeight || 0);
      const mobileLift = window.innerWidth <= 760
        ? Math.round(Math.min(132, Math.max(104, window.innerHeight * 0.14)))
        : 0;

      return crowdLift + mobileLift;
    };

    const setActiveFooterLift = (lift) => {
      const nextLift = Math.max(0, Math.round(lift));
      if (activeFooterLift === nextLift) return;
      activeFooterLift = nextLift;
      pet.dataset.petFooter = getPetFooterState();
      targetIndex = 0;
      settleHome();
    };

    const sectionObserver = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) syncActivePetAlign();
        },
        { threshold: [0.35, 0.6, 0.82] },
      );

    const footerObserver = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
        ([entry]) => {
          footerIsVisible = entry.isIntersecting;
          setActiveFooterLift(readFooterLift());
        },
        { threshold: [0.01, 0.35, 0.65] },
      );

    if (reducedMotion?.matches) {
      pet.dataset.petMotion = "reduced";
      settleHome();
    } else {
      pet.dataset.petMotion = "active";
      settleHome();
      syncActivePetAlign();
      alignTimer = window.setInterval(syncActivePetAlign, 240);
      movementTimer = window.setInterval(roam, 3400);
    }

    sections.forEach((section) => sectionObserver?.observe(section));
    if (crowdFooter) {
      footerObserver?.observe(crowdFooter);
    }
    const handleResize = () => {
      setActiveFooterLift(readFooterLift());
      settleHome();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.clearInterval(movementTimer);
      window.clearInterval(alignTimer);
      window.clearTimeout(stateTimer);
      sectionObserver?.disconnect();
      footerObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    petCompanion();
  };

  return (
    <button
      className="site-pet"
      data-pet-clarity="high"
      data-pet-direction="right"
      data-pet-motion="active"
      data-pet-avoid="none"
      data-pet-footer="clear"
      data-pet-state="idle"
      data-site-pet-source="derDere/site-pet"
      type="button"
      aria-label="Pet Synqora site companion"
      onClick={petCompanion}
      onKeyDown={handleKeyDown}
      ref={petRef}
    >
      <span className="site-pet-sprite" aria-hidden="true" />
    </button>
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
      <DepthScrollController panelCount={textScreens.length} />
      <header className="site-header">
        <p className="wordmark">Synqora</p>
      </header>

      <main>
        {textScreens.map((screen, index) => (
          <TextScreen screen={screen} index={index} key={screen.id} />
        ))}
      </main>
      <CrowdFooter />
      <SitePet />
    </div>
  );
}
