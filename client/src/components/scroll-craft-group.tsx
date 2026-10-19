"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./scroll-craft-group.module.css";

/** Scroll Craft v0.3.1 (MIT, Nate Herk) flow-entry adaptation.
 * Only decorative rules move; content remains readable before JS or entry.
 * See docs/SCROLL_CRAFT_IMPLEMENTATION.md for provenance and rollback.
 */
export function ScrollCraftGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const group = root.current;
    if (!group || !("IntersectionObserver" in window)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const items = Array.from(group.querySelectorAll<HTMLElement>("[data-sc-entry]"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.setAttribute("data-sc-entered", "");
        observer.unobserve(target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    const sync = () => {
      observer.disconnect();
      group.dataset.scMotion = motion.matches ? "off" : "on";
      items.forEach((item) => {
        if (motion.matches) item.setAttribute("data-sc-entered", "");
        else if (!item.hasAttribute("data-sc-entered")) observer.observe(item);
      });
    };
    sync();
    motion.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", sync);
      delete group.dataset.scMotion;
    };
  }, []);
  return <div ref={root} className={`${styles.group} ${className}`}>{children}</div>;
}
