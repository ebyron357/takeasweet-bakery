import { useEffect } from "react";

const SITE_NAME = "TakeASweet Cookies & Treats";

/**
 * Sets the browser tab title for the current page ("Menu | TakeASweet …")
 * and restores the previous title when the page unmounts.
 */
export function usePageTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} | ${SITE_NAME}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
