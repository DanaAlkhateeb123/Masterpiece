
(function () {
    'use strict';
    var opening = document.querySelector('.about-opening');
    if (!opening || window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        document.documentElement.classList.contains('reduce-motion') ||
        !('IntersectionObserver' in window) || !Element.prototype.animate) return;

    var groups = document.querySelectorAll('.about-opening-copy, .about-opening-note, .about-story-chapter, .about-story-copy blockquote, .about-purpose-card');
    var animations = new Map();
    groups.forEach(function (group) {
        var wordIndex = 0;
        var groupAnimations = [];
        var paragraphs = group.matches('blockquote') ? [group] : group.querySelectorAll('p:not(.eyebrow)');
        paragraphs.forEach(function (paragraph) {
            var text = paragraph.textContent;
            paragraph.setAttribute('aria-label', text);
            var fragment = document.createDocumentFragment();
            text.split(/(\s+)/).forEach(function (part) {
                if (!part.trim()) {
                    fragment.appendChild(document.createTextNode(part));
                    return;
                }
                var word = document.createElement('span');
                word.className = 'about-reveal-word';
                word.textContent = part;
                word.setAttribute('aria-hidden', 'true');
                fragment.appendChild(word);
                var animation = word.animate([
                    { opacity: 0, transform: 'translateY(7px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], {
                    duration: 420,
                    delay: 300 + wordIndex * 65,
                    easing: 'cubic-bezier(.16, 1, .3, 1)',
                    fill: 'both'
                });
                animation.pause();
                groupAnimations.push(animation);
                wordIndex += 1;
            });
            paragraph.replaceChildren(fragment);
        });
        animations.set(group, groupAnimations);
    });
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            animations.get(entry.target).forEach(function (animation) { animation.play(); });
            animations.delete(entry.target);
        });
    }, { threshold: .15 });
    groups.forEach(function (group) { observer.observe(group); });
})();
