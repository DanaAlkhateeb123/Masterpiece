document.addEventListener('DOMContentLoaded', function () {
    var hero = document.querySelector('.antiques-hero');
    if (hero) {
        var clockLayer = document.createElement('div');
        clockLayer.className = 'hero-clock-layer';
        clockLayer.setAttribute('aria-hidden', 'true');
        var numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
        var dial = '';
        for (var tick = 0; tick < 60; tick += 1) {
            dial += '<path d="M0 -238 v' + (tick % 5 === 0 ? '16' : '7') + '" transform="rotate(' + tick * 6 + ')"/>';
        }
        var numbers = numerals.map(function (label, index) {
            var angle = index * Math.PI / 6;
            return '<text x="' + Math.sin(angle) * 194 + '" y="' + (-Math.cos(angle) * 194 + 13) + '">' + label + '</text>';
        }).join('');
        clockLayer.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1900 1900">' +
            '<defs><radialGradient id="hero-dial-paper"><stop stop-color="#f8f2df"/><stop offset=".8" stop-color="#e9dfc8"/><stop offset="1" stop-color="#bcae91"/></radialGradient></defs>' +
            '<g transform="translate(960 780) scale(.96 1.04)">' +
            '<circle r="244" fill="url(#hero-dial-paper)" stroke="#9c8968" stroke-width="3"/>' +
            '<g fill="none" stroke="#6b5c49" stroke-width="2">' + dial + '<circle r="219" stroke-width="1"/><circle r="158" stroke-width="1" opacity=".4"/></g>' +
            '<g fill="#29283b" font-family="Georgia,serif" font-size="42" text-anchor="middle">' + numbers + '</g>' +
            '<g fill="#4a3620" stroke="#b49a61" stroke-width="2"><g data-clock-hour><path d="M-7 25 L-10 -70 L0 -139 L10 -70 L7 25Z"/><circle cy="-83" r="11" fill="#e9dfc8"/></g>' +
            '<g data-clock-minute><path d="M-5 32 L-7 -130 L0 -195 L7 -130 L5 32Z"/><circle cy="-138" r="8" fill="#e9dfc8"/></g></g>' +
            '<g data-clock-second stroke="#864333" stroke-width="3"><path d="M0 42V-214"/><circle cy="31" r="8" fill="none"/></g>' +
            '<circle r="12" fill="#a08249" stroke="#46341e" stroke-width="3"/></g></svg>';
        hero.insertBefore(clockLayer, hero.firstChild);
        var hourHand = clockLayer.querySelector('[data-clock-hour]');
        var minuteHand = clockLayer.querySelector('[data-clock-minute]');
        var secondHand = clockLayer.querySelector('[data-clock-second]');
        function positionClock() {
            var size = Math.max(hero.clientWidth, hero.clientHeight);
            var horizontalPosition = parseFloat(window.getComputedStyle(hero).backgroundPositionX) / 100;
            clockLayer.style.width = clockLayer.style.height = size + 'px';
            clockLayer.style.left = (hero.clientWidth - size) * horizontalPosition + 'px';
            clockLayer.style.top = (hero.clientHeight - size) * .5 + 'px';
        }
        var clockStartTime = Date.now();
        var clockAnimationStart = performance.now();
        function updateClock() {
            var now = new Date(clockStartTime + (performance.now() - clockAnimationStart) * 6);
            var seconds = now.getSeconds() + now.getMilliseconds() / 1000;
            var minutes = now.getMinutes() + seconds / 60;
            hourHand.setAttribute('transform', 'rotate(' + ((now.getHours() % 12 + minutes / 60) * 30) + ')');
            minuteHand.setAttribute('transform', 'rotate(' + minutes * 6 + ')');
            secondHand.setAttribute('transform', 'rotate(' + seconds * 6 + ')');
        }
        positionClock();
        updateClock();
        new ResizeObserver(positionClock).observe(hero);
        window.setInterval(function () { if (!document.hidden) updateClock(); }, 40);
        document.addEventListener('visibilitychange', updateClock);
    }
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
