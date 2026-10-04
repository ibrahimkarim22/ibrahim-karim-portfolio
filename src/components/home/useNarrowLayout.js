import { useEffect, useState } from "react";

const NARROW_LAYOUT_QUERY = "(max-width: 1250px)";

export default function useNarrowLayout() {
  const [matches, setMatches] = useState(() => window.matchMedia?.(NARROW_LAYOUT_QUERY).matches ?? false);

  useEffect(() => {
    const media = window.matchMedia?.(NARROW_LAYOUT_QUERY);
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
