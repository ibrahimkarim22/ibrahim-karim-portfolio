import phoneHeyYouMap from "../../images/phoneHeyYouMap.png";
import phoneHeyYouChat from "../../images/phoneHeyYouChat.png";
import whacka from "../../images/whacka.gif";
import connection from "../../images/portfolio-process/heyyou-connection.jpg";
import curtain from "../../images/portfolio-process/bard-curtain.jpg";
import board from "../../images/portfolio-process/tuhdoo-board.jpg";

// URL imports do not fetch images. Only user intent or project opening warms them.
// BARD's first phone follows its full opening screen; TUH-DOO's hero is DOM/SVG.
const criticalImages = {
  heyyou: [phoneHeyYouMap, phoneHeyYouChat],
  whackamole: [whacka],
  thisportfolio: [connection, curtain, board],
};
const preloads = new Map();

export function reportImageFailure(src) {
  if (process.env.NODE_ENV !== "production") console.error(`Project image failed to load: ${src}`);
}

export async function decodeImage(image) {
  if (typeof image.decode === "function") {
    try {
      await image.decode();
    } catch (error) {
      // A completed native load remains usable on browsers/formats that reject decode.
      if (process.env.NODE_ENV !== "production") {
        console.warn(`Project image decode failed: ${image.currentSrc || image.src}`, error);
      }
    }
  }
  return image.naturalWidth > 0;
}

export function preloadImage(src) {
  if (preloads.has(src)) return preloads.get(src).promise;
  const image = new Image();
  let settle;
  const promise = new Promise((resolve) => { settle = resolve; });
  // Retain successful decoded images as well as promises while the page is open.
  preloads.set(src, { image, promise });
  const finish = (success) => {
    image.onload = null;
    image.onerror = null;
    if (!success) preloads.delete(src); // A later intentional opening may retry.
    settle(success);
  };
  image.onload = async () => finish(await decodeImage(image));
  image.onerror = () => {
    reportImageFailure(src);
    finish(false);
  };
  image.loading = "eager";
  image.fetchPriority = "high";
  image.decoding = "async";
  image.src = src;
  return promise;
}

export function preloadProjectImages(projectId) {
  const sources = criticalImages[typeof projectId === "string" ? projectId.toLowerCase() : ""] || [];
  return Promise.all(sources.map(preloadImage));
}
