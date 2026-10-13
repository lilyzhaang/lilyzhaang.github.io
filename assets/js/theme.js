try{ const t=localStorage.getItem('theme'); if(t) document.documentElement.setAttribute('data-theme',t); }catch(e){}

// The new theme is revealed through a huge, soft ellipse whose center sits below the page,
// so only the top of its curve shows, like the sun on the horizon. Going light, the sun
// rises; going dark, it sinks. A glow rides the soft edge.
const themeSun = window.themeSun = {
  sunrise: { width: 2.2, drop: 150, soft: 85, duration: 2400, glow: 0.55, color: '255,215,120', color2: '255,180,90' },
  sunset: { width: 2.2, drop: 150, soft: 85, duration: 2400, glow: 0.55, color: '255,160,90', color2: '240,120,110' },
  easing: 'cubic-bezier(.45,0,.25,1)',
};
// width: how much wider than tall the ellipse is (higher = flatter curve)
// drop:  how far below the bottom of the page its center sits, in vh (higher = flatter, bigger)
// soft:  where the soft edge starts, as % of the radius (lower = blurrier)
// glow:  opacity of the glow on the edge

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('theme-toggle');
  if(!btn) return;
  btn.addEventListener('click', () => {
    const root = document.documentElement;
    const cur = root.getAttribute('data-theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = cur ? cur === 'dark' : sysDark;
    const next = isDark ? 'light' : 'dark';
    const anim = next === 'dark' ? 'sunset' : 'sunrise';
    const s = themeSun[anim];
    const glow = document.createElement('div');
    glow.className = 'theme-glow';
    const swap = () => {
      if(root.dataset.themeAnim) document.body.append(glow);
      root.setAttribute('data-theme', next);
      try{ localStorage.setItem('theme', next); }catch(e){}
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!document.startViewTransition || reduceMotion) return swap();

    // Radius (ellipse height) at which the page is untouched: the edge just reaches the bottom.
    const drop = s.drop / 100 * innerHeight;
    const hidden = drop;
    // Radius at which the solid middle covers the far top corners.
    const covered = Math.hypot(innerWidth / 2 / s.width, innerHeight + drop) / (s.soft / 100);
    const b = 100 - s.soft;
    root.style.setProperty('--sun-w', s.width);
    root.style.setProperty('--sun-drop', drop + 'px');
    root.style.setProperty('--sun-soft', s.soft + '%');
    root.style.setProperty('--sun', (anim === 'sunrise' ? hidden : covered) + 'px');
    glow.style.background = `radial-gradient(ellipse calc(var(--sun) * ${s.width}) var(--sun) at 50% calc(100% + ${drop}px),
      transparent ${s.soft - b / 8}%, rgba(${s.color},${s.glow}) ${s.soft + b * .35}%,
      rgba(${s.color2},${s.glow * .36}) ${s.soft + b * .65}%, transparent 100%)`;

    root.dataset.themeAnim = anim;
    const t = document.startViewTransition(swap);
    const sun = { '--sun': anim === 'sunrise' ? [hidden + 'px', covered + 'px'] : [covered + 'px', hidden + 'px'] };
    const timing = { duration: s.duration, easing: themeSun.easing, fill: 'both' };
    t.ready.then(() => {
      root.animate(sun, { ...timing, pseudoElement: '::view-transition-new(root)' });
      glow.animate(sun, timing);
    });
    t.finished.finally(() => {
      delete root.dataset.themeAnim;
      ['--sun', '--sun-w', '--sun-drop', '--sun-soft'].forEach(p => root.style.removeProperty(p));
      glow.remove();
    });
  });
});
