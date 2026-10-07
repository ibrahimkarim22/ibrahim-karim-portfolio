import ProjectImage from "../projects/ProjectImage";
export default function PortfolioMedia({
  src,
  width,
  height,
  alt,
  name,
  caption,
  label,
}) {
  return (
    <figure className="tp-media">
      {label && <p className="tp-media-label">{label}</p>}
      <div className="tp-media-mount">
        <ProjectImage
          src={src}
          width={width}
          height={height}
          alt={alt}
          loading="lazy"
          decoding="async"
        />
      </div>
      <figcaption>
        <span>{caption}</span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${name} at full size (opens in a new tab)`}
        >
          View full size <span aria-hidden="true">↗</span>
        </a>
      </figcaption>
    </figure>
  );
}

export function SourceCrop({
  src,
  width,
  height,
  top,
  crop,
  left = 0,
  cropWidth = width,
  alt,
  name,
  note,
}) {
  return (
    <figure className="tp-source">
      <p className="tp-media-label">PROCESS ARCHIVE / SOURCE EXCERPT</p>
      <div
        className="tp-source-crop"
        style={{ aspectRatio: `${cropWidth} / ${crop}` }}
      >
        <ProjectImage
          src={src}
          width={width}
          height={height}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{
            top: `${(-top / crop) * 100}%`,
            left: `${(-left / cropWidth) * 100}%`,
            width: `${(width / cropWidth) * 100}%`,
          }}
        />
      </div>
      <figcaption>
        <span>{note}</span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${name} at full size (opens in a new tab)`}
        >
          View full size <span aria-hidden="true">↗</span>
        </a>
      </figcaption>
    </figure>
  );
}
