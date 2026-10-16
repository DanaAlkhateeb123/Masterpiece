document.addEventListener('DOMContentLoaded', function () {
    var listingRail = document.getElementById('antique-listings');
    var listingCards = Array.prototype.slice.call(document.querySelectorAll('[data-antique-card]'));
    var typeFilter = document.getElementById('listing-type-filter');
    var priceSort = document.getElementById('listing-price-sort');
    var noResults = document.getElementById('no-antique-results');

    function updateListings() {
        var selectedType = typeFilter ? typeFilter.value : 'all';
        var selectedSort = priceSort ? priceSort.value : 'default';
        var visibleCards = listingCards.filter(function (card) {
            return selectedType === 'all' || card.dataset.listingType === selectedType;
        });

        if (selectedSort === 'price-asc') {
            visibleCards.sort(function (a, b) { return Number(a.dataset.price) - Number(b.dataset.price); });
        } else if (selectedSort === 'price-desc') {
            visibleCards.sort(function (a, b) { return Number(b.dataset.price) - Number(a.dataset.price); });
        } else {
            visibleCards.sort(function (a, b) { return listingCards.indexOf(a) - listingCards.indexOf(b); });
        }

        listingCards.forEach(function (card) {
            card.hidden = visibleCards.indexOf(card) === -1;
        });
        visibleCards.forEach(function (card) { listingRail.appendChild(card); });
        if (noResults) noResults.hidden = visibleCards.length > 0;
    }

    if (typeFilter) typeFilter.addEventListener('change', updateListings);
    if (priceSort) priceSort.addEventListener('change', updateListings);
    updateListings();

    document.querySelectorAll('.antique-card').forEach(function (card) {
        card.setAttribute('tabindex', '0');
        card.addEventListener('click', function (event) {
            if (event.target.closest('.antique-heart, a, button')) return;
            window.location.href = '../item-details/item-details.html?item=' + encodeURIComponent(card.dataset.item);
        });
        card.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            window.location.href = '../item-details/item-details.html?item=' + encodeURIComponent(card.dataset.item);
        });
    });


    var defaultFavoriteIds = ['fav-sweater', 'fav-jacket', 'fav-sofa', 'fav-board-game'];
    var favoritesStorageKey = 'nostalgiaAntiqueFavorites';
    var catalogStorageKey = 'nostalgiaFavoriteCatalog';

    function readFavorites() {
        try {
            var stored = localStorage.getItem(favoritesStorageKey);
            if (stored === null) return defaultFavoriteIds.slice();
            var saved = JSON.parse(stored);
            return Array.isArray(saved) ? saved : [];
        } catch (error) { return []; }
    }

    function readCatalog() {
        try {
            var saved = JSON.parse(localStorage.getItem(catalogStorageKey) || '{}');
            return saved && typeof saved === 'object' ? saved : {};
        } catch (error) { return {}; }
    }

    function saveFavorites(favorites, catalog) {
        try {
            localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
            localStorage.setItem(catalogStorageKey, JSON.stringify(catalog));
        }
        catch (error) { /* Favorites remain interactive for this visit when storage is unavailable. */ }
    }

    var favorites = readFavorites();
    var favoriteCatalog = readCatalog();
    document.querySelectorAll('.antique-heart').forEach(function (button) {
        var card = button.closest('[data-antique-card]');
        var itemId = card && card.dataset.item;
        var isSaved = itemId && favorites.indexOf(itemId) !== -1;
        button.setAttribute('aria-pressed', String(Boolean(isSaved)));
        if (isSaved) button.setAttribute('aria-label', 'Remove ' + itemId.replace(/-/g, ' ') + ' from favorites');
        button.addEventListener('click', function () {
            if (!itemId) return;
            var currentlySaved = button.getAttribute('aria-pressed') === 'true';
            button.setAttribute('aria-pressed', String(!currentlySaved));
            if (currentlySaved) {
                favorites = favorites.filter(function (id) { return id !== itemId; });
            } else {
                if (favorites.indexOf(itemId) === -1) favorites.push(itemId);
                var image = card.querySelector('.antique-card-image img');
                var title = card.querySelector('h3');
                var seller = card.querySelector('.antique-seller');
                var rating = card.querySelector('.antique-rating');
                favoriteCatalog[itemId] = {
                    title: title ? title.textContent.trim() : itemId,
                    image: image ? image.src : '',
                    alt: image ? image.alt : itemId,
                    seller: seller ? seller.textContent.replace(/^Seller:\s*/, '').trim() : 'Nostalgia seller',
                    location: 'Amman, Jordan',
                    price: card.dataset.price + ' JD',
                    condition: card.dataset.listingType === 'auction' ? 'Auction' : 'Fixed Price',
                    category: 'Antiques',
                    rating: rating ? rating.textContent.replace(/[^0-9.\/]/g, '').trim() : '4.8',
                    description: 'A carefully selected antique from the Nostalgia marketplace.'
                };
            }
            saveFavorites(favorites, favoriteCatalog);
        });
    });

    var countdown = document.querySelector('.auction-countdown');
    if (countdown) {
        var remaining = ((2 * 24 + 8) * 60 + 14) * 60 + 22;
        var parts = countdown.querySelectorAll('b');
        window.setInterval(function () {
            if (remaining > 0) remaining -= 1;
            var days = Math.floor(remaining / 86400);
            var hours = Math.floor((remaining % 86400) / 3600);
            var minutes = Math.floor((remaining % 3600) / 60);
            var seconds = remaining % 60;
            [days, hours, minutes, seconds].forEach(function (value, index) {
                parts[index].textContent = String(value).padStart(2, '0');
            });
        }, 1000);
    }
});
