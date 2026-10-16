(function () {
    function readUser() {
        try { return JSON.parse(localStorage.getItem('nostalgiaUser') || 'null'); }
        catch (error) { return null; }
    }

    function initials(name) {
        return String(name || 'N').trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase() || 'N';
    }

    window.initAccountSidebar = function () {
        var root = document.getElementById('account-drawer-root');
        var panel = document.getElementById('account-sidebar');
        var trigger = document.getElementById('nav-user-trigger');
        var signIn = document.querySelector('.nav-sign-in');
        var nameText = document.getElementById('nav-user-name');
        var navImage = document.getElementById('nav-user-avatar-image');
        var navInitials = document.getElementById('nav-user-avatar-initials');
        var sidebarName = document.getElementById('sidebar-user-name');
        var sidebarImage = document.getElementById('sidebar-avatar-image');
        var sidebarInitials = document.getElementById('sidebar-avatar-initials');
        var backdrop = document.getElementById('account-sidebar-backdrop');

        if (!root || !trigger) return;

        function setAvatar(image, fallback, photo, name) {
            if (!image || !fallback) return;
            fallback.textContent = initials(name);
            if (photo) {
                image.src = photo;
                image.hidden = false;
                fallback.hidden = true;
                image.onerror = function () {
                    image.hidden = true;
                    fallback.hidden = false;
                };
            } else {
                image.hidden = true;
                image.removeAttribute('src');
                fallback.hidden = false;
            }
        }

        function renderUser() {
            var user = readUser();
            var name = user && (user.name || [user.firstName, user.lastName].filter(Boolean).join(' ')) || '';
            if (!name && user && user.email) name = user.email.split('@')[0];
            trigger.hidden = !user;
            if (signIn) signIn.hidden = Boolean(user);
            if (!user) {
                closeSidebar();
                return;
            }
            if (nameText) nameText.textContent = name.split(/\s+/)[0] || name || 'Nostalgia';
            if (sidebarName) sidebarName.textContent = name || 'Nostalgia member';
            setAvatar(navImage, navInitials, user.photo, name);
            setAvatar(sidebarImage, sidebarInitials, user.photo, name);
        }

        function openSidebar() {
            if (trigger.hidden) return;
            root.hidden = false;
            requestAnimationFrame(function () {
                root.classList.add('is-open');
                panel.setAttribute('aria-hidden', 'false');
            });
            document.body.classList.add('account-sidebar-open');
            trigger.setAttribute('aria-expanded', 'true');
            panel.querySelector('a')?.focus({ preventScroll: true });
        }

        function closeSidebar() {
            root.classList.remove('is-open');
            panel.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('account-sidebar-open');
            trigger.setAttribute('aria-expanded', 'false');
            window.setTimeout(function () {
                if (!root.classList.contains('is-open')) {
                    root.hidden = true;
                    if (!trigger.hidden) trigger.focus({ preventScroll: true });
                }
            }, 300);
        }

        trigger.addEventListener('click', function () {
            if (root.hidden || !root.classList.contains('is-open')) openSidebar();
            else closeSidebar();
        });
        backdrop.addEventListener('click', closeSidebar);
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !root.hidden) closeSidebar();
        });
        document.getElementById('account-logout').addEventListener('click', function () {
            localStorage.removeItem('nostalgiaUser');
            closeSidebar();
            renderUser();
        });
        document.querySelectorAll('[data-sidebar-page]').forEach(function (link) {
            if (link.dataset.sidebarPage === window.location.pathname.split('/').filter(Boolean).pop()?.replace(/\.html$/i, '')) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
        window.addEventListener('storage', renderUser);
        window.addEventListener('nostalgia-auth-changed', renderUser);
        renderUser();
    };
})();
