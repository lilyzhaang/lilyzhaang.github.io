// When a page is opened from elsewhere on the site (not a reload), mark it so its main content
// can float up (see .arrived in style.css: the project card, or a musing's body text).
// Runs in <head> so the class is set before anything first paints.
(() => {
  const a = window.navigation && navigation.activation;
  const from = a ? (a.from && a.from.url) : document.referrer;
  const nav = performance.getEntriesByType('navigation')[0];
  const reload = a ? a.navigationType === 'reload' : nav && nav.type === 'reload';
  try {
    if(from && !reload && new URL(from).origin === location.origin) document.documentElement.classList.add('arrived');
  } catch(e) {}
})();
