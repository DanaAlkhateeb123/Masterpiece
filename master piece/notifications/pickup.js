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
    api.hasDetails = function (n) {
        var p = n && n.pickup;
        return !!(n && n.pickupStatus === 'scheduled' && p &&
            ['name', 'governorate', 'city', 'phone', 'address', 'building'].every(function (key) { return typeof p[key] === 'string' && p[key].trim(); }) &&
            typeof p.latitude === 'number' && Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90 &&
            typeof p.longitude === 'number' && Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180);
    };
    document.addEventListener('DOMContentLoaded', function () {
        var dialog = document.getElementById('pickup-dialog'), form = document.getElementById('pickup-form');
        var selectedId = null, owner = null, saved = null;
        var error = document.getElementById('pickup-error');
        var fields = {};
        ['name', 'governorate', 'city', 'phone', 'address', 'building', 'unit', 'time', 'notes'].forEach(function (key) { fields[key] = document.getElementById('pickup-' + key); });
        var map = null, marker = null, point = null;
        function fill(value) { Object.keys(fields).forEach(function (key) { fields[key].value = value[key] || ''; }); }
        function setPoint(lat, lng) {
            if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng)) || Number(lat)<-90 || Number(lat)>90 || Number(lng)<-180 || Number(lng)>180) return;
            point = { lat: Number(lat), lng: Number(lng) };
            document.getElementById('pickup-latitude').value = point.lat.toFixed(6);
            document.getElementById('pickup-longitude').value = point.lng.toFixed(6);
            document.getElementById('pickup-map-selection').textContent = 'Pinned: ' + point.lat.toFixed(6) + ', ' + point.lng.toFixed(6);
            if (map) {
                if (marker) marker.setLatLng(point);
                else { marker = L.marker(point, { draggable: true }).addTo(map); marker.on('dragend', function (e) { var pos=e.target.getLatLng(); setPoint(pos.lat,pos.lng); }); }
            }
        }
        function restorePoint(value) {
            point = null;
            if (marker && map) { map.removeLayer(marker); marker=null; }
            document.getElementById('pickup-latitude').value = '';
            document.getElementById('pickup-longitude').value = '';
            document.getElementById('pickup-map-selection').textContent = 'No exact map point selected yet.';
            if(value && value.latitude != null && value.longitude != null) setPoint(value.latitude,value.longitude);
            if(map)map.setView(point || [31.9539,35.9106],point?16:12);
        }
        function initializeMap() {
            if(!map && window.L) {
                map=L.map('pickup-map').setView([31.9539,35.9106],12);
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
                map.on('click',function(e){setPoint(e.latlng.lat,e.latlng.lng);});
            }
            if(map){map.invalidateSize();if(point){setPoint(point.lat,point.lng);map.setView(point,16);}}
            else document.getElementById('pickup-map-selection').textContent='The map could not load. Check your connection and reopen this window.';
        }
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
                document.getElementById('pickup-title').textContent = 'Edit your address';
                form.querySelector('[type="submit"]').textContent = api.hasDetails(notification) ? 'Update Location' : 'Save Pickup Details';
                var user = JSON.parse(localStorage.getItem("nostalgiaUser") || "null") || {};
                fill(Object.assign({ name: user.name || [user.firstName,user.lastName].filter(Boolean).join(" "), phone:user.phone || "", governorate:"Amman" }, notification.pickup || {}));
                if(!fields.governorate.value)fields.governorate.value="Amman";
                restorePoint(notification.pickup);
                dialog.showModal();
                window.requestAnimationFrame(initializeMap);
            } catch (_) {
                document.getElementById('notification-status').textContent = 'Pickup details could not be opened in this browser.';
            }
        };
        document.getElementById('pickup-use-saved').addEventListener('change', function (event) {
            if (event.target.checked && saved) {
                ['name','governorate','city','phone','address','building','unit','notes'].forEach(function (key) { fields[key].value = saved[key] || ''; });
                if(!fields.governorate.value)fields.governorate.value="Amman";
                restorePoint(saved);
            }
        });
        document.getElementById('pickup-current-location').addEventListener('click',function(){
            var message=document.getElementById('pickup-map-selection');
            if(!map){initializeMap();if(!map)return;}
            if(!navigator.geolocation){message.textContent='Location access is not available. Choose a point on the map.';return;}
            var requestOwner=owner,requestId=selectedId;
            message.textContent='Finding your current location...';
            navigator.geolocation.getCurrentPosition(function(pos){
                if(!dialog.open || owner!==requestOwner || selectedId!==requestId)return;
                setPoint(pos.coords.latitude,pos.coords.longitude);map.setView(point,16);
            },function(){if(dialog.open && selectedId===requestId)message.textContent='Could not access your location. Allow location access or choose a point on the map.';},{enableHighAccuracy:true,timeout:10000});
        });
        ['pickup-close','pickup-cancel'].forEach(function (id) { document.getElementById(id).addEventListener('click', function () { dialog.close(); }); });
        dialog.addEventListener('click', function (event) { if(event.target === dialog) { var rect=dialog.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dialog.close(); } });
        form.addEventListener('submit', function (event) {
            event.preventDefault();error.hidden = true;
            if(!form.reportValidity())return;
            var pickup = {};
            Object.keys(fields).forEach(function (key) { pickup[key] = fields[key].value.trim(); });
            if(!pickup.name || !pickup.governorate || !pickup.city || !pickup.address || !pickup.building) { fail('Enter your full name, governorate, city, street, and building details.'); return; }
            if(!/^[+\d\s().-]+$/.test(pickup.phone) || pickup.phone.replace(/\D/g,'').length<7 || pickup.phone.replace(/\D/g,'').length>15) { fail('Enter a valid contact number.'); fields.phone.focus(); return; }
            if(!point) { fail("Choose your exact pickup point on the map before saving."); return; }
            pickup.latitude=point.lat;pickup.longitude=point.lng;
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
                    try { localStorage.setItem('nostalgiaPickupAddress:' + owner, JSON.stringify({ name:pickup.name, governorate:pickup.governorate, city:pickup.city, phone:pickup.phone, address:pickup.address, building:pickup.building, unit:pickup.unit, notes:pickup.notes, latitude:pickup.latitude, longitude:pickup.longitude })); } catch (_) { addressSaved = false; }
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