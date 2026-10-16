window.initCompleteProfileForm = function (root, options) {
    root = root || document;
    options = options || {};

    var input = root.querySelector('#photo');
    var preview = root.querySelector('#photo-preview');
    var empty = root.querySelector('#photo-empty');
    var form = root.querySelector('#profile-form');
    var email = root.querySelector('#email');
    var firstName = root.querySelector('#firstName');
    var lastName = root.querySelector('#lastName');
    var gender = root.querySelector('#gender');
    var phone = root.querySelector('#phone');
    var city = root.querySelector('#citySelect');
    if (!form || form.dataset.initialized === 'true') return;
    form.dataset.initialized = 'true';

    var selectedPhoto = null;
    var previewUrl = null;
    var account = null;

    try { account = JSON.parse(localStorage.getItem('nostalgiaUser') || 'null'); } catch (error) { account = null; }
    if (account) {
        if (account.email) email.value = account.email;
        if (account.firstName) firstName.value = account.firstName;
        if (account.lastName) lastName.value = account.lastName;
        if (account.gender) gender.value = account.gender;
        if (account.phone && phone) phone.value = account.phone;
        if (account.city && city) city.value = account.city;
        if (account.photo) {
            preview.src = account.photo;
            preview.hidden = false;
            empty.hidden = true;
        }
    }

    input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        if (!file) return;
        selectedPhoto = file;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(file);
        preview.src = previewUrl;
        preview.hidden = false;
        empty.hidden = true;
    });

    function compressPhoto(file) {
        return new Promise(function (resolve) {
            var sourceUrl = URL.createObjectURL(file);
            var image = new Image();
            image.onload = function () {
                var scale = Math.min(1, 320 / Math.max(image.naturalWidth, image.naturalHeight));
                var canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
                canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(sourceUrl);
                canvas.toBlob(function (blob) {
                    if (!blob) { resolve(''); return; }
                    var reader = new FileReader();
                    reader.onload = function () { resolve(reader.result); };
                    reader.onerror = function () { resolve(''); };
                    reader.readAsDataURL(blob);
                }, 'image/jpeg', .82);
            };
            image.onerror = function () { URL.revokeObjectURL(sourceUrl); resolve(''); };
            image.src = sourceUrl;
        });
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        var current = null;
        try { current = JSON.parse(localStorage.getItem('nostalgiaUser') || 'null'); } catch (error) { current = null; }
        current = current || {};
        var photo = selectedPhoto ? await compressPhoto(selectedPhoto) : (current.photo || '');
        var profile = Object.assign({}, current, {
            name: [firstName.value.trim(), lastName.value.trim()].filter(Boolean).join(' ') || 'Nostalgia member',
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            gender: gender.value,
            email: email.value.trim(),
            phone: phone ? phone.value.trim() : (current.phone || ''),
            city: city ? city.value : (current.city || ''),
            photo: photo || current.photo || '',
            signedIn: true
        });
        localStorage.setItem('nostalgiaUser', JSON.stringify(profile));
        try {
            var accounts = JSON.parse(localStorage.getItem('nostalgiaAccounts') || '[]');
            var accountIndex = accounts.findIndex(function (savedAccount) { return savedAccount.email.toLowerCase() === profile.email.toLowerCase(); });
            if (accountIndex !== -1) {
                accounts[accountIndex].profile = {
                    name: profile.name,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    gender: profile.gender,
                    email: profile.email,
                    phone: profile.phone,
                    city: profile.city,
                    photo: profile.photo
                };
                localStorage.setItem('nostalgiaAccounts', JSON.stringify(accounts));
            }
        } catch (error) { /* Keep the signed-in profile available even if account storage is unavailable. */ }

        localStorage.removeItem('nostalgiaProfileSetupPending');
        window.dispatchEvent(new Event('nostalgia-auth-changed'));
        if (options.modal) {
            var dialog = root.closest('dialog');
            if (dialog && dialog.open) dialog.close();
            return;
        }
        window.location.href = '../home/home.html';
    });
};

document.addEventListener('DOMContentLoaded', function () {
    window.initCompleteProfileForm(document, { modal: false });
});
