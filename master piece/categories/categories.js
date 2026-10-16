document.addEventListener('DOMContentLoaded', function () {
    var tabs = Array.from(document.querySelectorAll('.category-tab'));
    var title = document.getElementById('category-title');
    var description = document.getElementById('category-description');
    var conditionButtons = Array.from(document.querySelectorAll('[data-filter]'));
    var genderSection = document.getElementById('gender-filter');
    var genderButtons = Array.from(document.querySelectorAll('#gender-filter [data-gender]'));
    var sortSelect = document.getElementById('sort-products');
    var grid = document.getElementById('product-grid');
    var emptyMessage = document.getElementById('empty-category');

    var additionalItems = [
        { category: 'antiques', name: 'Vintage Art Print', price: 85, condition: 'used', date: '2026-09-26', image: 'photo-1577083552431-6e5fd01aa342', alt: 'Vintage framed artwork', seller: 'Maha Saleh' },
        { category: 'antiques', name: 'Hand-Painted Ceramic Vase', price: 60, condition: 'used', date: '2026-09-22', image: 'photo-1578749556568-bc2c40e68b61', alt: 'Hand-painted ceramic vase', seller: 'Khaled Nasser' },
        { category: 'books', name: 'Classic Literature Set', price: 28, condition: 'used', date: '2026-09-25', image: 'photo-1544947950-fa07a98d237f', alt: 'A collection of classic books', seller: 'Rana Ahmad' },
        { category: 'books', name: 'The Art of Living', price: 14, condition: 'new', date: '2026-09-19', image: 'photo-1512820790803-83ca734da794', alt: 'Open book on a table', seller: 'Tareq Ali' },
        { category: 'games', name: 'Classic Board Game', price: 22, condition: 'used', date: '2026-09-24', image: 'photo-1720205836109-7bc7e4bb7d8c', alt: 'Classic board game ready to play', seller: 'Nour Haddad' },
        { category: 'games', name: 'Wireless Game Controller', price: 35, condition: 'used', date: '2026-09-17', image: 'photo-1593305841991-05c297ba4575', alt: 'Video game console setup', seller: 'Omar Khalil' },
        { category: 'accessories', name: 'Gold-Tone Hoop Earrings', price: 32, condition: 'new', date: '2026-09-23', image: 'photo-1617038220319-276d3cfab638', alt: 'Elegant gold-tone jewelry', seller: 'Lina Ahmad' },
        { category: 'accessories', name: 'Vintage Pendant Necklace', price: 27, condition: 'used', date: '2026-09-14', image: 'photo-1515562141207-7a88fb7ce338', alt: 'Delicate pendant necklace', seller: 'Sara Ahmad' },
        { category: 'bags', name: 'Classic Leather Handbag', price: 75, condition: 'used', date: '2026-09-21', image: 'photo-1584917865442-de89df76afd3', alt: 'Classic leather handbag', seller: 'Dana Saleh' },
        { category: 'bags', name: 'Everyday Canvas Tote', price: 24, condition: 'new', date: '2026-09-13', image: 'photo-1544816155-12df9643f363', alt: 'Canvas tote bag', seller: 'Hala Odeh' },
        { category: 'shoes', name: 'Leather Ballet Flats', price: 48, condition: 'used', date: '2026-09-20', image: 'photo-1543163521-1bf539c55dd2', alt: 'Elegant leather flats', seller: 'Maya Nasser' },
        { category: 'shoes', name: 'Everyday White Sneakers', price: 40, condition: 'new', date: '2026-09-12', image: 'photo-1542291026-7eec264c27ff', alt: 'White everyday sneakers', seller: 'Zaid Omar' },
        { category: 'other', name: 'Handmade Ceramic Bowl', price: 30, condition: 'new', date: '2026-09-18', image: 'photo-1578749556568-bc2c40e68b61', alt: 'Handmade ceramic bowl', seller: 'Ruba Mansour' },
        { category: 'other', name: 'Decorative Table Clock', price: 38, condition: 'used', date: '2026-09-11', image: 'photo-1523275335684-37898b6baf30', alt: 'Decorative table clock', seller: 'Sami Nasser' }
    ];

    function itemSlug(value) {
        return value.toLocaleLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    additionalItems.forEach(function (item) {
        var card = document.createElement('article');
        card.className = 'product-card';
        card.dataset.item = 'category-' + itemSlug(item.name);
        card.dataset.category = item.category;
        card.dataset.condition = item.condition;
        card.dataset.price = String(item.price);
        card.dataset.created = item.date;
        card.innerHTML = '<div class="product-image"><img src="https://images.unsplash.com/' + item.image + '?auto=format&fit=crop&w=900&q=80" alt="' + item.alt + '" loading="lazy"><button class="favorite-button" type="button" aria-label="Add ' + item.name + ' to favorites" aria-pressed="false"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg></button></div><div class="product-info"><h3 class="product-title"><a href="../item-details/item-details.html">' + item.name + '</a></h3><p class="product-meta">$' + item.price + ' <span class="product-dot">•</span> <span class="product-condition product-condition--' + item.condition + '">' + (item.condition === 'new' ? 'New' : 'Used') + '</span></p><p class="product-rating" aria-label="4.8 out of 5 stars; preliminary AI rating"><span class="rating-stars" aria-hidden="true">★★★★★</span> <span class="rating-value">4.8/5</span> <span class="rating-source">AI rating</span></p><p class="product-seller">Seller: ' + item.seller + '</p></div>';
        card.querySelector('.product-title a').href = '../item-details/item-details.html?item=' + encodeURIComponent(card.dataset.item);
        grid.appendChild(card);
    });

    var cards = Array.from(grid.querySelectorAll('.product-card'));
    for (var cardIndex = cards.length - 1; cardIndex > 0; cardIndex -= 1) {
        var randomIndex = Math.floor(Math.random() * (cardIndex + 1));
        var cardAtIndex = cards[cardIndex];
        cards[cardIndex] = cards[randomIndex];
        cards[randomIndex] = cardAtIndex;
    }
    cards.forEach(function (card) {
        if (!card.dataset.item) {
            var titleLink = card.querySelector('.product-title a');
            card.dataset.item = 'category-' + itemSlug(titleLink ? titleLink.textContent : 'item');
        }
        var detailLink = card.querySelector('.product-title a');
        if (detailLink) detailLink.href = '../item-details/item-details.html?item=' + encodeURIComponent(card.dataset.item);
        grid.appendChild(card);
    });
    var resultsHeader = document.querySelector('.category-header');
    function scrollToResults() {
        if (!resultsHeader) return;
        var siteHeader = document.getElementById('site-header');
        var offset = (siteHeader ? siteHeader.getBoundingClientRect().height : 0) + 16;
        var top = resultsHeader.getBoundingClientRect().top + window.scrollY - offset;
        var behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        window.scrollTo({ top: Math.max(0, top), behavior: behavior });
    }
    function categoryLabel(tab) { return (tab.dataset.label || tab.textContent).trim(); }

    var categoryDescriptions = {
        electronics: 'Phones, gadgets and everyday tech looking for a new home.',
        clothes: 'Pre-loved and new clothing for every style and age.',
        furniture: 'Furniture to make every room feel like home.',
        books: 'Stories, textbooks and great reads ready for another reader.',
        games: 'Video games, board games and playtime favorites.',
        antiques: 'One-of-a-kind vintage finds with a story to tell.',
        accessories: 'Jewelry and finishing touches to make every outfit yours.',
        bags: 'Handbags, clutches and totes to carry it all with you.',
        shoes: 'Everyday sneakers, dress shoes and more for every step.',
        other: 'The useful, unusual and wonderful finds that do not fit anywhere else.'
    };

    var params = new URLSearchParams(window.location.search);
    var searchQuery = (params.get('search') || '').trim();
    var normalizedSearch = searchQuery.toLocaleLowerCase();
    var requestedCategory = params.get('category');
    var categoryFromUrl = tabs.find(function (tab) {
        return requestedCategory && tab.dataset.category === requestedCategory.toLocaleLowerCase();
    });
    var matchedCategory = tabs.find(function (tab) {
        var label = categoryLabel(tab).toLocaleLowerCase();
        return normalizedSearch && (normalizedSearch === tab.dataset.category || normalizedSearch === label || normalizedSearch === label.replace(/s$/, '') || normalizedSearch.includes(label));
    });
    var state = {
        category: matchedCategory ? matchedCategory.dataset.category : (categoryFromUrl ? categoryFromUrl.dataset.category : 'all'),
        condition: 'all', gender: 'all', sort: 'default',
        search: searchQuery && !matchedCategory ? normalizedSearch : ''
    };

    if (matchedCategory || categoryFromUrl) {
        var selectedCategoryTab = matchedCategory || categoryFromUrl;
        title.textContent = categoryLabel(selectedCategoryTab);
        description.textContent = categoryDescriptions[state.category];
    } else if (state.search) {
        title.textContent = 'Search results';
        description.textContent = 'Items matching “' + searchQuery + '”.';
    } else {
        title.textContent = 'All items';
        description.textContent = 'A little something from every category, ready to find a new home.';
    }
    tabs.forEach(function (tab) {
        var selected = tab === matchedCategory || (!matchedCategory && !state.search && tab.dataset.category === state.category);
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', String(selected));
        if (selected) tab.setAttribute('aria-current', 'true');
        else tab.removeAttribute('aria-current');
    });

    function applyFilters() {
        var visibleCount = 0;
        var matchingCards = cards.filter(function (card) {
            var audienceLabel = card.querySelector('.product-audience');
            var audience = audienceLabel ? audienceLabel.textContent.toLocaleLowerCase() : '';
            var matches = (state.category === 'all' || card.dataset.category === state.category) &&
                (state.condition === 'all' || card.dataset.condition === state.condition) &&
                (state.category !== 'clothes' || state.gender === 'all' || audience === ("for " + state.gender)) &&
                (!state.search || (card.querySelector('.product-title').textContent + ' ' + card.querySelector('img').alt).toLocaleLowerCase().includes(state.search));
            card.hidden = !matches;
            if (matches) visibleCount += 1;
            return matches;
        });

        matchingCards.sort(function (a, b) {
            var priceDiff = Number(a.dataset.price) - Number(b.dataset.price);
            var dateDiff = new Date(a.dataset.created) - new Date(b.dataset.created);
            if (state.sort === 'price-asc') return priceDiff;
            if (state.sort === 'price-desc') return -priceDiff;
            if (state.sort === 'date-desc') return -dateDiff;
            if (state.sort === 'date-asc') return dateDiff;
            return cards.indexOf(a) - cards.indexOf(b);
        });
        matchingCards.forEach(function (card) { grid.appendChild(card); });

        emptyMessage.hidden = visibleCount > 0;
        genderSection.hidden = state.category !== 'clothes';
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            if (tab.dataset.category === 'antiques') {
                window.location.href = '../antiqes/antiqes.html';
                return;
            }

            tabs.forEach(function (item) {
                var selected = item === tab;
                item.classList.toggle('is-active', selected);
                item.setAttribute('aria-selected', String(selected));
                if (selected) item.setAttribute('aria-current', 'true');
                else item.removeAttribute('aria-current');
            });
            state.category = tab.dataset.category;
            state.search = '';
            title.textContent = categoryLabel(tab);
            description.textContent = categoryDescriptions[state.category];
            state.condition = 'all';
            conditionButtons.forEach(function (button) {
                var selected = button.dataset.filter === 'all';
                button.classList.toggle('is-active', selected);
                button.setAttribute('aria-pressed', String(selected));
            });
            applyFilters();
            scrollToResults();
        });
    });

    conditionButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            state.condition = button.dataset.filter;
            conditionButtons.forEach(function (item) {
                var selected = item === button;
                item.classList.toggle('is-active', selected);
                item.setAttribute('aria-pressed', String(selected));
            });
            applyFilters();
        });
    });

    genderButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            state.gender = button.dataset.gender;
            genderButtons.forEach(function (item) {
                var selected = item === button;
                item.classList.toggle('is-active', selected);
                item.setAttribute('aria-pressed', String(selected));
            });
            applyFilters();
        });
    });

    sortSelect.addEventListener('change', function () {
        state.sort = sortSelect.value;
        applyFilters();
    });

    var favoritesStorageKey = 'nostalgiaAntiqueFavorites';
    var catalogStorageKey = 'nostalgiaFavoriteCatalog';
    var defaultFavoriteIds = ['fav-sweater', 'fav-jacket', 'fav-sofa', 'fav-board-game'];

    function readFavoriteIds() {
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

    function saveFavoriteState(ids, catalog) {
        try {
            localStorage.setItem(favoritesStorageKey, JSON.stringify(ids));
            localStorage.setItem(catalogStorageKey, JSON.stringify(catalog));
        } catch (error) { /* Favorites remain interactive for this visit when storage is unavailable. */ }
    }

    function getCardRecord(card) {
        var image = card.querySelector('.product-image img');
        var title = card.querySelector('.product-title');
        var seller = card.querySelector('.product-seller');
        var condition = card.querySelector('.product-condition');
        var rating = card.querySelector('.rating-value');
        return {
            title: title ? title.textContent.trim() : 'Saved item',
            image: image ? image.src : '',
            alt: image ? image.alt : 'Saved item',
            seller: seller ? seller.textContent.replace(/^Seller:\s*/, '').trim() : 'Nostalgia seller',
            location: 'Amman, Jordan',
            price: '$' + (card.dataset.price || '0'),
            condition: condition ? condition.textContent.trim() : 'Used',
            category: card.dataset.category || 'Other',
            rating: rating ? rating.textContent.trim() : '4.8/5',
            description: 'A carefully selected piece from the Nostalgia marketplace.'
        };
    }

    var savedIds = readFavoriteIds();
    var savedCatalog = readCatalog();
    cards.forEach(function (card) {
        savedCatalog[card.dataset.item] = getCardRecord(card);
        card.addEventListener('click', function (event) {
            if (event.target.closest('.favorite-button, a, button')) return;
            window.location.href = '../item-details/item-details.html?item=' + encodeURIComponent(card.dataset.item);
        });
        card.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            window.location.href = '../item-details/item-details.html?item=' + encodeURIComponent(card.dataset.item);
        });
        card.setAttribute('tabindex', '0');
    });
    saveFavoriteState(savedIds, savedCatalog);
    document.querySelectorAll('.favorite-button').forEach(function (button) {
        button.addEventListener('click', function () {
            var card = button.closest('.product-card');
            if (!card || !card.dataset.item) return;
            var itemId = card.dataset.item;
            var pressed = button.getAttribute('aria-pressed') === 'true';
            button.setAttribute('aria-pressed', String(!pressed));
            if (pressed) {
                savedIds = savedIds.filter(function (id) { return id !== itemId; });
            } else {
                if (savedIds.indexOf(itemId) === -1) savedIds.push(itemId);
                savedCatalog[itemId] = getCardRecord(card);
            }
            saveFavoriteState(savedIds, savedCatalog);
        });
        var card = button.closest('.product-card');
        var isSaved = card && savedIds.indexOf(card.dataset.item) !== -1;
        button.setAttribute('aria-pressed', String(Boolean(isSaved)));
    });

    applyFilters();
});








