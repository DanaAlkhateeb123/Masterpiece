/*
 * Nostalgia charts - tiny dependency-free SVG chart helpers used by the dashboards.
 * Exposes window.NC with: line, bars, donut, heatmap, spark, countUp, fmt, tip, colors.
 *
 * Colours: a fixed categorical order (never cycled) checked for colour-blind separation.
 * Every chart has a hover tooltip, direct values or a legend, and animates in once.
 */
(function () {
    'use strict';

    var SVGNS = 'http://www.w3.org/2000/svg';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var colors = ['#8E3B46', '#D1A94E', '#3B7DB5', '#6A9A4A']; // burgundy, gold, blue, green - always in this order
    var ink = '#292322', muted = '#817471', grid = '#e9e0da';

    /* ---------------- formatting ---------------- */
    var fmt = {
        num: function (n) { return Math.round(n).toLocaleString('en-US'); },
        compact: function (n) {
            var a = Math.abs(n);
            if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
            if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k';
            return String(Math.round(n));
        },
        money: function (n) { return '$' + Math.round(n).toLocaleString('en-US'); },
        moneyCompact: function (n) { return '$' + fmt.compact(n); },
        pct: function (n) { return (Math.round(n * 10) / 10) + '%'; }
    };

    /* ---------------- helpers ---------------- */
    function el(name, attrs, parent) {
        var node = document.createElementNS(SVGNS, name);
        Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
        if (parent) parent.appendChild(node);
        return node;
    }

    function niceMax(max) {
        if (max <= 0) return 1;
        var pow = Math.pow(10, Math.floor(Math.log10(max)));
        var n = max / pow;
        var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
        return step * pow;
    }

    // monotone cubic path (no overshoot between points)
    function smooth(pts) {
        var n = pts.length;
        if (n < 2) return '';
        var dx = [], dy = [], m = [], t = [];
        for (var i = 0; i < n - 1; i++) {
            dx[i] = pts[i + 1][0] - pts[i][0];
            dy[i] = pts[i + 1][1] - pts[i][1];
            m[i] = dy[i] / dx[i];
        }
        t[0] = m[0];
        t[n - 1] = m[n - 2];
        for (i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
        for (i = 0; i < n - 1; i++) {
            if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
            var a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
            if (s > 9) { var k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
        }
        var d = 'M' + pts[0][0] + ',' + pts[0][1];
        for (i = 0; i < n - 1; i++) {
            var x1 = pts[i][0] + dx[i] / 3, y1 = pts[i][1] + t[i] * dx[i] / 3;
            var x2 = pts[i + 1][0] - dx[i] / 3, y2 = pts[i + 1][1] - t[i + 1] * dx[i] / 3;
            d += 'C' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + pts[i + 1][0] + ',' + pts[i + 1][1];
        }
        return d;
    }

    // bar with only the data end rounded (4px), anchored square on the baseline
    function barPath(x, y, w, h, r, dir) {
        r = Math.max(0, Math.min(r, w / 2, h));
        if (h <= 0 || w <= 0) return '';
        if (dir === 'up') {
            return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
        }
        return 'M' + x + ',' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h - r) + 'Q' + (x + w) + ',' + (y + h) + ' ' + (x + w - r) + ',' + (y + h) + 'H' + x + 'Z';
    }

    // animate a stroke being drawn (uses the real path length - works at any size)
    function draw(path, dur, delay) {
        var len = path.getTotalLength ? Math.ceil(path.getTotalLength()) + 1 : 1000;
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        path.style.animation = 'nc-draw ' + dur + 's ' + delay + 's cubic-bezier(.16,1,.3,1) forwards';
    }

    /* ---------------- tooltip ---------------- */
    var tipEl;
    var tip = {
        show: function (html, x, y) {
            if (!tipEl) {
                tipEl = document.createElement('div');
                tipEl.className = 'nc-tip';
                tipEl.setAttribute('role', 'status');
                document.body.appendChild(tipEl);
            }
            tipEl.innerHTML = html;
            tipEl.classList.add('is-on');
            var w = tipEl.offsetWidth, h = tipEl.offsetHeight;
            var left = x + 16, top = y - h - 12;
            if (left + w > window.innerWidth - 8) left = x - w - 16;
            if (top < 8) top = y + 18;
            tipEl.style.transform = 'translate(' + Math.max(8, left) + 'px,' + top + 'px)';
        },
        hide: function () { if (tipEl) tipEl.classList.remove('is-on'); }
    };

    /* ---------------- responsive wrapper ---------------- */
    function mount(container, draw) {
        var first = true, lastW = 0, timer;
        function run() {
            var w = Math.floor(container.clientWidth);
            if (!w) return;
            lastW = w;
            container.innerHTML = '';
            draw(w, first && !reduce);
            first = false;
        }
        run();
        if (container._ncObserver) container._ncObserver.disconnect(); // a re-render replaces the old observer
        if ('ResizeObserver' in window) {
            container._ncObserver = new ResizeObserver(function () {
                if (Math.floor(container.clientWidth) === lastW) return;
                clearTimeout(timer);
                timer = setTimeout(run, 120);
            });
            container._ncObserver.observe(container);
        }
        return { redraw: function (animate) { first = !!animate; run(); } };
    }

    /* ======================================================================
       Line / area chart (one measure, one axis, optional previous-period line)
       cfg: labels[], series:[{name,color,values,dashed,area}], format(fn), height, tickEvery
       ====================================================================== */
    function line(container, cfg) {
        container.classList.add('nc-chart');
        return mount(container, function (W, animate) {
            var H = cfg.height || 300;
            var m = { t: 14, r: 16, b: 30, l: 48 };
            var iw = W - m.l - m.r, ih = H - m.t - m.b;
            var all = [];
            cfg.series.forEach(function (s) { all = all.concat(s.values); });
            var max = niceMax(Math.max.apply(null, all) * 1.04);
            var n = cfg.labels.length;
            var f = cfg.format || fmt.compact;
            var X = function (i) { return m.l + (n === 1 ? iw / 2 : i * iw / (n - 1)); };
            var Y = function (v) { return m.t + ih - v / max * ih; };

            var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': cfg.label || 'Line chart' }, container);
            var defs = el('defs', {}, svg);
            var gid = 'g' + Math.random().toString(36).slice(2, 8);
            var grad = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
            el('stop', { offset: '0%', 'stop-color': cfg.series[0].color || colors[0], 'stop-opacity': .26 }, grad);
            el('stop', { offset: '100%', 'stop-color': cfg.series[0].color || colors[0], 'stop-opacity': 0 }, grad);

            // grid + y labels
            for (var g = 0; g <= 4; g++) {
                var gy = m.t + ih - g / 4 * ih;
                el('line', { x1: m.l, x2: W - m.r, y1: gy, y2: gy, stroke: g === 0 ? '#d5cac3' : grid, 'stroke-width': 1 }, svg);
                var tx = el('text', { x: m.l - 10, y: gy + 4, 'text-anchor': 'end', fill: muted, 'font-size': 11 }, svg);
                tx.textContent = f(max * g / 4);
            }
            // x labels
            var every = cfg.tickEvery || Math.ceil(n / Math.max(2, Math.floor(iw / 70)));
            cfg.labels.forEach(function (lb, i) {
                if (i % every !== 0 && i !== n - 1) return;
                if (i === n - 1 && (n - 1) % every !== 0 && (n - 1 - Math.floor((n - 1) / every) * every) < every / 2) return;
                var t = el('text', { x: X(i), y: H - 8, 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle', fill: muted, 'font-size': 11 }, svg);
                t.textContent = lb;
            });

            var dots = [];
            cfg.series.forEach(function (s, si) {
                var color = s.color || colors[si];
                var pts = s.values.map(function (v, i) { return [X(i), Y(v)]; });
                var d = smooth(pts);
                if (si === 0 && s.area !== false) {
                    var area = el('path', { d: d + 'L' + X(n - 1) + ',' + (m.t + ih) + 'L' + X(0) + ',' + (m.t + ih) + 'Z', fill: 'url(#' + gid + ')' }, svg);
                    if (animate) { area.style.opacity = 0; area.style.animation = 'nc-fade .9s .45s ease forwards'; }
                }
                var p = el('path', { d: d, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
                if (s.dashed) { p.setAttribute('stroke-dasharray', '4 5'); p.setAttribute('opacity', .75); }
                else if (animate) { draw(p, 1.3, si * .15); }
                var dot = el('circle', { r: 4.5, fill: color, stroke: '#fff', 'stroke-width': 2, opacity: 0 }, svg);
                dots.push(dot);
            });

            var cross = el('line', { y1: m.t, y2: m.t + ih, stroke: '#b9aca4', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0 }, svg);
            var hit = el('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent' }, svg);
            hit.style.cursor = 'crosshair';

            function move(ev) {
                var r = svg.getBoundingClientRect();
                var px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
                var i = Math.max(0, Math.min(n - 1, Math.round((px - m.l) / iw * (n - 1))));
                cross.setAttribute('x1', X(i)); cross.setAttribute('x2', X(i)); cross.setAttribute('opacity', 1);
                var rows = '';
                cfg.series.forEach(function (s, si) {
                    dots[si].setAttribute('cx', X(i)); dots[si].setAttribute('cy', Y(s.values[i])); dots[si].setAttribute('opacity', 1);
                    rows += '<div class="nc-tip-row"><i style="background:' + (s.color || colors[si]) + '"></i><span>' + s.name + '</span><b>' + (cfg.tipFormat || f)(s.values[i]) + '</b></div>';
                });
                tip.show('<div class="nc-tip-title">' + (cfg.tipLabels ? cfg.tipLabels[i] : cfg.labels[i]) + '</div>' + rows,
                    ev.touches ? ev.touches[0].clientX : ev.clientX, ev.touches ? ev.touches[0].clientY : ev.clientY);
            }
            function leave() { cross.setAttribute('opacity', 0); dots.forEach(function (d) { d.setAttribute('opacity', 0); }); tip.hide(); }
            hit.addEventListener('mousemove', move);
            hit.addEventListener('touchstart', move, { passive: true });
            hit.addEventListener('touchmove', move, { passive: true });
            hit.addEventListener('mouseleave', leave);
            hit.addEventListener('touchend', leave);
        });
    }

    /* ======================================================================
       Bars. cfg: labels[], values[], horizontal, color, format, height, highlight (index),
       valueLabels (show a value at the end of every bar - used for horizontal ranks)
       ====================================================================== */
    function bars(container, cfg) {
        container.classList.add('nc-chart');
        return mount(container, function (W, animate) {
            var f = cfg.format || fmt.compact;
            var n = cfg.labels.length;
            var max = niceMax(Math.max.apply(null, cfg.values) * 1.02);
            var color = cfg.color || colors[0];
            var svg;
            if (cfg.horizontal) {
                var rowH = cfg.rowHeight || 34, H = n * rowH + 6;
                var labelW = Math.min(130, Math.max(80, W * .3)), valW = 58;
                var bw = W - labelW - valW;
                svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': cfg.label || 'Bar chart' }, container);
                cfg.labels.forEach(function (lb, i) {
                    var y = i * rowH + 3, th = Math.min(14, rowH - 14);
                    var t = el('text', { x: 0, y: y + rowH / 2 + 4, fill: ink, 'font-size': 12.5 }, svg);
                    t.textContent = lb;
                    el('rect', { x: labelW, y: y + (rowH - th) / 2, width: bw, height: th, rx: 4, fill: '#f3ebe5' }, svg);
                    var w = cfg.values[i] / max * bw;
                    var c = Array.isArray(cfg.color) ? cfg.color[i] : (cfg.highlight != null && cfg.highlight !== i ? '#c9a9ad' : color);
                    var b = el('path', { d: barPath(labelW, y + (rowH - th) / 2, Math.max(w, 2), th, 4, 'right'), fill: c }, svg);
                    b.style.transformBox = 'fill-box'; b.style.transformOrigin = '0 50%';
                    if (animate) { b.style.transform = 'scaleX(0)'; b.style.animation = 'nc-grow-x .9s ' + (i * .05) + 's var(--ease-out, ease-out) forwards'; }
                    var v = el('text', { x: W, y: y + rowH / 2 + 4, 'text-anchor': 'end', fill: ink, 'font-size': 12.5, 'font-weight': 600 }, svg);
                    v.textContent = f(cfg.values[i]);
                    var hit = el('rect', { x: 0, y: y, width: W, height: rowH, fill: 'transparent' }, svg);
                    hit.addEventListener('mousemove', function (ev) {
                        tip.show('<div class="nc-tip-title">' + lb + '</div><div class="nc-tip-row"><i style="background:' + c + '"></i><span>' + (cfg.name || 'Value') + '</span><b>' + (cfg.tipFormat || f)(cfg.values[i]) + '</b></div>', ev.clientX, ev.clientY);
                    });
                    hit.addEventListener('mouseleave', tip.hide);
                });
            } else {
                var H2 = cfg.height || 240, m = { t: 12, r: 8, b: 26, l: 44 };
                var iw = W - m.l - m.r, ih = H2 - m.t - m.b;
                svg = el('svg', { width: W, height: H2, viewBox: '0 0 ' + W + ' ' + H2, role: 'img', 'aria-label': cfg.label || 'Bar chart' }, container);
                for (var g = 0; g <= 4; g++) {
                    var gy = m.t + ih - g / 4 * ih;
                    el('line', { x1: m.l, x2: W - m.r, y1: gy, y2: gy, stroke: g === 0 ? '#d5cac3' : grid }, svg);
                    var tx = el('text', { x: m.l - 8, y: gy + 4, 'text-anchor': 'end', fill: muted, 'font-size': 11 }, svg);
                    tx.textContent = f(max * g / 4);
                }
                var slot = iw / n, bwid = Math.max(4, Math.min(28, slot - 6)); // 2px+ gap between neighbours
                var every = Math.ceil(n / Math.max(2, Math.floor(iw / 44)));
                cfg.labels.forEach(function (lb, i) {
                    var h = cfg.values[i] / max * ih, x = m.l + slot * i + (slot - bwid) / 2;
                    var c = cfg.highlight != null && cfg.highlight !== i ? '#c9a9ad' : color;
                    var b = el('path', { d: barPath(x, m.t + ih - h, bwid, h, 4, 'up'), fill: c }, svg);
                    b.style.transformBox = 'fill-box'; b.style.transformOrigin = '50% 100%';
                    if (animate) { b.style.transform = 'scaleY(0)'; b.style.animation = 'nc-grow-y .8s ' + (i * .025) + 's var(--ease-out, ease-out) forwards'; }
                    if (i % every === 0) {
                        var t = el('text', { x: x + bwid / 2, y: H2 - 8, 'text-anchor': 'middle', fill: muted, 'font-size': 11 }, svg);
                        t.textContent = lb;
                    }
                    var hit = el('rect', { x: m.l + slot * i, y: m.t, width: slot, height: ih, fill: 'transparent' }, svg);
                    hit.addEventListener('mousemove', function (ev) {
                        b.setAttribute('opacity', .85);
                        tip.show('<div class="nc-tip-title">' + (cfg.tipLabels ? cfg.tipLabels[i] : lb) + '</div><div class="nc-tip-row"><i style="background:' + c + '"></i><span>' + (cfg.name || 'Value') + '</span><b>' + (cfg.tipFormat || f)(cfg.values[i]) + '</b></div>', ev.clientX, ev.clientY);
                    });
                    hit.addEventListener('mouseleave', function () { b.setAttribute('opacity', 1); tip.hide(); });
                });
            }
        });
    }

    /* ======================================================================
       Donut. cfg: items:[{name,value,color}], format, centerLabel, size
       Renders SVG + an HTML legend with values next to it.
       ====================================================================== */
    function donut(container, cfg) {
        container.classList.add('nc-donut');
        container.innerHTML = '';
        var total = cfg.items.reduce(function (a, b) { return a + b.value; }, 0);
        var f = cfg.format || fmt.num;
        var size = cfg.size || 168, r = size / 2 - 14, circ = 2 * Math.PI * r, sw = 16;
        var wrap = document.createElement('div'); wrap.className = 'nc-donut-ring';
        var svg = el('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': cfg.label || 'Donut chart' });
        wrap.appendChild(svg);
        el('circle', { cx: size / 2, cy: size / 2, r: r, fill: 'none', stroke: '#f3ebe5', 'stroke-width': sw }, svg);
        var center = document.createElement('div'); center.className = 'nc-donut-center';
        center.innerHTML = '<strong>' + (cfg.centerValue || f(total)) + '</strong><span>' + (cfg.centerLabel || 'Total') + '</span>';
        wrap.appendChild(center);
        var legend = document.createElement('ul'); legend.className = 'nc-legend';
        var off = 0, gap = 2.5, segs = [];
        cfg.items.forEach(function (it, i) {
            var len = it.value / total * circ;
            var seg = el('circle', { cx: size / 2, cy: size / 2, r: r, fill: 'none', stroke: it.color || colors[i], 'stroke-width': sw, 'stroke-dasharray': Math.max(len - gap, 1) + ' ' + circ, 'stroke-dashoffset': -off, transform: 'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')' }, svg);
            seg.style.transition = 'stroke-width .25s ease, opacity .25s ease';
            if (!reduce) { seg.style.opacity = 0; seg.style.animation = 'nc-fade .6s ' + (.15 + i * .15) + 's ease forwards'; }
            segs.push(seg);
            off += len;
            var li = document.createElement('li');
            li.innerHTML = '<i style="background:' + (it.color || colors[i]) + '"></i><span>' + it.name + '</span><b>' + (cfg.legendFormat ? cfg.legendFormat(it) : f(it.value)) + '</b><em>' + Math.round(it.value / total * 100) + '%</em>';
            legend.appendChild(li);
            function on(ev) {
                segs.forEach(function (s, j) { s.style.opacity = j === i ? 1 : .35; });
                seg.setAttribute('stroke-width', sw + 4);
                center.innerHTML = '<strong>' + Math.round(it.value / total * 100) + '%</strong><span>' + it.name + '</span>';
            }
            function off_() {
                segs.forEach(function (s) { s.style.opacity = 1; s.setAttribute('stroke-width', sw); });
                center.innerHTML = '<strong>' + (cfg.centerValue || f(total)) + '</strong><span>' + (cfg.centerLabel || 'Total') + '</span>';
            }
            [seg, li].forEach(function (t) { t.addEventListener('mouseenter', on); t.addEventListener('mouseleave', off_); });
            seg.addEventListener('mousemove', function (ev) {
                tip.show('<div class="nc-tip-title">' + it.name + '</div><div class="nc-tip-row"><i style="background:' + (it.color || colors[i]) + '"></i><span>' + (cfg.tipName || 'Value') + '</span><b>' + (cfg.legendFormat ? cfg.legendFormat(it) : f(it.value)) + '</b></div>', ev.clientX, ev.clientY);
            });
            seg.addEventListener('mouseleave', tip.hide);
        });
        container.appendChild(wrap);
        container.appendChild(legend);
    }

    /* ======================================================================
       Heatmap (single sequential hue). cfg: rows[], cols[], data[row][col], format, unit
       ====================================================================== */
    function heatmap(container, cfg) {
        container.classList.add('nc-heat');
        container.innerHTML = '';
        var max = 0;
        cfg.data.forEach(function (r) { r.forEach(function (v) { if (v > max) max = v; }); });
        var grid_ = document.createElement('div');
        grid_.className = 'nc-heat-grid';
        grid_.style.gridTemplateColumns = 'auto repeat(' + cfg.cols.length + ', minmax(0, 1fr))';
        grid_.appendChild(document.createElement('span'));
        cfg.cols.forEach(function (c, ci) {
            var s = document.createElement('span'); s.className = 'nc-heat-col'; s.textContent = ci % 3 === 0 ? c : ''; grid_.appendChild(s);
        });
        cfg.rows.forEach(function (rw, ri) {
            var l = document.createElement('span'); l.className = 'nc-heat-row'; l.textContent = rw; grid_.appendChild(l);
            cfg.data[ri].forEach(function (v, ci) {
                var c = document.createElement('i');
                var k = v / max;
                c.style.background = 'color-mix(in srgb, #8E3B46 ' + Math.round(8 + k * 92) + '%, #fbf6f2)';
                if (!reduce) { c.style.opacity = 0; c.style.animation = 'nc-fade .5s ' + ((ri * 24 + ci) * 6) + 'ms ease forwards'; }
                c.addEventListener('mousemove', function (ev) {
                    tip.show('<div class="nc-tip-title">' + rw + ' · ' + cfg.cols[ci] + '</div><div class="nc-tip-row"><span>' + (cfg.unit || 'Visits') + '</span><b>' + fmt.num(v) + '</b></div>', ev.clientX, ev.clientY);
                });
                c.addEventListener('mouseleave', tip.hide);
                grid_.appendChild(c);
            });
        });
        container.appendChild(grid_);
        var scale = document.createElement('div');
        scale.className = 'nc-heat-scale';
        scale.innerHTML = '<span>Quiet</span><i></i><span>Busy</span>';
        container.appendChild(scale);
    }

    /* ---------------- sparkline ---------------- */
    function spark(container, values, color) {
        container.innerHTML = '';
        var W = container.clientWidth || 96, H = container.clientHeight || 32;
        var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
        var pts = values.map(function (v, i) { return [2 + i * (W - 8) / (values.length - 1), H - 4 - (v - min) / ((max - min) || 1) * (H - 10)]; });
        var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' }, container);
        var p = el('path', { d: smooth(pts), fill: 'none', stroke: color || colors[0], 'stroke-width': 1.75, 'stroke-linecap': 'round' }, svg);
        if (!reduce) draw(p, 1.1, .2);
        var last = pts[pts.length - 1];
        el('circle', { cx: last[0], cy: last[1], r: 2.8, fill: color || colors[0], stroke: '#fff', 'stroke-width': 1.5 }, svg);
    }

    /* ---------------- count-up numbers ---------------- */
    function countUp(node, to, opts) {
        opts = opts || {};
        var dec = opts.decimals || 0, pre = opts.prefix || '', suf = opts.suffix || '';
        var show = function (v) {
            var s = opts.compact ? fmt.compact(v) : v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
            node.textContent = pre + s + suf;
        };
        if (reduce) { show(to); return; }
        var start = performance.now(), dur = opts.duration || 1400;
        (function tick(now) {
            var p = Math.min(1, (now - start) / dur);
            show(to * (1 - Math.pow(1 - p, 4)));
            if (p < 1) requestAnimationFrame(tick); else show(to);
        })(start);
    }

    window.NC = { line: line, bars: bars, donut: donut, heatmap: heatmap, spark: spark, countUp: countUp, fmt: fmt, tip: tip, colors: colors };
})();
