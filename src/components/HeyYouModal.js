import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import HorizontalScroll from "./HorizontalScroll";
import Copyright from "./Copyright";
import ProjectImage from "./projects/ProjectImage";
import express from "../images/express.png";
import mongo from "../images/mongo.png";
import node from "../images/node.png";
import socketio from "../images/socketio.png";
import googleMaps from "../images/googleMaps.png";
import docker from "../images/docker.png";
import native from "../images/native.png";
import run from "../images/run.png";
import expo from "../images/expo.png";
import phoneHeyYouMenu from "../images/phoneHeyYouMenu.png";
import phoneHeyYouMain from "../images/phoneHeyYouMain.png";
import phoneHeyYouGenerate from "../images/phoneHeyYouGenerate.png";
import phoneHeyYouJoined from "../images/phoneHeyYouJoined.png";
import phoneHeyYouMap from "../images/phoneHeyYouMap.png";
import phoneHeyYouChat from "../images/phoneHeyYouChat.png";

const apkUrl = "https://drive.google.com/file/d/1qS72H4LG1BF-wKSWfJiPhMNqGe5kkRZ_/view?usp=drive_link";
const githubUrl = "https://github.com/ibrahim-karim-22/fullStackPortfolioProject";
const screens = [
  { image: phoneHeyYouMap, title: "Find your group", description: "Shared locations on the map", alt: "HeyYou app: group map with named location markers" },
  { image: phoneHeyYouChat, title: "Keep the conversation going", description: "Messages in the same group", alt: "HeyYou app: group chat with messages and a send control" },
  { image: phoneHeyYouMain, title: "Make a connection", description: "Create a group or join one", alt: "HeyYou app: home screen with create, join, and logout actions" },
  { image: phoneHeyYouGenerate, title: "Start a group", description: "Generate a group access key", alt: "HeyYou app: group creation and generated access key" },
  { image: phoneHeyYouJoined, title: "Join the group", description: "Connect with a shared access key", alt: "HeyYou app: joined group confirmation" },
  { image: phoneHeyYouMenu, title: "Move between views", description: "The app navigation menu", alt: "HeyYou app: navigation menu" },
];

// Verbatim excerpt from HeyYou server.js (67bd005), not illustrative pseudocode.
const locationExcerpt = `io.to(accessKey).emit('locationUpdated', {
  userId,
  coordinates,
  username: data.username,
});`;

function LocationMark({ className = "" }) {
  return <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 29s10-10 10-17a10 10 0 0 0-20 0c0 7 10 17 10 17Z" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="16" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export function getConnectionGeometry({ width, height, left, right }) {
  const center = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
  const edge = (phone, side) => [-1, 1].map((end) => {
    const [a, b, c, d] = phone.matrix;
    const x = side * phone.width / 2;
    const y = end * phone.height / 2;
    return { x: phone.x + a * x + c * y, y: phone.y + b * x + d * y };
  });
  const distance = ([start, end]) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const progress = Math.max(0, Math.min(1, ((center.x - start.x) * dx + (center.y - start.y) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(center.x - start.x - progress * dx, center.y - start.y - progress * dy);
  };
  const endpoint = ([start, end]) => {
    const middle = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    const length = Math.hypot(center.x - middle.x, center.y - middle.y);
    const inset = Math.min(8, length / 3);
    return { x: middle.x + (center.x - middle.x) * inset / length, y: middle.y + (center.y - middle.y) * inset / length };
  };
  const leftEdge = edge(left, 1);
  const rightEdge = edge(right, -1);
  return { width, height, center, left: endpoint(leftEdge), right: endpoint(rightEdge), radius: Math.max(1, Math.min(48, distance(leftEdge) - 7, distance(rightEdge) - 7)) };
}

function HeroConnection() {
  const compositionRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [geometry, setGeometry] = useState(() => getConnectionGeometry({
    width: 520, height: 580,
    left: { x: 120, y: 320, width: 180, height: 360, matrix: [1, 0, 0, 1] },
    right: { x: 400, y: 355, width: 180, height: 360, matrix: [1, 0, 0, 1] },
  }));

  useLayoutEffect(() => {
    const composition = compositionRef.current;
    const measure = () => {
      const bounds = composition.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const frame = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const values = style.transform === "none" ? [1, 0, 0, 1] : style.transform.slice(style.transform.indexOf("(") + 1, -1).split(",").map(Number);
        return {
          x: (rect.left + rect.right) / 2 - bounds.left,
          y: (rect.top + rect.bottom) / 2 - bounds.top,
          width: parseFloat(style.width), height: parseFloat(style.height),
          matrix: values.length === 16 ? [values[0], values[1], values[4], values[5]] : values.slice(0, 4),
        };
      };
      setGeometry(getConnectionGeometry({ width: bounds.width, height: bounds.height, left: frame(leftRef.current), right: frame(rightRef.current) }));
    };
    measure();
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(measure);
      [composition, leftRef.current, rightRef.current].forEach((element) => observer.observe(element));
      return () => observer.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { center, radius } = geometry;
  return (
    <div className="hey-you-hero-product" ref={compositionRef}>
      <svg className="hey-you-location-signal" viewBox={`0 0 ${geometry.width} ${geometry.height}`} role="img" aria-label="Location signal illustration" aria-describedby="hey-you-connection-description">
        <desc id="hey-you-connection-description">Two devices connect through one shared group.</desc>
        <g fill="none" stroke="currentColor">
          <circle cx={center.x} cy={center.y} r={radius} className="hey-you-signal-orbit" />
          <circle cx={center.x} cy={center.y} r={radius * 0.68} className="hey-you-signal-orbit" />
          {["left", "right"].map((side) => {
            const source = geometry[side];
            return <g key={side}><title>{side === "left" ? "Left device signal" : "Right device signal"}</title>
              <path className={`hey-you-signal-route hey-you-signal-route-${side}`} d={`M${source.x} ${source.y} L${center.x} ${center.y}`} strokeDasharray="2 5" />
              <circle className="hey-you-device-node-halo" cx={source.x} cy={source.y} r="6" />
              <circle className="hey-you-device-node" cx={source.x} cy={source.y} r="2.7" />
              <circle className={`hey-you-signal-traveler hey-you-signal-traveler-${side}`} cx={source.x} cy={source.y} r="2.7" style={{ "--hey-you-signal-dx": `${center.x - source.x}px`, "--hey-you-signal-dy": `${center.y - source.y}px` }} />
            </g>;
          })}
          <circle cx={center.x} cy={center.y} r={radius} className="hey-you-signal-ring hey-you-signal-ring-one" style={{ transformOrigin: `${center.x}px ${center.y}px` }} />
          <circle cx={center.x} cy={center.y} r="13" className="hey-you-signal-synchronization" />
        </g>
        <g className="hey-you-shared-node" transform={`translate(${center.x} ${center.y})`}>
          <circle r="9" fill="#0d2330" stroke="currentColor" />
          <g fill="none" stroke="currentColor" strokeWidth="0.8"><circle cx="0" cy="-3" r="2" /><circle cx="-4.5" cy="-0.5" r="1.4" /><circle cx="4.5" cy="-0.5" r="1.4" /><path d="M-3 5V3a3 3 0 0 1 6 0v2M-6.5 4V3a2 2 0 0 1 2-2M6.5 4V3a2 2 0 0 0-2-2" /></g>
        </g>
        <text className="hey-you-signal-label" x={center.x} y={center.y + radius + 14} textAnchor="middle">GROUP</text>
      </svg>
      <div className="hey-you-hero-phone hey-you-hero-phone-map" ref={leftRef}><ProjectImage src={phoneHeyYouMap} width={1367} height={1221} critical alt="HeyYou group map on an Android phone" /></div>
      <div className="hey-you-hero-phone hey-you-hero-phone-chat" ref={rightRef}><ProjectImage src={phoneHeyYouChat} width={1367} height={1221} critical alt="HeyYou messages on an Android phone" /></div>
      <span className="hey-you-product-annotation">ONE GROUP.<br />TWO WAYS TO CONNECT.</span>
    </div>
  );
}

function ProductGallery() {
  const galleryRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    if (preference.addEventListener) {
      preference.addEventListener("change", update);
      return () => preference.removeEventListener("change", update);
    }
    preference.addListener(update);
    return () => preference.removeListener(update);
  }, []);

  useEffect(() => {
    const gallery = galleryRef.current;
    const releaseWheelAtBoundary = (event) => {
      const scroller = gallery.querySelector(".hey-you-horizontal-scroll");
      const end = scroller.scrollWidth - scroller.clientWidth;
      if ((event.deltaY > 0 && scroller.scrollLeft >= end - 1) ||
          (event.deltaY < 0 && scroller.scrollLeft <= 1)) {
        // Forward the exhausted gesture directly, including fractional snap
        // offsets that can otherwise leave the browser latched to this scroller.
        event.preventDefault();
        event.stopPropagation();
        const body = gallery.closest(".hey-you-modal-body-main");
        const distance = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? body.clientHeight : 1);
        const scrollBehavior = body.style.scrollBehavior;
        body.style.scrollBehavior = "auto";
        body.scrollTop += distance;
        body.style.scrollBehavior = scrollBehavior;
      }
    };
    gallery.addEventListener("wheel", releaseWheelAtBoundary, { capture: true, passive: false });
    return () => gallery.removeEventListener("wheel", releaseWheelAtBoundary, true);
  }, []);

  const move = (direction) => {
    const scroller = galleryRef.current.querySelector(".hey-you-horizontal-scroll");
    const step = scroller.querySelector(".hey-you-page").offsetWidth;
    scroller.scrollTo({ left: scroller.scrollLeft + direction * step, behavior: reducedMotion ? "auto" : "smooth" });
  };
  const images = screens.map(({ image, title, description, alt }, index) => (
    <figure className="hey-you-page hey-you-gallery-screen" key={title}>
      <div className="hey-you-device-shot"><ProjectImage src={image} width={1367} height={1221} alt={alt} loading="lazy" /></div>
      <figcaption><span className="hey-you-screen-number">0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></figcaption>
    </figure>
  ));

  return (
    <div className="hey-you-gallery" ref={galleryRef}>
      <div className="hey-you-gallery-controls"><p>Six views of the original app <span className="hey-you-arrow" aria-hidden="true">↔</span></p><div>
        <button type="button" onClick={() => move(-1)} aria-label="Previous app screen">←</button>
        <button type="button" onClick={() => move(1)} aria-label="Next app screen">→</button>
      </div></div>
      <div className="hey-you-gallery-navigation" role="group" aria-label="App screenshots" tabIndex={0} onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}>
        {/* Preserve the original wheel + snap interaction; avoid forced smooth scrolling with reduced motion. */}
        {reducedMotion ? <div className="hey-you-horizontal-scroll">{images}</div> : <HorizontalScroll className="hey-you-horizontal-scroll">{images}</HorizontalScroll>}
      </div>
    </div>
  );
}

function DeploymentScene() {
  const sceneRef = useRef(null);
  // Pixel units keep the responsive choreography valid in browsers without
  // container units. Measure before paint and keep dimensions current on resize.
  useLayoutEffect(() => {
    const scene = sceneRef.current;
    const measure = () => {
      scene.style.setProperty("--hey-you-scene-unit-x", `${scene.clientWidth / 100}px`);
      scene.style.setProperty("--hey-you-scene-unit-y", `${scene.clientHeight / 100}px`);
    };
    measure();
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(measure);
      observer.observe(scene);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div className="hey-you-ocean" ref={sceneRef} role="img" aria-label="Docker whale jumping and diving through a moonlit ocean above Cloud Run, Expo, and React Native containers">
      <div className="hey-you-ocean-scene" aria-hidden="true">
        <div className="moon-container"><div className="moon" /></div>
        <div className="stars-grid-container">{["one", "two", "three", "four"].map((star) => <div className={`star-${star}-container`} key={star}><div className={`star-${star}`} /></div>)}</div>
        <div className="water-div-at-distance" /><div className="water-div-further" /><div className="water-div-closer" />
        <div className="water-particle-one" /><div className="water-particle-two" />
        <div className="docker-logo-container"><ProjectImage src={docker} width={300} height={191} className="docker-logo" alt="" /></div>
        <div className="google-cloud-run-building hey-you-deployment-badge"><ProjectImage src={run} width={1024} height={921} className="google-cloud-run-logo" alt="" /><div><span>Backend host</span><strong>Cloud Run</strong></div></div>
        <div className="expo-building hey-you-deployment-badge"><ProjectImage src={expo} width={300} height={265} className="expo-logo" alt="" /><div><span>Mobile tooling</span><strong>Expo</strong></div></div>
        <div className="react-native-building hey-you-deployment-badge"><ProjectImage src={native} width={275} height={300} className="react-native-logo" alt="" /><div><span>Mobile app</span><strong>React Native</strong></div></div>
      </div>
      <span className="hey-you-ocean-notation" aria-hidden="true">A LITTLE IMAGINATION. A REAL DEPLOYMENT STORY.</span>
    </div>
  );
}

function HeyYouModal({ isOpen, closeModal }) {
  return (
    <Modal isOpen={isOpen} toggle={closeModal} fullscreen fade={false} trapFocus labelledBy="hey-you-project-title" modalClassName="hey-you-modal-presentation" className="hey-you-modal-main-div">
      {isOpen && <>
        <ModalHeader toggle={closeModal} closeAriaLabel="Close project" tag="div" className="hey-you-modal-header">
          <LocationMark className="hey-you-header-mark" />
          <span className="hey-you-modal-header-text">HeyYou</span>
          <span className="hey-you-modal-header-text-two">Location Tracking & Messaging</span>
        </ModalHeader>

        <ModalBody className="hey-you-modal-body-main">
          <div className="hey-you-story">
            <section className="hey-you-hero" aria-labelledby="hey-you-project-title">
              <div className="hey-you-project-line"><span>A mobile project by Ibrahim Karim</span><span>LOCATION / COMMUNICATION</span></div>
              <div className="hey-you-hero-composition">
                <div className="hey-you-hero-copy">
                  <p className="hey-you-eyebrow"><span className="hey-you-status-dot" /> A connection, in motion</p>
                  <h1 id="hey-you-project-title"><span>HEYYOU</span><span className="hey-you-modal-main-title" aria-hidden="true">HEYYOU</span></h1>
                  <p className="hey-you-hero-subtitle">Location Tracking & Messaging</p>
                  <p className="hey-you-hero-description">A shared place to find each other.<br />And a conversation to stay connected.</p>
                  <p className="hey-you-hero-context">I built HeyYou to bring group location sharing and messaging together in a React Native app. Create a group, share its access key, and see the people you connect with on a map.</p>
                  <a className="hey-you-text-link" href="#hey-you-mobile-title">Meet the app <span aria-hidden="true">↓</span></a>
                  <p className="hey-you-recognition"><span aria-hidden="true">✧</span> Nucamp Full-Stack Honors Award</p>
                </div>
                <HeroConnection />
              </div>
              <ul className="hey-you-stack-summary" aria-label="Project technology summary"><li>React Native <span>/ Expo</span></li><li>Node.js <span>/ Express</span></li><li>Socket.IO <span>/ MongoDB</span></li><li>Docker <span>/ Cloud Run</span></li></ul>
            </section>

            <section className="hey-you-mobile" aria-labelledby="hey-you-mobile-title">
              <div className="hey-you-section-heading"><div><p className="hey-you-eyebrow">01 / Mobile experience</p><h2 id="hey-you-mobile-title">Live connection.</h2></div><p>From a shared key to a shared view.<br />The original React Native & Expo app.</p></div>
              <ProductGallery />
            </section>

            <section className="hey-you-architecture" aria-labelledby="hey-you-architecture-title">
              <div className="hey-you-section-heading"><div><p className="hey-you-eyebrow">02 / Backend & data</p><h2 id="hey-you-architecture-title">How the signal moves.</h2></div><p>A mobile interface. A shared backend.<br />One group at the center of it all.</p></div>
              <ol className="hey-you-system-flow" aria-label="HeyYou system architecture">
                <li><span className="hey-you-flow-index">01</span><h3>On your phone</h3><p>React Native / Expo</p><small>Group, map & chat screens</small></li>
                <li><span className="hey-you-flow-index">02</span><h3>At the server</h3><p>Node.js / Express / Socket.IO</p><small>API requests & group events</small></li>
                <li><span className="hey-you-flow-index">03</span><h3>In the data</h3><p>MongoDB / Mongoose</p><small>Accounts, groups, locations & messages</small></li>
              </ol>
              <div className="hey-you-backend-detail"><div><h3>A place for the shared state.</h3><p>Express handles the HTTP routes; Socket.IO handles live group communication on the same Node.js server. Mongoose models store user accounts, group membership, location coordinates, and messages in MongoDB.</p><p>The mobile map gets its coordinates from Expo Location and renders named markers with Google Maps through <code>react-native-maps</code>.</p></div>
                <div className="hey-you-backend-visual" aria-hidden="true"><div className="hey-you-backend-canvas">
                  <div className="bg-light-hey-you-modal" /><div className="bg-light-hey-you-modal-two" /><div className="bg-light-hey-you-modal-three" />
                  <ProjectImage src={node} width={266} height={300} className="node-hey-you-modal" alt="" /><ProjectImage src={express} width={300} height={87} className="express-hey-you-modal" alt="" /><ProjectImage src={mongo} width={135} height={300} className="mongo-hey-you-modal" alt="" />
                </div><span>NODE.JS / EXPRESS / MONGODB</span></div>
              </div>
            </section>

            <section className="hey-you-realtime" aria-labelledby="hey-you-realtime-title">
              <div className="hey-you-realtime-copy"><p className="hey-you-eyebrow">03 / Real-time connection</p><h2 id="hey-you-realtime-title">Updates, without<br />the refresh.</h2><p>Socket.IO rooms connect devices through their group access key. The server saves a location or message, then broadcasts the update to that room. Listening clients update their map markers or conversation.</p>
                <dl className="hey-you-event-list"><div><dt>Location</dt><dd><code>updateLocation</code><span aria-hidden="true"> → </span><code>locationUpdated</code></dd></div><div><dt>Messages</dt><dd><code>sendMessage</code><span aria-hidden="true"> → </span><code>newMessage</code></dd></div><div><dt>Groups</dt><dd>Create or join a room with an access key</dd></div></dl>
              </div>
              <figure className="hey-you-code-frame"><figcaption><span><ProjectImage className="socket-io-logo-two" src={socketio} width={300} height={299} alt="" /> Socket.IO / server.js</span><span>LOCATION DELIVERY</span></figcaption><pre><code>{locationExcerpt}</code></pre><p><code>io.to(accessKey)</code> selects the group's room. <code>locationUpdated</code> carries the coordinates back to its connected clients.</p></figure>
            </section>

            <section className="hey-you-location" aria-labelledby="hey-you-location-title">
              <div className="hey-you-location-copy"><p className="hey-you-eyebrow">04 / Location</p><h2 id="hey-you-location-title">A place for<br />every person.</h2><p>Expo Location requests foreground permission and watches device position. The app sends the coordinates through Socket.IO; each incoming group update becomes a named marker on the Google map.</p><p>The result is a shared view of where your group is, alongside a place to talk.</p><div className="hey-you-location-pipeline"><span>Device position</span><span aria-hidden="true">↓</span><span>Group update</span><span aria-hidden="true">↓</span><span>Named map marker</span></div></div>
              <figure className="hey-you-map-exhibit"><div className="hey-you-map-stage"><div className="hey-you-device-shot"><ProjectImage src={phoneHeyYouMap} width={1367} height={1221} alt="Original HeyYou map showing the Ibrahim, Mom, and Dad group markers" loading="lazy" /></div><div className="hey-you-map-orbits" aria-hidden="true"><div className="google-maps-api-logo-one-container"><ProjectImage src={googleMaps} width={210} height={300} alt="" /></div><div className="google-maps-api-logo-two-container"><ProjectImage src={googleMaps} width={210} height={300} alt="" /></div></div></div><figcaption><LocationMark /> Google Maps / Original project screen</figcaption></figure>
            </section>

            <section className="hey-you-safety" aria-labelledby="hey-you-safety-title">
              <div className="hey-you-safety-heading"><p className="hey-you-eyebrow">Sharing & safety</p><h2 id="hey-you-safety-title">Share with intent.</h2><p>Location sharing deserves a clear explanation of when it happens and how it ends.</p><div className="hey-you-safety-symbols" aria-hidden="true"><div className="hey-you-safety-person-frame"><svg className="hey-you-safety-person-base" viewBox="0 0 32 32"><circle cx="16" cy="8" r="5" fill="none" stroke="currentColor" /><path d="M5 28v-5a11 11 0 0 1 22 0v5" fill="none" stroke="currentColor" /></svg><svg className="hey-you-safety-person" viewBox="0 0 32 32"><circle cx="16" cy="8" r="5" fill="none" stroke="currentColor" /><path d="M5 28v-5a11 11 0 0 1 22 0v5" fill="none" stroke="currentColor" /></svg></div><span className="hey-you-safety-connection" /><div className="hey-you-key-stage"><svg className="hey-you-safety-key" viewBox="0 0 32 32"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="m14 14 14 14m-6-6 4-4m-8 0 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg></div><span className="hey-you-safety-symbol-caption">PERSON / SHARED KEY</span></div></div>
              <ol className="hey-you-safety-notes"><li><span>01</span><div><h3>A group you choose to join.</h3><p>The server generates an eight-character access key from a UUID. Sharing that key lets another device join the same group for locations and messages.</p></div></li><li><span>02</span><div><h3>Foreground location permission.</h3><p>The map screen requests device permission before obtaining a position. Its location watcher is removed when that screen unmounts. The app can reuse a previously stored group key.</p></div></li><li><span>03</span><div><h3>Clear coordinates on logout.</h3><p>Logout requests an authenticated backend operation that clears the user's stored coordinate fields, then clears local app storage.</p></div></li></ol>
            </section>

            <section className="hey-you-shipping" aria-labelledby="hey-you-shipping-title">
              <div className="hey-you-section-heading"><div><p className="hey-you-eyebrow">05 / Shipping</p><h2 id="hey-you-shipping-title">From code to cloud.</h2></div><p>One backend to ship.<br />One app to put in your hands.</p></div>
              <DeploymentScene />
              <div className="hey-you-deployment-notes"><article><p className="hey-you-eyebrow">Backend / Docker → Cloud Run</p><h3>A server, containerized.</h3><p>A Node-based Dockerfile installs the app's dependencies and runs the Express server. The project's deployment used Google Cloud Run to host the backend container.</p></article><article><p className="hey-you-eyebrow">Mobile / React Native + Expo</p><h3>An Android app to share.</h3><p>The React Native app uses Expo for its mobile tooling. The original project includes an Android APK, available through the project action below.</p></article></div>
            </section>

            <section className="hey-you-demo" aria-labelledby="hey-you-demo-title">
              <div className="hey-you-section-heading"><div><p className="hey-you-eyebrow">The honors project / Original submission</p><h2 id="hey-you-demo-title">See it in action.</h2></div><a className="hey-you-text-link" href="https://www.youtube.com/watch?v=CShAZT8jykY" target="_blank" rel="noopener noreferrer">Watch on YouTube <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></a></div>
              <div className="hey-you-video-frame"><iframe className="hey-you-modal-project-video" title="HeyYou Honors Project Video Submission" src="https://www.youtube.com/embed/CShAZT8jykY?si=ruBs8fOIFK2vkVzq" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
              <p className="hey-you-demo-caption">Honors Project Video Submission <span>Play when you're ready.</span></p>
              <div className="hey-you-end-credit"><LocationMark /><p>Designed & developed by Ibrahim Karim<br /><Copyright /></p><span>HEYYOU / STAY CONNECTED</span></div>
            </section>
          </div>
        </ModalBody>

        <ModalFooter className="hey-you-modal-footer" role="group" aria-label="HeyYou project actions">
          <span className="hey-you-footer-identity"><span className="hey-you-status-dot" /> HEYYOU <span>/ Stay connected.</span></span>
          <Button color="" className="hey-you-modal-close-btn hey-you-footer-action" onClick={closeModal}>Close</Button>
          <Button tag="a" color="" className="hey-you-request-apk-btn hey-you-footer-action" href={apkUrl} target="_blank" rel="noopener noreferrer">APK! <span aria-hidden="true">↓</span><span className="visually-hidden"> (opens in a new tab)</span></Button>
          <Button tag="a" color="" className="hey-you-modal-github-btn hey-you-footer-action" href={githubUrl} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span><span className="visually-hidden"> (opens in a new tab)</span></Button>
        </ModalFooter>
      </>}
    </Modal>
  );
}

export default HeyYouModal;
