import { useEffect } from "react";

export function usePageMeta(title, description) {
  useEffect(() => {
    const fullTitle = title ? `${title} | NeovationLabs` : "NeovationLabs | AI Engineering & Intelligent Software";
    document.title = fullTitle;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = "description";
        document.head.appendChild(tag);
      }
      const previous = tag.getAttribute("content");
      tag.setAttribute("content", description);
      return () => {
        if (previous) tag.setAttribute("content", previous);
      };
    }
    return undefined;
  }, [title, description]);
}
