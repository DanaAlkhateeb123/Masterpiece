document.addEventListener('DOMContentLoaded', function () {
    var dialog = document.getElementById('address-dialog');
    var form = document.getElementById('address-form');
    var mapElement = document.getElementById('delivery-map');
    var map = null;
    var marker = null;
    var selectedPoint = null;
    var continueButton = document.getElementById('checkout-continue');
    var cashConfirmDialog = document.getElementById('cash-confirm-dialog');
    var orderConfirmationDialog = document.getElementById('order-confirmation-dialog');
    var paymentMethods = Array.from(document.querySelectorAll('input[name="payment_method"]'));

    function updateContinueButton() {
        var selectedMethod = document.querySelector('input[name="payment_method"]:checked');
        continueButton.textContent = selectedMethod && selectedMethod.value === 'cod' ? 'Place Cash Order' : 'Proceed to Payment';
    }

    paymentMethods.forEach(function (method) {
        method.addEventListener('change', updateContinueButton);
    });
    continueButton.addEventListener('click', function () {
        var selectedMethod = document.querySelector('input[name="payment_method"]:checked');
        if (selectedMethod && selectedMethod.value === 'cod') {
            cashConfirmDialog.showModal();
            return;
        }
        window.location.href = '../payment-details/payment-details.html';
    });
    document.getElementById('cancel-cash-order').addEventListener('click', function () { cashConfirmDialog.close(); });
    document.getElementById('cash-confirm-close').addEventListener('click', function () { cashConfirmDialog.close(); });
    document.getElementById('confirm-cash-order').addEventListener('click', function () {
        cashConfirmDialog.close();
        window.NostalgiaNotifications.add({ id: "order-NOST-0012-confirmed", category: "orders", title: "Your order is confirmed.", body: "Your Compact Digital Camera order has been placed. Pay $100 on delivery.", action: "Track order", href: "../order-tracking/order-tracking.html" });
        orderConfirmationDialog.showModal();
    });
    document.getElementById('close-order-confirmation').addEventListener('click', function () { orderConfirmationDialog.close(); });
    orderConfirmationDialog.addEventListener('click', function (event) {
        if (event.target === orderConfirmationDialog) orderConfirmationDialog.close();
    });
    cashConfirmDialog.addEventListener('click', function (event) {
        if (event.target === cashConfirmDialog) cashConfirmDialog.close();
    });
    updateContinueButton();

    var fields = {
        name: document.getElementById('recipient-name'),
        phone: document.getElementById('recipient-phone'),
        governorate: document.getElementById('recipient-governorate'),
        city: document.getElementById('recipient-city'),
        street: document.getElementById('recipient-street'),
        building: document.getElementById('recipient-building'),
        unit: document.getElementById('recipient-unit'),
        notes: document.getElementById('recipient-notes'),
        latitude: document.getElementById('delivery-latitude'),
        longitude: document.getElementById('delivery-longitude')
    };

    function updatePoint(latlng) {
        selectedPoint = latlng;
        fields.latitude.value = latlng.lat.toFixed(6);
        fields.longitude.value = latlng.lng.toFixed(6);
        document.getElementById('map-selection').textContent = 'Pinned: ' + fields.latitude.value + ', ' + fields.longitude.value;
        if (marker) {
            marker.setLatLng(latlng);
        } else {
            marker = L.marker(latlng, { draggable: true }).addTo(map);
            marker.on('dragend', function (event) { updatePoint(event.target.getLatLng()); });
        }
    }

    function initializeMap() {
        if (map || !window.L) return;
        var startingPoint = [31.9539, 35.9106];
        map = L.map(mapElement).setView(startingPoint, 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        }).addTo(map);
        map.on('click', function (event) { updatePoint(event.latlng); });
        map.invalidateSize();
    }

    function openEditor() {
        dialog.showModal();
        window.setTimeout(function () {
            initializeMap();
            if (map) map.invalidateSize();
        }, 80);
    }

    document.getElementById('edit-address').addEventListener('click', openEditor);
    document.getElementById('close-address').addEventListener('click', function () { dialog.close(); });
    document.getElementById('cancel-address').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (event) {
        if (event.target === dialog) dialog.close();
    });

    document.getElementById('use-current-location').addEventListener('click', function () {
        var status = document.getElementById('map-selection');
        if (!navigator.geolocation) {
            status.textContent = 'Location access is not available in this browser. Choose a point on the map.';
            return;
        }
        status.textContent = 'Finding your current location…';
        navigator.geolocation.getCurrentPosition(function (position) {
            var point = [position.coords.latitude, position.coords.longitude];
            map.setView(point, 16);
            updatePoint({ lat: point[0], lng: point[1] });
        }, function () {
            status.textContent = 'Could not access your location. Allow location access or choose a point on the map.';
        }, { enableHighAccuracy: true, timeout: 10000 });
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var error = document.getElementById('address-error');
        error.hidden = true;
        if (!form.reportValidity()) return;
        if (!selectedPoint) {
            error.textContent = 'Choose your exact delivery point on the map before saving.';
            error.hidden = false;
            return;
        }

        var streetAddress = Array.from(new Set([fields.building.value.trim(), fields.street.value.trim(), fields.city.value.trim(), fields.governorate.value, 'Jordan'].filter(Boolean))).join(', ');
        var unit = fields.unit.value.trim();
        if (unit) streetAddress += ' · ' + unit;
        document.getElementById('saved-name').textContent = fields.name.value.trim();
        document.getElementById('saved-address').textContent = streetAddress;
        document.getElementById('saved-contact').textContent = fields.phone.value.trim() + (fields.notes.value.trim() ? ' · ' + fields.notes.value.trim() : '');
        var pin = document.getElementById('saved-pin');
        pin.textContent = 'Map pin: ' + fields.latitude.value + ', ' + fields.longitude.value;
        pin.hidden = false;
        dialog.close();
    });
});
