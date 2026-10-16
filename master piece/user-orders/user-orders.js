/*
 * My Orders (buying + selling). DUMMY DATA below - TODO: load from the backend for the signed-in user.
 */
(function () {
    'use strict';
    var auth = window.NostalgiaAuth, user = auth && auth.getUser();
    if (!user) { document.getElementById('page-gate').hidden = false; return; }
    document.getElementById('page-app').hidden = false;

    var NC = window.NC, fmt = NC.fmt;
    function $(id) { return document.getElementById(id); }
    function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
    function toast(m) { var t = document.createElement('div'); t.className = 'd-toast'; t.textContent = m; $('toasts').appendChild(t); setTimeout(function () { t.classList.add('is-out'); setTimeout(function () { t.remove(); }, 320); }, 2800); }
    var ICON = {
        bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>', box: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v9"/>',
        truck: '<path d="M3 7h11v11H3zM14 11h4l3 3v4h-7z"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="17.5" cy="18.5" r="1.5"/>',
        money: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M9.3 9.6c0-1 1.1-1.6 2.7-1.6s2.7.6 2.7 1.7c0 2.2-5.4 1.1-5.4 3.5 0 1.1 1.1 1.8 2.7 1.8s2.7-.7 2.7-1.7"/>',
        check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
    };
    function svg(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>'; }

    var STEPS = ['Paid', 'Preparing', 'On the way', 'Delivered'];
    var STATUS = { 'Paid': [0, 'info'], 'Preparing': [1, 'warning'], 'On the way': [2, 'gold'], 'Delivered': [3, 'success'] };
    var BUY = [
        { id: 'NOST-0012', t: 'Hand-knit wool sweater', who: 'Sara Ahmad', city: 'Amman', price: 15, st: 'Preparing', date: 'Oct 10, 2026', ph: '#e8d6c6', icon: 'bag' },
        { id: 'NOST-0009', t: 'Vintage leather jacket', who: 'Omar Ali', city: 'Amman', price: 25, st: 'On the way', date: 'Oct 6, 2026', ph: '#c9a58a', icon: 'bag' },
        { id: 'NOST-0007', t: 'Ottoman brass coffee set', who: 'Lina Saleh', city: 'Salt', price: 190, st: 'Delivered', date: 'Sep 28, 2026', ph: '#d6b878', icon: 'box', auction: true },
        { id: 'NOST-0005', t: 'Compact digital camera', who: 'Zaid Omar', city: 'Irbid', price: 95, st: 'Delivered', date: 'Sep 14, 2026', ph: '#cfd3d8', icon: 'box' },
        { id: 'NOST-0003', t: 'Classy evening dress', who: 'Lina Saleh', city: 'Amman', price: 25, st: 'Delivered', date: 'Aug 30, 2026', ph: '#d8b9bf', icon: 'bag' },
        { id: 'NOST-0002', t: 'First-edition poetry book', who: 'Mazen Haddad', city: 'Zarqa', price: 48, st: 'Delivered', date: 'Jul 19, 2026', ph: '#d9cdb2', icon: 'box' }
    ];
    var SELL = [
        { id: 'NOST-0411', t: 'Vintage silk scarf', who: 'Maya Q.', city: 'Amman', price: 32, st: 'Paid', date: 'Oct 13, 2026', ph: '#d8c7d4', icon: 'bag' },
        { id: 'NOST-0398', t: '1950s Singer sewing machine', who: 'Dina F.', city: 'Aqaba', price: 120, st: 'Preparing', date: 'Oct 11, 2026', ph: '#bdb9ae', icon: 'box', auction: true },
        { id: 'NOST-0371', t: 'Leather weekend bag', who: 'Sami T.', city: 'Amman', price: 85, st: 'On the way', date: 'Oct 8, 2026', ph: '#b99b7d', icon: 'bag' },
        { id: 'NOST-0349', t: 'Brass candlestick pair', who: 'Reem L.', city: 'Irbid', price: 44, st: 'Delivered', date: 'Sep 30, 2026', ph: '#d6c58f', icon: 'box' },
        { id: 'NOST-0322', t: 'Retro film camera', who: 'Faris N.', city: 'Amman', price: 130, st: 'Delivered', date: 'Sep 21, 2026', ph: '#cfd3d8', icon: 'box' },
        { id: 'NOST-0301', t: 'Wool winter coat', who: 'Aya F.', city: 'Zarqa', price: 58, st: 'Delivered', date: 'Sep 9, 2026', ph: '#bfa491', icon: 'bag' }
    ];
    var MONTHS = { buying: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], selling: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'] };
    var SERIES = { buying: [0, 0, 48, 25, 285, 40], selling: [0, 0, 0, 0, 232, 237] };

    var state = { mode: 'buying', status: 'all', q: '' };
    function data() { return state.mode === 'buying' ? BUY : SELL; }

    function renderKpis() {
        var d = data(), buying = state.mode === 'buying';
        var active = d.filter(function (o) { return o.st !== 'Delivered'; }).length;
        var total = sum(d.map(function (o) { return o.price; }));
        var done = d.filter(function (o) { return o.st === 'Delivered'; }).length;
        var list = buying ? [
            ['Active orders', active, 'truck', '', 'On their way to you'], ['Total spent', total, 'money', '$', 'Across ' + d.length + ' orders'],
            ['Delivered', done, 'check', '', 'Items in your hands'], ['Saved with pre-loved', Math.round(total * .62), 'bag', '$', 'Versus buying new']
        ] : [
            ['To ship', d.filter(function (o) { return o.st === 'Paid' || o.st === 'Preparing'; }).length, 'box', '', 'Waiting for you'], ['Earnings', total, 'money', '$', 'After fees: ' + fmt.money(total * .92)],
            ['Items sold', d.length, 'bag', '', 'Since you joined'], ['Avg. rating', 4.8, 'check', '', 'From buyers', 1]
        ];
        $('kpi-grid').innerHTML = list.map(function (k, i) {
            return '<article class="kpi span-3" style="animation: dash-rise .7s var(--ease-out) both; animation-delay:' + i * 70 + 'ms"><div class="kpi-top"><span class="kpi-label">' + k[0] + '</span><span class="kpi-icon">' + svg(k[2]) + '</span></div><p class="kpi-value" data-k="' + i + '">0</p><div class="kpi-note">' + k[4] + '</div></article>';
        }).join('');
        list.forEach(function (k, i) { NC.countUp(document.querySelector('[data-k="' + i + '"]'), k[1], { prefix: k[3], decimals: k[5] || 0, duration: 1100 }); });
    }

    function renderChips() {
        var d = data(), counts = { all: d.length };
        STEPS.forEach(function (s) { counts[s] = d.filter(function (o) { return o.st === s; }).length; });
        $('status-chips').innerHTML = ['all'].concat(STEPS).map(function (s) {
            return '<button class="chip" type="button" data-s="' + s + '" aria-pressed="' + (state.status === s) + '">' + (s === 'all' ? 'All' : s) + '<b>' + counts[s] + '</b></button>';
        }).join('');
    }

    function renderList() {
        var buying = state.mode === 'buying', q = state.q.toLowerCase();
        var rows = data().filter(function (o) { return (state.status === 'all' || o.st === state.status) && (!q || (o.t + o.id + o.who).toLowerCase().indexOf(q) > -1); });
        $('order-list').innerHTML = rows.map(function (o, i) {
            var idx = STATUS[o.st][0];
            var steps = STEPS.map(function (s, n) { return '<div class="step ' + (n < idx || idx === 3 ? 'is-done' : n === idx ? 'is-current' : '') + '" style="--n:' + n + '"><i></i><span>' + s + '</span></div>'; }).join('');
            var actions = buying
                ? (o.st === 'Delivered' ? '<a class="d-btn d-btn--ghost d-btn--sm" href="../feedback/feedback.html">Leave feedback</a>' : '<a class="d-btn d-btn--sm" href="../order-tracking/order-tracking.html">Track order</a>') + '<a class="d-btn d-btn--ghost d-btn--sm" href="../messeges/messages.html">Message seller</a>'
                : (o.st === 'Paid' || o.st === 'Preparing' ? '<button class="d-btn d-btn--sm" type="button" data-ship="' + o.id + '">Mark as shipped</button>' : '<a class="d-btn d-btn--ghost d-btn--sm" href="../order-tracking/order-tracking.html">View details</a>') + '<a class="d-btn d-btn--ghost d-btn--sm" href="../messeges/messages.html">Message buyer</a>';
            return '<li class="order" style="--d:' + i * 60 + 'ms"><div class="order-main"><span class="order-img" style="--ph:' + o.ph + '">' + svg(o.icon) + '</span>' +
                '<div><h4 class="order-title">' + o.t + '</h4><div class="order-meta"><span>#' + o.id + '</span><span>' + (buying ? 'Seller: ' : 'Buyer: ') + o.who + ' · ' + o.city + '</span><span>' + o.date + '</span>' + (o.auction ? '<span class="pill pill--gold" style="padding:1px 8px">Auction</span>' : '') + '</div></div>' +
                '<div class="order-price"><strong>' + fmt.money(o.price) + '</strong><span class="pill pill--' + STATUS[o.st][1] + '">' + o.st + '</span></div></div>' +
                '<div class="steps">' + steps + '</div><div class="order-foot">' + actions + '</div></li>';
        }).join('');
        $('order-empty').hidden = rows.length > 0;
        // let the progress bars animate in
        requestAnimationFrame(function () { requestAnimationFrame(function () { $('order-list').querySelectorAll('.step').forEach(function (s) { s.classList.add('go'); }); }); });
    }

    function renderChart() {
        var buying = state.mode === 'buying';
        $('chart-title').textContent = buying ? 'Spending' : 'Earnings';
        $('chart-total-label').textContent = buying ? 'Spent in 6 months' : 'Earned in 6 months';
        $('chart-total').textContent = fmt.money(sum(SERIES[state.mode]));
        NC.bars($('month-chart'), { labels: MONTHS[state.mode], values: SERIES[state.mode], height: 210, color: buying ? NC.colors[0] : '#B88932', highlight: 5, name: buying ? 'Spent' : 'Earned', format: fmt.moneyCompact, tipFormat: fmt.money, label: 'Monthly totals' });
    }

    function renderAll() {
        $('list-title').textContent = state.mode === 'buying' ? 'Purchases' : 'Sales';
        $('list-sub').textContent = state.mode === 'buying' ? "Everything you've ordered" : 'Orders from people who bought your items';
        renderKpis(); renderChips(); renderList(); renderChart();
    }

    $('mode-seg').addEventListener('click', function (e) {
        var b = e.target.closest('[data-mode]'); if (!b || b.dataset.mode === state.mode) return;
        state.mode = b.dataset.mode; state.status = 'all';
        $('mode-seg').querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        renderAll();
    });
    $('status-chips').addEventListener('click', function (e) { var b = e.target.closest('[data-s]'); if (!b) return; state.status = b.dataset.s; renderChips(); renderList(); });
    $('order-search').addEventListener('input', function (e) { state.q = e.target.value.trim(); renderList(); });
    $('order-list').addEventListener('click', function (e) {
        var b = e.target.closest('[data-ship]'); if (!b) return;
        var o = SELL.filter(function (x) { return x.id === b.dataset.ship; })[0]; o.st = 'On the way'; // TODO: update on the backend
        toast('Marked #' + o.id + ' as shipped'); renderKpis(); renderChips(); renderList();
    });
    renderAll();
})();
