document.addEventListener('DOMContentLoaded', function () {
    var list = document.getElementById('favorites-list');
    var count = document.getElementById('favorites-count');
    var empty = document.getElementById('favorites-empty');
    var storageKey = 'nostalgiaAntiqueFavorites';
    var catalogStorageKey = 'nostalgiaFavoriteCatalog';
    var antiqueCatalog = {
        'vintage-clock': { title: 'Vintage Wooden Clock', image: 'https://i.etsystatic.com/64268298/c/1086/1086/0/181/il/b69725/8599642205/il_600x600.8599642205_tanc.jpg', alt: 'Ornate antique bronze clock', seller: 'Amani Haddad', location: 'Amman, Jordan', price: '85 JD', condition: 'Fixed Price' },
        'antique-vase': { title: 'Antique Vase', image: 'https://i.etsystatic.com/66105071/r/il/b477b5/8535133619/il_600x600.8535133619_2mo2.jpg', alt: 'Antique ceramic vase', seller: 'Omar Khalil', location: 'Amman, Jordan', price: '120 JD', condition: 'Fixed Price' },
        'old-painting': { title: 'Old Landscape Painting', image: 'https://www.bing.com/th/id/OIP.3yklNWYKY0TgYf5nXvi4mwHaHa?w=193&h=193&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=ImgAns&rm=2', alt: 'Classic framed landscape painting', seller: 'Lina Saleh', location: 'Irbid, Jordan', price: '200 JD', condition: 'Auction' },
        'vintage-lamp': { title: 'Vintage Table Lamp', image: 'https://i.etsystatic.com/61107663/c/2830/2830/157/151/il/c46794/8597901968/il_680x540.8597901968_6o93.jpg', alt: 'Vintage brass table lamp', seller: 'Sami Nasser', location: 'Zarqa, Jordan', price: '250 JD', condition: 'Fixed Price' },
        'heirloom-necklace': { title: 'Heirloom Statement Necklace', image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=850&q=85', alt: 'Heirloom gold statement necklace', seller: 'Maya Khalil', location: 'Amman, Jordan', price: '320 JD', condition: 'Auction' }
    };
    var savedCatalog = {};

    function readCatalog() {
        try {
            var catalog = JSON.parse(localStorage.getItem(catalogStorageKey) || '{}');
            return catalog && typeof catalog === 'object' ? catalog : {};
        } catch (error) { return {}; }
    }

    function readFavorites() {
        try {
            var stored = localStorage.getItem(storageKey);
            if (stored === null) {
                var initialIds = Array.from(list.querySelectorAll('.favorite-item[data-item]')).map(function (card) { return card.dataset.item; });
                localStorage.setItem(storageKey, JSON.stringify(initialIds));
                return initialIds;
            }
            var saved = JSON.parse(stored);
            return Array.isArray(saved) ? saved : [];
        } catch (error) { return []; }
    }

    function saveFavorites(favorites) {
        try { localStorage.setItem(storageKey, JSON.stringify(favorites)); }
        catch (error) { /* Favorites remain visible for this visit when storage is unavailable. */ }
    }

    function createAntiqueCard(itemId, item) {
        var card = document.createElement('article');
        card.className = 'favorite-item';
        card.dataset.item = itemId;
        card.innerHTML = '<div class="favorite-image-wrap"><img class="favorite-image" src="' + item.image + '" alt="' + item.alt + '" loading="lazy"><button class="remove-button" type="button" aria-label="Remove ' + item.title + ' from favorites" title="Remove from favorites"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.4Z"/></svg></button></div><div class="favorite-info"><a class="favorite-title" href="../item-details/item-details.html?item=' + itemId + '">' + item.title + '</a><p class="favorite-seller">' + item.seller + ' <span>·</span> ' + item.location + '</p><div class="favorite-meta"><span class="favorite-price">' + item.price + '</span><span class="favorite-condition">' + item.condition + '</span></div></div>';
        return card;
    }

    var favorites = readFavorites();

    function refresh() {
        var cards = Array.from(list.querySelectorAll('.favorite-item'));
        cards.forEach(function (card) {
            card.hidden = favorites.indexOf(card.dataset.item) === -1;
        });
        favorites.forEach(function (itemId) {
            var item = antiqueCatalog[itemId] || savedCatalog[itemId];
            if (!list.querySelector('[data-item="' + itemId + '"]') && item) {
                list.appendChild(createAntiqueCard(itemId, item));
            }
        });
        var visibleCount = list.querySelectorAll('.favorite-item:not([hidden])').length;
        count.textContent = visibleCount + (visibleCount === 1 ? ' saved piece' : ' saved pieces');
        empty.hidden = visibleCount > 0;
        count.hidden = visibleCount === 0;
        list.hidden = visibleCount === 0;
    }

    list.addEventListener('click', function (e) {
        var btn = e.target.closest('.remove-button');
        if (!btn) return;
        var card = btn.closest('.favorite-item');
        favorites = favorites.filter(function (id) { return id !== card.dataset.item; });
        saveFavorites(favorites);
        refresh();
    });

    window.addEventListener('storage', function (event) {
        if (event.key === catalogStorageKey) savedCatalog = readCatalog();
        if (event.key === storageKey) {
            try { favorites = JSON.parse(event.newValue || '[]'); }
            catch (error) { favorites = []; }
        }
        if (event.key !== storageKey && event.key !== catalogStorageKey) return;
        refresh();
    });

    savedCatalog = readCatalog();
    refresh();
});

