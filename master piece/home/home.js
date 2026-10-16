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
