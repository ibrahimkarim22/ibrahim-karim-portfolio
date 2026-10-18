import ProjectImage from "./projects/ProjectImage";
import { useEffect, useRef, useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import chaplinVagabond from "../images/chaplinVagabond.jpg";
import chaplinOneAM from "../images/chaplinOneAM.jpg";
import js from "../images/js.png";
import reactLogo from "../images/reactLogo.png";
import firebase from "../images/firebase.png";
import css from "../images/css.png";
import krispyMovies from "../images/krispyMovies.png";
import krispyLiveTV from "../images/krispyLiveTV.png";
import krispyMyList from "../images/krispyMyList.png";
import krispyGlobe from "../images/krispyGlobe.png";
import Copyright from "./Copyright";

const movieSource = "https://publicdomainmovie.net/movie.php?id=CC_1916_07_10_TheVagabond&type=.mp4";
const technologies = [
  { name: "JavaScript", logo: js, width: 1200, height: 1200 },
  { name: "React", logo: reactLogo, width: 300, height: 270, className: "krispy-modal-react-logo" },
  { name: "Firebase Authentication", logo: firebase, width: 219, height: 300 },
  { name: "HLS.js" },
  { name: "CSS", logo: css, width: 263, height: 300 },
];

// Excerpts from Krispy's storage.js and LibraryContext.js, with line wrapping.
const favoritesExcerpt = `const emptyLibrary = () => ({
  saved: [],
  progress: {},
  recent: [],
});`;
const removalExcerpt = `const alreadySaved = previous.saved.includes(id);
const saved = alreadySaved
  ? previous.saved.filter((value) => value !== id)
  : [...previous.saved, id];`;

function KrispyMoviePlayer() {
  const playerRef = useRef(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (!player.paused) player.pause();
    };
  }, []);

  return (
    <section className="krispy-now-playing" aria-labelledby="krispy-movie-title">
      <div className="krispy-movie-heading">
        <div><p className="krispy-eyebrow">Now playing / From the collection</p><h2 id="krispy-movie-title">The Vagabond</h2><p className="krispy-movie-credit">Charlie Chaplin <span aria-hidden="true">·</span> 1916</p></div>
        <p className="krispy-movie-intro">From the poster to the picture.<br />Take a moment with a silent classic.</p>
      </div>
      <div className="krispy-projection-frame">
        <div className="krispy-screen-notation" aria-hidden="true"><span>KRISPY / SILENT CINEMA</span><span>CC / 1916</span></div>
        <video ref={playerRef} src={movieSource} poster={chaplinVagabond} controls playsInline preload="metadata" tabIndex={0} aria-label="The Vagabond (1916), Charlie Chaplin" onError={() => setHasError(true)}>
          Your browser does not support HTML5 video. <a href={movieSource} target="_blank" rel="noopener noreferrer">Open the original movie source.</a>
        </video>
        <div className="krispy-screen-notation"><span>Charlie Chaplin · 1916</span><span>Your screening. Your pace.</span></div>
      </div>
      {hasError && <p className="krispy-movie-error" role="status">The film could not load from its original source. <a href={movieSource} target="_blank" rel="noopener noreferrer">Open the original movie source<span className="visually-hidden"> (opens in a new tab)</span> ↗</a></p>}
    </section>
  );
}

function KrispyModal({ isOpen, closeModal }) {
  const [screening, setScreening] = useState(false);

  return (
    <Modal isOpen={isOpen} toggle={closeModal} fullscreen fade={false} trapFocus labelledBy="krispy-project-title" modalClassName="krispy-modal-presentation"
      className={`krispy-modal-main-div${isOpen ? " krispy-modal-frame-open" : ""}${screening ? " krispy-screening" : ""}`} onClosed={() => setScreening(false)}>
      {isOpen && (
        <>
          <ModalHeader toggle={closeModal} closeAriaLabel="Close project" tag="div" className="krispy-modal-header">
            <svg className="krispy-reel-symbol" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" />
              <circle cx="16" cy="16" r="2" fill="currentColor" />
              <g fill="none" stroke="currentColor"><circle cx="16" cy="7.5" r="3" /><circle cx="24.5" cy="16" r="3" /><circle cx="16" cy="24.5" r="3" /><circle cx="7.5" cy="16" r="3" /></g>
            </svg>
            <span className="krispy-modal-header-text">KRISPY</span>
            <span className="krispy-modal-header-text-two">Streaming Service</span>
          </ModalHeader>

          <ModalBody className="krispy-modal-body-main">
            <div className="krispy-modal-flex-main">
              <section className="krispy-hero" aria-labelledby="krispy-project-title">
                <div className="krispy-program-line"><span>A streaming project by Ibrahim Karim</span><span aria-hidden="true">PROGRAM / 01</span></div>
                <div className="krispy-hero-composition">
                  <div className="krispy-title-card">
                    <p className="krispy-eyebrow">An invitation to watch</p>
                    <h1 id="krispy-project-title">KRISPY</h1>
                    <p className="krispy-hero-subtitle">Streaming Service</p>
                    <p className="krispy-modal-info">Classic films, Blender open films, live TV, and webcams in one React app. Search the collections, watch in-app, and save favorites to My List.</p>
                    <a className="krispy-text-link" href="https://krispy22.web.app" target="_blank" rel="noopener noreferrer">Explore Krispy <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
                  </div>
                  <aside className="krispy-program" aria-label="On the program">
                    <p className="krispy-eyebrow">On the program</p>
                    <ol>
                      <li><span aria-hidden="true">01</span><div>Films<small>Chaplin, classic cinema & Blender open films</small></div></li>
                      <li><span aria-hidden="true">02</span><div>Live television<small>Danish Parliament & UN Web TV</small></div></li>
                      <li><span aria-hidden="true">03</span><div>The world, live<small>Alveus Sanctuary & Abisko webcams</small></div></li>
                    </ol>
                    <p className="krispy-program-note">Find something worth watching.</p>
                  </aside>
                </div>
                <div className="krispy-technology-credits">
                  <div><p className="krispy-eyebrow">Built with</p><ul aria-label="Main technology stack">{technologies.map(({ name, logo, className, width, height }) => <li key={name}>{logo && <ProjectImage src={logo} width={width} height={height} alt="" className={className} />}<span>{name}</span></li>)}</ul></div>
                  <button type="button" className="krispy-house-lights" aria-label="House lights" aria-describedby="krispy-lights-state" aria-pressed={screening} onClick={() => setScreening((dimmed) => !dimmed)}>
                    {/* Adapt the original pendant lamp and its local light-state interaction. */}
                    <svg className="krispy-lamp" viewBox="0 0 36 48" aria-hidden="true" focusable="false">
                      <path d="M15 1v13M9 14h12l6 16H3z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path className="krispy-lamp-glow" d="M5 32h20l-3 6H8z" fill="currentColor" />
                      <path className="krispy-lamp-cord" d="M30 18v23m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span><span className="krispy-lights-label">House lights</span><span id="krispy-lights-state" className="krispy-lights-state">{screening ? "Screening · Bring up the lights" : "Matinee · Dim the lights"}</span></span>
                  </button>
                </div>
              </section>

              <section className="krispy-now-showing" aria-labelledby="krispy-collection-title">
                <div className="krispy-section-heading"><div><p className="krispy-eyebrow">Now showing / Classic cinema</p><h2 id="krispy-collection-title">Charlie Chaplin Collection</h2></div><p>Two posters. A little perspective.<br />Select a film to watch on Krispy.</p></div>
                <div className="film-container">
                  <figure className="krispy-poster-exhibit">
                    <a className="chaplin-vagabond-container krispy-poster-link" href="https://krispy22.web.app/movie/3" target="_blank" rel="noopener noreferrer" aria-label="Watch The Vagabond (opens in a new tab)">
                      <ProjectImage className="chaplin-vagabond" src={chaplinVagabond} width={960} height={1440} alt="Charlie Chaplin — The Vagabond film poster" /><span className="krispy-poster-play" aria-hidden="true">▶</span>
                    </a>
                    <figcaption><span><small>01 / Charlie Chaplin</small><strong>The Vagabond</strong></span><a className="krispy-poster-caption-action" href="https://krispy22.web.app/movie/3" target="_blank" rel="noopener noreferrer" aria-label="Watch film: The Vagabond (opens in a new tab)">Watch film <span aria-hidden="true">↗</span></a></figcaption>
                  </figure>
                  <figure className="krispy-poster-exhibit">
                    <a className="chaplin-one-am-container krispy-poster-link" href="https://krispy22.web.app/movie/1" target="_blank" rel="noopener noreferrer" aria-label="Watch One A.M. (opens in a new tab)">
                      <ProjectImage className="chaplin-one-am" src={chaplinOneAM} width={800} height={1195} alt="Charlie Chaplin — One A.M. film poster" /><span className="krispy-poster-play" aria-hidden="true">▶</span>
                    </a>
                    <figcaption><span><small>02 / Charlie Chaplin</small><strong>One A.M.</strong></span><a className="krispy-poster-caption-action" href="https://krispy22.web.app/movie/1" target="_blank" rel="noopener noreferrer" aria-label="Watch film: One A.M. (opens in a new tab)">Watch film <span aria-hidden="true">↗</span></a></figcaption>
                  </figure>
                </div>
                <p className="krispy-gallery-note"><span aria-hidden="true">●</span> Chaplin films. Part of a wider collection.</p>
              </section>

              <section className="krispy-story" aria-labelledby="krispy-story-title">
                <div><p className="krispy-eyebrow">The project</p><h2 id="krispy-story-title">From silent film<br />to a world in motion.</h2></div>
                <div className="krispy-story-copy">
                  <p>Krispy brings classic films, Blender open films, live television, and webcams into one React application.</p>
                  <p>I rebuilt the browsing and playback experience around a shared catalog, with a poster wall, featured films, search and filters, and an in-app player.</p>
                  <p>Browsing and playback work without signing in. An email/password account lets viewers save favorites to My List.</p>
                  <dl className="krispy-story-credits"><div><dt>Content</dt><dd>Movies / TV / Globe</dd></div><div><dt>Experience</dt><dd>Browse / Watch / Favorite</dd></div></dl>
                </div>
              </section>

              <section className="krispy-behind-screen" aria-labelledby="krispy-technical-title">
                <div className="krispy-section-heading"><div><p className="krispy-eyebrow">Development notes / Four chapters</p><h2 id="krispy-technical-title">Behind the screen</h2></div><p>The decisions that connect<br />the collection to the experience.</p></div>

                <article className="krispy-chapter">
                  <div className="krispy-chapter-index"><span>01</span><p>Interface & rendering</p></div>
                  <div className="krispy-chapter-copy"><h3>A collection, rendered dynamically.</h3><p>A shared catalog and JavaScript’s <code>.map()</code> supply the React browsing interface. Search and filters narrow the collections by title, genre, country, or language.</p><p className="krispy-chapter-outcome">One catalog connects films, live TV, and webcams.</p></div>
                  <figure className="krispy-favorites-demo"><picture><ProjectImage src={krispyMovies} width={1920} height={919} alt="KRISPY movies page with Big Buck Bunny featured above the film collection" loading="lazy" /></picture><figcaption>Featured films and the movie collection</figcaption></figure>
                </article>

                <article className="krispy-chapter">
                  <div className="krispy-chapter-index"><span>02</span><p>Navigation</p></div>
                  <div className="krispy-chapter-copy"><h3>Every film has its place.</h3><p>The browser’s History API keeps selected titles and filters in shareable URLs. Film routes retain their <code>:id</code> path, and <code>popstate</code> restores the view when navigating back or forward.</p><p className="krispy-chapter-outcome">A poster can lead directly to its film, just as the Chaplin posters above do.</p></div>
                  <figure className="krispy-favorites-demo"><picture><ProjectImage src={krispyLiveTV} width={1920} height={919} alt="KRISPY Live TV page with Danish Parliament and UN Web TV" loading="lazy" /></picture><figcaption>Live TV with country, language, and genre filters</figcaption></figure>
                </article>

                <article className="krispy-chapter krispy-favorites-chapter">
                  <div className="krispy-chapter-index"><span>03</span><p>State & favorites</p></div>
                  <div className="krispy-chapter-copy"><h3>A personal collection</h3><p>Firebase Authentication handles email/password accounts. Saving to My List requires login; favorites, playback progress, and recent items stay separate for each account in this browser and do not sync across devices.</p><p>React Context shares library state. Saved IDs, playback progress, and recently opened titles are persisted through browser localStorage.</p><p className="krispy-data-credit"><span>Accounts & hosting</span> Firebase Authentication / Firebase Hosting</p></div>
                  <figure className="krispy-favorites-demo"><picture><ProjectImage src={krispyMyList} width={1920} height={919} alt="KRISPY My List page with saved films and collection filters" loading="lazy" /></picture><figcaption>Saved films in My List</figcaption></figure>
                  <div className="krispy-code-pair">
                    <figure className="krispy-code-frame"><figcaption><span>Library / Initial state</span><span aria-hidden="true">EXCERPT 01</span></figcaption><pre><code>{favoritesExcerpt}</code></pre><p>Saved titles, playback progress, and recent items.</p></figure>
                    <figure className="krispy-code-frame"><figcaption><span>Library / Toggle a saved title</span><span aria-hidden="true">EXCERPT 02</span></figcaption><pre><code>{removalExcerpt}</code></pre><p>Add or remove the selected ID from My List.</p></figure>
                  </div>
                </article>

                <article className="krispy-chapter krispy-styling-chapter">
                  <div className="krispy-chapter-index"><span>04</span><p>Styling & motion</p></div>
                  <div className="krispy-chapter-copy"><h3>Room for every screen.</h3><p>Plain CSS adapts the poster wall, navigation, and player for desktop and mobile. CSS scene transitions respect reduced-motion preferences.</p><p>Playback uses <code>HTML5 video</code>, <code>HLS.js</code>, and official provider embeds, with loading states and retry controls when a stream cannot play.</p></div>
                  <figure className="krispy-favorites-demo"><picture><ProjectImage src={krispyGlobe} width={1920} height={919} alt="KRISPY Globe page with Alveus Sanctuary and Abisko webcams" loading="lazy" /></picture><figcaption>Live webcams in Globe</figcaption></figure>
                </article>

              </section>

              <KrispyMoviePlayer />

              <section className="krispy-final-credits" aria-label="Final credits"><div className="krispy-end-credits"><p>Designed & developed by Ibrahim Karim</p><Copyright /><span aria-hidden="true">END OF PROGRAM / KRISPY</span></div></section>
            </div>
          </ModalBody>

          <ModalFooter className="krispy-modal-footer" role="group" aria-label="Krispy project actions">
            <span className="krispy-footer-note" aria-hidden="true">KRISPY <span> / Enjoy the show.</span></span>
            <Button color="" className="krispy-modal-close-btn krispy-footer-action" onClick={closeModal}>Close</Button>
            <Button tag="a" color="" className="krispy-site-btn krispy-footer-action" href="https://krispy22.web.app" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶</span> Watch!<span className="visually-hidden"> (opens in a new tab)</span></Button>
            <Button tag="a" color="" className="krispy-modal-github-btn krispy-footer-action" href="https://github.com/ibrahimkarim22/krispy" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}

export default KrispyModal;
