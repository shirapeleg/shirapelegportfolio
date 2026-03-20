(function() {
  function init() {
    var btn = document.querySelector('.work-page .scroll-to-top-btn');
    if (!btn) return;
    var scrollEl = document.body;
    var threshold = 50;
    function update() {
      if (scrollEl.scrollTop > threshold) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }
    scrollEl.addEventListener('scroll', update, { passive: true });
    update();
  }

  function optimizeMediaForMobile() {
    var mqMobile = window.matchMedia && window.matchMedia('(max-width: 1100px)');
    if (!mqMobile || !mqMobile.matches) return;

    // Only on work pages (not index.html): they contain images/videos in <main>.
    var main = document.querySelector('main') || document.body;
    if (!main) return;

    var heroMedia = main.querySelector('img, video');

    var imgs = Array.from(main.querySelectorAll('img'));
    var heroImg = heroMedia && heroMedia.tagName === 'IMG' ? heroMedia : null;
    imgs.forEach(function(img) {
      // Decode async to reduce main-thread work.
      img.decoding = 'async';

      if (heroImg && img === heroImg) {
        // Keep the first visible content eager so it doesn't feel blank.
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');
        return;
      }

      img.setAttribute('loading', 'lazy');
      img.removeAttribute('fetchpriority');
    });

    var videos = Array.from(main.querySelectorAll('video'));
    var heroVideo = heroMedia && heroMedia.tagName === 'VIDEO' ? heroMedia : null;

    videos.forEach(function(video) {
      // Ensure attributes that help autoplay on mobile.
      if (video.hasAttribute && !video.hasAttribute('muted')) video.setAttribute('muted', '');
      if (video.hasAttribute && !video.hasAttribute('playsinline')) video.setAttribute('playsinline', '');

      if (heroVideo && video === heroVideo) {
        // Keep the first media moving, but avoid heavy upfront buffering.
        if (video.hasAttribute && video.hasAttribute('autoplay')) video.preload = 'metadata';
        return;
      }

      // Stop preloading/auto-playing everything else on mobile.
      try { video.pause(); } catch (e) {}
      video.removeAttribute('autoplay');
      try { video.preload = 'none'; } catch (e2) {}
    });

    // When the user scrolls, play videos only when they enter the viewport.
    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          v.play().catch(function() {
            // Autoplay can still be blocked by some mobile browsers; ignore.
          });
        } else {
          try { v.pause(); } catch (e) {}
        }
      });
    }, { root: null, rootMargin: '300px 0px', threshold: 0.01 });

    videos.forEach(function(video) {
      if (heroVideo && video === heroVideo) return;
      io.observe(video);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
    document.addEventListener('DOMContentLoaded', optimizeMediaForMobile);
  } else {
    init();
    optimizeMediaForMobile();
  }
})();
