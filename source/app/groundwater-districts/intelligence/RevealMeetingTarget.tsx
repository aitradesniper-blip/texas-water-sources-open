"use client";
import { useEffect } from "react";

// Native disclosure keeps large packets manageable; shared item URLs still open.
export function RevealMeetingTarget() {
  useEffect(() => {
    const reveal = () => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target) return;
      let parent: HTMLElement | null = target;
      while (parent) {
        if (parent instanceof HTMLDetailsElement) parent.open = true;
        parent = parent.parentElement;
      }
      target.scrollIntoView();
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);
  return null;
}
