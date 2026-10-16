document.addEventListener('DOMContentLoaded', function () {
    var pills = document.querySelectorAll('.type-pill');
    var upload = document.getElementById('photo-upload');
    var hint = document.getElementById('upload-hint');
    var uploadPreviews = document.getElementById('upload-previews');
    var form = document.getElementById('listing-form');
    var preview = document.getElementById('listing-preview');
    var locations = {
        category: document.getElementById('category'),
        condition: document.getElementById('condition'),
        title: document.getElementById('item-title'),
        price: document.getElementById('price'),
        material: document.getElementById('material'),
        description: document.getElementById('item-description'),
        location: document.getElementById('location')
    };

    function selectedListingType() {
        var active = document.querySelector('.type-pill.is-active');
        return active ? active.textContent.trim() : 'Fixed Price (Direct Buy)';
    }

    function removeSelectedPhoto(index) {
        var transfer = new DataTransfer();
        Array.from(upload.files).forEach(function (file, fileIndex) {
            if (fileIndex !== index) transfer.items.add(file);
        });
        upload.files = transfer.files;
        renderUploadPreviews();
        if (preview.open) updatePreview();
    }

    function addRemoveButton(parent, index, label) {
        var remove = document.createElement('button');
        remove.className = 'photo-remove';
        remove.type = 'button';
        remove.setAttribute('aria-label', 'Remove ' + label);
        remove.textContent = '\u00D7';
        remove.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            removeSelectedPhoto(index);
        });
        parent.appendChild(remove);
    }

    function updatePreview() {
        document.getElementById('preview-item-title').textContent = locations.title.value.trim() || 'Untitled listing';
        document.getElementById('preview-price').textContent = locations.price.value ? '$' + Number(locations.price.value).toFixed(2) : 'Price not set';
        document.getElementById('preview-description').textContent = locations.description.value.trim() || 'No description provided.';
        document.getElementById('preview-location').textContent = locations.location.value.trim() ? 'Location: ' + locations.location.value.trim() : 'Location not set';

        var facts = document.getElementById('preview-facts');
        facts.replaceChildren();
        [
            ['Category', locations.category.selectedOptions[0].textContent],
            ['Condition', locations.condition.selectedOptions[0].textContent],
            ['Material', locations.material.value.trim() || 'Not provided'],
            ['Listing type', selectedListingType()]
        ].forEach(function (fact) {
            var row = document.createElement('div');
            var label = document.createElement('dt');
            var value = document.createElement('dd');
            label.textContent = fact[0];
            value.textContent = fact[1];
            row.append(label, value);
            facts.appendChild(row);
        });

        var photo = document.getElementById('preview-photo');
        photo.replaceChildren();
        if (upload.files.length) {
            Array.from(upload.files).forEach(function (file, index) {
                if (!file.type.startsWith('image/')) return;
                var card = document.createElement('span');
                card.className = 'preview-photo-card';
                var image = document.createElement('img');
                image.src = URL.createObjectURL(file);
                image.alt = file.name;
                card.appendChild(image);
                addRemoveButton(card, index, file.name);
                photo.appendChild(card);
            });
        } else {
            var empty = document.createElement('span');
            empty.textContent = 'No photo selected';
            photo.appendChild(empty);
        }
    }

    document.getElementById('preview-button').addEventListener('click', function () {
        if (!form.reportValidity()) return;
        updatePreview();
        preview.showModal();
    });
    document.querySelector('.preview-close').addEventListener('click', function () { preview.close(); });
    document.querySelector('.preview-back').addEventListener('click', function () { preview.close(); });
    document.getElementById('preview-publish').addEventListener('click', function () {
        if (!form.reportValidity()) return;
        form.requestSubmit();
    });

    // Fixed price / Auction toggle
    pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            pills.forEach(function (p) { p.classList.toggle('is-active', p === pill); });
        });
    });

    // Tell the user how many photos they picked (max 10)
    function renderUploadPreviews() {
        var files = Array.from(upload.files);
        var n = files.length;
        if (n > 10) {
            hint.textContent = 'Maximum 10 photos. Please choose fewer.';
            upload.value = '';
            uploadPreviews.replaceChildren();
            return;
        }
        hint.textContent = n ? n + (n === 1 ? ' photo selected' : ' photos selected') : 'Click to browse or drag & drop';
        uploadPreviews.replaceChildren();
        files.forEach(function (file, index) {
            if (!file.type.startsWith('image/')) return;
            var card = document.createElement('span');
            card.className = 'upload-preview';
            var image = document.createElement('img');
            image.src = URL.createObjectURL(file);
            image.alt = file.name;
            var name = document.createElement('span');
            name.className = 'upload-preview-name';
            name.textContent = file.name;
            card.append(image, name);
            addRemoveButton(card, index, file.name);
            uploadPreviews.appendChild(card);
        });
    }

    upload.addEventListener('change', renderUploadPreviews);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        preview.close();
        window.alert('Your listing is ready. Publishing will be available once the marketplace is connected.');
    });
});
