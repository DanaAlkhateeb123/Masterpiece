(function () {
    var demoProfile = {
        firstName: 'Dana',
        lastName: 'Alkhateeb',
        name: 'Dana Alkhateeb',
        email: 'dana.k@example.com',
        phone: '+962 79 123 4567',
        gender: 'Female',
        city: 'Amman',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=85'
    };

    function readProfile() {
        try {
            var saved = JSON.parse(localStorage.getItem('nostalgiaUser') || 'null');
            if (!saved) return Object.assign({}, demoProfile);
            return Object.assign({ firstName: '', lastName: '', name: '', email: '', phone: '', gender: '', city: '', photo: '' }, saved);
        } catch (error) {
            return Object.assign({}, demoProfile);
        }
    }

    function initials(profile) {
        var name = profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Nostalgia';
        return name.trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase();
    }

    function setAvatar(image, fallback, photo, letters) {
        fallback.textContent = letters;
        if (!photo) {
            image.hidden = true;
            image.removeAttribute('src');
            fallback.hidden = false;
            return;
        }
        image.src = photo;
        image.hidden = false;
        fallback.hidden = true;
        image.onerror = function () { image.hidden = true; fallback.hidden = false; };
    }

    function renderProfile(profile) {
        profile = profile || readProfile();
        var fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.name || 'Nostalgia member';
        var letter = initials(Object.assign({}, profile, { name: fullName }));
        document.getElementById('profile-name').textContent = fullName;
        document.getElementById('detail-name').textContent = fullName;
        document.getElementById('detail-email').textContent = profile.email || 'Not added yet';
        document.getElementById('detail-phone').textContent = profile.phone || 'Not added yet';
        document.getElementById('detail-gender').textContent = profile.gender || 'Not added yet';
        document.getElementById('detail-city').textContent = profile.city ? profile.city + ', Jordan' : 'Not added yet';
        setAvatar(document.getElementById('profile-avatar'), document.getElementById('profile-initials'), profile.photo, letter);
    }

    function compressPhoto(file) {
        return new Promise(function (resolve) {
            var url = URL.createObjectURL(file);
            var image = new Image();
            image.onload = function () {
                var scale = Math.min(1, 420 / Math.max(image.naturalWidth, image.naturalHeight));
                var canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
                canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(url);
                canvas.toBlob(function (blob) {
                    if (!blob) { resolve(''); return; }
                    var reader = new FileReader();
                    reader.onload = function () { resolve(reader.result); };
                    reader.onerror = function () { resolve(''); };
                    reader.readAsDataURL(blob);
                }, 'image/jpeg', .82);
            };
            image.onerror = function () { URL.revokeObjectURL(url); resolve(''); };
            image.src = url;
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var dialog = document.getElementById('profile-edit-dialog');
        var form = document.getElementById('edit-profile-form');
        var photoInput = document.getElementById('edit-photo');
        var editPhoto = document.getElementById('edit-avatar');
        var editInitials = document.getElementById('edit-initials');
        var selectedPhoto = null;

        function fillEditForm(profile) {
            document.getElementById('edit-first-name').value = profile.firstName || '';
            document.getElementById('edit-last-name').value = profile.lastName || '';
            document.getElementById('edit-email').value = profile.email || '';
            document.getElementById('edit-phone').value = profile.phone || '';
            document.getElementById('edit-gender').value = profile.gender || '';
            document.getElementById('edit-city').value = profile.city || '';
            setAvatar(editPhoto, editInitials, profile.photo, initials(profile));
        }

        function openEditor() {
            fillEditForm(readProfile());
            selectedPhoto = null;
            photoInput.value = '';
            dialog.showModal();
        }
        document.getElementById('edit-profile').addEventListener('click', openEditor);
        document.querySelectorAll('[data-edit-profile]').forEach(function (button) { button.addEventListener('click', openEditor); });
        document.querySelectorAll('[data-photo-edit]').forEach(function (button) { button.addEventListener('click', function () { openEditor(); window.setTimeout(function () { photoInput.click(); }, 80); }); });
        document.getElementById('banner-photo-edit').addEventListener('click', function (event) { event.stopPropagation(); openEditor(); window.setTimeout(function () { photoInput.click(); }, 80); });
        document.getElementById('cancel-edit').addEventListener('click', function () { dialog.close(); });
        dialog.addEventListener('click', function (event) {
            if (event.target === dialog) dialog.close();
        });
        photoInput.addEventListener('change', function () {
            var file = photoInput.files && photoInput.files[0];
            if (!file) return;
            selectedPhoto = file;
            var previewUrl = URL.createObjectURL(file);
            setAvatar(editPhoto, editInitials, previewUrl, initials(readProfile()));
        });

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            var oldProfile = readProfile();
            var nextProfile = Object.assign({}, oldProfile, {
                firstName: document.getElementById('edit-first-name').value.trim(),
                lastName: document.getElementById('edit-last-name').value.trim(),
                email: document.getElementById('edit-email').value.trim(),
                phone: document.getElementById('edit-phone').value.trim(),
                gender: document.getElementById('edit-gender').value,
                city: document.getElementById('edit-city').value
            });
            nextProfile.name = [nextProfile.firstName, nextProfile.lastName].filter(Boolean).join(' ');
            if (selectedPhoto) nextProfile.photo = await compressPhoto(selectedPhoto) || oldProfile.photo || '';

            try {
                localStorage.setItem('nostalgiaUser', JSON.stringify(nextProfile));
                var accounts = JSON.parse(localStorage.getItem('nostalgiaAccounts') || '[]');
                var oldEmail = String(oldProfile.email || '').toLowerCase();
                var account = accounts.find(function (entry) { return String(entry.email || '').toLowerCase() === oldEmail; });
                if (account) {
                    account.email = nextProfile.email;
                    account.profile = Object.assign({}, account.profile || {}, {
                        name: nextProfile.name,
                        firstName: nextProfile.firstName,
                        lastName: nextProfile.lastName,
                        email: nextProfile.email,
                        phone: nextProfile.phone,
                        gender: nextProfile.gender,
                        city: nextProfile.city,
                        photo: nextProfile.photo
                    });
                    localStorage.setItem('nostalgiaAccounts', JSON.stringify(accounts));
                }
            } catch (error) {
                window.alert('Your changes could not be saved in this browser. Please try again.');
                return;
            }

            renderProfile(nextProfile);
            window.dispatchEvent(new Event('nostalgia-auth-changed'));
            dialog.close();
        });

        renderProfile();
        window.addEventListener('storage', function () { renderProfile(); });
        window.addEventListener('nostalgia-auth-changed', function () { renderProfile(); });
    });
})();
