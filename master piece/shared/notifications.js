(function () {
    function key() {
        var user;
        try { user = JSON.parse(localStorage.getItem('nostalgiaUser') || 'null'); } catch (_) {}
        return 'nostalgiaNotifications:' + (user && (user.id || user.email) || 'guest');
    }
    function read() {
        try { var data = JSON.parse(localStorage.getItem(key()) || '[]'); return Array.isArray(data) ? data.filter(function (n) { return n && typeof n.id === 'string'; }) : []; } catch (_) { return []; }
    }
    function save(items) {
        try { localStorage.setItem(key(), JSON.stringify(items)); window.dispatchEvent(new Event('nostalgia-notifications-changed')); return true; } catch (_) { return false; }
    }
    window.NostalgiaNotifications = {
        read: read, save: save,
        add: function (notification) {
            try {
                var preferences = JSON.parse(localStorage.getItem(key().replace("nostalgiaNotifications:", "nostalgiaPreferences:")) || "{}");
                if (preferences && preferences[notification.category] === false) return true;
            } catch (_) {}
            var items = read();
            if (items.some(function (item) { return item.id === notification.id; })) return true;
            return save([Object.assign({ read: false, createdAt: new Date().toISOString() }, notification)].concat(items));
        }
    };
})();