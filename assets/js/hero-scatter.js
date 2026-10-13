// Letters in the hero title lean away from the cursor, like a little hill
// kicking up wherever you point. Springs (via Motion) bring them back.
import { animate } from "https://cdn.jsdelivr.net/npm/motion@12.23.12/+esm";

// Exported so the tuner page can tweak these live.
export const config = {
  radius: 100,      // px around the cursor that feels the push
  push: 8.5,        // max nudge directly away from the cursor
  lift: 12,         // max upward kick
  rotate: 16,       // max tilt, in degrees
  randomness: 0.53, // 0 = straight away from cursor, 1 = up to ±90° off
  bounce: 0.8,      // spring bounciness, 0–1
  duration: 0.6,    // spring visual duration, seconds
};

const title = document.querySelector(".hero h1");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (title && !reduceMotion) {
  const spring = () => ({ type: "spring", bounce: config.bounce, visualDuration: config.duration });

  // Split into letters, keeping each word together so wrapping is unchanged.
  const text = title.textContent;
  title.textContent = "";
  title.setAttribute("aria-label", text);
  const letters = [];
  text.split(/(\s+)/).forEach((chunk) => {
    if (/^\s+$/.test(chunk)) {
      title.append(chunk);
      return;
    }
    const word = document.createElement("span");
    word.className = "scatter-word";
    word.setAttribute("aria-hidden", "true");
    for (const ch of chunk) {
      const letter = document.createElement("span");
      letter.className = "scatter-letter";
      letter.textContent = ch;
      word.append(letter);
      letters.push({ el: letter, jitter: 0, active: false });
    }
    title.append(word);
  });

  let centers = [];
  const measure = () => {
    centers = letters.map(({ el }) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY };
    });
  };
  measure();
  window.addEventListener("resize", measure);
  document.fonts?.ready.then(measure);

  const settle = () =>
    letters.forEach((l) => {
      l.active = false;
      animate(l.el, { x: 0, y: 0, rotate: 0 }, spring());
    });

  // Listen on the whole hero so the radius can reach letters from just outside the text.
  const area = title.closest(".hero") || title;
  area.addEventListener("pointermove", (e) => {
    letters.forEach((l, i) => {
      const dx = centers[i].x - e.pageX;
      const dy = centers[i].y - e.pageY;
      const dist = Math.hypot(dx, dy);
      // Smooth bell-shaped falloff: strongest under the cursor, zero at the radius.
      const t = Math.max(0, 1 - dist / config.radius);
      const strength = t * t * (3 - 2 * t);
      if (!strength) {
        if (l.active) {
          l.active = false;
          animate(l.el, { x: 0, y: 0, rotate: 0 }, spring());
        }
        return;
      }
      // Each time a letter is newly "tagged", it picks its own random skew.
      if (!l.active) {
        l.active = true;
        l.jitter = (Math.random() * 2 - 1) * (Math.PI / 2);
      }
      const angle = Math.atan2(dy, dx) + l.jitter * config.randomness;
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);
      animate(
        l.el,
        {
          x: nx * config.push * strength,
          y: ny * config.push * strength - config.lift * strength,
          rotate: nx * config.rotate * strength,
        },
        spring()
      );
    });
  });
  area.addEventListener("pointerleave", settle);
}
