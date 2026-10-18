document.addEventListener('DOMContentLoaded', function () {
    var switches = Array.from(document.querySelectorAll('[data-auth-switch]'));
    var submit = document.getElementById('submit-button');
    var form = document.getElementById('auth-form');
    var heading = document.getElementById('auth-heading');
    var subtitle = document.getElementById('auth-subtitle');
    var firstNameField = document.getElementById('first-name-field');
    var firstName = document.getElementById('first-name');
    var lastNameField = document.getElementById('last-name-field');
    var lastName = document.getElementById('last-name');
    var confirmPasswordField = document.getElementById('confirm-password-field');
    var confirmPassword = document.getElementById('confirm-password');
    var confirmError = document.getElementById('confirm-password-error');
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

    function validateConfirmation() {
        var mismatch = mode === 'register' && confirmPassword.value !== '' && confirmPassword.value !== password.value;
        confirmPassword.setCustomValidity(mismatch ? 'Passwords do not match.' : '');
        confirmPassword.setAttribute('aria-invalid', String(mismatch));
        confirmError.hidden = !mismatch;
    }

    function setMode(nextMode) {
        mode = nextMode === 'register' ? 'register' : 'login';
        showFeedback('');
        var registering = mode === 'register';
        switches.forEach(function (button) {
            button.dataset.mode = registering ? 'login' : 'register';
            button.textContent = registering ? 'Sign in' : (button.classList.contains('auth-text-switch') ? 'Create now' : 'Register');
        });
        var prompt = registering ? 'Already have an account?' : 'Don\u2019t have an account?';
        document.getElementById('auth-account-prompt').textContent = prompt;
        document.getElementById('auth-footer-prompt').textContent = prompt;
        document.body.dataset.authMode = mode;
        heading.textContent = registering ? 'Create Your Account' : 'Welcome Back';
        subtitle.textContent = registering
            ? 'Give good things another chapter with Nostalgia.'
            : 'Sign in to continue your journey with Nostalgia.';
        firstNameField.hidden = !registering;
        firstName.disabled = !registering;
        firstName.required = registering;
        lastNameField.hidden = !registering;
        lastName.disabled = !registering;
        lastName.required = registering;
        confirmPasswordField.hidden = !registering;
        confirmPassword.disabled = !registering;
        confirmPassword.required = registering;
        if (!registering) {
            confirmPassword.value = '';
            confirmPassword.type = 'password';
            document.getElementById('toggle-confirm-password').setAttribute('aria-label', 'Show confirmation password');
            document.getElementById('confirm-eye-use').setAttribute('href', '../assets/icons/icons.svg#eye');
        }
        validateConfirmation();
        password.autocomplete = registering ? 'new-password' : 'current-password';
        password.placeholder = registering ? 'Create a password' : 'Enter your password';
        forgotLinks.hidden = registering;
        submit.textContent = registering ? 'Register' : 'Sign in';
        terms.innerHTML = (registering ? 'By creating an account' : 'By signing in') + ', you agree to Nostalgia\'s <a href="https://www.etsy.com/legal/terms-of-use?ref=reg" target="_blank" rel="noopener">Terms of Use</a> and <a href="https://www.etsy.com/legal/privacy?ref=reg" target="_blank" rel="noopener">Privacy Policy</a>.';
    }

    switches.forEach(function (button) {
        button.addEventListener('click', function () {
            setMode(button.dataset.mode);
            (mode === 'register' ? firstName : document.getElementById('email')).focus({ preventScroll: true });
        });
    });
    document.querySelectorAll('[data-provider]').forEach(function (button) {
        button.addEventListener('click', function () {
            showFeedback('Please continue using your email and password.');
        });
    });
    setMode(new URLSearchParams(window.location.search).get('mode'));
    toggle.addEventListener('click', function () {
        var show = password.type === 'password';
        password.type = show ? 'text' : 'password';
        toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        eye.setAttribute('href', '../assets/icons/icons.svg#' + (show ? 'eye-off' : 'eye'));
    });
    confirmPassword.addEventListener('input', validateConfirmation);
    password.addEventListener('input', validateConfirmation);
    document.getElementById('toggle-confirm-password').addEventListener('click', function () {
        var show = confirmPassword.type === 'password';
        confirmPassword.type = show ? 'text' : 'password';
        this.setAttribute('aria-label', show ? 'Hide confirmation password' : 'Show confirmation password');
        document.getElementById('confirm-eye-use').setAttribute('href', '../assets/icons/icons.svg#' + (show ? 'eye-off' : 'eye'));
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        showFeedback('');
        var emailValue = document.getElementById('email').value.trim().toLowerCase();
        var passwordValue = password.value;
        var accounts = readAccounts();

        if (mode === 'register') {
            if (!firstName.value.trim() || !lastName.value.trim()) {
                showFeedback('Enter your first and last name.');
                (!firstName.value.trim() ? firstName : lastName).focus();
                return;
            }
            if (passwordValue !== confirmPassword.value) {
                validateConfirmation();
                showFeedback('Passwords do not match. Please confirm your password.');
                confirmPassword.focus();
                return;
            }
        }
        if (!form.reportValidity()) return;

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
                    name: [firstName.value.trim(), lastName.value.trim()].join(' '),
                    firstName: firstName.value.trim(),
                    lastName: lastName.value.trim(),
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
