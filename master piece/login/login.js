document.addEventListener('DOMContentLoaded', function () {
    var tabs = Array.from(document.querySelectorAll('.auth-tab'));
    var submit = document.getElementById('submit-button');
    var form = document.getElementById('auth-form');
    var heading = document.getElementById('auth-heading');
    var firstNameField = document.getElementById('first-name-field');
    var firstName = document.getElementById('first-name');
    var forgotLinks = document.getElementById('forgot-links');
    var password = document.getElementById('password');
    var toggle = document.getElementById('toggle-password');
    var eye = document.getElementById('eye-use');
    var terms = document.getElementById('auth-terms');
    var feedback = document.getElementById('auth-feedback');
    var mode = 'login';

    function readAccounts() {
        try {
            var accounts = JSON.parse(localStorage.getItem('nostalgiaAccounts') || '[]');
            return Array.isArray(accounts) ? accounts.filter(function (account) { return account && typeof account.email === 'string'; }) : [];
        } catch (error) { return []; }
    }

    function makeSalt() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
    }

    async function hashPassword(value, salt) {
        var bytes = new TextEncoder().encode(salt + ':' + value);
        var digest = await crypto.subtle.digest('SHA-256', bytes);
        return Array.from(new Uint8Array(digest)).map(function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
    }

    function showFeedback(message) {
        feedback.textContent = message;
        feedback.hidden = !message;
    }

    function setMode(nextMode) {
        mode = nextMode;
        showFeedback('');
        var registering = mode === 'register';
        tabs.forEach(function (tab) {
            var selected = tab.dataset.mode === mode;
            tab.classList.toggle('is-active', selected);
            tab.setAttribute('aria-selected', String(selected));
        });
        heading.textContent = registering ? "Welcome, let's get your account set up" : 'Welcome back';
        firstNameField.hidden = !registering;
        firstName.disabled = !registering;
        firstName.required = registering;
        password.autocomplete = registering ? 'new-password' : 'current-password';
        password.placeholder = registering ? 'Create a password' : 'Enter your password';
        forgotLinks.hidden = registering;
        submit.textContent = registering ? 'Create account' : 'Sign in';
        terms.innerHTML = registering
            ? 'By clicking Create account or Continue with Google or Facebook, you agree to Nostalgia\'s <a href="https://www.etsy.com/legal/terms-of-use?ref=reg" target="_blank" rel="noopener">Terms of Use</a> and <a href="https://www.etsy.com/legal/privacy?ref=reg" target="_blank" rel="noopener">Privacy Policy</a>.'
            : 'By clicking Sign in or continuing with Google or Facebook, you agree to Nostalgia\'s <a href="https://www.etsy.com/legal/terms-of-use?ref=reg" target="_blank" rel="noopener">Terms of Use</a> and <a href="https://www.etsy.com/legal/privacy?ref=reg" target="_blank" rel="noopener">Privacy Policy</a>.';
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () { setMode(tab.dataset.mode); });
    });

    toggle.addEventListener('click', function () {
        var show = password.type === 'password';
        password.type = show ? 'text' : 'password';
        toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        eye.setAttribute('href', '../assets/icons/icons.svg#' + (show ? 'eye-off' : 'eye'));
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        showFeedback('');
        var emailValue = document.getElementById('email').value.trim().toLowerCase();
        var passwordValue = password.value;
        var accounts = readAccounts();

        try {
            if (!window.crypto || !window.crypto.subtle) {
                showFeedback('For local account sign-in, open the site with Live Server or another localhost server.');
                return;
            }

            if (mode === 'register') {
                if (accounts.some(function (account) { return account.email.toLowerCase() === emailValue; })) {
                    showFeedback('An account with this email already exists. Sign in instead.');
                    return;
                }
                var salt = makeSalt();
                var profile = {
                    name: firstName.value.trim(),
                    firstName: firstName.value.trim(),
                    lastName: '',
                    email: emailValue,
                    photo: ''
                };
                var newAccount = { email: emailValue, passwordSalt: salt, passwordHash: await hashPassword(passwordValue, salt), profile: profile };
                accounts.push(newAccount);
                localStorage.setItem('nostalgiaAccounts', JSON.stringify(accounts));
                localStorage.setItem('nostalgiaUser', JSON.stringify(Object.assign({}, profile, { signedIn: true })));
                localStorage.setItem('nostalgiaProfileSetupPending', 'true');
                window.location.href = '../home/home.html';
                return;
            }

            var savedAccount = accounts.find(function (account) { return account.email.toLowerCase() === emailValue; });
            if (!savedAccount) {
                showFeedback('No account found with this email. Choose Register to create one.');
                return;
            }
            if (!savedAccount.passwordSalt || !savedAccount.passwordHash || await hashPassword(passwordValue, savedAccount.passwordSalt) !== savedAccount.passwordHash) {
                showFeedback('The email or password is incorrect. Please try again.');
                return;
            }
            localStorage.setItem('nostalgiaUser', JSON.stringify(Object.assign({}, savedAccount.profile || {}, { email: emailValue, signedIn: true })));
            window.location.href = '../home/home.html';
        } catch (error) {
            showFeedback('Could not save your account in this browser. Check local storage settings and try again.');
        }
    });
});

// Antique clock on the left panel: start the hands at the visitor's local time
(function syncHeroClock() {
    var hour = document.querySelector('.hand-hour');
    var minute = document.querySelector('.hand-minute');
    var second = document.querySelector('.hand-second');
    if (!hour || !minute || !second) return;

    var now = new Date();
    var s = now.getSeconds() + now.getMilliseconds() / 1000;
    var m = now.getMinutes() * 60 + s;
    var h = (now.getHours() % 12) * 3600 + m;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // no motion: just show the current time
        hour.style.transform = 'rotate(' + (h / 43200 * 360) + 'deg)';
        minute.style.transform = 'rotate(' + (m / 3600 * 360) + 'deg)';
        second.style.transform = 'rotate(' + (s / 60 * 360) + 'deg)';
        return;
    }

    // a negative delay fast-forwards each animation to "now"
    hour.style.animationDelay = (-h) + 's';
    minute.style.animationDelay = (-m) + 's';
    second.style.animationDelay = (-s) + 's';
})();
