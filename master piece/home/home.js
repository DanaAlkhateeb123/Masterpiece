document.addEventListener('DOMContentLoaded', async function () {
    if (localStorage.getItem('nostalgiaProfileSetupPending') !== 'true') return;

    var user = null;
    try { user = JSON.parse(localStorage.getItem('nostalgiaUser') || 'null'); } catch (error) { user = null; }
    if (!user || !user.signedIn) {
        localStorage.removeItem('nostalgiaProfileSetupPending');
        return;
    }

    try {
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = new URL('../complete-profile/complete-profile.css', window.location.href).href;
        document.head.appendChild(css);
        var modalCss = document.createElement('link');
        modalCss.rel = 'stylesheet';
        modalCss.href = new URL('../complete-profile/complete-profile-modal.css', window.location.href).href;
        document.head.appendChild(modalCss);

        var response = await fetch(new URL('../complete-profile/complete-profile.html', window.location.href), { cache: 'no-store' });
        if (!response.ok) throw new Error('Could not load profile form: ' + response.status);
        var source = new DOMParser().parseFromString(await response.text(), 'text/html');
        source.querySelectorAll('script').forEach(function (script) { script.remove(); });
        var profile = source.querySelector('.profile-wrap');
        if (!profile) throw new Error('Profile form was not found.');

        var dialog = document.createElement('dialog');
        dialog.className = 'profile-setup-dialog';
        dialog.id = 'profile-setup-dialog';
        dialog.setAttribute('aria-labelledby', 'profile-setup-title');
        var main = document.createElement('main');
        main.className = 'profile-main';
        main.appendChild(profile);
        dialog.appendChild(main);
        document.body.appendChild(dialog);

        var heading = dialog.querySelector('.profile-intro h1');
        if (heading) heading.id = 'profile-setup-title';
        var form = dialog.querySelector('#profile-form');
        var skip = document.createElement('button');
        skip.type = 'button';
        skip.className = 'profile-skip-button';
        skip.textContent = 'Skip for now';
        form.appendChild(skip);

        skip.addEventListener('click', function () {
            localStorage.removeItem('nostalgiaProfileSetupPending');
            dialog.close();
            dialog.remove();
        });
        dialog.addEventListener('cancel', function () {
            localStorage.removeItem('nostalgiaProfileSetupPending');
        });

        window.initCompleteProfileForm(dialog, { modal: true });
        dialog.showModal();
    } catch (error) {
        console.error('Could not open the new member profile form.', error);
    }
});

/* Count each statistic once when it enters the screen, on every page load. */
(function initHomeCounters() {
    'use strict';
    var counters = document.querySelectorAll('.home [data-count]');
    var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    function formatCounter(counter, value) {
        var decimals = Number(counter.dataset.decimals || 0);
        return value.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }) + (counter.dataset.suffix || '');
    }
    function animateCounter(counter) {
        var target = Number(counter.dataset.count);
        if (!Number.isFinite(target)) return;
        if (motionPreference.matches || document.documentElement.classList.contains('reduce-motion')) {
            counter.textContent = formatCounter(counter, target);
            return;
        }
        var startedAt = null;
        counter.textContent = formatCounter(counter, 0);
        function frame(timestamp) {
            if (startedAt === null) startedAt = timestamp;
            var progress = Math.min((timestamp - startedAt) / 1100, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = formatCounter(counter, progress === 1 ? target : target * eased);
            if (progress < 1) window.requestAnimationFrame(frame);
        }
        window.requestAnimationFrame(frame);
    }
    function startVisibleCounter(counter) {
        var heroStats = counter.closest('.hero-stats');
        if (heroStats && heroStats.getAnimations && !motionPreference.matches &&
            !document.documentElement.classList.contains('reduce-motion')) {
            var entranceAnimations = heroStats.getAnimations();
            if (entranceAnimations.length) {
                counter.textContent = formatCounter(counter, 0);
                Promise.all(entranceAnimations.map(function (animation) {
                    return animation.finished.catch(function () {});
                })).then(function () { animateCounter(counter); });
                return;
            }
        }
        animateCounter(counter);
    }
    if (!('IntersectionObserver' in window)) {
        counters.forEach(startVisibleCounter);
        return;
    }
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            startVisibleCounter(entry.target);
        });
    }, { threshold: .3 });
    counters.forEach(function (counter) { observer.observe(counter); });
})();

/* ==========================================================================
   Home page behaviour: navbar spacing, hero light and parallax, tile tilt, favourites
   ========================================================================== */
(function () {
    'use strict';

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var home = document.querySelector('.home');
    var hero = document.querySelector('.home-hero');

    // ---- the hero slides up under the floating navbar: measure the navbar's real height ----
    function measureHeader() {
        var header = document.querySelector('.site-header');
        if (!header || !home) return false;
        var style = window.getComputedStyle(header);
        var height = header.offsetHeight + (parseFloat(style.marginTop) || 0);
        home.style.setProperty('--home-nav-h', Math.round(height) + 'px');
        return true;
    }
    var tries = 0;
    var waitForHeader = setInterval(function () {            // the navbar is injected a moment after load
        tries += 1;
        if (measureHeader() || tries > 40) clearInterval(waitForHeader);
    }, 100);
    window.addEventListener('resize', measureHeader);

    if (hero && !reduce) {
        // ---- gentle parallax for the glowing orbs and rings ----
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                var progress = Math.min(1, window.scrollY / Math.max(1, hero.offsetHeight));
                hero.style.setProperty('--py', progress.toFixed(3));
                ticking = false;
            });
        }, { passive: true });

        // ---- a soft golden light follows the mouse inside the hero ----
        if (finePointer) {
            var light = hero.querySelector('.hero-light');
            hero.addEventListener('pointermove', function (event) {
                var rect = hero.getBoundingClientRect();
                hero.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
                hero.style.setProperty('--my', (event.clientY - rect.top) + 'px');
                if (light) light.style.setProperty('--light', '1');
            });
            hero.addEventListener('pointerleave', function () { if (light) light.style.setProperty('--light', '0'); });
        }
    }

    // ---- category tiles tilt slightly towards the mouse ----
    if (finePointer && !reduce) {
        document.querySelectorAll('.tile').forEach(function (tile) {
            var frame = tile.querySelector('.tile-frame');
            tile.addEventListener('pointermove', function (event) {
                var rect = tile.getBoundingClientRect();
                var x = (event.clientX - rect.left) / rect.width - 0.5;
                var y = (event.clientY - rect.top) / rect.height - 0.5;
                frame.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
                frame.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
            });
            tile.addEventListener('pointerleave', function () {
                frame.style.setProperty('--rx', '0deg');
                frame.style.setProperty('--ry', '0deg');
            });
        });
    }

    // ---- save (heart) buttons on the featured listings ----
    document.querySelectorAll('.piece .favorite-button').forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            var on = button.getAttribute('aria-pressed') === 'true';
            button.setAttribute('aria-pressed', String(!on));
            // TODO: save / remove the favourite on the backend
        });
    });
})();
