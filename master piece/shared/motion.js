/*
 * Shared motion for every page (loaded with <script src="../shared/motion.js" defer>).
 * 1. Gives the floating header a stronger shadow once the page scrolls.
 * 2. Fades page blocks in softly as they enter the screen.
 * It only adds/removes CSS classes - all the look lives in shared/global.css.
 */
(function () {
    'use strict';

    // ---- 1. header state (the header is injected a moment after load) ----
    function updateHeader() {
        var header = document.querySelector('.site-header');
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('load', updateHeader);
    updateHeader();

    // ---- 2. soft reveal ----
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;

    function collect(main) {
        var items = [];
        Array.prototype.forEach.call(main.children, function (level1) {
            items.push(level1);
            Array.prototype.forEach.call(level1.children, function (level2) { items.push(level2); });
        });
        return items.filter(function (el) {
            if (/^(SCRIPT|STYLE|DIALOG|TEMPLATE|LINK)$/.test(el.tagName)) return false;
            if (el.hidden || el.classList.contains('reveal') || el.hasAttribute('data-no-reveal')) return false;
            var style = window.getComputedStyle(el);
            if (/^(fixed|absolute|sticky)$/.test(style.position)) return false;   // keep overlays and sticky bars untouched
            if (style.display === 'none' || style.display === 'contents') return false;
            return el.offsetHeight > 24;
        });
    }

    function start() {
        var main = document.querySelector('main');
        if (!main) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                observer.unobserve(el);
                el.classList.add('is-in');
                // hand the element back to its own hover/transition rules once it has settled
                setTimeout(function () { el.classList.remove('reveal', 'is-in'); el.style.removeProperty('--reveal-delay'); }, 1100);
            });
        }, { threshold: 0.06, rootMargin: '0px 0px -5% 0px' });

        var counts = new Map();
        collect(main).forEach(function (el) {
            var parent = el.parentElement;
            var index = counts.get(parent) || 0;
            counts.set(parent, index + 1);
            el.style.setProperty('--reveal-delay', Math.min(index, 5) * 70 + 'ms');
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
