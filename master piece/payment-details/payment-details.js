document.addEventListener('DOMContentLoaded', function () {
    var tabs = document.querySelectorAll('.payment-tab');
    var cardFields = document.getElementById('card-fields');
    var appleNote = document.getElementById('apple-note');
    var form = document.getElementById('payment-form');
    var number = document.getElementById('card-number');
    var expiry = document.getElementById('expiry-date');
    var confirmationDialog = document.getElementById('order-confirmation-dialog');
    var confirmationMethod = document.getElementById('order-confirmation-method');

    document.getElementById('close-order-confirmation').addEventListener('click', function () { confirmationDialog.close(); });
    confirmationDialog.addEventListener('click', function (event) {
        if (event.target === confirmationDialog) confirmationDialog.close();
    });

    // Card / Apple Pay tabs
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var apple = tab.dataset.method === 'apple';
            tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
            cardFields.hidden = apple;
            appleNote.hidden = !apple;
            // the card fields are only required when paying by card
            cardFields.querySelectorAll('input[required]').forEach(function (i) { i.disabled = apple; });
        });
    });

    // Card number: digits only, grouped as 1234 5678 9012 3456
    number.addEventListener('input', function () {
        var digits = number.value.replace(/\D/g, '').slice(0, 16);
        number.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });

    // Expiry: MM/YY
    expiry.addEventListener('input', function () {
        var digits = expiry.value.replace(/\D/g, '').slice(0, 4);
        expiry.value = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // TODO: process the payment through a payment provider (never store card numbers yourself)
        var activeMethod = document.querySelector('.payment-tab.is-active')?.dataset.method;
        confirmationMethod.textContent = (activeMethod === 'apple' ? 'Apple Pay' : 'Card payment') + ' · $100 paid';
        window.NostalgiaNotifications.add({ id: "order-NOST-0012-confirmed", category: "orders", title: "Your order is confirmed.", body: "Your Compact Digital Camera order is confirmed and payment has been received.", action: "Track order", href: "../order-tracking/order-tracking.html" });
        confirmationDialog.querySelector('a[href*="order-tracking"]').href = "../order-tracking/order-tracking.html?method=" + (activeMethod === "apple" ? "apple" : "card") + "&payment=paid";
        confirmationDialog.showModal();
    });
});
