/* Case-page image lightbox — desktop & tablet only (>720px).
   Click a gallery image to view it large; ←/→ cycle the page's images,
   Esc / backdrop / × close. On phones it stays inert (native pinch-zoom). */
(function () {
  var mq = window.matchMedia('(min-width: 721px)');

  var imgs = Array.prototype.slice.call(
    document.querySelectorAll(
      '.case-gallery img, .case-tiles img, .case-pair img, .case-quad img, .case-figure img, .case-media img'
    )
  );
  if (!imgs.length) return;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML =
    '<button class="lightbox-btn lightbox-close" type="button" aria-label="Close">' +
      '<span class="material-symbols-outlined">close</span></button>' +
    '<button class="lightbox-btn lightbox-prev" type="button" aria-label="Previous image">' +
      '<span class="material-symbols-outlined">chevron_left</span></button>' +
    '<img class="lightbox-img" alt="">' +
    '<button class="lightbox-btn lightbox-next" type="button" aria-label="Next image">' +
      '<span class="material-symbols-outlined">chevron_right</span></button>';
  document.body.appendChild(box);

  var bigImg = box.querySelector('.lightbox-img');
  var prevBtn = box.querySelector('.lightbox-prev');
  var nextBtn = box.querySelector('.lightbox-next');
  var closeBtn = box.querySelector('.lightbox-close');
  var single = imgs.length < 2;
  if (single) { prevBtn.hidden = true; nextBtn.hidden = true; }

  var index = 0;
  var lastFocused = null;

  // click-to-zoom + pan, desktop pointers only
  var canZoom = window.matchMedia('(hover: hover) and (pointer: fine)');
  var ZOOM = 2.4;
  var zoomed = false;
  var baseRect = null;

  function setZoom(on, e) {
    zoomed = on && canZoom.matches;
    bigImg.classList.toggle('is-zoomed', zoomed);
    if (zoomed) {
      baseRect = bigImg.getBoundingClientRect();
      pan(e);
      bigImg.style.transform = 'scale(' + ZOOM + ')';
    } else {
      baseRect = null;
      bigImg.style.transform = '';
      bigImg.style.transformOrigin = '';
    }
  }

  function pan(e) {
    if (!zoomed || !baseRect || !e) return;
    var x = (e.clientX - baseRect.left) / baseRect.width * 100;
    var y = (e.clientY - baseRect.top) / baseRect.height * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    bigImg.style.transformOrigin = x + '% ' + y + '%';
  }

  function show(i) {
    index = (i + imgs.length) % imgs.length;
    setZoom(false);
    var src = imgs[index].currentSrc || imgs[index].src;
    bigImg.src = src;
    bigImg.alt = imgs[index].alt || '';
  }

  function open(i) {
    if (!mq.matches) return;
    lastFocused = document.activeElement;
    show(i);
    box.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    setZoom(false);
    box.hidden = true;
    bigImg.removeAttribute('src');
    document.documentElement.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  imgs.forEach(function (img, i) {
    img.addEventListener('click', function () { open(i); });
  });

  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(index - 1); });
  nextBtn.addEventListener('click', function () { show(index + 1); });

  // click the large image to toggle zoom; move the mouse to pan
  bigImg.addEventListener('click', function (e) {
    e.stopPropagation();
    setZoom(!zoomed, e);
  });
  box.addEventListener('mousemove', pan);

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (!single && e.key === 'ArrowLeft') show(index - 1);
    else if (!single && e.key === 'ArrowRight') show(index + 1);
  });

  // if the viewport shrinks to phone size while open, dismiss
  var onChange = function (e) { if (!e.matches && !box.hidden) close(); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
