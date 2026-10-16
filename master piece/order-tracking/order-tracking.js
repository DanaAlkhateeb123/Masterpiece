document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var method = params.get('method');
    var cash = method === 'cod';
    var paid = !cash && (method === 'card' || method === 'apple') && params.get('payment') === 'paid';
    var status = document.getElementById('payment-status');
    status.textContent = paid ? 'Paid' : 'Pending';
    status.classList.toggle('is-paid', paid);
    status.classList.toggle('is-pending', !paid);
    document.getElementById('payment-method').textContent = cash ? 'Cash on delivery · $100 due on arrival' : paid ? (method === 'apple' ? 'Apple Pay' : 'Card payment') + ' · $100 paid' : 'Awaiting payment confirmation';
    var title = document.getElementById('first-track-title');
    var description = document.getElementById('first-track-description');
    title.textContent = paid ? 'Payment received' : 'Order confirmed';
    description.textContent = cash ? 'Your order is confirmed. Pay $100 in cash when the camera is delivered.' : paid ? 'Your payment has been received by Nostalgia.' : 'Your order is confirmed. Payment is awaiting confirmation.';
    if (!paid) {
        document.querySelector('.completion-thanks').textContent = cash ? 'Thank you for shopping with Nostalgia. Your item has been marked as received.' : 'Thank you for shopping with Nostalgia. Your item has been marked as received. Payment confirmation is still pending.';
    }
    var deliveryDialog = document.getElementById('confirm-delivery-dialog');
    var completionDialog = document.getElementById('order-completed-dialog');
    var openButton = document.getElementById('open-confirm-delivery');
    var confirmButton = document.getElementById('confirm-received-item');
    if (!deliveryDialog || !completionDialog || !openButton || !confirmButton) return;

    openButton.addEventListener('click', function () {
        deliveryDialog.showModal();
    });

    confirmButton.addEventListener('click', function () {
        deliveryDialog.close();
        window.NostalgiaNotifications.add({ id: "order-NOST-0012-delivered", category: "orders", title: "Your order is complete.", body: "You confirmed receipt of your Compact Digital Camera. Enjoy your find!", action: "My orders", href: "../user-orders/user-orders.html" });
        completionDialog.showModal();
    });

    deliveryDialog.querySelectorAll('[data-close-delivery-dialog]').forEach(function (button) {
        button.addEventListener('click', function () {
            deliveryDialog.close();
        });
    });

    completionDialog.querySelectorAll('[data-close-completion-dialog]').forEach(function (button) {
        button.addEventListener('click', function () {
            completionDialog.close();
        });
    });

    [deliveryDialog, completionDialog].forEach(function (dialog) {
        dialog.addEventListener('click', function (event) {
            if (event.target === dialog) dialog.close();
        });
    });
});
