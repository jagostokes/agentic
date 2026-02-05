import anime from "animejs";

// Easing presets for consistent feel
export const easings = {
  smooth: "easeOutExpo",
  bounce: "easeOutElastic(1, .5)",
  spring: "spring(1, 80, 10, 0)",
  snappy: "easeOutQuart",
  gentle: "easeInOutSine",
} as const;

// Duration presets
export const durations = {
  instant: 150,
  fast: 250,
  normal: 400,
  slow: 600,
  dramatic: 800,
} as const;

// Stagger entrance animation for lists
export function staggerEntrance(
  targets: string | HTMLElement | HTMLElement[],
  options: {
    delay?: number;
    staggerDelay?: number;
    duration?: number;
    translateY?: number;
  } = {}
) {
  const {
    delay = 0,
    staggerDelay = 50,
    duration = durations.normal,
    translateY = 20,
  } = options;

  return anime({
    targets,
    translateY: [translateY, 0],
    opacity: [0, 1],
    duration,
    delay: anime.stagger(staggerDelay, { start: delay }),
    easing: easings.smooth,
  });
}

// Fade in animation
export function fadeIn(
  targets: string | HTMLElement | HTMLElement[],
  options: { delay?: number; duration?: number } = {}
) {
  const { delay = 0, duration = durations.normal } = options;

  return anime({
    targets,
    opacity: [0, 1],
    duration,
    delay,
    easing: easings.gentle,
  });
}

// Scale pop animation (for buttons, cards)
export function scalePop(
  targets: string | HTMLElement | HTMLElement[],
  options: { scale?: number; duration?: number } = {}
) {
  const { scale = 0.97, duration = durations.fast } = options;

  return anime({
    targets,
    scale: [1, scale, 1],
    duration,
    easing: easings.snappy,
  });
}

// Pulse animation (for status indicators)
export function pulse(
  targets: string | HTMLElement | HTMLElement[],
  options: { scale?: number; duration?: number; loop?: boolean } = {}
) {
  const { scale = 1.15, duration = 1000, loop = true } = options;

  return anime({
    targets,
    scale: [1, scale, 1],
    opacity: [1, 0.7, 1],
    duration,
    loop,
    easing: easings.gentle,
  });
}

// Breathing glow animation
export function breathingGlow(
  targets: string | HTMLElement | HTMLElement[],
  options: { color?: string; duration?: number } = {}
) {
  const { color = "hsl(353, 100%, 38%)", duration = 2000 } = options;

  return anime({
    targets,
    boxShadow: [
      `0 0 0px ${color}`,
      `0 0 20px ${color}`,
      `0 0 0px ${color}`,
    ],
    duration,
    loop: true,
    easing: easings.gentle,
  });
}

// Shake animation (for errors)
export function shake(
  targets: string | HTMLElement | HTMLElement[],
  options: { intensity?: number; duration?: number } = {}
) {
  const { intensity = 10, duration = 500 } = options;

  return anime({
    targets,
    translateX: [0, -intensity, intensity, -intensity, intensity, 0],
    duration,
    easing: easings.snappy,
  });
}

// Slide expand animation (for accordions)
export function slideExpand(
  targets: string | HTMLElement | HTMLElement[],
  options: { duration?: number } = {}
) {
  const { duration = durations.normal } = options;

  return anime({
    targets,
    height: [0, (el: HTMLElement) => el.scrollHeight],
    opacity: [0, 1],
    duration,
    easing: easings.smooth,
  });
}

// Slide collapse animation
export function slideCollapse(
  targets: string | HTMLElement | HTMLElement[],
  options: { duration?: number } = {}
) {
  const { duration = durations.fast } = options;

  return anime({
    targets,
    height: 0,
    opacity: 0,
    duration,
    easing: easings.snappy,
  });
}

// Counter animation (for numbers)
export function animateCounter(
  targets: string | HTMLElement | HTMLElement[],
  options: { from?: number; to: number; duration?: number; round?: number } = { to: 0 }
) {
  const { from = 0, to, duration = durations.slow, round = 0 } = options;

  const obj = { value: from };

  return anime({
    targets: obj,
    value: to,
    round,
    duration,
    easing: easings.smooth,
    update: () => {
      const elements = typeof targets === "string"
        ? document.querySelectorAll(targets)
        : Array.isArray(targets) ? targets : [targets];

      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.textContent = Math.round(obj.value).toString();
        }
      });
    },
  });
}

// Floating particles animation
export function createFloatingParticles(
  container: HTMLElement,
  options: { count?: number; color?: string } = {}
) {
  const { count = 15, color = "hsl(353, 100%, 38%)" } = options;

  const particles: HTMLElement[] = [];

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "floating-particle";
    particle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: ${color};
      border-radius: 50%;
      opacity: 0;
      pointer-events: none;
    `;
    container.appendChild(particle);
    particles.push(particle);
  }

  anime({
    targets: particles,
    translateX: () => anime.random(-100, 100),
    translateY: () => anime.random(-100, 100),
    scale: () => anime.random(0.5, 1.5),
    opacity: [0, () => anime.random(0.1, 0.3), 0],
    duration: () => anime.random(3000, 6000),
    delay: () => anime.random(0, 2000),
    loop: true,
    easing: easings.gentle,
  });

  return () => particles.forEach((p) => p.remove());
}

// Ripple effect on click
export function createRipple(
  event: React.MouseEvent<HTMLElement>,
  color: string = "rgba(196, 0, 26, 0.3)"
) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: ${color};
    border-radius: 50%;
    transform: scale(0);
    pointer-events: none;
  `;

  button.style.position = "relative";
  button.style.overflow = "hidden";
  button.appendChild(ripple);

  anime({
    targets: ripple,
    scale: [0, 2],
    opacity: [1, 0],
    duration: 600,
    easing: easings.smooth,
    complete: () => ripple.remove(),
  });
}

// Hover lift effect
export function hoverLift(element: HTMLElement, active: boolean) {
  anime({
    targets: element,
    translateY: active ? -2 : 0,
    scale: active ? 1.01 : 1,
    duration: durations.fast,
    easing: easings.snappy,
  });
}

// Sidebar expand animation
export function sidebarExpand(
  targets: string | HTMLElement | HTMLElement[],
  expanded: boolean
) {
  return anime({
    targets,
    width: expanded ? 220 : 68,
    duration: durations.normal,
    easing: easings.smooth,
  });
}

// Icon spin animation
export function spinIcon(
  targets: string | HTMLElement | HTMLElement[],
  options: { duration?: number; loop?: boolean } = {}
) {
  const { duration = 1000, loop = false } = options;

  return anime({
    targets,
    rotate: "1turn",
    duration,
    loop,
    easing: "linear",
  });
}

// Success checkmark animation
export function checkmarkSuccess(targets: string | HTMLElement | HTMLElement[]) {
  return anime({
    targets,
    strokeDashoffset: [anime.setDashoffset, 0],
    scale: [0.5, 1],
    opacity: [0, 1],
    duration: durations.normal,
    easing: easings.smooth,
  });
}

// Typewriter effect
export function typewriter(
  element: HTMLElement,
  text: string,
  options: { speed?: number } = {}
) {
  const { speed = 30 } = options;
  let i = 0;
  element.textContent = "";

  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

// Glitch text effect
export function glitchText(
  targets: string | HTMLElement | HTMLElement[],
  options: { duration?: number; intensity?: number } = {}
) {
  const { duration = 300, intensity = 3 } = options;

  return anime({
    targets,
    translateX: [
      { value: intensity, duration: 50 },
      { value: -intensity, duration: 50 },
      { value: intensity / 2, duration: 50 },
      { value: 0, duration: 50 },
    ],
    opacity: [
      { value: 0.8, duration: 50 },
      { value: 1, duration: 50 },
      { value: 0.9, duration: 50 },
      { value: 1, duration: 50 },
    ],
    filter: [
      { value: "hue-rotate(90deg)", duration: 50 },
      { value: "hue-rotate(-90deg)", duration: 50 },
      { value: "hue-rotate(0deg)", duration: 50 },
    ],
    easing: "linear",
  });
}

// Progress bar animation
export function animateProgress(
  targets: string | HTMLElement | HTMLElement[],
  progress: number,
  options: { duration?: number } = {}
) {
  const { duration = durations.slow } = options;

  return anime({
    targets,
    width: `${progress}%`,
    duration,
    easing: easings.smooth,
  });
}
