import { useEffect, useRef, useCallback } from "react";
import anime from "animejs";
import {
  staggerEntrance,
  fadeIn,
  scalePop,
  pulse,
  shake,
  hoverLift,
  createRipple,
  breathingGlow,
  durations,
  easings,
} from "@/lib/animations";

// Hook for staggered entrance animations on mount
export function useStaggerEntrance(
  selector: string,
  options: {
    delay?: number;
    staggerDelay?: number;
    duration?: number;
    translateY?: number;
    enabled?: boolean;
  } = {}
) {
  const { enabled = true, ...animOptions } = options;

  useEffect(() => {
    if (!enabled) return;

    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    // Set initial state
    elements.forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = `translateY(${animOptions.translateY || 20}px)`;
    });

    // Animate after a frame to ensure DOM is ready
    requestAnimationFrame(() => {
      staggerEntrance(selector, animOptions);
    });
  }, [selector, enabled]);
}

// Hook for fade in on mount
export function useFadeIn(
  ref: React.RefObject<HTMLElement | null>,
  options: { delay?: number; duration?: number; enabled?: boolean } = {}
) {
  const { enabled = true, ...animOptions } = options;

  useEffect(() => {
    if (!enabled || !ref.current) return;

    ref.current.style.opacity = "0";

    requestAnimationFrame(() => {
      if (ref.current) {
        fadeIn(ref.current, animOptions);
      }
    });
  }, [enabled]);
}

// Hook for pulsing status indicator
export function usePulse(
  ref: React.RefObject<HTMLElement | null>,
  options: { active?: boolean; scale?: number; duration?: number } = {}
) {
  const { active = true, ...animOptions } = options;
  const animationRef = useRef<anime.AnimeInstance | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (active) {
      animationRef.current = pulse(ref.current, animOptions);
    } else {
      animationRef.current?.pause();
      anime.remove(ref.current);
      ref.current.style.transform = "";
      ref.current.style.opacity = "";
    }

    return () => {
      animationRef.current?.pause();
      if (ref.current) {
        anime.remove(ref.current);
      }
    };
  }, [active]);
}

// Hook for breathing glow effect
export function useBreathingGlow(
  ref: React.RefObject<HTMLElement | null>,
  options: { active?: boolean; color?: string; duration?: number } = {}
) {
  const { active = true, ...animOptions } = options;
  const animationRef = useRef<anime.AnimeInstance | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (active) {
      animationRef.current = breathingGlow(ref.current, animOptions);
    } else {
      animationRef.current?.pause();
      anime.remove(ref.current);
      ref.current.style.boxShadow = "";
    }

    return () => {
      animationRef.current?.pause();
      if (ref.current) {
        anime.remove(ref.current);
      }
    };
  }, [active, animOptions.color]);
}

// Hook for hover animations
export function useHoverAnimation(
  ref: React.RefObject<HTMLElement | null>,
  options: { lift?: boolean; scale?: boolean; glow?: boolean } = {}
) {
  const { lift = true, scale = false, glow = false } = options;

  const handleMouseEnter = useCallback(() => {
    if (!ref.current) return;

    anime({
      targets: ref.current,
      translateY: lift ? -2 : 0,
      scale: scale ? 1.02 : 1,
      boxShadow: glow ? "0 4px 20px rgba(196, 0, 26, 0.15)" : undefined,
      duration: durations.fast,
      easing: easings.snappy,
    });
  }, [lift, scale, glow]);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;

    anime({
      targets: ref.current,
      translateY: 0,
      scale: 1,
      boxShadow: glow ? "0 0 0 rgba(196, 0, 26, 0)" : undefined,
      duration: durations.fast,
      easing: easings.snappy,
    });
  }, [glow]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave]);
}

// Hook for click animation with ripple
export function useClickAnimation(
  ref: React.RefObject<HTMLElement | null>,
  options: { ripple?: boolean; scale?: boolean } = {}
) {
  const { ripple = true, scale = true } = options;

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;

      if (ripple) {
        createRipple(e as unknown as React.MouseEvent<HTMLElement>);
      }

      if (scale) {
        scalePop(ref.current);
      }
    },
    [ripple, scale]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("click", handleClick);

    return () => {
      element.removeEventListener("click", handleClick);
    };
  }, [handleClick]);
}

// Hook for shake animation (errors)
export function useShake(
  ref: React.RefObject<HTMLElement | null>,
  trigger: boolean,
  options: { intensity?: number; duration?: number } = {}
) {
  useEffect(() => {
    if (!trigger || !ref.current) return;
    shake(ref.current, options);
  }, [trigger]);
}

// Hook for accordion expand/collapse
export function useAccordion(
  contentRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean
) {
  const firstRender = useRef(true);

  useEffect(() => {
    if (!contentRef.current) return;

    // Skip animation on first render
    if (firstRender.current) {
      firstRender.current = false;
      contentRef.current.style.height = isOpen ? "auto" : "0";
      contentRef.current.style.opacity = isOpen ? "1" : "0";
      contentRef.current.style.overflow = "hidden";
      return;
    }

    if (isOpen) {
      contentRef.current.style.height = "0";
      contentRef.current.style.opacity = "0";

      anime({
        targets: contentRef.current,
        height: [0, contentRef.current.scrollHeight],
        opacity: [0, 1],
        duration: durations.normal,
        easing: easings.smooth,
        complete: () => {
          if (contentRef.current) {
            contentRef.current.style.height = "auto";
          }
        },
      });
    } else {
      anime({
        targets: contentRef.current,
        height: 0,
        opacity: 0,
        duration: durations.fast,
        easing: easings.snappy,
      });
    }
  }, [isOpen]);
}

// Hook for scroll-triggered animations
export function useScrollAnimation(
  ref: React.RefObject<HTMLElement | null>,
  options: {
    threshold?: number;
    animation?: "fadeIn" | "slideUp" | "slideLeft" | "scale";
  } = {}
) {
  const { threshold = 0.1, animation = "slideUp" } = options;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            const animations: Record<string, anime.AnimeParams> = {
              fadeIn: {
                opacity: [0, 1],
                duration: durations.normal,
                easing: easings.gentle,
              },
              slideUp: {
                translateY: [30, 0],
                opacity: [0, 1],
                duration: durations.normal,
                easing: easings.smooth,
              },
              slideLeft: {
                translateX: [30, 0],
                opacity: [0, 1],
                duration: durations.normal,
                easing: easings.smooth,
              },
              scale: {
                scale: [0.9, 1],
                opacity: [0, 1],
                duration: durations.normal,
                easing: easings.snappy,
              },
            };

            anime({
              targets: entry.target,
              ...animations[animation],
            });
          }
        });
      },
      { threshold }
    );

    // Set initial hidden state
    ref.current.style.opacity = "0";
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [animation, threshold]);
}

// Hook for loading spinner
export function useLoadingSpinner(
  ref: React.RefObject<HTMLElement | null>,
  isLoading: boolean
) {
  const animationRef = useRef<anime.AnimeInstance | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (isLoading) {
      animationRef.current = anime({
        targets: ref.current,
        rotate: "1turn",
        duration: 1000,
        loop: true,
        easing: "linear",
      });
    } else {
      animationRef.current?.pause();
      anime.remove(ref.current);
      ref.current.style.transform = "";
    }

    return () => {
      animationRef.current?.pause();
      if (ref.current) {
        anime.remove(ref.current);
      }
    };
  }, [isLoading]);
}

// Hook for number counter animation
export function useCounterAnimation(
  ref: React.RefObject<HTMLElement | null>,
  value: number,
  options: { duration?: number; decimals?: number } = {}
) {
  const { duration = durations.slow, decimals = 0 } = options;
  const prevValue = useRef(value);

  useEffect(() => {
    if (!ref.current) return;

    const obj = { value: prevValue.current };

    anime({
      targets: obj,
      value,
      round: decimals === 0 ? 1 : Math.pow(10, decimals),
      duration,
      easing: easings.smooth,
      update: () => {
        if (ref.current) {
          ref.current.textContent = obj.value.toFixed(decimals);
        }
      },
    });

    prevValue.current = value;
  }, [value, duration, decimals]);
}

// Hook for typewriter effect
export function useTypewriter(
  ref: React.RefObject<HTMLElement | null>,
  text: string,
  options: { speed?: number; delay?: number; enabled?: boolean } = {}
) {
  const { speed = 30, delay = 0, enabled = true } = options;

  useEffect(() => {
    if (!ref.current || !enabled) return;

    ref.current.textContent = "";
    let i = 0;

    const timeoutId = setTimeout(() => {
      const interval = setInterval(() => {
        if (!ref.current) {
          clearInterval(interval);
          return;
        }

        if (i < text.length) {
          ref.current.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [text, speed, delay, enabled]);
}
