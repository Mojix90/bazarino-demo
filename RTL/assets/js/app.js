/*!
 * Bazarino v2.0 — app.js (vanilla JavaScript, no dependencies)
 * Modules: theme, header & mega menu, drawers, live search, cart / wishlist / compare (localStorage),
 * carousels, tabs, hero slider, countdowns, 3D tilt & parallax, shop filters, product page,
 * form validation, blog list, account demo actions.
 * Put your own code in custom.js (loaded after this file).
 */
(function () {
  'use strict';
  var D = window.BZ || { products: [], t: {}, cats: {}, brands: {}, colors: {}, lang: 'fa' };
  var T = D.t || {};
  var html = document.documentElement;
  var ROOT = html.getAttribute('data-root') || '';
  var RTL = html.dir === 'rtl';
  var FA = D.lang === 'fa';
  var KEY = 'bz2-' + (FA ? 'rtl' : 'ltr') + '-';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- helpers ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt); }
  var faDigits = '۰۱۲۳۴۵۶۷۸۹';
  function digits(v) { v = String(v); return FA ? v.replace(/[0-9]/g, function (d) { return faDigits[d]; }).replace(/([۰-۹])\.([۰-۹])/g, '$1٫$2') : v; }
  function latin(v) { return String(v || '').replace(/[۰-۹]/g, function (d) { return faDigits.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }); }
  function num(n) { return digits(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')); }
  function money(n) { return FA ? num(n) + ' <small>' + T.cur + '</small>' : '<small>$</small>' + num(n); }
  function moneyText(n) { return FA ? num(n) + ' ' + T.cur : '$' + num(n); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function icon(n, cls) { return '<svg class="icon ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  function star() { return '<svg class="icon" aria-hidden="true"><use href="#i-star"/></svg>'; }
  function byId(id) { for (var i = 0; i < D.products.length; i++) if (D.products[i].id === id) return D.products[i]; return null; }
  function pUrl(p) { return ROOT + 'products/' + p.id + '.html'; }
  function pImg(p) { return ROOT + 'assets/img/products/' + p.i + '.webp'; }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(KEY + k)); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { } }
  function catName(k) { return (D.cats[k] && D.cats[k][0]) || ''; }
  function subName(k) { for (var c in D.cats) { if (D.cats[c][2][k]) return D.cats[c][2][k]; } return ''; }

  /* ---------- toast ---------- */
  function toast(msg, type) {
    var box = $('.toasts'); if (!box) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.setAttribute('role', 'status');
    el.innerHTML = icon(type === 'error' ? 'info' : 'check-circle') + '<span>' + msg + '</span>';
    box.appendChild(el);
    setTimeout(function () { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(function () { el.remove(); }, 320); }, 2600);
  }
  window.BZToast = toast;

  /* ---------- theme ---------- */
  $$('.theme-toggle').forEach(function (b) {
    on(b, 'click', function () {
      var dark = html.getAttribute('data-theme') === 'dark';
      html.setAttribute('data-theme', dark ? 'light' : 'dark');
      try { localStorage.setItem('bz2-theme', dark ? 'light' : 'dark'); } catch (e) { }
      b.setAttribute('aria-pressed', String(!dark));
    });
  });

  /* ---------- header ---------- */
  var header = $('.site-header');
  var backTop = $('.back-top');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 10);
    if (backTop) backTop.classList.toggle('is-visible', y > 600);
    parallax(y);
    ticking = false;
  }
  on(window, 'scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  on(backTop, 'click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* mega menu */
  $$('.has-mega').forEach(function (item) {
    var btn = $('.nav-link', item), timer;
    function open() { clearTimeout(timer); item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    function close() { item.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    on(btn, 'click', function (e) { e.preventDefault(); item.classList.contains('is-open') ? close() : open(); });
    on(item, 'mouseenter', function () { if (finePointer) open(); });
    on(item, 'mouseleave', function () { if (finePointer) timer = setTimeout(close, 160); });
    on(item, 'keydown', function (e) { if (e.key === 'Escape') { close(); btn.focus(); } });
    on(item, 'focusout', function (e) { if (!item.contains(e.relatedTarget)) close(); });
    $$('.mega-tab', item).forEach(function (tab) {
      function act() {
        $$('.mega-tab', item).forEach(function (t) { t.classList.toggle('is-active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
        $$('.mega-panel', item).forEach(function (p) { p.classList.toggle('is-active', p.id === tab.getAttribute('aria-controls')); });
      }
      on(tab, 'mouseenter', act); on(tab, 'focus', act); on(tab, 'click', act);
    });
  });

  /* ---------- drawers & overlay ---------- */
  var overlay = $('.overlay');
  var lastFocus = null;
  function openDrawer(id) {
    var d = document.getElementById(id); if (!d) return;
    closeAll();
    lastFocus = document.activeElement;
    d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var f = d.querySelector('button, a, input'); if (f) setTimeout(function () { f.focus(); }, 60);
    if (id === 'cart-drawer') renderMiniCart();
  }
  function closeAll() {
    $$('.drawer.is-open, .filters.is-open, .modal.is-open').forEach(function (d) { d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); });
    if (overlay) overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function close() { var had = $('.drawer.is-open, .filters.is-open, .modal.is-open'); closeAll(); if (had && lastFocus) lastFocus.focus(); }
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); var id = o.getAttribute('data-open'); var el = document.getElementById(id); if (!el) return; if (el.classList.contains('modal') || el.classList.contains('filters')) { lastFocus = o; el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false'); if (el.classList.contains('filters') && overlay) overlay.classList.add('is-open'); var f = el.querySelector('button, input, a'); if (f) setTimeout(function () { f.focus(); }, 60); } else openDrawer(id); return; }
    if (e.target.closest('[data-close]') || e.target === overlay || e.target.classList.contains('modal-backdrop')) { close(); }
  });
  on(document, 'keydown', function (e) { if (e.key === 'Escape') close(); });

  /* ---------- live search ---------- */
  function norm(s) { return latin(String(s)).toLowerCase().replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/\u200c/g, ' '); }
  $$('[data-search]').forEach(function (form) {
    var input = $('input', form), box = $('.search-suggest', form), active = -1;
    if (!input || !box) return;
    function render() {
      var q = norm(input.value.trim()); active = -1;
      if (!q) {
        box.innerHTML = '<div class="suggest-title">' + T.popular + '</div><div class="suggest-tags">' + (T.popularTags || []).map(function (t) { return '<a class="chip" href="' + ROOT + 'shop.html?q=' + encodeURIComponent(t) + '">' + esc(t) + '</a>'; }).join('') + '</div>';
        box.classList.add('is-open'); input.setAttribute('aria-expanded', 'true'); return;
      }
      var res = D.products.filter(function (p) { return norm(p.n + ' ' + (D.brands[p.b] || '') + ' ' + catName(p.c) + ' ' + subName(p.s)).indexOf(q) > -1; }).slice(0, 6);
      if (!res.length) { box.innerHTML = '<div class="suggest-empty">' + T.noResult + '</div>'; }
      else {
        var raw = input.value.trim();
        box.innerHTML = '<div class="suggest-title">' + T.products + '</div>' + res.map(function (p, i) {
          var name = esc(p.n), idx = norm(p.n).indexOf(q);
          if (idx > -1) name = esc(p.n.slice(0, idx)) + '<mark>' + esc(p.n.slice(idx, idx + raw.length)) + '</mark>' + esc(p.n.slice(idx + raw.length));
          return '<a class="suggest-item" role="option" id="sg-' + i + '" href="' + pUrl(p) + '"><img src="' + pImg(p) + '" alt="" width="46" height="46" loading="lazy"><span><strong>' + name + '</strong><small>' + esc(catName(p.c)) + ' · ' + moneyText(p.p) + '</small></span></a>';
        }).join('') + '<a class="suggest-item" href="' + ROOT + 'shop.html?q=' + encodeURIComponent(raw) + '"><span class="muted">' + T.seeAll + ' «' + esc(raw) + '»</span></a>';
      }
      box.classList.add('is-open'); input.setAttribute('aria-expanded', 'true');
    }
    on(input, 'input', render);
    on(input, 'focus', render);
    on(input, 'keydown', function (e) {
      var items = $$('.suggest-item', box);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); if (!items.length) return;
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach(function (it, i) { it.classList.toggle('is-active', i === active); });
        input.setAttribute('aria-activedescendant', items[active].id || '');
      } else if (e.key === 'Enter' && active > -1 && items[active]) { e.preventDefault(); location.href = items[active].href; }
      else if (e.key === 'Escape') { box.classList.remove('is-open'); }
    });
    on(document, 'click', function (e) { if (!form.contains(e.target)) { box.classList.remove('is-open'); input.setAttribute('aria-expanded', 'false'); } });
    on(form, 'submit', function (e) { e.preventDefault(); location.href = ROOT + 'shop.html?q=' + encodeURIComponent(input.value.trim()); });
  });

  /* ---------- cart / wishlist / compare stores ---------- */
  function getCart() { return load('cart', []).filter(function (l) { return byId(l.id); }); }
  function setCart(c) { save('cart', c); updateCounts(); }
  function getWish() { return load('wish', []).filter(byId); }
  function getCmp() { return load('compare', []).filter(byId); }
  function cartCount() { return getCart().reduce(function (s, l) { return s + l.q; }, 0); }
  function updateCounts() {
    var counts = { cart: cartCount(), wish: getWish().length, compare: getCmp().length };
    $$('[data-count]').forEach(function (el) { var n = counts[el.getAttribute('data-count')] || 0; el.textContent = digits(n); el.setAttribute('data-zero', String(n === 0)); });
    var w = getWish(), c = getCmp();
    $$('[data-wish]').forEach(function (b) { var a = w.indexOf(b.getAttribute('data-wish')) > -1; b.classList.toggle('is-active', a); b.setAttribute('aria-pressed', String(a)); });
    $$('[data-compare]').forEach(function (b) { var a = c.indexOf(b.getAttribute('data-compare')) > -1; b.classList.toggle('is-active', a); b.setAttribute('aria-pressed', String(a)); });
  }
  function addToCart(id, q, color, size, silent) {
    var p = byId(id); if (!p) return;
    if (!p.st) { toast(T.outOfStock, 'error'); return; }
    var cart = getCart(), key = id + '|' + (color || '') + '|' + (size || '');
    var line = cart.filter(function (l) { return l.k === key; })[0];
    if (line) line.q = Math.min(line.q + q, 20); else cart.push({ k: key, id: id, q: q, c: color || '', s: size || '' });
    setCart(cart);
    if (!silent) { toast(T.addedToCart); renderMiniCart(); }
  }
  function lineTotal(l) { return byId(l.id).p * l.q; }
  function subtotal() { return getCart().reduce(function (s, l) { return s + lineTotal(l); }, 0); }
  function optText(l) { var t = []; if (l.c && D.colors[l.c]) t.push(T.color + ': ' + D.colors[l.c][0]); if (l.s) t.push(T.size + ': ' + digits(l.s)); return t.join(' · '); }
  function changeQty(key, q) { var cart = getCart(); cart.forEach(function (l) { if (l.k === key) l.q = Math.max(1, Math.min(20, q)); }); setCart(cart); renderAllCarts(); }
  function removeLine(key) { setCart(getCart().filter(function (l) { return l.k !== key; })); renderAllCarts(); toast(T.removed); }
  function qtyHtml(l, sm) { return '<div class="qty ' + (sm ? 'qty-sm' : '') + '"><button type="button" data-qty-dec="' + l.k + '" aria-label="' + T.decrease + '">' + icon('minus', 'icon-sm') + '</button><input type="number" min="1" max="20" value="' + l.q + '" data-qty-input="' + l.k + '" aria-label="' + T.qty + '"><button type="button" data-qty-inc="' + l.k + '" aria-label="' + T.increase + '">' + icon('plus', 'icon-sm') + '</button></div>'; }
  function renderMiniCart() {
    var body = $('#cart-drawer .drawer-body'), foot = $('#cart-drawer .drawer-foot'); if (!body) return;
    var cart = getCart();
    if (!cart.length) {
      body.innerHTML = '<div class="empty-state"><div class="empty-ico">' + icon('bag') + '</div><h3>' + T.cartEmpty + '</h3><p>' + T.cartEmptyText + '</p><a class="btn btn-primary" href="' + ROOT + 'shop.html">' + T.startShopping + '</a></div>';
      if (foot) foot.hidden = true; return;
    }
    if (foot) foot.hidden = false;
    var st = subtotal(), free = D.freeShip, pct = Math.min(100, st / free * 100);
    body.innerHTML = '<div class="free-ship">' + (st >= free ? T.freeShipDone : T.freeShipLeft.replace('%s', moneyText(free - st))) + '<div class="bar"><i style="--p:' + pct + '%"></i></div></div>' + cart.map(function (l) {
      var p = byId(l.id);
      return '<div class="cart-line"><a href="' + pUrl(p) + '"><img src="' + pImg(p) + '" alt="' + esc(p.n) + '" width="72" height="72" loading="lazy"></a><div><h3><a href="' + pUrl(p) + '">' + esc(p.n) + '</a></h3><small>' + optText(l) + '</small><div class="cart-line-foot">' + qtyHtml(l, true) + '<b>' + money(lineTotal(l)) + '</b></div><button type="button" class="link-danger" data-remove="' + l.k + '">' + icon('trash', 'icon-sm') + T.remove + '</button></div></div>';
    }).join('');
    var tot = $('#cart-drawer [data-subtotal]'); if (tot) tot.innerHTML = money(st);
  }
  /* coupon & shipping */
  var COUPONS = { BAZARINO10: { type: 'pct', v: 10 }, WELCOME: { type: 'fix', v: D.couponFix } };
  function getCoupon() { return load('coupon', ''); }
  function discountFor(st) { var c = COUPONS[getCoupon()]; if (!c) return 0; return c.type === 'pct' ? Math.round(st * c.v / 100) : Math.min(c.v, st); }
  function shipCost(st, method) {
    method = method || load('ship', 'post');
    var opt = (D.ship || []).filter(function (s) { return s.k === method; })[0] || (D.ship || [])[0];
    if (!opt) return 0;
    if (method === 'post' && st >= D.freeShip) return 0;
    return opt.p;
  }
  function renderSummary() {
    $$('[data-summary]').forEach(function (box) {
      var st = subtotal(), dc = discountFor(st), sh = getCart().length ? shipCost(st) : 0, tax = Math.round((st - dc) * D.tax), total = st - dc + sh + tax;
      var set = function (k, v) { var el = $('[data-s="' + k + '"]', box); if (el) el.innerHTML = v; };
      set('sub', money(st)); set('disc', dc ? '− ' + money(dc) : money(0)); set('ship', sh ? money(sh) : '<span class="badge badge-success">' + T.free + '</span>'); set('tax', money(tax)); set('total', money(total));
      var count = $('[data-s="count"]', box); if (count) count.textContent = digits(cartCount());
      var items = $('.co-items', box);
      if (items) items.innerHTML = getCart().map(function (l) { var p = byId(l.id); return '<div class="co-item"><img src="' + pImg(p) + '" alt="" width="54" height="54" loading="lazy"><span><span class="qbadge">' + digits(l.q) + '×</span> ' + esc(p.n) + '<br><small class="muted">' + optText(l) + '</small></span><b>' + money(lineTotal(l)) + '</b></div>'; }).join('');
    });
  }
  function renderCartPage() {
    var host = $('#cart-list'); if (!host) return;
    var cart = getCart(), full = $('#cart-full'), empty = $('#cart-empty');
    if (full) full.hidden = !cart.length; if (empty) empty.hidden = !!cart.length;
    host.innerHTML = cart.map(function (l) {
      var p = byId(l.id);
      return '<div class="cart-row"><a href="' + pUrl(p) + '"><img src="' + pImg(p) + '" alt="' + esc(p.n) + '" width="100" height="100" loading="lazy"></a><div><h3><a href="' + pUrl(p) + '">' + esc(p.n) + '</a></h3><div class="opts">' + (optText(l) || esc(D.brands[p.b] || '')) + '</div><div class="price"><b>' + money(p.p) + '</b></div><button type="button" class="link-danger" data-remove="' + l.k + '">' + icon('trash', 'icon-sm') + T.remove + '</button></div>' + qtyHtml(l) + '<div class="line-total">' + money(lineTotal(l)) + '</div></div>';
    }).join('');
    var c = $('[data-cart-count]'); if (c) c.textContent = digits(cartCount());
  }
  function renderAllCarts() { renderMiniCart(); renderCartPage(); renderSummary(); var co = $('#checkout-form'); if (co && !getCart().length) { var e = $('#checkout-empty'); if (e) { e.hidden = false; co.hidden = true; } } }

  document.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-add]'))) { e.preventDefault(); var p = byId(t.getAttribute('data-add')); if (p && (p.sz.length || p.co.length > 1) && !t.hasAttribute('data-direct')) { location.href = pUrl(p); return; } addToCart(t.getAttribute('data-add'), 1, p && p.co[0], ''); return; }
    if ((t = e.target.closest('[data-remove]'))) { removeLine(t.getAttribute('data-remove')); return; }
    if ((t = e.target.closest('[data-qty-dec]'))) { var k = t.getAttribute('data-qty-dec'); var l = getCart().filter(function (x) { return x.k === k; })[0]; if (l) changeQty(k, l.q - 1); return; }
    if ((t = e.target.closest('[data-qty-inc]'))) { var k2 = t.getAttribute('data-qty-inc'); var l2 = getCart().filter(function (x) { return x.k === k2; })[0]; if (l2) changeQty(k2, l2.q + 1); return; }
    if ((t = e.target.closest('[data-wish]'))) {
      e.preventDefault(); var id = t.getAttribute('data-wish'), w = getWish(), i = w.indexOf(id);
      if (i > -1) { w.splice(i, 1); toast(T.wishRemoved); } else { w.push(id); toast(T.wishAdded); }
      save('wish', w); updateCounts(); renderWishlist(); return;
    }
    if ((t = e.target.closest('[data-compare]'))) {
      e.preventDefault(); var id2 = t.getAttribute('data-compare'), c = getCmp(), j = c.indexOf(id2);
      if (j > -1) { c.splice(j, 1); toast(T.cmpRemoved); } else { if (c.length >= 4) { toast(T.cmpMax, 'error'); return; } c.push(id2); toast(T.cmpAdded + ' <a href="' + ROOT + 'compare.html" style="text-decoration:underline">' + T.view + '</a>'); }
      save('compare', c); updateCounts(); renderCompare(); return;
    }
    if ((t = e.target.closest('[data-clear-compare]'))) { save('compare', []); updateCounts(); renderCompare(); return; }
  });
  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-qty-input]');
    if (t) changeQty(t.getAttribute('data-qty-input'), parseInt(latin(t.value), 10) || 1);
  });

  /* coupon form */
  $$('[data-coupon]').forEach(function (f) {
    var input = $('input', f), msg = $('.coupon-msg', f.parentNode);
    if (getCoupon() && input) input.value = getCoupon();
    function apply(e) {
      if (e) e.preventDefault(); var code = latin(input.value).trim().toUpperCase();
      if (COUPONS[code]) { save('coupon', code); msg.className = 'coupon-msg ok'; msg.textContent = T.couponOk; }
      else { save('coupon', ''); msg.className = 'coupon-msg bad'; msg.textContent = T.couponBad; }
      renderSummary();
    }
    if (f.tagName === 'FORM') on(f, 'submit', apply);
    else {
      on($('button', f), 'click', apply);
      on(input, 'keydown', function (e) { if (e.key === 'Enter') apply(e); });
    }
  });
  /* shipping radios */
  $$('input[name="shipping"]').forEach(function (r) {
    if (r.value === load('ship', 'post')) r.checked = true;
    on(r, 'change', function () { save('ship', r.value); renderSummary(); });
  });

  /* ---------- product card (JS renderer; mirrors the static markup) ---------- */
  function card(p) {
    var badges = '';
    if (!p.st) badges += '<span class="p-badge out">' + T.soldOut + '</span>';
    else if (p.d) badges += '<span class="p-badge off">' + digits(p.d) + '٪'.replace('٪', FA ? '٪' : '%') + '</span>';
    if (p.t === 'new') badges += '<span class="p-badge new">' + T.new + '</span>';
    if (p.t === 'hot') badges += '<span class="p-badge hot">' + T.hot + '</span>';
    var sw = p.co.length ? '<div class="p-swatches" role="img" aria-label="' + T.colors + '">' + p.co.slice(0, 4).map(function (c) { return '<i style="--c:' + D.colors[c][1] + '" title="' + D.colors[c][0] + '"></i>'; }).join('') + '</div>' : '';
    return '<article class="p-card" data-tilt><a class="p-media" href="' + pUrl(p) + '" tabindex="-1" aria-hidden="true"><img src="' + pImg(p) + '" alt="" width="400" height="400" loading="lazy"><img class="img-2" src="' + pImg(p) + '" alt="" width="400" height="400" loading="lazy"></a>' +
      '<div class="p-badges">' + badges + '</div><div class="p-tools"><button type="button" class="p-tool" data-wish="' + p.id + '" aria-label="' + T.addWish + '" aria-pressed="false">' + icon('heart', 'icon-sm') + '</button><button type="button" class="p-tool" data-compare="' + p.id + '" aria-label="' + T.addCompare + '" aria-pressed="false">' + icon('compare', 'icon-sm') + '</button><a class="p-tool qv" href="' + pUrl(p) + '" aria-label="' + T.view + '">' + icon('eye', 'icon-sm') + '</a></div>' +
      '<div class="p-body"><span class="p-cat">' + esc(subName(p.s)) + '</span><h3 class="p-title"><a href="' + pUrl(p) + '">' + esc(p.n) + '</a></h3><span class="rating">' + star() + '<b>' + digits(p.r.toFixed(1)) + '</b> (' + digits(p.rc) + ')</span>' + sw + '<p class="p-desc">' + esc(T.cardDesc) + '</p>' +
      '<div class="p-foot"><div class="price"><b>' + money(p.p) + '</b>' + (p.o ? '<del>' + moneyText(p.o) + '</del>' : '') + '</div><button type="button" class="add-btn" data-add="' + p.id + '" aria-label="' + T.addCart + ': ' + esc(p.n) + '"' + (p.st ? '' : ' disabled') + '>' + icon('cart') + '</button></div></div></article>';
  }
  window.BZCard = card;

  /* ---------- wishlist & compare pages ---------- */
  function renderWishlist() {
    $$('[data-wishlist-grid]').forEach(function (g) {
      var items = getWish().map(byId), empty = document.getElementById(g.getAttribute('data-empty'));
      g.innerHTML = items.map(card).join(''); g.hidden = !items.length; if (empty) empty.hidden = !!items.length;
      $$('[data-wish-count]').forEach(function (c) { c.textContent = digits(items.length); });
    });
    updateCounts(); bindTilt();
  }
  function renderCompare() {
    var host = $('#compare-host'); if (!host) return;
    var items = getCmp().map(byId), empty = $('#compare-empty');
    host.hidden = !items.length; if (empty) empty.hidden = !!items.length;
    if (!items.length) return;
    var rows = [[T.product, function (p) { return '<img src="' + pImg(p) + '" alt="" width="140" height="140"><a class="c-name" href="' + pUrl(p) + '">' + esc(p.n) + '</a><button class="link-danger" type="button" data-compare="' + p.id + '">' + icon('trash', 'icon-sm') + T.remove + '</button>'; }],
      [T.price, function (p) { return '<div class="price" style="align-items:center"><b>' + money(p.p) + '</b>' + (p.o ? '<del>' + moneyText(p.o) + '</del>' : '') + '</div>'; }],
      [T.rating, function (p) { return '<span class="rating">' + star() + '<b>' + digits(p.r.toFixed(1)) + '</b> (' + digits(p.rc) + ')</span>'; }],
      [T.brand, function (p) { return esc(D.brands[p.b]); }],
      [T.category, function (p) { return esc(catName(p.c)) + ' / ' + esc(subName(p.s)); }],
      [T.colors, function (p) { return p.co.length ? '<div class="p-swatches" style="justify-content:center">' + p.co.map(function (c) { return '<i style="--c:' + D.colors[c][1] + '" title="' + D.colors[c][0] + '"></i>'; }).join('') + '</div>' : '—'; }],
      [T.sizes, function (p) { return p.sz.length ? digits(p.sz.join('، '.replace('، ', FA ? '، ' : ', '))) : '—'; }],
      [T.stock, function (p) { return p.st ? '<span class="in-stock">' + T.inStock + '</span>' : '<span class="out-stock">' + T.soldOut + '</span>'; }]];
    var maxSpec = 0; items.forEach(function (p) { maxSpec = Math.max(maxSpec, p.sp.length); });
    for (var i = 1; i < maxSpec; i++) (function (i) { rows.push([items[0].sp[i] ? items[0].sp[i][0] : '', function (p) { return p.sp[i] ? esc(p.sp[i][1]) : '—'; }]); })(i);
    rows.push(['', function (p) { return '<button type="button" class="btn btn-primary btn-sm" data-add="' + p.id + '"' + (p.st ? '' : ' disabled') + '>' + icon('cart', 'icon-sm') + T.addCart + '</button>'; }]);
    host.innerHTML = '<table class="compare-table"><tbody>' + rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th>' + items.map(function (p) { return '<td>' + r[1](p) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
    updateCounts();
  }

  /* ---------- carousels ---------- */
  $$('[data-carousel]').forEach(function (c) {
    var track = $('.carousel-track', c), id = c.id;
    var prev = $('[data-prev="' + id + '"]'), next = $('[data-next="' + id + '"]');
    if (!track) return;
    function state() {
      var max = track.scrollWidth - track.clientWidth - 2, x = Math.abs(track.scrollLeft);
      if (prev) prev.disabled = x <= 2; if (next) next.disabled = x >= max;
    }
    function go(dir) { var dx = track.clientWidth * 0.9 * dir * (RTL ? -1 : 1); track.scrollBy({ left: dx, behavior: reduceMotion ? 'auto' : 'smooth' }); }
    on(prev, 'click', function () { go(-1); }); on(next, 'click', function () { go(1); });
    on(track, 'scroll', function () { requestAnimationFrame(state); }, { passive: true });
    on(window, 'resize', state); state();
  });

  /* ---------- tabs ---------- */
  $$('[role="tablist"]:not(.mega-tabs)').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function select(tab, focus) {
      tabs.forEach(function (t) { var s = t === tab; t.setAttribute('aria-selected', String(s)); t.tabIndex = s ? 0 : -1; var p = document.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = !s; });
      if (focus) tab.focus();
      var car = document.getElementById(tab.getAttribute('aria-controls')); if (car) $$('[data-carousel]', car).forEach(function (c) { var tr = $('.carousel-track', c); if (tr) tr.dispatchEvent(new Event('scroll')); });
    }
    tabs.forEach(function (t, i) {
      on(t, 'click', function () { select(t); if (t.hasAttribute('data-hash')) history.replaceState(null, '', '#' + t.getAttribute('data-hash')); });
      on(t, 'keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight') n = RTL ? i - 1 : i + 1; else if (k === 'ArrowLeft') n = RTL ? i + 1 : i - 1; else if (k === 'Home') n = 0; else if (k === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(tabs[(n + tabs.length) % tabs.length], true); }
      });
    });
    var h = location.hash.slice(1);
    var pre = tabs.filter(function (t) { return t.getAttribute('data-hash') === h; })[0];
    if (pre) select(pre);
  });
  $$('[data-tab-link]').forEach(function (a) { on(a, 'click', function (e) { var t = document.getElementById(a.getAttribute('data-tab-link')); if (t) { e.preventDefault(); t.click(); t.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); } }); });

  /* ---------- hero slider ---------- */
  $$('[data-slider]').forEach(function (s) {
    var slides = $$('.hs-slide', s), dots = $$('.hs-dots button', s), cur = 0, timer, bar = $('.counter .line i', s), num = $('.counter .cur', s);
    if (slides.length < 2) return;
    function go(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (sl, j) { sl.classList.toggle('is-active', j === cur); sl.setAttribute('aria-hidden', String(j !== cur)); sl.inert = j !== cur; });
      dots.forEach(function (d, j) { d.setAttribute('aria-current', String(j === cur)); });
      if (bar) bar.style.transform = 'translateX(' + (cur * 100) + '%)';
      if (num) num.textContent = digits('0' + (cur + 1));
    }
    function play() { if (reduceMotion) return; stop(); timer = setInterval(function () { go(cur + 1); }, 6500); }
    function stop() { clearInterval(timer); }
    dots.forEach(function (d, j) { on(d, 'click', function () { go(j); play(); }); });
    on($('[data-hs-prev]', s), 'click', function () { go(cur - 1); play(); });
    on($('[data-hs-next]', s), 'click', function () { go(cur + 1); play(); });
    on(s, 'mouseenter', stop); on(s, 'mouseleave', play); on(s, 'focusin', stop); on(s, 'focusout', play);
    go(0); play();
  });

  /* ---------- countdowns ---------- */
  var cds = $$('[data-countdown]');
  if (cds.length) {
    var tick = function () {
      var now = new Date();
      cds.forEach(function (el) {
        var hrs = parseFloat(el.getAttribute('data-countdown')) || 0, end;
        if (hrs) { var base = new Date(now); base.setHours(0, 0, 0, 0); end = base.getTime() + hrs * 3600000; while (end < now.getTime()) end += hrs * 3600000; }
        else { end = new Date(now); end.setHours(24, 0, 0, 0); end = end.getTime(); }
        var s = Math.max(0, Math.floor((end - now.getTime()) / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
        var set = function (k, v) { var x = $('[data-cd="' + k + '"]', el); if (x) x.textContent = digits(String(v).padStart(2, '0')); };
        set('d', d); set('h', h); set('m', m); set('s', sec);
      });
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- 3D: hero stage tilt, parallax, card tilt ---------- */
  var stages = $$('[data-stage]');
  if (!reduceMotion && finePointer) {
    stages.forEach(function (st) {
      var inner = $('.stage-inner', st) || st, layers = $$('[data-depth]', st), raf = 0, tx = 0, ty = 0;
      function apply() { raf = 0; inner.style.setProperty('--sry', (tx * 7).toFixed(2) + 'deg'); inner.style.setProperty('--srx', (-ty * 6).toFixed(2) + 'deg'); layers.forEach(function (l) { var d = parseFloat(l.getAttribute('data-depth')); l.style.setProperty('--lx', (tx * d).toFixed(1) + 'px'); l.style.setProperty('--ly', (ty * d).toFixed(1) + 'px'); }); }
      var zone = st.closest('[data-stage-zone]') || st;
      on(zone, 'pointermove', function (e) { var r = zone.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 2 - 1; ty = (e.clientY - r.top) / r.height * 2 - 1; if (!raf) raf = requestAnimationFrame(apply); });
      on(zone, 'pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
    });
  }
  var parallaxEls = reduceMotion ? [] : $$('[data-parallax]');
  function parallax(y) { if (!parallaxEls.length || y > 1400) return; parallaxEls.forEach(function (el) { el.style.translate = '0 ' + (y * parseFloat(el.getAttribute('data-parallax'))).toFixed(1) + 'px'; }); }
  function bindTilt() {
    if (reduceMotion || !finePointer) return;
    $$('[data-tilt]:not([data-tilt-bound])').forEach(function (el) {
      el.setAttribute('data-tilt-bound', '');
      var raf = 0, rx = 0, ry = 0, max = parseFloat(el.getAttribute('data-tilt')) || 6;
      function apply() { raf = 0; el.style.transform = rx || ry ? 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)' : ''; }
      on(el, 'pointermove', function (e) { var r = el.getBoundingClientRect(); ry = (((e.clientX - r.left) / r.width) - .5) * max * 2; rx = -(((e.clientY - r.top) / r.height) - .5) * max * 2; ry = +ry.toFixed(2); rx = +rx.toFixed(2); if (!raf) raf = requestAnimationFrame(apply); });
      on(el, 'pointerleave', function () { rx = 0; ry = 0; if (!raf) raf = requestAnimationFrame(apply); });
    });
  }

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });

  /* ---------- generic qty stepper (product page) ---------- */
  $$('[data-stepper]').forEach(function (q) {
    var input = $('input', q);
    $$('button', q).forEach(function (b) { on(b, 'click', function () { var v = parseInt(latin(input.value), 10) || 1; v += b.hasAttribute('data-inc') ? 1 : -1; input.value = Math.max(1, Math.min(20, v)); }); });
    on(input, 'change', function () { input.value = Math.max(1, Math.min(20, parseInt(latin(input.value), 10) || 1)); });
  });

  /* ---------- form validation ---------- */
  var RX = { email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, phone: FA ? /^09\d{9}$/ : /^\+?[\d\s()-]{7,16}$/, postal: FA ? /^\d{10}$/ : /^[A-Za-z0-9\s-]{3,10}$/, code: /^[A-Za-z]{2}-?\d{4,8}$/ };
  function validateField(f) {
    var field = f.closest('.field'), v = latin(f.value).trim(), err = '';
    if (f.type === 'checkbox') { if (f.required && !f.checked) err = T.vAccept; }
    else if (f.required && !v) err = T.vRequired;
    else if (v && f.dataset.type && RX[f.dataset.type] && !RX[f.dataset.type].test(v.replace(/\s/g, f.dataset.type === 'phone' && FA ? '' : ' '))) err = T['v_' + f.dataset.type];
    else if (v && f.minLength > 0 && v.length < f.minLength) err = T.vMin.replace('%s', digits(f.minLength));
    else if (f.dataset.match) { var o = document.getElementById(f.dataset.match); if (o && o.value !== f.value) err = T.vMatch; }
    if (field) { field.classList.toggle('has-error', !!err); var m = $('.field-error', field); if (m) m.textContent = err; }
    f.setAttribute('aria-invalid', String(!!err));
    return !err;
  }
  $$('form[data-validate]').forEach(function (form) {
    form.noValidate = true;
    $$('input, select, textarea', form).forEach(function (f) {
      var field = f.closest('.field');
      if (field && !$('.field-error', field)) { var m = document.createElement('span'); m.className = 'field-error'; m.id = (f.id || f.name) + '-err'; m.setAttribute('aria-live', 'polite'); field.appendChild(m); f.setAttribute('aria-describedby', m.id); }
      on(f, 'blur', function () { if (f.value || f.getAttribute('aria-invalid') === 'true') validateField(f); });
      on(f, 'input', function () { if (f.getAttribute('aria-invalid') === 'true') validateField(f); });
    });
    on(form, 'submit', function (e) {
      e.preventDefault();
      var ok = true, first = null;
      $$('input, select, textarea', form).forEach(function (f) { if (f.closest('[hidden]') || f.disabled) return; if (!validateField(f)) { ok = false; first = first || f; } });
      var alert = $('.form-alert', form);
      if (!ok) { if (first) first.focus(); if (alert) { alert.className = 'form-alert error is-visible'; alert.textContent = T.vFix; } return; }
      var action = form.getAttribute('data-validate');
      if (action === 'checkout') return placeOrder(form);
      if (action === 'login' || action === 'register') { toast(action === 'login' ? T.loginOk : T.registerOk); save('user', { name: (($('[name="name"]', form) || {}).value) || T.demoUser }); setTimeout(function () { location.href = ROOT + 'account.html'; }, 900); return; }
      if (action === 'track') { var res = $('#track-result'); if (res) { res.hidden = false; var c = $('[data-track-code]'); if (c) c.textContent = digits(latin($('input', form).value).toUpperCase()); res.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); } return; }
      if (action === 'review') {
        var list = $('#review-list'), name = $('[name="rname"]', form).value, text = $('[name="rtext"]', form).value, rate = ($('input[name="rate"]:checked', form) || { value: 5 }).value;
        if (list) { var d = document.createElement('div'); d.className = 'review'; d.innerHTML = '<div class="review-head"><b>' + esc(name) + '</b><span class="stars">' + Array(+rate + 1).join(star()) + '</span><span class="badge badge-warning">' + T.pending + '</span></div><p>' + esc(text) + '</p>'; list.prepend(d); }
      }
      if (alert) { alert.className = 'form-alert success is-visible'; alert.textContent = form.getAttribute('data-success') || T.sent; }
      else toast(form.getAttribute('data-success') || T.sent);
      if (action !== 'profile') form.reset();
    });
  });
  /* password toggle & meter */
  $$('.pw-toggle').forEach(function (b) { on(b, 'click', function () { var i = $('input', b.parentNode), show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', String(show)); b.setAttribute('aria-label', show ? T.hidePw : T.showPw); }); });
  $$('[data-meter]').forEach(function (i) {
    var bar = $('#' + i.getAttribute('data-meter') + ' i');
    on(i, 'input', function () { var v = i.value, s = 0; if (v.length >= 8) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++; bar.style.width = (s * 25) + '%'; bar.style.background = ['#c8384a', '#e0683d', '#e3a21a', '#2a9d6c', '#1b7a55'][s]; });
  });

  /* ---------- checkout ---------- */
  function placeOrder(form) {
    var cart = getCart(); if (!cart.length) { toast(T.cartEmpty, 'error'); return; }
    var st = subtotal(), dc = discountFor(st), sh = shipCost(st), tax = Math.round((st - dc) * D.tax);
    var order = { no: 'BZ-' + (Date.now() % 1000000 + 100000), total: st - dc + sh + tax, items: cart, ship: load('ship', 'post'), pay: ($('input[name="payment"]:checked', form) || {}).value || 'online', name: ($('[name="fname"]', form) || {}).value + ' ' + ($('[name="lname"]', form) || {}).value, date: Date.now() };
    save('lastOrder', order); save('cart', []); save('coupon', '');
    location.href = ROOT + 'order-success.html';
  }
  var succ = $('#success-host');
  if (succ) {
    var o = load('lastOrder', null);
    if (o) {
      var set = function (k, v) { var x = $('[data-o="' + k + '"]'); if (x) x.innerHTML = v; };
      set('no', digits(o.no)); set('total', money(o.total)); set('name', esc(o.name));
      set('pay', (D.payNames || {})[o.pay] || o.pay); set('ship', ((D.ship || []).filter(function (s) { return s.k === o.ship; })[0] || {}).n || '');
      var it = $('#success-items'); if (it) it.innerHTML = o.items.filter(function (l) { return byId(l.id); }).map(function (l) { var p = byId(l.id); return '<div class="co-item"><img src="' + pImg(p) + '" alt="" width="54" height="54" loading="lazy"><span><span class="qbadge">' + digits(l.q) + '×</span> ' + esc(p.n) + '</span><b>' + money(p.p * l.q) + '</b></div>'; }).join('');
    }
  }

  /* ---------- shop page ---------- */
  var shop = $('#shop');
  if (shop) (function () {
    var grid = $('#shop-grid'), params = new URLSearchParams(location.search), PER = 12;
    var maxP = D.products.reduce(function (m, p) { return Math.max(m, p.p); }, 0);
    var step = FA ? 500000 : 10;
    maxP = Math.ceil(maxP / step) * step;
    var S = { cats: [], subs: [], brands: [], colors: [], sizes: [], min: 0, max: maxP, stock: false, sale: false, q: params.get('q') || '', sort: params.get('sort') || 'popular', page: 1, view: load('view', 'grid') };
    if (params.get('cat')) S.cats = params.get('cat').split(',');
    if (params.get('sub')) S.subs = params.get('sub').split(',');
    if (params.get('brand')) S.brands = params.get('brand').split(',');
    if (params.get('sale')) S.sale = true;
    if (params.get('page')) S.page = parseInt(params.get('page'), 10) || 1;
    var rMin = $('#price-min'), rMax = $('#price-max'), oMin = $('#out-min'), oMax = $('#out-max'), fill = $('.range-fill');
    [rMin, rMax].forEach(function (r) { r.max = maxP; r.step = step; });
    rMin.value = 0; rMax.value = maxP;
    function syncRange(src) {
      var a = +rMin.value, b = +rMax.value;
      if (a > b - step) { if (src === rMin) rMin.value = a = b - step; else rMax.value = b = a + step; }
      S.min = a; S.max = b; oMin.innerHTML = moneyText(a); oMax.innerHTML = moneyText(b);
      var l = a / maxP * 100, r = 100 - b / maxP * 100; fill.style.insetInlineStart = l + '%'; fill.style.insetInlineEnd = r + '%';
    }
    [rMin, rMax].forEach(function (r) { on(r, 'input', function () { syncRange(r); S.page = 1; render(); }); });
    syncRange();
    function syncInputs() {
      $$('[data-f]', shop).forEach(function (i) { var k = i.getAttribute('data-f'); if (S[k] instanceof Array) i.checked = S[k].indexOf(i.value) > -1; else i.checked = !!S[k]; });
      $('#sort').value = S.sort;
      $$('.cat-tree [data-f="subs"]:checked').forEach(function (i) { var li = i.closest('li.has-sub'); if (li) li.classList.add('is-open'); });
      $$('.cat-tree [data-f="cats"]:checked').forEach(function (i) { var li = i.closest('li'); if (li) li.classList.add('is-open'); });
    }
    on(shop, 'change', function (e) {
      var i = e.target, k = i.getAttribute('data-f'); if (!k) return;
      if (S[k] instanceof Array) { var a = S[k], ix = a.indexOf(i.value); if (i.checked && ix < 0) a.push(i.value); if (!i.checked && ix > -1) a.splice(ix, 1); }
      else S[k] = i.checked;
      if (k === 'cats') { $$('[data-f="subs"]', i.closest('li')).forEach(function (s) { var j = S.subs.indexOf(s.value); if (j > -1) S.subs.splice(j, 1); s.checked = false; }); if (i.checked) i.closest('li').classList.add('is-open'); }
      S.page = 1; render();
    });
    $$('.tree-toggle').forEach(function (b) { on(b, 'click', function () { var li = b.closest('li'); li.classList.toggle('is-open'); b.setAttribute('aria-expanded', String(li.classList.contains('is-open'))); }); });
    on($('#sort'), 'change', function () { S.sort = this.value; S.page = 1; render(); });
    $$('.f-search').forEach(function (inp) { on(inp, 'input', function () { var q = norm(inp.value); $$('label', inp.nextElementSibling).forEach(function (l) { l.hidden = norm(l.textContent).indexOf(q) < 0; }); }); });
    $$('.view-btns button').forEach(function (b) { on(b, 'click', function () { S.view = b.getAttribute('data-view'); save('view', S.view); render(); }); });
    function clearAll() { S.cats = []; S.subs = []; S.brands = []; S.colors = []; S.sizes = []; S.stock = false; S.sale = false; S.q = ''; rMin.value = 0; rMax.value = maxP; syncRange(); S.page = 1; syncInputs(); render(); }
    $$('[data-clear-filters]').forEach(function (b) { on(b, 'click', clearAll); });
    function filtered() {
      var q = norm(S.q);
      var list = D.products.filter(function (p) {
        if (S.cats.length || S.subs.length) { var okC = S.cats.indexOf(p.c) > -1 || S.subs.indexOf(p.s) > -1; if (!okC) return false; }
        if (S.brands.length && S.brands.indexOf(p.b) < 0) return false;
        if (S.colors.length && !p.co.some(function (c) { return S.colors.indexOf(c) > -1; })) return false;
        if (S.sizes.length && !p.sz.some(function (z) { return S.sizes.indexOf(z) > -1; })) return false;
        if (S.stock && !p.st) return false;
        if (S.sale && !p.d) return false;
        if (p.p < S.min || p.p > S.max) return false;
        if (q && norm(p.n + ' ' + D.brands[p.b] + ' ' + catName(p.c) + ' ' + subName(p.s)).indexOf(q) < 0) return false;
        return true;
      });
      var sorters = { popular: function (a, b) { return b.rc - a.rc; }, newest: function (a, b) { return b.x - a.x; }, cheap: function (a, b) { return a.p - b.p; }, expensive: function (a, b) { return b.p - a.p; }, rating: function (a, b) { return b.r - a.r; }, discount: function (a, b) { return b.d - a.d; } };
      return list.sort(sorters[S.sort] || sorters.popular);
    }
    function chips() {
      var out = [];
      S.cats.forEach(function (c) { out.push(['cats', c, catName(c)]); });
      S.subs.forEach(function (c) { out.push(['subs', c, subName(c)]); });
      S.brands.forEach(function (c) { out.push(['brands', c, D.brands[c]]); });
      S.colors.forEach(function (c) { out.push(['colors', c, D.colors[c][0]]); });
      S.sizes.forEach(function (c) { out.push(['sizes', c, T.size + ' ' + digits(c)]); });
      if (S.stock) out.push(['stock', '', T.inStockOnly]); if (S.sale) out.push(['sale', '', T.saleOnly]);
      if (S.q) out.push(['q', '', '«' + S.q + '»']);
      if (S.min > 0 || S.max < maxP) out.push(['price', '', moneyText(S.min) + ' – ' + moneyText(S.max)]);
      var host = $('#chips');
      host.innerHTML = out.map(function (c) { return '<button type="button" class="f-chip" data-chip="' + c[0] + '" data-v="' + esc(c[1]) + '">' + esc(c[2]) + icon('x') + '<span class="sr-only">' + T.remove + '</span></button>'; }).join('') + (out.length ? '<button type="button" class="clear-all" data-clear-filters>' + T.clearAll + '</button>' : '');
      $$('[data-chip]', host).forEach(function (b) { on(b, 'click', function () { var k = b.getAttribute('data-chip'), v = b.getAttribute('data-v'); if (S[k] instanceof Array) S[k].splice(S[k].indexOf(v), 1); else if (k === 'price') { rMin.value = 0; rMax.value = maxP; syncRange(); } else if (k === 'q') S.q = ''; else S[k] = false; S.page = 1; syncInputs(); render(); }); });
      $$('[data-clear-filters]', host).forEach(function (b) { on(b, 'click', clearAll); });
      var fc = $('[data-filter-count]'); if (fc) { fc.textContent = digits(out.length); fc.hidden = !out.length; }
    }
    function render() {
      var list = filtered(), pages = Math.max(1, Math.ceil(list.length / PER));
      if (S.page > pages) S.page = pages;
      var slice = list.slice((S.page - 1) * PER, S.page * PER);
      grid.className = 'p-grid cols-3' + (S.view === 'list' ? ' is-list' : '');
      grid.innerHTML = slice.map(card).join('');
      $('#shop-empty').hidden = !!list.length; grid.hidden = !list.length;
      $('#res-count').textContent = digits(list.length);
      $$('.view-btns button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === S.view)); });
      var pg = $('#pagination'), h = '';
      if (pages > 1) {
        h += '<button type="button" data-page="' + (S.page - 1) + '"' + (S.page === 1 ? ' disabled' : '') + ' aria-label="' + T.prevPage + '">' + icon(RTL ? 'chev-right' : 'chev-left') + '</button>';
        for (var i = 1; i <= pages; i++) h += '<button type="button" data-page="' + i + '"' + (i === S.page ? ' aria-current="page"' : '') + ' aria-label="' + T.page + ' ' + digits(i) + '">' + digits(i) + '</button>';
        h += '<button type="button" data-page="' + (S.page + 1) + '"' + (S.page === pages ? ' disabled' : '') + ' aria-label="' + T.nextPage + '">' + icon(RTL ? 'chev-left' : 'chev-right') + '</button>';
      }
      pg.innerHTML = h;
      $$('button', pg).forEach(function (b) { on(b, 'click', function () { S.page = +b.getAttribute('data-page'); render(); $('#shop-main').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }); });
      chips(); updateCounts(); bindTilt();
      var u = new URLSearchParams();
      if (S.cats.length) u.set('cat', S.cats.join(',')); if (S.subs.length) u.set('sub', S.subs.join(',')); if (S.brands.length) u.set('brand', S.brands.join(','));
      if (S.sale) u.set('sale', '1'); if (S.q) u.set('q', S.q); if (S.sort !== 'popular') u.set('sort', S.sort); if (S.page > 1) u.set('page', S.page);
      history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
      var title = $('#shop-title');
      if (title) title.textContent = S.cats.length === 1 && !S.subs.length ? catName(S.cats[0]) : (S.subs.length === 1 && !S.cats.length ? subName(S.subs[0]) : (S.q ? T.searchFor + ' «' + S.q + '»' : T.allProducts));
    }
    syncInputs(); render();
  })();

  /* ---------- product page ---------- */
  var pd = $('#pd');
  if (pd) (function () {
    var id = pd.getAttribute('data-id'), p = byId(id), main = $('.g-main', pd), img = $('img', main), lens = $('.lens', main);
    $$('.g-thumbs button', pd).forEach(function (b) {
      on(b, 'click', function () { $$('.g-thumbs button', pd).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); img.className = b.getAttribute('data-view'); lens.className = 'lens'; });
    });
    if (finePointer) {
      lens.style.backgroundImage = 'url(' + img.getAttribute('src') + ')';
      on(main, 'pointermove', function (e) { var r = main.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100; lens.style.backgroundPosition = x + '% ' + y + '%'; });
      on(main, 'pointerenter', function () { if (!img.className) main.classList.add('is-zoom'); });
      on(main, 'pointerleave', function () { main.classList.remove('is-zoom'); });
    }
    on($('[data-zoom-toggle]', pd), 'click', function () { if (!img.className) main.classList.toggle('is-zoom'); lens.style.backgroundImage = 'url(' + img.getAttribute('src') + ')'; lens.style.backgroundPosition = '50% 50%'; });
    $$('input[name="color"], input[name="size"]', pd).forEach(function (r) { on(r, 'change', function () { var l = $('[data-sel="' + r.name + '"]', pd); if (l) l.textContent = r.getAttribute('data-label'); var err = $('#size-error'); if (r.name === 'size' && err) err.hidden = true; }); });
    $$('[data-buy]').forEach(function (b) {
      on(b, 'click', function () {
        var color = ($('input[name="color"]:checked', pd) || {}).value || '', size = ($('input[name="size"]:checked', pd) || {}).value || '';
        if (p.sz.length && !size) { var err = $('#size-error'); if (err) { err.hidden = false; } var first = $('input[name="size"]', pd); if (first) { first.closest('.opt').scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); first.focus(); } toast(T.chooseSize, 'error'); return; }
        var q = parseInt(latin(($('#qty-input') || { value: 1 }).value), 10) || 1;
        addToCart(id, q, color, size);
        if (b.hasAttribute('data-buy-now')) location.href = ROOT + 'checkout.html'; else openDrawer('cart-drawer');
      });
    });
    on($('[data-copy-link]'), 'click', function () { try { navigator.clipboard.writeText(location.href).then(function () { toast(T.linkCopied); }, function () { toast(T.linkCopied); }); } catch (e) { toast(T.linkCopied); } });
    var rv = load('recent', []).filter(function (x) { return x !== id; }); rv.unshift(id); save('recent', rv.slice(0, 12));
  })();

  /* ---------- blog list ---------- */
  var bl = $('#blog-list');
  if (bl) (function () {
    var cards = $$('.b-card', bl).map(function (c) { return c.parentNode === bl ? c : c.parentNode; }), PER = 6, page = 1, cat = new URLSearchParams(location.search).get('cat') || '', q = '';
    var pg = $('#blog-pages'), empty = $('#blog-empty');
    function render() {
      var list = cards.filter(function (c) { return (!cat || c.getAttribute('data-cat') === cat) && (!q || norm(c.textContent).indexOf(norm(q)) > -1); });
      var pages = Math.max(1, Math.ceil(list.length / PER)); if (page > pages) page = pages;
      cards.forEach(function (c) { c.hidden = true; });
      list.slice((page - 1) * PER, page * PER).forEach(function (c) { c.hidden = false; });
      empty.hidden = !!list.length;
      var h = ''; if (pages > 1) for (var i = 1; i <= pages; i++) h += '<button type="button" data-p="' + i + '"' + (i === page ? ' aria-current="page"' : '') + ' aria-label="' + T.page + ' ' + digits(i) + '">' + digits(i) + '</button>';
      pg.innerHTML = h;
      $$('button', pg).forEach(function (b) { on(b, 'click', function () { page = +b.getAttribute('data-p'); render(); bl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }); });
      $$('[data-blog-cat]').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-blog-cat') === cat); if (a.getAttribute('data-blog-cat') === cat) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    }
    $$('[data-blog-cat]').forEach(function (a) { on(a, 'click', function (e) { e.preventDefault(); cat = a.getAttribute('data-blog-cat'); page = 1; render(); }); });
    var bs = $('#blog-search'); if (bs) on(bs, 'submit', function (e) { e.preventDefault(); q = $('input', bs).value.trim(); page = 1; render(); });
    render();
  })();

  /* ---------- TOC highlight ---------- */
  var tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var tio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) tocLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); }); }); }, { rootMargin: '-20% 0px -70% 0px' });
    tocLinks.forEach(function (a) { var t = document.getElementById(a.getAttribute('href').slice(1)); if (t) tio.observe(t); });
  }

  /* ---------- account demo actions ---------- */
  $$('[data-logout]').forEach(function (a) { on(a, 'click', function (e) { e.preventDefault(); save('user', null); toast(T.loggedOut); setTimeout(function () { location.href = a.getAttribute('href'); }, 700); }); });
  $$('[data-addr-default]').forEach(function (b) { on(b, 'click', function () { $$('.addr-card').forEach(function (c) { c.classList.remove('is-default'); }); b.closest('.addr-card').classList.add('is-default'); toast(T.defaultSet); }); });
  $$('[data-addr-remove]').forEach(function (b) { on(b, 'click', function () { var c = b.closest('.addr-card'); c.remove(); toast(T.removed); }); });
  $$('[data-faq-search]').forEach(function (inp) { on(inp, 'input', function () { var q = norm(inp.value); $$('.acc').forEach(function (d) { d.hidden = q && norm(d.textContent).indexOf(q) < 0; }); }); });
  $$('[data-auth-go]').forEach(function (b) { on(b, 'click', function (e) { e.preventDefault(); var t = document.getElementById(b.getAttribute('data-auth-go')); if (t) { t.click(); t.focus(); } }); });

  /* ---------- recently viewed ---------- */
  var rvHost = $('#recent-grid');
  if (rvHost) { var rv = load('recent', []).map(byId).filter(Boolean).slice(0, 4); if (rv.length) { rvHost.innerHTML = rv.map(card).join(''); rvHost.closest('section').hidden = false; } }

  /* init */
  updateCounts(); renderAllCarts(); renderWishlist(); renderCompare(); bindTilt(); onScroll();
})();
