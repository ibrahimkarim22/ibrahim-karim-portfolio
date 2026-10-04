import { useEffect, useState } from "react";

const DESKTOP_HOVER_QUERY = "(min-width: 1251px) and (min-height: 701px) and (hover: hover) and (pointer: fine)";

export default function useDesktopHover() {
  const [matches, setMatches] = useState(() => window.matchMedia?.(DESKTOP_HOVER_QUERY).matches ?? false);

  useEffect(() => {
    const media = window.matchMedia?.(DESKTOP_HOVER_QUERY);
    if (!media) return;
    setMatches(media.matches);
    const update = (event) => setMatches(event.matches);
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener?.(update);
    return () => media.removeListener?.(update);
  }, []);

  return matches;
}
