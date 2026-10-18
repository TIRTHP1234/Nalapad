"use client";

import { useEffect } from "react";

export default function ScrollRevealProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.08,
      }
    );

    function observeElements() {
      const elements = document.querySelectorAll<HTMLElement>(
        ".reveal, .scroll-reveal, .kpi-card"
      );
      elements.forEach((el) => {
        if (!el.classList.contains("is-visible")) {
          observer.observe(el);
        }
      });
    }

    // Initial check
    observeElements();

    // Check on route/DOM mutations (Next.js client-side navigation)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return <>{children}</>;
}
