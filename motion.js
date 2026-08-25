(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) document.documentElement.classList.add('om-motion');
  var navbound = false, obs = null, parlist = [], parbound = false;

  function bindnav() {
    var nav = document.querySelector('.nav');
    if (!nav || navbound) return;
    navbound = true;
    var onscroll = function () {
      if (window.scrollY > 8) nav.classList.add('om-stuck');
      else nav.classList.remove('om-stuck');
    };
    onscroll();
    window.addEventListener('scroll', onscroll, { passive: true });
  }

  function watcher() {
    if (obs) return obs;
    if (!('IntersectionObserver' in window)) return null;
    obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('om-in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
    return obs;
  }

  function tag() {
    if (reduce) return;
    var blocks = [].slice.call(document.querySelectorAll('section, footer, article'));
    var w = watcher();
    blocks.forEach(function (el, i) {
      if (el.classList.contains('om-reveal') || el.classList.contains('om-seen')) return;
      if (i === 0) { el.classList.add('om-seen'); return; }
      el.classList.add('om-reveal');
      if (w) w.observe(el); else el.classList.add('om-in');
    });
  }

  function parallax() {
    if (reduce || parbound) return;
    if (!window.matchMedia('(min-width: 900px) and (pointer: fine)').matches) return;
    parlist = [].slice.call(document.querySelectorAll('.om-par'));
    if (!parlist.length) return;
    parbound = true;
    var ticking = false;
    var frame = function () {
      ticking = false;
      var vh = window.innerHeight;
      parlist.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var ratio = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = 'translate3d(0,' + (ratio * -26).toFixed(2) + 'px,0)';
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
    }, { passive: true });
    frame();
  }

  function sweep() { bindnav(); tag(); parallax(); }

  sweep();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sweep);
  window.addEventListener('load', sweep);
  if ('MutationObserver' in window) {
    var mo = new MutationObserver(function () { sweep(); });
    var startmo = function () { if (document.body) mo.observe(document.body, { childList: true, subtree: true }); };
    if (document.body) startmo();
    else document.addEventListener('DOMContentLoaded', startmo);
    window.setTimeout(function () { mo.disconnect(); sweep(); }, 8000);
  }
})();
