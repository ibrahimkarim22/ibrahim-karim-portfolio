// Invisible copies share one grid cell, reserving the tallest annotation at
// the current width. Only the selected, live annotation is exposed to AT.
export default function StableAnnotation({
  items,
  selected,
  render,
  className,
  id,
  label,
}) {
  return (
    <div className="tp-annotation-stack">
      {items.map((item, index) => (
        <div
          key={index}
          className={`tp-annotation-reserve ${className}`}
          aria-hidden="true"
        >
          {render(item, index)}
        </div>
      ))}
      <div
        className={className}
        id={id}
        role="region"
        aria-label={label}
        aria-live="polite"
        aria-atomic="true"
      >
        {render(items[selected], selected)}
      </div>
    </div>
  );
}
