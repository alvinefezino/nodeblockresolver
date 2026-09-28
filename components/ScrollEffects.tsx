"use client";

import { useEffect } from "react";

// Explicit targets: add class "reveal" (or data-reveal) to anything else you want animated
const EXPLICIT = ".reveal, [data-reveal], .issue-card, [class*='circleWrapper']";
// Auto targets: direct children of every <section> and <footer>
const AUTO = "section > *, footer > *";
// Elements that get the cursor-following spotlight
const SPOT = ".issue-card, .glass-hover, .btn-ghost, [data-spot]";

export default function ScrollEffects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) el.dataset.sr = "in";
          else if (el.dataset.sr === "in") el.dataset.sr = "out";
        }
      },
      { rootMargin: "-6% 0px -6% 0px", threshold: 0 }
    );

    const bound = new WeakSet<Element>();

    const canTag = (el: HTMLElement) => {
      if (bound.has(el)) return false;
      if (el.closest("header, nav, [data-no-reveal]")) return false;
      if (el.parentElement?.closest("[data-sr]")) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      const cs = getComputedStyle(el);
      if (cs.position === "fixed" || cs.position === "absolute") return false;
      if (cs.pointerEvents === "none" || cs.display === "none") return false;
      return true;
    };

    const tag = (el: HTMLElement) => {
      bound.add(el);
      const i = Array.prototype.indexOf.call(el.parentElement?.children ?? [], el);
      el.style.setProperty("--sr-delay", `${(i % 4) * 90}ms`);
      el.dataset.sr = "hidden";
      io.observe(el);
    };

    const scan = () => {
      document
        .querySelectorAll<HTMLElement>(EXPLICIT)
        .forEach((el) => canTag(el) && tag(el));
      document.querySelectorAll<HTMLElement>(AUTO).forEach((el) => {
        if (canTag(el) && !el.querySelector("[data-sr]")) tag(el);
      });
    };

    // catch content that mounts later (route changes, client-rendered UI)
    let timer: ReturnType<typeof setTimeout>;
    const mo = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(scan, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    scan();

    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(SPOT);
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(timer);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);

  return null;
}