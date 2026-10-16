/*
 * Tiny front-end auth helper used by the sidebar and the protected pages.
 * NOTE: this only controls what the UI shows. Real protection MUST be enforced by the backend
 * (check the admin role on every admin API call) - front-end checks can be bypassed.
 */
(function () {
    // Emails that get the admin dashboard. Replace with the real admin account(s) - or set role: 'admin' on the user object from the backend.
    var ADMIN_EMAILS = ['admin@nostalgia.com'];

    function getUser() {
        try {
            var user = JSON.parse(localStorage.getItem('nostalgiaUser') || 'null');
            return user && (user.email || user.name || user.firstName) ? user : null;
        } catch (error) { return null; }
    }

    function isAdmin(user) {
        user = user || getUser();
        if (!user) return false;
        return user.role === 'admin' || ADMIN_EMAILS.indexOf(String(user.email || '').toLowerCase()) !== -1;
    }

    window.NostalgiaAuth = { getUser: getUser, isAdmin: isAdmin, ADMIN_EMAILS: ADMIN_EMAILS };
})();
