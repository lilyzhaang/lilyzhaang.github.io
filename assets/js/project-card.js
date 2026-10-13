// When a project page is opened from elsewhere on the site (not a reload), let its card float up.
// Runs in <head> so the class is set before the card first paints.
(() => {
  if(!location.pathname.includes('/projects/')) return;
  const a = window.navigation && navigation.activation;
  const from = a ? (a.from && a.from.url) : document.referrer;
  const nav = performance.getEntriesByType('navigation')[0];
  const reload = a ? a.navigationType === 'reload' : nav && nav.type === 'reload';
  try {
    if(from && !reload && new URL(from).origin === location.origin) document.documentElement.classList.add('card-float');
  } catch(e) {}
})();
