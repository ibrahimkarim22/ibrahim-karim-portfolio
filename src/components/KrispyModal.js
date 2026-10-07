import { useEffect, useRef, useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import chaplinVagabond from "../images/chaplinVagabond.jpg";
import chaplinOneAM from "../images/chaplinOneAM.jpg";
import js from "../images/js.png";
import reactLogo from "../images/reactLogo.png";
import redux from "../images/redux.png";
import firebase from "../images/firebase.png";
import bootstrapLogo from "../images/bootstrapLogo.png";
import sass from "../images/sass.png";
import krispyFavorite from "../images/krispyFavorite.png";
import krispyFavoriteGif from "../images/krispyFavoriteGif.gif";
import Copyright from "./Copyright";

const movieSource = "https://publicdomainmovie.net/movie.php?id=CC_1916_07_10_TheVagabond&type=.mp4";
const technologies = [
  { name: "JavaScript", logo: js },
  { name: "React", logo: reactLogo, className: "krispy-modal-react-logo" },
  { name: "Redux", logo: redux },
  { name: "Firebase Hosting", logo: firebase },
  { name: "Bootstrap", logo: bootstrapLogo },
  { name: "SCSS", logo: sass },
];

// Excerpts verified against Krispy's favoritesSlice.js, with line wrapping.
const favoritesExcerpt = `initialState: {
  faveList: [],
  faveListTV: [],
  faveListGlobe: [],
},`;
const removalExcerpt = `if (type === 'movie') {
  state.faveList = state.faveList.filter(
    movie => movie.id !== item.id
  );
}`;

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
        <div className="krispy-screen-notation"><span>Public domain film</span><span>Your screening. Your pace.</span></div>
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
                    <p className="krispy-modal-info">Silent classics, live television, and a window onto the world. A streaming service I built to bring them together.</p>
                    <a className="krispy-text-link" href="https://krispy22.web.app" target="_blank" rel="noopener noreferrer">Explore Krispy <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a>
                  </div>
                  <aside className="krispy-program" aria-label="On the program">
                    <p className="krispy-eyebrow">On the program</p>
                    <ol>
                      <li><span aria-hidden="true">01</span><div>Silent cinema<small>Charlie Chaplin’s public domain films</small></div></li>
                      <li><span aria-hidden="true">02</span><div>Live television<small>TV channels, streaming live</small></div></li>
                      <li><span aria-hidden="true">03</span><div>The world, live<small>Globe locations & live feeds</small></div></li>
                    </ol>
                    <p className="krispy-program-note">Find something worth watching.</p>
                  </aside>
                </div>
                <div className="krispy-technology-credits">
                  <div><p className="krispy-eyebrow">Built with</p><ul aria-label="Main technology stack">{technologies.map(({ name, logo, className }) => <li key={name}>{logo && <img src={logo} alt="" className={className} />}<span>{name}</span></li>)}</ul></div>
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
                <div className="krispy-section-heading"><div><p className="krispy-eyebrow">Now showing / Public domain cinema</p><h2 id="krispy-collection-title">Charlie Chaplin Collection</h2></div><p>Two posters. A little perspective.<br />Select a film to watch on Krispy.</p></div>
                <div className="film-container">
                  <figure className="krispy-poster-exhibit">
                    <a className="chaplin-vagabond-container krispy-poster-link" href="https://krispy22.web.app/movie/3" target="_blank" rel="noopener noreferrer" aria-label="Watch The Vagabond (opens in a new tab)">
                      <img className="chaplin-vagabond" src={chaplinVagabond} alt="Charlie Chaplin — The Vagabond film poster" /><span className="krispy-poster-play" aria-hidden="true">▶</span>
                    </a>
                    <figcaption><span><small>01 / Charlie Chaplin</small><strong>The Vagabond</strong></span><a className="krispy-poster-caption-action" href="https://krispy22.web.app/movie/3" target="_blank" rel="noopener noreferrer" aria-label="Watch film: The Vagabond (opens in a new tab)">Watch film <span aria-hidden="true">↗</span></a></figcaption>
                  </figure>
                  <figure className="krispy-poster-exhibit">
                    <a className="chaplin-one-am-container krispy-poster-link" href="https://krispy22.web.app/movie/1" target="_blank" rel="noopener noreferrer" aria-label="Watch One A.M. (opens in a new tab)">
                      <img className="chaplin-one-am" src={chaplinOneAM} alt="Charlie Chaplin — One A.M. film poster" /><span className="krispy-poster-play" aria-hidden="true">▶</span>
                    </a>
                    <figcaption><span><small>02 / Charlie Chaplin</small><strong>One A.M.</strong></span><a className="krispy-poster-caption-action" href="https://krispy22.web.app/movie/1" target="_blank" rel="noopener noreferrer" aria-label="Watch film: One A.M. (opens in a new tab)">Watch film <span aria-hidden="true">↗</span></a></figcaption>
                  </figure>
                </div>
                <p className="krispy-gallery-note"><span aria-hidden="true">●</span> Public domain films. Presented with a sense of play.</p>
              </section>

              <section className="krispy-story" aria-labelledby="krispy-story-title">
                <div><p className="krispy-eyebrow">The project</p><h2 id="krispy-story-title">From silent film<br />to a world in motion.</h2></div>
                <div className="krispy-story-copy">
                  <p>Krispy brings three kinds of viewing into one React application: Charlie Chaplin’s public domain films, live TV channels, and live feeds from locations around the globe.</p>
                  <p>I built the browsing interface, navigation, and favorites experience. The development goal was to connect these different collections through dynamic rendering, shared state, and a responsive interface with its own playful motion.</p>
                  <p>A clickable hanging lamp changes Krispy’s yellow header and bright page background to a dark viewing presentation. It’s a small invitation to settle in; the House lights control here carries that detail into the case study.</p>
                  <dl className="krispy-story-credits"><div><dt>Content</dt><dd>Movies / TV / Globe</dd></div><div><dt>Experience</dt><dd>Browse / Watch / Favorite</dd></div></dl>
                </div>
              </section>

              <section className="krispy-behind-screen" aria-labelledby="krispy-technical-title">
                <div className="krispy-section-heading"><div><p className="krispy-eyebrow">Development notes / Four chapters</p><h2 id="krispy-technical-title">Behind the screen</h2></div><p>The decisions that connect<br />the collection to the experience.</p></div>

                <article className="krispy-chapter">
                  <div className="krispy-chapter-index"><span>01</span><p>Interface & rendering</p></div>
                  <div className="krispy-chapter-copy"><h3>A collection, rendered dynamically.</h3><p>JavaScript’s <code>.map()</code> turns lists of movies, TV channels, and globe locations into the React browsing interface. Conditional rendering changes what appears when a genre is selected or favorites are present.</p><p className="krispy-chapter-outcome">The same rendering approach serves three different kinds of content.</p></div>
                  <aside className="krispy-rendering-note" aria-label="Rendering flow"><span>Movies / TV / Globe</span><span aria-hidden="true">↓</span><code>.map()</code><span aria-hidden="true">↓</span><span>React interface</span></aside>
                </article>

                <article className="krispy-chapter">
                  <div className="krispy-chapter-index"><span>02</span><p>Navigation</p></div>
                  <div className="krispy-chapter-copy"><h3>Every film has its place.</h3><p>React Router connects the movie, television, and globe pages. Detail routes use an <code>:id</code> URL parameter, read with <code>useParams()</code>, to select the content to display.</p><p className="krispy-chapter-outcome">A poster can lead directly to its film, just as the Chaplin posters above do.</p></div>
                  <div className="krispy-route-note"><p className="krispy-eyebrow">A route in the collection</p><span>/movie/<strong>3</strong></span><small>The Vagabond on Krispy</small></div>
                </article>

                <article className="krispy-chapter krispy-favorites-chapter">
                  <div className="krispy-chapter-index"><span>03</span><p>State & favorites</p></div>
                  <div className="krispy-chapter-copy"><h3>A personal collection</h3><p>Redux centralizes adding and removing favorites. Separate lists hold movies, TV channels, and globe locations, so each category keeps its own collection in shared state.</p><p>Removal filters the matching item by its ID. This keeps the favorites interaction consistent across the three categories.</p><p className="krispy-data-credit"><span>Project hosting</span> Firebase Hosting</p></div>
                  <figure className="krispy-favorites-demo"><picture><source media="(prefers-reduced-motion: reduce)" srcSet={krispyFavorite} /><img src={krispyFavoriteGif} alt="Krispy favorites demonstration" loading="lazy" /></picture><figcaption>Adding & removing favorites in Krispy</figcaption></figure>
                  <div className="krispy-code-pair">
                    <figure className="krispy-code-frame"><figcaption><span>Redux / Initial state</span><span aria-hidden="true">EXCERPT 01</span></figcaption><pre><code>{favoritesExcerpt}</code></pre><p>Three lists, held in one centralized state.</p></figure>
                    <figure className="krispy-code-frame"><figcaption><span>Redux / Remove a movie</span><span aria-hidden="true">EXCERPT 02</span></figcaption><pre><code>{removalExcerpt}</code></pre><p>Keep every movie except the selected ID.</p></figure>
                  </div>
                </article>

                <article className="krispy-chapter krispy-styling-chapter">
                  <div className="krispy-chapter-index"><span>04</span><p>Styling & motion</p></div>
                  <div className="krispy-chapter-copy"><h3>Room for every screen.</h3><p>Bootstrap’s responsive utilities and flex containers work alongside custom SCSS to adapt the layout across devices while keeping the project’s visual identity.</p><p>Krispy’s home page uses React Scroll Parallax. A <code>ParallaxProvider</code> and individual <code>Parallax</code> elements apply scroll-driven scale, rotation, and movement to the composition.</p></div>
                  <aside className="krispy-styling-note"><p className="krispy-eyebrow">In the composition</p><dl><div><dt>Layout</dt><dd>Bootstrap</dd></div><div><dt>Identity</dt><dd>Custom SCSS</dd></div><div><dt>Movement</dt><dd>React Scroll Parallax</dd></div></dl></aside>
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
            <Button tag="a" color="" className="krispy-modal-github-btn krispy-footer-action" href="https://github.com/ibrahim-karim-22/portfolioProjectReact" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}

export default KrispyModal;
