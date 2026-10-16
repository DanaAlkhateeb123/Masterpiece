/*
 * My Listings. DUMMY DATA below - TODO: load the signed-in user's listings from the backend
 * (and send edit / mark-as-sold / delete actions to it).
 */
(function () {
    'use strict';
    var auth = window.NostalgiaAuth, user = auth && auth.getUser();
    if (!user) { document.getElementById('page-gate').hidden = false; return; }
    document.getElementById('page-app').hidden = false;

    var NC = window.NC, fmt = NC.fmt, C = NC.colors;
    function $(id) { return document.getElementById(id); }
    function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
    function toast(m) { var t = document.createElement('div'); t.className = 'd-toast'; t.textContent = m; $('toasts').appendChild(t); setTimeout(function () { t.classList.add('is-out'); setTimeout(function () { t.remove(); }, 320); }, 2800); }
    function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    var ICON = {
        eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
        heart: '<path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.4Z"/>',
        chat: '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5a7.5 7.5 0 1 1 17-3Z"/>',
        box: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v9"/>',
        gavel: '<path d="m13 4 7 7M9 8l7 7M4 20l7-7M10.5 3.5l4 4-5 5-4-4zM14 11l4 4-3 3-4-4z"/>',
        bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',
        money: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M9.3 9.6c0-1 1.1-1.6 2.7-1.6s2.7.6 2.7 1.7c0 2.2-5.4 1.1-5.4 3.5 0 1.1 1.1 1.8 2.7 1.8s2.7-.7 2.7-1.7"/>'
    };
    function svg(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>'; }

    var LIST = [
        { id: 1, t: 'Vintage Omega Seamaster, 1962', cat: 'Antiques', st: 'auction', price: 640, bids: 27, ends: 22 * 60, views: 1840, saves: 112, msgs: 9, ph: '#d9c7a0', icon: 'gavel', age: 5 },
        { id: 2, t: 'Hand-knit wool sweater', cat: 'Clothes', st: 'active', price: 15, views: 412, saves: 31, msgs: 4, ph: '#e8d6c6', icon: 'bag', age: 9, ai: 'Similar sweaters sell for $18–$22. Raise your price by $3.' },
        { id: 3, t: 'Art Deco crystal chandelier', cat: 'Antiques', st: 'auction', price: 415, bids: 18, ends: 6.5 * 3600, views: 1210, saves: 74, msgs: 5, ph: '#e6d9c9', icon: 'gavel', age: 3 },
        { id: 4, t: 'Oak writing desk', cat: 'Furniture', st: 'active', price: 260, views: 689, saves: 48, msgs: 7, ph: '#c9ad8e', icon: 'box', age: 14, ai: 'Priced 12% above similar desks — lower to $230 to sell faster.' },
        { id: 5, t: 'Leather weekend bag', cat: 'Bags', st: 'sold', price: 85, views: 903, saves: 66, msgs: 11, ph: '#b99b7d', icon: 'bag', age: 21 },
        { id: 6, t: 'Retro film camera', cat: 'Electronics', st: 'sold', price: 130, views: 1156, saves: 89, msgs: 14, ph: '#cfd3d8', icon: 'box', age: 30 },
        { id: 7, t: 'Brass candlestick pair', cat: 'Antiques', st: 'active', price: 44, views: 238, saves: 19, msgs: 2, ph: '#d6c58f', icon: 'box', age: 6 },
        { id: 8, t: 'Suede ankle boots', cat: 'Shoes', st: 'draft', price: 38, views: 0, saves: 0, msgs: 0, ph: '#bfa491', icon: 'bag', age: 1 }
    ];
    var NAMES = { active: 'Active', auction: 'Auction', sold: 'Sold', draft: 'Draft' };
    var PILL = { active: 'success', auction: 'gold', sold: 'info', draft: 'muted' };
    var state = { filter: 'all', q: '', sort: 'recent', metric: 'views' };
    LIST.forEach(function (l) { l.endsAt = l.ends ? Date.now() + l.ends * 1000 : 0; var r = rng(l.id * 13); l.trend = Array.from({ length: 12 }, function (_, i) { return Math.max(1, Math.round(l.views / 90 * (.5 + i / 11 + r() * .5))); }); });

    function renderKpis() {
        var live = LIST.filter(function (l) { return l.st === 'active' || l.st === 'auction'; }).length, sold = LIST.filter(function (l) { return l.st === 'sold'; });
        var list = [
            ['Live listings', live, 'box', '', LIST.filter(function (l) { return l.st === 'auction'; }).length + ' of them auctions'],
            ['Total views', sum(LIST.map(function (l) { return l.views; })), 'eye', '', '+18% vs last month'],
            ['Saved by others', sum(LIST.map(function (l) { return l.saves; })), 'heart', '', 'Favourites across your items'],
            ['Earned from sales', sum(sold.map(function (l) { return l.price; })), 'money', '$', sold.length + ' items sold']
        ];
        $('kpi-grid').innerHTML = list.map(function (k, i) {
            return '<article class="kpi span-3" style="animation: dash-rise .7s var(--ease-out) both; animation-delay:' + i * 70 + 'ms"><div class="kpi-top"><span class="kpi-label">' + k[0] + '</span><span class="kpi-icon">' + svg(k[2]) + '</span></div><p class="kpi-value" data-k="' + i + '">0</p><div class="kpi-note">' + k[4] + '</div></article>';
        }).join('');
        list.forEach(function (k, i) { NC.countUp(document.querySelector('[data-k="' + i + '"]'), k[1], { prefix: k[3], duration: 1200 }); });
    }

    function renderChart() {
        var r = rng(state.metric === 'views' ? 4 : 9), n = 30, now = new Date(), labels = [], tips = [], vals = [];
        var M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], base = state.metric === 'views' ? 150 : 11;
        for (var i = 0; i < n; i++) {
            var d = new Date(now); d.setDate(now.getDate() - (n - 1 - i));
            labels.push(M[d.getMonth()] + ' ' + d.getDate()); tips.push(d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }));
            vals.push(Math.round(base * (.8 + i / n * .5) * (1 + (r() - .5) * .4) * (d.getDay() === 5 || d.getDay() === 6 ? 1.25 : 1)));
        }
        NC.line($('views-chart'), { labels: labels, tipLabels: tips, height: 270, format: fmt.compact, tipFormat: fmt.num, label: state.metric, series: [{ name: state.metric === 'views' ? 'Views' : 'Saves', color: C[0], values: vals }] });
    }

    function renderInsights() {
        var tips = LIST.filter(function (l) { return l.ai; });
        $('insights').innerHTML = tips.map(function (l) { return '<li><strong>' + l.t + '</strong><span>' + l.ai + '</span></li>'; }).join('') +
            '<li><strong>Your best time to list</strong><span>Items posted on <b>Thursday evenings</b> get 24% more views in the first day.</span></li>';
    }

    function renderChips() {
        var counts = { all: LIST.length }; Object.keys(NAMES).forEach(function (k) { counts[k] = LIST.filter(function (l) { return l.st === k; }).length; });
        $('l-chips').innerHTML = ['all', 'active', 'auction', 'sold', 'draft'].map(function (k) {
            return '<button class="chip" type="button" data-f="' + k + '" aria-pressed="' + (state.filter === k) + '">' + (k === 'all' ? 'All' : NAMES[k]) + '<b>' + counts[k] + '</b></button>';
        }).join('');
    }

    function timeLeft(ms) {
        if (ms <= 0) return 'Ending…';
        var s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60, p = function (n) { return String(n).padStart(2, '0'); };
        return h ? h + 'h ' + p(m) + 'm' : p(m) + ':' + p(sec);
    }

    function renderGrid() {
        var q = state.q.toLowerCase();
        var rows = LIST.filter(function (l) { return (state.filter === 'all' || l.st === state.filter) && (!q || (l.t + l.cat).toLowerCase().indexOf(q) > -1); });
        rows.sort(function (a, b) { return state.sort === 'views' ? b.views - a.views : state.sort === 'price' ? b.price - a.price : a.age - b.age; });
        $('list-count').textContent = rows.length + (rows.length === 1 ? ' listing' : ' listings');
        $('l-grid').innerHTML = rows.map(function (l, i) {
            return '<article class="lcard" data-id="' + l.id + '" style="--d:' + i * 55 + 'ms"><div class="lcard-img" style="--ph:' + l.ph + '">' + svg(l.icon) + '<div class="lcard-badges"><span class="pill pill--' + PILL[l.st] + '">' + NAMES[l.st] + '</span></div></div>' +
                '<div class="lcard-body"><div><h4 class="lcard-title">' + l.t + '</h4><small style="color:var(--color-muted)">' + l.cat + ' · listed ' + l.age + 'd ago</small></div>' +
                '<div class="lcard-price"><strong>' + fmt.money(l.price) + '</strong><small>' + (l.st === 'auction' ? 'Current bid' : l.st === 'sold' ? 'Sold price' : l.st === 'draft' ? 'Not published' : 'Asking price') + '</small></div>' +
                (l.st === 'auction' ? '<div class="lcard-auction"><span>' + svg('gavel').replace('<svg', '<svg width="14" height="14" style="vertical-align:-2px;fill:none;stroke:currentColor;stroke-width:1.7"') + ' <b>' + l.bids + '</b> bids</span><span class="timer" data-end="' + l.id + '">--</span></div>' : '') +
                (l.ai ? '<div class="lcard-ai">✦ ' + l.ai + '</div>' : '') +
                '<div class="lcard-stats"><span title="Views">' + svg('eye') + fmt.num(l.views) + '</span><span title="Saves">' + svg('heart') + l.saves + '</span><span title="Messages">' + svg('chat') + l.msgs + '</span><div class="lcard-spark" data-sp="' + l.id + '"></div></div>' +
                '<div class="lcard-actions">' + (l.st === 'sold' ? '<a class="d-btn d-btn--ghost d-btn--sm" href="../user-orders/user-orders.html">View order</a>' : '<a class="d-btn d-btn--ghost d-btn--sm" href="../selling/selling.html">' + (l.st === 'draft' ? 'Finish &amp; publish' : 'Edit') + '</a>') +
                (l.st === 'active' ? '<button class="d-btn d-btn--sm" type="button" data-sold="' + l.id + '">Mark sold</button>' : '') +
                (l.st !== 'sold' ? '<button class="icon-btn" type="button" data-del="' + l.id + '" aria-label="Delete ' + l.t + '">' + svg('trash') + '</button>' : '') + '</div></div></article>';
        }).join('');
        $('l-empty').hidden = rows.length > 0;
        rows.forEach(function (l) { var c = document.querySelector('[data-sp="' + l.id + '"]'); if (c && l.views) NC.spark(c, l.trend, l.st === 'sold' ? C[2] : C[0]); });
        tick();
    }
    function tick() { LIST.forEach(function (l) { var t = document.querySelector('[data-end="' + l.id + '"]'); if (!t) return; var left = l.endsAt - Date.now(); t.textContent = timeLeft(left); t.classList.toggle('is-soon', left < 3600000); }); }
    setInterval(tick, 1000);

    $('l-chips').addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; state.filter = b.dataset.f; renderChips(); renderGrid(); });
    $('l-search').addEventListener('input', function (e) { state.q = e.target.value.trim(); renderGrid(); });
    $('l-sort').addEventListener('change', function (e) { state.sort = e.target.value; renderGrid(); });
    $('metric-seg').addEventListener('click', function (e) {
        var b = e.target.closest('[data-metric]'); if (!b || b.dataset.metric === state.metric) return;
        state.metric = b.dataset.metric; $('metric-seg').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); renderChart();
    });
    $('l-grid').addEventListener('click', function (e) {
        var sold = e.target.closest('[data-sold]'), del = e.target.closest('[data-del]');
        if (!sold && !del) return;
        var id = +(sold || del).dataset[sold ? 'sold' : 'del'], item = LIST.filter(function (l) { return l.id === id; })[0], card = (sold || del).closest('.lcard');
        if (del && !window.confirm('Delete "' + item.t + '"? This cannot be undone.')) return;
        card.classList.add('is-leaving');
        setTimeout(function () { // TODO: send to the backend
            if (sold) { item.st = 'sold'; toast('Nice! "' + item.t + '" is marked as sold'); }
            else { LIST.splice(LIST.indexOf(item), 1); toast('Listing deleted'); }
            renderKpis(); renderChips(); renderGrid();
        }, 320);
    });

    renderKpis(); renderChart(); renderInsights(); renderChips(); renderGrid();
})();
