(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('year').textContent = new Date().getFullYear();

  // Reveal on enter
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Split story text into words; mark key words
  const keys = ['curious', 'confident', 'bridge', 'foundations,', 'steady', 'goal.'];
  const story = document.getElementById('storyText');
  story.innerHTML = story.textContent.trim().split(/\s+/).map((w) =>
    `<span class="w${keys.includes(w.toLowerCase()) ? ' key' : ''}">${w}</span>`
  ).join(' ');
  const words = [...story.querySelectorAll('.w')];

  const progress = document.getElementById('progress');
  const storySec = document.querySelector('.story');
  const linesSec = document.getElementById('lines');
  const lines = [...linesSec.querySelectorAll('.line')];
  const timeline = document.querySelector('.timeline');
  const spine = document.getElementById('spine');

  // 0 → 1 as a tall section scrolls through its sticky phase
  const stickyProgress = (el) => {
    const r = el.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return Math.min(1, Math.max(0, -r.top / total));
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    progress.style.transform = `scaleX(${doc.scrollTop / (doc.scrollHeight - doc.clientHeight)})`;

    const sp = reduce ? 1 : stickyProgress(storySec) * 1.15;
    const lit = Math.round(sp * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < lit));

    const lp = reduce ? 1 : stickyProgress(linesSec);
    lines.forEach((l, i) => l.classList.toggle('on', lp > 0.08 + i * 0.25));

    const tr = timeline.getBoundingClientRect();
    const tp = reduce ? 1 : Math.min(1, Math.max(0, (window.innerHeight * 0.6 - tr.top) / tr.height));
    spine.style.strokeDashoffset = String(1000 * (1 - tp));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Prototype tabs: click, plus auto-cycle while visible
  const tabs = [...document.querySelectorAll('.ptab')];
  const views = [...document.querySelectorAll('.pview')];
  let current = 0, timer = null;
  const show = (i) => {
    current = i;
    tabs.forEach((t, j) => t.classList.toggle('active', j === i));
    views.forEach((v, j) => v.classList.toggle('active', j === i));
  };
  const start = () => { if (!reduce && !timer) timer = setInterval(() => show((current + 1) % tabs.length), 5200); };
  const stop = () => { clearInterval(timer); timer = null; };
  tabs.forEach((t, i) => t.addEventListener('click', () => { stop(); show(i); }));
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.4 })
    .observe(document.querySelector('.proto'));
})();
