(function () {
    var api = window.NostalgiaPickup = {};
    function accountKey() {
        var user = JSON.parse(localStorage.getItem('nostalgiaUser') || 'null');
        return String(user && (user.id || user.email) || 'guest');
    }
    api.eligible = function (n) {
        return !!n && n.category === 'selling' && !['cancelled', 'delivered', 'completed'].includes(n.orderStatus) &&
            (n.type === 'seller_order_received' || n.id === 'demo-new-order' || n.title === 'New Order Received');
    };
    document.addEventListener('DOMContentLoaded', function () {
        var dialog = document.getElementById('pickup-dialog'), form = document.getElementById('pickup-form');
        var selectedId = null, owner = null, saved = null;
        var error = document.getElementById('pickup-error');
        var fields = {};
        ['city', 'phone', 'address', 'building', 'time', 'notes'].forEach(function (key) { fields[key] = document.getElementById('pickup-' + key); });
        function fill(value) { Object.keys(fields).forEach(function (key) { fields[key].value = value[key] || ''; }); }
        function fail(message) { error.textContent = message; error.hidden = false; }
        api.open = function (id) {
            error.hidden = true;form.reset();saved = null;
            try {
                owner = accountKey();
                var notification = window.NostalgiaNotifications.read().find(function (n) { return n.id === id; });
                if (!api.eligible(notification)) return;
                selectedId = id;
                try { saved = JSON.parse(localStorage.getItem('nostalgiaPickupAddress:' + owner) || 'null'); } catch (_) {}
                if (!saved || typeof saved !== 'object' || !saved.address) saved = null;
                document.getElementById('pickup-saved-wrap').hidden = !saved;
                document.getElementById('pickup-use-saved').checked = false;
                document.getElementById('pickup-title').textContent = notification.pickup ? 'Pickup Details' : 'Arrange Pickup';
                document.getElementById('pickup-item').textContent = [notification.itemName || 'Your ordered item', notification.orderId ? 'Order #' + notification.orderId : ''].filter(Boolean).join(' · ');
                form.querySelector('[type="submit"]').textContent = notification.pickup ? 'Update Location' : 'Save Pickup Details';
                fill(notification.pickup || {});
                dialog.showModal();
            } catch (_) {
                document.getElementById('notification-status').textContent = 'Pickup details could not be opened in this browser.';
            }
        };
        document.getElementById('pickup-use-saved').addEventListener('change', function (event) {
            if (event.target.checked && saved) {
                ['city','phone','address','building'].forEach(function (key) { fields[key].value = saved[key] || ''; });
            }
        });
        ['pickup-close','pickup-cancel'].forEach(function (id) { document.getElementById(id).addEventListener('click', function () { dialog.close(); }); });
        dialog.addEventListener('click', function (event) { if(event.target === dialog) { var rect=dialog.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dialog.close(); } });
        form.addEventListener('submit', function (event) {
            event.preventDefault();error.hidden = true;
            if(!form.reportValidity())return;
            var pickup = {};
            Object.keys(fields).forEach(function (key) { pickup[key] = fields[key].value.trim(); });
            if(!pickup.city || !pickup.address || !pickup.building) { fail('Enter your city, street address, and building details.'); return; }
            if(!/^[+\d\s().-]+$/.test(pickup.phone) || pickup.phone.replace(/\D/g,'').length<7 || pickup.phone.replace(/\D/g,'').length>15) { fail('Enter a valid contact number.'); fields.phone.focus(); return; }
            if(pickup.time) {
                // datetime-local is explicitly a Jordan wall-clock time (UTC+03:00).
                var date = new Date(pickup.time + ':00+03:00');
                if(!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) { fail('Choose a future pickup time, or leave it blank.'); fields.time.focus(); return; }
                pickup.timeZone = 'Asia/Amman';
            }
            try {
                if(accountKey() !== owner) { fail('Your account changed. Close this window and open the order again.'); return; }
                var all = window.NostalgiaNotifications.read();
                var n = all.find(function (entry) { return entry.id === selectedId; });
                if(!api.eligible(n)) { fail('This order is no longer available for pickup.'); return; }
                pickup.updatedAt = new Date().toISOString();
                n.pickup = pickup; n.pickupStatus = 'scheduled'; n.read = true;
                if(!window.NostalgiaNotifications.save(all)) { fail('Pickup details could not be saved. Please try again.'); return; }
                var addressSaved = true;
                if(document.getElementById('pickup-save-address').checked) {
                    try { localStorage.setItem('nostalgiaPickupAddress:' + owner, JSON.stringify({ city:pickup.city, phone:pickup.phone, address:pickup.address, building:pickup.building })); } catch (_) { addressSaved = false; }
                }
                dialog.close();
                window.dispatchEvent(new Event('nostalgia-pickup-updated'));
                document.getElementById('notification-status').textContent = addressSaved ? 'Pickup details saved. You can view or update the location anytime.' : 'Pickup details saved, but the address could not be saved for future use.';
            } catch (_) { fail('Pickup details could not be saved. Please try again.'); }
        });
        window.addEventListener('nostalgia-auth-changed', function () { if(dialog.open)dialog.close(); });
        window.addEventListener('storage', function () { if(dialog.open) { try { if(accountKey()!==owner)dialog.close(); } catch (_) { dialog.close(); } } });
    });
})();