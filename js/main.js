(function () {
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  /* ---------- theme toggle ---------- */
  function effectiveTheme() {
    var t = root.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return media && media.matches ? 'dark' : 'light';
  }
  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- hero statement decoded like a diffusion LM ----------
     On load, every character of the statement starts as a masked token and is
     revealed a few at a time, in parallel and out of order; then it stays put. */
  var el = document.getElementById('statement');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function maskAll(root) {
    var spans = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      var text = node.nodeValue;
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); continue; }
        var s = document.createElement('span');
        s.className = 'ch m';
        s.textContent = ch;
        frag.appendChild(s);
        spans.push(s);
      }
      node.parentNode.replaceChild(frag, node);
    });
    return spans;
  }

  if (el && !reduce) {
    var spans = maskAll(el);
    var order = shuffle(spans.slice());
    var steps = 10, per = Math.ceil(order.length / steps), k = 0;
    var tick = function () {
      order.slice(k, k + per).forEach(function (s) { s.classList.remove('m'); });
      k += per;
      if (k < order.length) setTimeout(tick, 75);
    };
    setTimeout(tick, 300);
  }

  /* ---------- highlight current section in the nav ---------- */
  var links = {};
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = links[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }
})();
