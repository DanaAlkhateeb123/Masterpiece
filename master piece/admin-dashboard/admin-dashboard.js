/*
 * Admin dashboard. All numbers are DUMMY DATA generated here (seeded, so the page looks the same on every load).
 * TODO (backend): replace the generators / constant arrays below with API responses - the render functions
 * only need the same shapes. Also enforce the admin role on the server; the check below only hides the UI.
 */
(function () {
    'use strict';

    var auth = window.NostalgiaAuth;
    var gate = document.getElementById('admin-gate');
    var app = document.getElementById('admin-app');
    var user = auth && auth.getUser();

    /* ---------------- access gate ---------------- */
    if (!auth || !auth.isAdmin()) {
        gate.hidden = false;
        if (user) {
            document.getElementById('gate-text').textContent = 'You are signed in as a regular member. The admin dashboard is only available to Nostalgia administrators.';
            var action = document.getElementById('gate-action');
            action.textContent = 'Back to my account';
            action.setAttribute('href', '../user-dashboard/user-dashboard.html');
        }
        return;
    }
    app.hidden = false;

    var NC = window.NC, fmt = NC.fmt, C = NC.colors;

    /* ---------------- tiny helpers ---------------- */
    function $(id) { return document.getElementById(id); }
    function rng(seed) { // mulberry32
        return function () {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
    function pick(a, r) { return a[Math.floor((r || Math.random)() * a.length)]; }
    function toast(msg) {
        var t = document.createElement('div');
        t.className = 'd-toast'; t.textContent = msg;
        $('toasts').appendChild(t);
        setTimeout(function () { t.classList.add('is-out'); setTimeout(function () { t.remove(); }, 320); }, 2800);
    }

    var ICON = {
        money: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M9.3 9.6c0-1 1.1-1.6 2.7-1.6s2.7.6 2.7 1.7c0 2.2-5.4 1.1-5.4 3.5 0 1.1 1.1 1.8 2.7 1.8s2.7-.7 2.7-1.7"/>',
        coin: '<path d="M4 8c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z"/><path d="M4 8v4c0 1.7 3.6 3 8 3s8-1.3 8-3V8M4 12v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4"/>',
        bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
        users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 0 1 0 6M18 14c2 .6 3 2.4 3 5"/>',
        box: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v9"/>',
        gavel: '<path d="m13 4 7 7M9 8l7 7M4 20l7-7M10.5 3.5l4 4-5 5-4-4zM14 11l4 4-3 3-4-4z"/>',
        pct: '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.4"/><circle cx="17" cy="17" r="2.4"/>',
        receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>',
        eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
        flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
        check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
        x: '<path d="M6 6l12 12M18 6 6 18"/>',
        up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
        down: '<path d="M12 5v14M5 12l7 7 7-7"/>'
    };
    function svg(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[name] + '</svg>'; }

    /* ---------------- header: greeting + clock ---------------- */
    var name = (user.firstName || user.name || (user.email || 'Admin').split('@')[0] || 'Admin').split(' ')[0];
    $('admin-name').textContent = name;
    (function () {
        var h = new Date().getHours();
        $('greet-part').textContent = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
        function tick() { $('clock').textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
        tick(); setInterval(tick, 15000);
    })();

    /* ======================================================================
       DUMMY DATA
       ====================================================================== */
    var RANGES = { '7d': { n: 7, unit: 'day' }, '30d': { n: 30, unit: 'day' }, '90d': { n: 90, unit: 'day' }, '12m': { n: 12, unit: 'month' } };
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var DOW = [1.0, .93, .95, 1.0, 1.08, 1.2, 1.12]; // Sun..Sat - weekends are the busiest

    function labelsFor(range) {
        var cfg = RANGES[range], out = [], tips = [], now = new Date();
        for (var i = cfg.n - 1; i >= 0; i--) {
            var d = new Date(now);
            if (cfg.unit === 'day') { d.setDate(now.getDate() - i); out.push(MONTHS[d.getMonth()] + ' ' + d.getDate()); tips.push(d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })); }
            else { d.setMonth(now.getMonth() - i, 1); out.push(MONTHS[d.getMonth()]); tips.push(MONTHS[d.getMonth()] + ' ' + d.getFullYear()); }
        }
        return { labels: out, tips: tips };
    }

    // one base series of sales; orders and new members derive from it so the three tabs stay consistent
    function makeSeries(range, seed, scale) {
        var cfg = RANGES[range], r = rng(seed), now = new Date(), gmv = [], orders = [], users = [];
        for (var i = 0; i < cfg.n; i++) {
            var progress = i / Math.max(1, cfg.n - 1), g;
            if (cfg.unit === 'day') {
                var d = new Date(now); d.setDate(now.getDate() - (cfg.n - 1 - i));
                g = 5200 * (1 + .14 * progress) * DOW[d.getDay()] * (1 + (r() - .5) * .22);
                if (range === '90d' && i > 60 && i < 66) g *= 1.28; // an auction-week spike
                gmv.push(g * scale);
                orders.push(g * scale / (56 + r() * 14));
                users.push(34 * (1 + .18 * progress) * DOW[d.getDay()] * scale * (1 + (r() - .5) * .3));
            } else {
                g = 5200 * 30 * (.62 + .045 * i) * (1 + (r() - .5) * .1) * (i === 10 ? 1.18 : 1);
                gmv.push(g * scale);
                orders.push(g * scale / (60 + r() * 8));
                users.push(34 * 30 * (.6 + .05 * i) * scale * (1 + (r() - .5) * .12));
            }
        }
        return { gmv: gmv, orders: orders.map(Math.round), users: users.map(Math.round) };
    }

    var ACTIVE = { '7d': 6820, '30d': 18420, '90d': 41300, '12m': 96500 };
    var CONV = { '7d': 3.1, '30d': 3.4, '90d': 3.3, '12m': 3.2 };

    var CATEGORIES = [['Clothes', 24], ['Electronics', 19], ['Antiques', 17], ['Furniture', 11], ['Books', 8], ['Games', 6], ['Accessories', 5], ['Bags', 4], ['Shoes', 4], ['Other', 2]];
    var CITIES = [['Amman', 46], ['Irbid', 14], ['Zarqa', 12], ['Aqaba', 7], ['Salt', 5], ['Madaba', 4], ['Jerash', 3], ['Other', 9]];

    var AUCTIONS = [
        { t: 'Vintage Omega Seamaster, 1962', s: 'Khaled M.', bid: 640, bids: 27, watch: 112, est: '$600–$780', ph: '#d9c7a0', ends: 22 * 60 },
        { t: 'Art Deco crystal chandelier', s: 'Rania T.', bid: 415, bids: 18, watch: 74, est: '$380–$520', ph: '#e6d9c9', ends: 47 * 60 },
        { t: '1930s Gramophone, working', s: 'Samer H.', bid: 285, bids: 21, watch: 66, est: '$240–$340', ph: '#c9b09a', ends: 3.2 * 3600 },
        { t: 'Ottoman brass coffee set', s: 'Lina S.', bid: 190, bids: 12, watch: 41, est: '$150–$220', ph: '#d6b878', ends: 6.5 * 3600 },
        { t: 'Hand-knotted Persian rug', s: 'Omar A.', bid: 520, bids: 15, watch: 58, est: '$480–$650', ph: '#b98a86', ends: 19 * 3600 },
        { t: '1950s Singer sewing machine', s: 'Dina F.', bid: 120, bids: 9, watch: 33, est: '$100–$150', ph: '#bdb9ae', ends: 31 * 3600 }
    ];

    var ORDERS = [
        ['#NOST-0412', 'Hand-knit wool sweater', 'Clothes', '#e8d6c6', 'Maya Q.', 'Sara Ahmad', 15, 'Preparing', 'Today · 09:42'],
        ['#NOST-0411', 'Vintage leather jacket', 'Clothes', '#c9a58a', 'Yazan K.', 'Omar Ali', 25, 'Paid', 'Today · 09:18'],
        ['#NOST-0410', 'Ottoman brass coffee set', 'Antiques', '#d6b878', 'Hala R.', 'Lina Saleh', 190, 'Shipped', 'Today · 08:51'],
        ['#NOST-0409', 'Compact digital camera', 'Electronics', '#cfd3d8', 'Faris N.', 'Zaid Omar', 95, 'Shipped', 'Yesterday · 21:07'],
        ['#NOST-0408', 'Oak writing desk', 'Furniture', '#c9ad8e', 'Noor B.', 'Rami D.', 260, 'Delivered', 'Yesterday · 18:30'],
        ['#NOST-0407', 'Classy evening dress', 'Clothes', '#d8b9bf', 'Dalia M.', 'Lina Saleh', 25, 'Delivered', 'Yesterday · 16:12'],
        ['#NOST-0406', 'First-edition Arabic poetry', 'Books', '#d9cdb2', 'Tariq S.', 'Mazen H.', 48, 'Disputed', 'Yesterday · 11:45'],
        ['#NOST-0405', 'Retro handheld console', 'Games', '#b7c4d0', 'Jana A.', 'Zaid Omar', 70, 'Delivered', 'Oct 12 · 20:03'],
        ['#NOST-0404', 'Leather weekend bag', 'Bags', '#b99b7d', 'Sami T.', 'Omar Ali', 85, 'Delivered', 'Oct 12 · 14:26'],
        ['#NOST-0403', '1930s Gramophone', 'Antiques', '#c9b09a', 'Reem L.', 'Samer H.', 285, 'Preparing', 'Oct 12 · 10:09'],
        ['#NOST-0402', 'Suede ankle boots', 'Shoes', '#bfa491', 'Aya F.', 'Dina F.', 38, 'Paid', 'Oct 11 · 19:40'],
        ['#NOST-0401', 'Silver filigree bracelet', 'Accessories', '#d5d3d0', 'Lama J.', 'Rania T.', 55, 'Delivered', 'Oct 11 · 13:15']
    ];

    var QUEUE = [
        { t: 'Roman-style bronze oil lamp', who: 'Seller: Hussam B.', why: 'Antique claim needs verification', ph: '#c9a86a' },
        { t: 'Designer handbag (new)', who: 'Seller: Mira K.', why: 'Possible counterfeit · brand mismatch', ph: '#b8a09a' },
        { t: 'Gaming laptop, barely used', who: 'Seller: Ali Z.', why: 'Price 3× above AI estimate', ph: '#aeb6c0' },
        { t: 'Antique silver tea service', who: 'Seller: Nada S.', why: 'Only one photo uploaded', ph: '#d1d1cd' },
        { t: 'Vintage Rolex Datejust', who: 'Seller: New member', why: 'Possible duplicate listing', ph: '#d6c58f' }
    ];

    var SELLERS = [
        ['Lina Saleh', 'Amman', 18420, 4.9, '#E5C9C4'], ['Omar Ali', 'Amman', 15980, 4.8, '#EAD7AD'], ['Zaid Omar', 'Irbid', 12340, 4.7, '#cfe0d4'],
        ['Samer Haddad', 'Zarqa', 10870, 4.9, '#d5e2f1'], ['Rania Taha', 'Salt', 9210, 4.6, '#E5C9C4']
    ];

    /* ======================================================================
       RENDER
       ====================================================================== */
    var state = { range: '30d', metric: 'gmv', table: false };
    var cur, prev, lab;

    function delta(curVal, prevVal) { return prevVal ? (curVal / prevVal - 1) * 100 : 0; }

    function renderKpis() {
        var gmv = sum(cur.gmv), gmvP = sum(prev.gmv), ord = sum(cur.orders), ordP = sum(prev.orders);
        var r = rng(state.range.length * 97 + 5);
        var d = function () { return (r() * 18 - 3); };
        var list = [
            { l: 'Total sales', i: 'money', v: gmv, o: { prefix: '$', compact: true }, d: delta(gmv, gmvP), s: cur.gmv, n: 'Gross merchandise value' },
            { l: 'Platform revenue', i: 'coin', v: gmv * .082, o: { prefix: '$', compact: true }, d: delta(gmv, gmvP) + .6, s: cur.gmv.map(function (x, i) { return x * (.078 + (i % 5) * .002); }), n: 'Commission + listing fees' },
            { l: 'Orders', i: 'bag', v: ord, o: {}, d: delta(ord, ordP), s: cur.orders, n: 'Completed checkouts' },
            { l: 'Active members', i: 'users', v: ACTIVE[state.range], o: {}, d: d(), s: cur.users.map(function (x, i) { return x * 3 + i * 4; }), n: 'Bought, sold or bid' },
            { l: 'New listings', i: 'box', v: Math.round(ord * 3.4), o: {}, d: d(), s: cur.orders.map(function (x, i) { return x * 3.4 + (i % 4) * 6; }), n: 'Items put up for sale' },
            { l: 'Live auctions', i: 'gavel', v: 6, o: {}, d: 20, s: [3, 4, 4, 5, 4, 5, 6, 5, 6, 6], n: 'Ending within 48 hours: 4' },
            { l: 'Conversion rate', i: 'pct', v: CONV[state.range], o: { suffix: '%', decimals: 1 }, d: d() / 3, s: cur.gmv.map(function (x, i) { return 3 + Math.sin(i / 3) * .25 + i * .004; }), n: 'Visits that became orders' },
            { l: 'Avg. order value', i: 'receipt', v: gmv / ord, o: { prefix: '$', decimals: 2 }, d: delta(gmv / ord, gmvP / ordP), s: cur.gmv.map(function (x, i) { return x / (cur.orders[i] || 1); }), n: 'Per completed order' }
        ];
        var host = $('kpi-grid');
        host.innerHTML = list.map(function (k, i) {
            var cls = k.d > .4 ? 'up' : k.d < -.4 ? 'down' : 'flat';
            return '<article class="kpi span-3" style="animation: dash-rise .8s var(--ease-out) both; animation-delay:' + (i * 70) + 'ms">' +
                '<div class="kpi-top"><span class="kpi-label">' + k.l + '</span><span class="kpi-icon">' + svg(k.i) + '</span></div>' +
                '<p class="kpi-value" data-i="' + i + '">0</p>' +
                '<div class="kpi-foot"><div><span class="delta ' + cls + '">' + (cls === 'flat' ? '' : svg(cls)) + Math.abs(k.d).toFixed(1) + '%</span><div class="kpi-note">' + k.n + '</div></div><div class="kpi-spark" data-s="' + i + '"></div></div></article>';
        }).join('');
        list.forEach(function (k, i) {
            NC.countUp(host.querySelector('[data-i="' + i + '"]'), k.v, k.o);
            NC.spark(host.querySelector('[data-s="' + i + '"]'), k.s.slice(-14), C[0]);
        });
    }

    var METRICS = {
        gmv: { name: 'Sales', fmt: fmt.moneyCompact, tip: fmt.money },
        orders: { name: 'Orders', fmt: fmt.compact, tip: fmt.num },
        users: { name: 'New members', fmt: fmt.compact, tip: fmt.num }
    };

    function renderPerf() {
        var m = METRICS[state.metric], a = cur[state.metric], b = prev[state.metric];
        $('perf-legend').innerHTML = '<span><i style="background:' + C[0] + '"></i>' + m.name + ' · this period <b style="color:var(--color-text)">' + (state.metric === 'gmv' ? fmt.money(sum(a)) : fmt.num(sum(a))) + '</b></span><span><i class="is-dash" style="border-color:#a99a93"></i>Previous period <b style="color:var(--color-text)">' + (state.metric === 'gmv' ? fmt.money(sum(b)) : fmt.num(sum(b))) + '</b></span>';
        $('perf-sub').textContent = state.range === '12m' ? 'Monthly, compared with the 12 months before' : 'Daily, compared with the previous ' + RANGES[state.range].n + ' days';
        NC.line($('perf-chart'), {
            labels: lab.labels, tipLabels: lab.tips, height: 310, format: m.fmt, tipFormat: m.tip, label: m.name + ' over time',
            series: [{ name: 'This period', color: C[0], values: a }, { name: 'Previous period', color: '#a99a93', values: b, dashed: true }]
        });
        var rows = lab.tips.map(function (t, i) { return '<tr><td>' + t + '</td><td class="num strong">' + m.tip(a[i]) + '</td><td class="num muted">' + m.tip(b[i]) + '</td></tr>'; }).join('');
        $('perf-table').innerHTML = '<table class="dtable"><thead><tr><th>Date</th><th class="num">This period</th><th class="num">Previous</th></tr></thead><tbody>' + rows + '</tbody></table>';
        $('perf-table').style.maxHeight = '340px';
    }

    function renderBreakdowns() {
        var gmv = sum(cur.gmv);
        var share = [['Used items', .41], ['New items', .24], ['Antique auctions', .22], ['Antique direct sales', .13]];
        NC.donut($('channel-donut'), {
            items: share.map(function (s, i) { return { name: s[0], value: gmv * s[1], color: C[i] }; }),
            format: fmt.moneyCompact, centerValue: fmt.moneyCompact(gmv), centerLabel: 'Total sales', tipName: 'Sales', label: 'Sales by channel'
        });
        $('channel-insight').innerHTML = '<b>Antique auctions</b> bring in 22% of sales from only ~4% of listings — the highest value per item on the platform.';

        var cats = CATEGORIES.map(function (c) { return [c[0], gmv * c[1] / 100]; });
        NC.bars($('category-bars'), { labels: cats.map(function (c) { return c[0]; }), values: cats.map(function (c) { return c[1]; }), horizontal: true, rowHeight: 31, format: fmt.moneyCompact, tipFormat: fmt.money, name: 'Sales', color: C[0], label: 'Sales by category' });

        var ord = sum(cur.orders);
        NC.bars($('city-bars'), { labels: CITIES.map(function (c) { return c[0]; }), values: CITIES.map(function (c) { return ord * c[1] / 100; }), horizontal: true, rowHeight: 38, format: fmt.compact, tipFormat: fmt.num, name: 'Orders', color: '#B88932', label: 'Orders by city' });

        // funnel
        var visits = Math.round(ord / (CONV[state.range] / 100));
        var steps = [['Visitors', visits], ['Viewed an item', visits * .62], ['Saved or added to cart', visits * .17], ['Started checkout', visits * .063], ['Paid', ord]];
        $('funnel').innerHTML = steps.map(function (s, i) {
            var pct = s[1] / visits * 100, drop = i ? Math.round((1 - s[1] / steps[i - 1][1]) * 100) : 0;
            return '<div class="funnel-step"><div class="funnel-row"><span>' + s[0] + '</span><span><b>' + fmt.num(s[1]) + '</b><em>' + (pct >= 10 ? Math.round(pct) : pct.toFixed(1)) + '%</em></span></div>' +
                '<div class="funnel-bar"><i style="width:' + Math.max(pct, 2.5) + '%; --d:' + (i * .12) + 's"></i></div>' + (i && i < steps.length - 1 ? '' : '') + '</div>';
        }).join('');
    }

    /* ---- auctions ---- */
    var auctionState = AUCTIONS.map(function (a) { return Object.assign({}, a, { endsAt: Date.now() + a.ends * 1000 }); });
    function timeLeft(ms) {
        if (ms <= 0) return 'Ending…';
        var s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
        if (d) return d + 'd ' + h + 'h';
        var p = function (n) { return String(n).padStart(2, '0'); };
        return h ? h + 'h ' + p(m) + 'm' : p(m) + ':' + p(sec);
    }
    function renderAuctions() {
        $('auction-list').innerHTML = auctionState.map(function (a, i) {
            return '<li class="auction" data-a="' + i + '"><span class="auction-img" style="--ph:' + a.ph + '; --d:' + (i * .6) + 's"></span>' +
                '<div><p class="auction-title">' + a.t + '</p><div class="auction-meta"><span>' + svg('users') + a.s + '</span><span>' + svg('gavel') + '<b data-bids>' + a.bids + '</b> bids</span><span>' + svg('eye') + a.watch + ' watching</span></div></div>' +
                '<div class="auction-bid"><strong data-bid>' + fmt.money(a.bid) + '</strong><small>AI est. ' + a.est + '</small></div>' +
                '<span class="timer" data-timer>--</span></li>';
        }).join('');
        tickAuctions();
    }
    function tickAuctions() {
        var now = Date.now();
        auctionState.forEach(function (a, i) {
            var left = a.endsAt - now;
            if (left < -3000) { a.endsAt = now + (4 + Math.random() * 20) * 3600 * 1000; a.bids = 3; a.bid = Math.round(a.bid * .35); var li0 = document.querySelector('[data-a="' + i + '"]'); if (li0) { li0.querySelector('[data-bid]').textContent = fmt.money(a.bid); li0.querySelector('[data-bids]').textContent = a.bids; } left = a.endsAt - now; }
            var li = document.querySelector('[data-a="' + i + '"] [data-timer]');
            if (!li) return;
            li.textContent = timeLeft(left);
            li.classList.toggle('is-soon', left < 3600 * 1000);
        });
    }
    var bidsToday = 386;

    /* ---- bids / heatmap / AI / health ---- */
    function renderBids() {
        var r = rng(77), vals = [], labels = [];
        for (var h = 0; h < 24; h++) {
            var curve = .25 + Math.exp(-Math.pow((h - 21) / 2.6, 2)) * 1.0 + Math.exp(-Math.pow((h - 13) / 2.2, 2)) * .45;
            vals.push(Math.round(curve * 30 * (.85 + r() * .3)));
            labels.push(String(h).padStart(2, '0'));
        }
        var peak = vals.indexOf(Math.max.apply(null, vals));
        NC.bars($('bids-chart'), { labels: labels, tipLabels: labels.map(function (l) { return l + ':00 – ' + l + ':59'; }), values: vals, height: 230, color: C[2], highlight: peak, name: 'Bids', format: fmt.compact, tipFormat: fmt.num, label: 'Bids per hour' });
        bidsToday = sum(vals);
        $('ms-bids').textContent = fmt.num(bidsToday);
        NC.countUp($('ms-bidders'), 142); NC.countUp($('ms-uplift'), 38, { suffix: '%' });
    }
    function renderHeat() {
        var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], r = rng(21), data = days.map(function (d, di) {
            var wk = di >= 4 ? 1.25 : 1;
            return Array.from({ length: 24 }, function (_, h) {
                var c = .06 + Math.exp(-Math.pow((h - 21) / 2.8, 2)) + Math.exp(-Math.pow((h - 13) / 2.4, 2)) * .55 + Math.exp(-Math.pow((h - 9.5) / 1.6, 2)) * .25;
                return Math.round(c * 160 * wk * (.88 + r() * .24));
            });
        });
        NC.heatmap($('heatmap'), { rows: days, cols: Array.from({ length: 24 }, function (_, h) { return String(h).padStart(2, '0'); }), data: data, unit: 'Visits' });
    }
    function renderAI() {
        var rows = [
            { l: 'Listings categorised automatically', v: 12480, p: 96, c: '96% accepted by sellers' },
            { l: 'Price suggestions used', v: 71, s: '%', p: 71, c: 'of sellers keep the AI price' },
            { l: 'Antiques identified', v: 842, p: 91, c: '91% average confidence' },
            { l: 'Suspicious listings caught', v: 37, p: 88, c: '88% resolved within a day' }
        ];
        $('ai-stats').innerHTML = rows.map(function (r, i) {
            return '<div class="ai-stat"><div class="ai-stat-row"><span>' + r.l + '</span><strong data-ai="' + i + '">0</strong></div><div class="bar-track"><i class="bar-fill" style="width:' + r.p + '%; animation-delay:' + (i * .12) + 's"></i></div><small style="color:rgba(255,255,255,.55);font-size:11px">' + r.c + '</small></div>';
        }).join('');
        rows.forEach(function (r, i) { NC.countUp(document.querySelector('[data-ai="' + i + '"]'), r.v, { suffix: r.s || '' }); });
    }
    function renderHealth() {
        var h = [['On-time delivery', 94, '94%'], ['Buyer satisfaction', 94, '4.7 / 5'], ['Replies within 2h', 88, '88%'], ['Disputes', 1.8, '1.8%', 1], ['Refunds', 2.4, '2.4%', 1]];
        $('health').innerHTML = h.map(function (x, i) {
            return '<div class="health-row"><div><span>' + x[0] + '</span><b>' + x[2] + '</b></div><div class="bar-track"><i class="bar-fill ' + (x[3] ? '' : 'bar-fill--primary') + '" style="width:' + Math.max(x[1] * (x[3] ? 8 : 1), 3) + '%; animation-delay:' + (i * .1) + 's"></i></div></div>';
        }).join('');
    }

    /* ---- orders table ---- */
    var STATUS = { Paid: 'info', Preparing: 'warning', Shipped: 'gold', Delivered: 'success', Disputed: 'error' };
    var AV = ['#E5C9C4', '#EAD7AD', '#cfe0d4', '#d5e2f1'];
    function renderOrders() {
        var q = $('order-search').value.trim().toLowerCase(), st = $('order-status').value;
        var rows = ORDERS.filter(function (o) { return (st === 'all' || o[7] === st) && (!q || (o[0] + o[1] + o[4] + o[5]).toLowerCase().indexOf(q) > -1); });
        $('orders-body').innerHTML = rows.map(function (o, i) {
            return '<tr><td><a class="strong" href="../order-tracking/order-tracking.html">' + o[0] + '</a></td>' +
                '<td><div class="cell-item"><span class="ph" style="--ph:' + o[3] + '"></span><div>' + o[1] + '<small>' + o[2] + '</small></div></div></td>' +
                '<td><div class="cell-user"><span class="av" style="--s:28px;--bg:' + AV[i % 4] + '">' + o[4][0] + '</span>' + o[4] + '</div></td><td class="muted">' + o[5] + '</td>' +
                '<td class="num strong">' + fmt.money(o[6]) + '</td><td><span class="pill pill--' + STATUS[o[7]] + '">' + o[7] + '</span></td><td class="muted" style="white-space:nowrap">' + o[8] + '</td></tr>';
        }).join('');
        $('orders-empty').hidden = rows.length > 0;
    }

    /* ---- moderation + sellers ---- */
    function renderQueue() {
        var host = $('queue');
        host.innerHTML = QUEUE.map(function (q, i) {
            return '<li data-q="' + i + '"><span class="ph" style="--ph:' + q.ph + '"></span><div><strong>' + q.t + '</strong><small>' + q.who + '</small><span class="pill pill--warning" style="margin-top:5px;font-weight:500">' + q.why + '</span></div>' +
                '<div class="queue-actions"><button class="icon-btn ok" type="button" data-act="approve" aria-label="Approve ' + q.t + '">' + svg('check') + '</button><button class="icon-btn no" type="button" data-act="reject" aria-label="Reject ' + q.t + '">' + svg('x') + '</button></div></li>';
        }).join('');
    }
    $('queue').addEventListener('click', function (e) {
        var btn = e.target.closest('[data-act]');
        if (!btn) return;
        var li = btn.closest('li'), title = li.querySelector('strong').textContent, ok = btn.dataset.act === 'approve';
        li.classList.add('is-leaving');
        setTimeout(function () {
            li.remove();
            var left = $('queue').children.length;
            $('queue-count').textContent = left ? left + ' pending' : 'All clear';
            $('queue-count').className = 'pill ' + (left ? 'pill--warning' : 'pill--success');
            if (!left) $('queue').innerHTML = '<li class="empty" style="display:block;max-height:none">All caught up — nothing waiting for review.</li>';
        }, 520);
        toast((ok ? 'Approved: ' : 'Rejected: ') + title); // TODO: send the decision to the backend
    });
    function renderSellers() {
        $('sellers').innerHTML = SELLERS.map(function (s) {
            return '<li><span class="av" style="--bg:' + s[4] + '">' + s[0].split(' ').map(function (p) { return p[0]; }).join('') + '</span><div><strong>' + s[0] + '</strong><small>' + s[1] + ' · ★ ' + s[3] + '</small></div><div class="amount">' + fmt.money(s[2]) + '</div></li>';
        }).join('');
    }

    /* ---- live feed ---- */
    var FEED = [
        ['order', 'bag', 'New order <b>#NOST-0413</b> · $48 · Amman'],
        ['bid', 'gavel', 'New bid <b>$655</b> on Vintage Omega Seamaster'],
        ['', 'users', '<b>Hana K.</b> joined Nostalgia · Irbid'],
        ['', 'box', 'New listing: <b>Retro film camera</b> · Electronics'],
        ['flag', 'flag', 'AI flagged a listing: <b>possible duplicate</b>'],
        ['bid', 'gavel', 'New bid <b>$425</b> on Art Deco chandelier'],
        ['order', 'bag', 'Order <b>#NOST-0412</b> marked as shipped']
    ];
    function addFeed(item, fresh) {
        var li = document.createElement('li');
        if (fresh) li.className = 'is-new';
        var mins = fresh ? 'just now' : Math.floor(Math.random() * 40 + 2) + ' min ago';
        li.innerHTML = '<span class="feed-ico ' + (item[0] ? 'is-' + item[0] : '') + '">' + svg(item[1]) + '</span><div>' + item[2] + '<small>' + mins + '</small></div>';
        var feed = $('feed');
        feed.insertBefore(li, feed.firstChild);
        while (feed.children.length > 7) feed.lastChild.remove();
    }

    /* ---- live simulation ---- */
    function simulate() {
        var i = Math.floor(Math.random() * auctionState.length), a = auctionState[i], li = document.querySelector('[data-a="' + i + '"]');
        a.bid += pick([5, 10, 10, 15, 25]); a.bids++; bidsToday++;
        if (li) {
            var s = li.querySelector('[data-bid]'); s.textContent = fmt.money(a.bid); s.classList.remove('flash'); void s.offsetWidth; s.classList.add('flash');
            li.querySelector('[data-bids]').textContent = a.bids;
        }
        $('ms-bids').textContent = fmt.num(bidsToday);
        addFeed(['bid', 'gavel', 'New bid <b>' + fmt.money(a.bid) + '</b> on ' + a.t.split(',')[0]], true);
    }
    var feedIdx = 0;
    function simulateOther() {
        var cities = ['Amman', 'Irbid', 'Zarqa', 'Aqaba', 'Salt'], t = Math.random();
        if (t < .45) addFeed(['order', 'bag', 'New order <b>#NOST-0' + (413 + feedIdx++) + '</b> · ' + fmt.money(12 + Math.random() * 180) + ' · ' + pick(cities)], true);
        else if (t < .75) addFeed(['', 'users', '<b>' + pick(['Hana K.', 'Yousef M.', 'Dina S.', 'Layth R.', 'Tala F.']) + '</b> joined Nostalgia · ' + pick(cities)], true);
        else addFeed(['', 'box', 'New listing: <b>' + pick(['Vintage typewriter', 'Wool coat', 'Brass candlestick', 'Retro radio', 'Leather boots']) + '</b>'], true);
    }

    /* ---------------- build + wire ---------------- */
    function build() {
        lab = labelsFor(state.range);
        cur = makeSeries(state.range, 11, 1);
        prev = makeSeries(state.range, 42, state.range === '12m' ? .74 : .88);
        renderKpis(); renderPerf(); renderBreakdowns();
    }

    $('range-seg').addEventListener('click', function (e) {
        var b = e.target.closest('[data-range]');
        if (!b || b.dataset.range === state.range) return;
        state.range = b.dataset.range;
        $('range-seg').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        build();
    });
    $('metric-seg').addEventListener('click', function (e) {
        var b = e.target.closest('[data-metric]');
        if (!b || b.dataset.metric === state.metric) return;
        state.metric = b.dataset.metric;
        $('metric-seg').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        renderPerf();
    });
    $('table-toggle').addEventListener('click', function () {
        state.table = !state.table;
        $('table-toggle').setAttribute('aria-pressed', String(state.table));
        $('table-toggle').textContent = state.table ? 'Chart' : 'Table';
        $('perf-table').hidden = !state.table;
        $('perf-chart').hidden = state.table;
        if (!state.table) renderPerf();
    });
    $('order-search').addEventListener('input', renderOrders);
    $('order-status').addEventListener('change', renderOrders);
    $('export-btn').addEventListener('click', function () {
        var m = state.metric, rows = ['Date,' + METRICS[m].name + ' (this period),' + METRICS[m].name + ' (previous period)'];
        lab.tips.forEach(function (t, i) { rows.push('"' + t + '",' + Math.round(cur[m][i]) + ',' + Math.round(prev[m][i])); });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
        a.download = 'nostalgia-' + m + '-' + state.range + '.csv';
        document.body.appendChild(a); a.click(); a.remove();
        toast('Exported ' + METRICS[m].name.toLowerCase() + ' report');
    });

    build();
    renderAuctions(); renderBids(); renderHeat(); renderAI(); renderHealth(); renderOrders(); renderQueue(); renderSellers();
    FEED.slice().reverse().forEach(function (f) { addFeed(f, false); });
    setInterval(tickAuctions, 1000);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setInterval(simulate, 7000);
        setInterval(simulateOther, 11000);
    }
})();
