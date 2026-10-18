document.addEventListener('DOMContentLoaded', function () {
    var antiqueItems = {
        'vintage-clock': {
            title: 'Vintage Wooden Clock', price: '85 JD', condition: 'Very Good', material: 'Wood and brass', location: 'Amman, Jordan', seller: 'Amani Haddad', initials: 'AH', category: 'Antiques · Clocks & Watches', rating: '4.8/5',
            image: 'https://i.etsystatic.com/64268298/c/1086/1086/0/181/il/b69725/8599642205/il_600x600.8599642205_tanc.jpg',
            description: 'A charming vintage wooden mantel clock with classic detailing and a warm patina. A beautiful statement piece for a living room, study, or collector’s shelf.'
        },
        'antique-vase': {
            title: 'Antique Vase', price: '120 JD', condition: 'Good', material: 'Hand-painted ceramic', location: 'Amman, Jordan', seller: 'Omar Khalil', initials: 'OK', category: 'Antiques · Decor & Home', rating: '4.7/5',
            image: 'https://i.etsystatic.com/66105071/r/il/b477b5/8535133619/il_600x600.8535133619_2mo2.jpg',
            description: 'A decorative ceramic vase with an old-world silhouette and hand-finished details. Its timeless shape makes it lovely displayed on its own or styled with dried flowers.'
        },
        'old-painting': {
            title: 'Old Landscape Painting', price: '200 JD', condition: 'Good', material: 'Oil on canvas, wood frame', location: 'Irbid, Jordan', seller: 'Lina Saleh', initials: 'LS', category: 'Antiques · Art & Painting', rating: '4.9/5',
            image: 'https://www.bing.com/th/id/OIP.3yklNWYKY0TgYf5nXvi4mwHaHa?w=193&h=193&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=ImgAns&rm=2',
            description: 'An atmospheric landscape painting in a beautifully aged frame. A distinctive vintage artwork with colors and character that bring warmth to any room.'
        },
        'vintage-lamp': {
            title: 'Vintage Table Lamp', price: '250 JD', condition: 'Very Good', material: 'Brass and glass', location: 'Zarqa, Jordan', seller: 'Sami Nasser', initials: 'SN', category: 'Antiques · Decor & Home', rating: '4.8/5',
            image: 'https://i.etsystatic.com/61107663/c/2830/2830/157/151/il/c46794/8597901968/il_680x540.8597901968_6o93.jpg',
            description: 'A vintage table lamp with a warm, inviting glow and timeless lines. An elegant accent for a bedside table, reading corner, or antique-inspired interior.'
        },
        'heirloom-necklace': {
            title: 'Heirloom Statement Necklace', price: '320 JD', condition: 'Very Good', material: 'Gold-tone metal and stones', location: 'Amman, Jordan', seller: 'Maya Khalil', initials: 'MK', category: 'Antiques · Jewelry', rating: '5/5',
            image: 'https://i.etsystatic.com/25780867/r/il/1889ba/7194662175/il_fullxfull.7194662175_hy1n.jpg',
            description: 'A richly detailed heirloom-inspired necklace, selected for its vintage character and striking craftsmanship. A special piece for collectors and lovers of statement jewelry.'
        }
    };
    Object.assign(antiqueItems, {
        'fav-sweater': {
            title: 'Hand-knit Wool Sweater', price: '$15.00', condition: 'Very good', material: 'Knit wool', location: 'Amman, Jordan', seller: 'Sara Ahmad', initials: 'SA', category: 'Clothes', categoryKey: 'clothes', breadcrumbCategory: 'Clothes', rating: '4.8/5',
            image: 'https://i.etsystatic.com/44692613/r/il/a94a98/6801900366/il_1588xN.6801900366_ryts.jpg',
            description: 'A cozy hand-knit cream wool sweater in very good condition, ready for another season.'
        },
        'fav-jacket': {
            title: 'Vintage Leather Jacket', price: '$25.00', condition: 'Excellent', material: 'Leather', location: 'Amman, Jordan', seller: 'Omar Ali', initials: 'OA', category: 'Clothes', categoryKey: 'clothes', breadcrumbCategory: 'Clothes', rating: '4.7/5',
            image: 'https://th.bing.com/th/id/OIP.FfG1ubCM9ezNgGNZvTszSAHaHa?w=900&h=900&c=7&rs=1',
            description: 'A vintage brown leather jacket in excellent condition, with a timeless everyday style.'
        },
        'fav-sofa': {
            title: 'Beige Two-Seat Sofa', price: '$320.00', condition: 'Very good', material: 'Upholstered fabric and wood', location: 'Amman, Jordan', seller: 'Hala Odeh', initials: 'HO', category: 'Furniture', categoryKey: 'furniture', breadcrumbCategory: 'Furniture', rating: '4.9/5',
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85',
            description: 'A soft beige two-seat sofa in very good condition, ready to bring a warm, comfortable feel to a new home.'
        },
        'fav-board-game': {
            title: 'Classic Board Game', price: '$22.00', condition: 'Good', material: 'Board, cards and game pieces', location: 'Amman, Jordan', seller: 'Nour Haddad', initials: 'NH', category: 'Games', categoryKey: 'games', breadcrumbCategory: 'Games', rating: '4.8/5',
            image: 'https://images.unsplash.com/photo-1720205836109-7bc7e4bb7d8c?auto=format&fit=crop&w=1200&q=85',
            description: 'A classic board game set in good condition, ready for a new game night.'
        }
    });

    var requestedItem = new URLSearchParams(window.location.search).get('item');
    try {
        var savedCatalog = JSON.parse(localStorage.getItem('nostalgiaFavoriteCatalog') || '{}');
        var savedItem = savedCatalog[requestedItem];
        if (savedItem && !antiqueItems[requestedItem]) {
            antiqueItems[requestedItem] = {
                title: savedItem.title,
                price: savedItem.price || 'Contact seller',
                condition: savedItem.condition || 'Used',
                material: 'See item description',
                location: savedItem.location || 'Amman, Jordan',
                seller: savedItem.seller || 'Nostalgia seller',
                initials: (savedItem.seller || 'NS').split(/\s+/).map(function (part) { return part.charAt(0); }).join('').slice(0, 2).toUpperCase(),
                category: savedItem.category || 'Marketplace',
                categoryKey: 'all',
                breadcrumbCategory: savedItem.category || 'Marketplace',
                rating: savedItem.rating || '4.8/5',
                image: savedItem.image,
                description: savedItem.description || 'A carefully selected piece from the Nostalgia marketplace.'
            };
        }
    } catch (error) { /* Detail pages still work for built-in items when storage is unavailable. */ }
    var antique = antiqueItems[requestedItem];
    if (antique) {
        document.title = antique.title + ' | Nostalgia';
        document.querySelector('.breadcrumb a:nth-of-type(2)').href = '../categories/categories.html?category=' + encodeURIComponent(antique.categoryKey || 'antiques');
        document.querySelector('.breadcrumb a:nth-of-type(2)').textContent = antique.breadcrumbCategory || 'Antiques';
        document.querySelector('.breadcrumb .current').textContent = antique.title;
        document.querySelector('.gallery-frame img').src = antique.image;
        document.querySelector('.gallery-frame img').alt = antique.title;
        document.getElementById('item-category').textContent = antique.category;
        document.getElementById('item-title').textContent = antique.title;
        document.getElementById('item-price').textContent = antique.price;
        document.getElementById('item-condition').textContent = antique.condition;
        document.getElementById('detail-category').textContent = antique.category;
        document.getElementById('detail-condition').textContent = antique.condition;
        document.getElementById('detail-material').textContent = antique.material;
        document.getElementById('detail-material').classList.remove('detail-unprovided');
        document.getElementById('detail-location').textContent = antique.location;
        var listingTypes = {
            'vintage-clock': 'Fixed Price (Direct Buy)',
            'antique-vase': 'Fixed Price (Direct Buy)',
            'old-painting': 'Auction',
            'vintage-lamp': 'Fixed Price (Direct Buy)',
            'heirloom-necklace': 'Auction'
        };
        document.getElementById('detail-listing-type').textContent = listingTypes[requestedItem] || 'Fixed Price (Direct Buy)';
        document.querySelector('.detail-rating').setAttribute('aria-label', antique.rating + ' out of 5 stars, AI rating');
        document.querySelector('.rating-value').textContent = antique.rating;
        document.getElementById('seller-profile-trigger').textContent = antique.seller;
        document.querySelector('.seller-avatar').textContent = antique.initials;
        document.querySelector('.item-description > p').textContent = antique.description;
        document.querySelector('.item-buy').textContent = 'Contact Seller / Buy Now';
        document.querySelector('.item-buy').href = '../messeges/messages.html?item=' + encodeURIComponent(requestedItem);
    }

    var seller = antique || {
        seller: 'Zaid Omar', initials: 'ZO', rating: '4.7/5', location: 'Irbid, Jordan'
    };
    var sellerAvatars = {
        'Zaid Omar': 'photo-1500648767791-00dcc994a43e',
        'Sara Ahmad': 'photo-1534528741775-53994a69daeb',
        'Omar Ali': 'photo-1506794778202-cad84cf45f1d',
        'Hala Odeh': 'photo-1534528741775-53994a69daeb',
        'Nour Haddad': 'photo-1531123897727-8f129e1688ce',
        'Amani Haddad': 'photo-1500648767791-00dcc994a43e',
        'Omar Khalil': 'photo-1506794778202-cad84cf45f1d',
        'Lina Saleh': 'photo-1534528741775-53994a69daeb',
        'Sami Nasser': 'photo-1500648767791-00dcc994a43e',
        'Maya Khalil': 'photo-1531123897727-8f129e1688ce'
    };
    var sellerAvatar = sellerAvatars[seller.seller] || sellerAvatars['Zaid Omar'];
    var sellerRating = Number((seller.rating || '4.7/5').split('/')[0]) || 0;
    var roundedRating = Math.max(0, Math.min(5, Math.round(sellerRating)));
    var sellerDialog = document.getElementById('seller-profile');
    document.getElementById('seller-profile-trigger').textContent = seller.seller;
    document.querySelector('.seller-avatar').textContent = seller.initials || 'ZO';
    document.getElementById('seller-profile-avatar').src = 'https://images.unsplash.com/' + sellerAvatar + '?auto=format&fit=crop&w=240&q=80';
    document.getElementById('seller-profile-avatar').alt = seller.seller;
    document.getElementById('seller-profile-name').textContent = seller.seller;
    document.getElementById('seller-profile-rating').textContent = sellerRating + '/5';
    document.getElementById('seller-profile-stars').textContent = '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating);
    document.getElementById('seller-profile-stars').setAttribute('aria-label', sellerRating + ' out of 5 stars');
    document.getElementById('seller-member-since').textContent = seller.memberSince || 'January 2023';
    document.getElementById('seller-response-time').textContent = seller.responseTime || 'Within a few hours';
    document.getElementById('seller-location').textContent = seller.location || 'Amman, Jordan';
    document.getElementById('seller-profile-trigger').addEventListener('click', function () {
        sellerDialog.showModal();
    });
    document.getElementById('seller-dialog-close').addEventListener('click', function () {
        sellerDialog.close();
    });
    sellerDialog.addEventListener('click', function (event) {
        if (event.target === sellerDialog) sellerDialog.close();
    });

    var heart = document.getElementById('wishlist-button');
    var favoriteStorageKey = 'nostalgiaAntiqueFavorites';
    var favoriteCatalogKey = 'nostalgiaFavoriteCatalog';

    function readFavoriteIds() {
        try {
            var stored = localStorage.getItem(favoriteStorageKey);
            var ids = stored === null ? ['fav-sweater', 'fav-jacket', 'fav-sofa', 'fav-board-game'] : JSON.parse(stored);
            return Array.isArray(ids) ? ids : [];
        } catch (error) { return []; }
    }

    function readFavoriteCatalog() {
        try {
            var catalog = JSON.parse(localStorage.getItem(favoriteCatalogKey) || '{}');
            return catalog && typeof catalog === 'object' ? catalog : {};
        } catch (error) { return {}; }
    }

    var favoriteIds = readFavoriteIds();
    var favoriteCatalog = readFavoriteCatalog();
    heart.setAttribute('aria-pressed', String(favoriteIds.indexOf(requestedItem) !== -1));

    heart.addEventListener('click', function () {
        var on = heart.getAttribute('aria-pressed') === 'true';
        heart.setAttribute('aria-pressed', String(!on));
        if (on) {
            favoriteIds = favoriteIds.filter(function (id) { return id !== requestedItem; });
        } else if (requestedItem) {
            if (favoriteIds.indexOf(requestedItem) === -1) favoriteIds.push(requestedItem);
            if (antique) {
                favoriteCatalog[requestedItem] = {
                    title: antique.title,
                    image: antique.image,
                    alt: antique.title,
                    seller: antique.seller,
                    location: antique.location || 'Amman, Jordan',
                    price: antique.price,
                    condition: antique.condition || 'Used',
                    category: antique.category || 'Marketplace',
                    rating: antique.rating || '4.8/5',
                    description: antique.description || 'A carefully selected piece from the Nostalgia marketplace.'
                };
            }
        }
        try {
            localStorage.setItem(favoriteStorageKey, JSON.stringify(favoriteIds));
            localStorage.setItem(favoriteCatalogKey, JSON.stringify(favoriteCatalog));
        } catch (error) { /* Favorites remain interactive for this visit when storage is unavailable. */ }
    });
});
