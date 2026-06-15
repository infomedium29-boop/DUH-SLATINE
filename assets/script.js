
(function(){
  document.documentElement.classList.add('reveal-ready');

  const preloader = document.querySelector('.preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader && preloader.classList.add('is-hidden'), 520);
  });

  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.scroll-progress span');
  const updateScroll = () => {
    const scrolled = window.scrollY > 20;
    header && header.classList.toggle('is-scrolled', scrolled);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if(progress) progress.style.width = pct + '%';
  };
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive:true });

  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if(toggle && panel){
    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true':'false');
      panel.setAttribute('aria-hidden', open ? 'false':'true');
    });
    panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
      panel.setAttribute('aria-hidden','true');
    }));
  }

  const supportsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(window.Lenis && supportsMotion){
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9, smoothWheel: true });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  if(window.gsap && window.ScrollTrigger && supportsMotion){
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease:'power3.out', duration:0.9 });

    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.to(el, {
        opacity:1,
        y:0,
        scrollTrigger:{ trigger:el, start:'top 86%' }
      });
    });

    gsap.utils.toArray('[data-stagger]').forEach((wrap) => {
      gsap.to(wrap.children, {
        opacity:1,
        y:0,
        stagger:0.11,
        scrollTrigger:{ trigger:wrap, start:'top 84%' }
      });
    });

    gsap.to('.chart-line', {
      strokeDashoffset:0,
      duration:1.8,
      scrollTrigger:{ trigger:'.line-chart', start:'top 85%' }
    });
    gsap.to('.chart-dot', {
      opacity:1,
      scale:1.15,
      duration:.7,
      delay:1,
      scrollTrigger:{ trigger:'.line-chart', start:'top 85%' }
    });
    gsap.to('.section-grid-bg:before', { opacity:.5 });
    gsap.utils.toArray('.hero-bg-orb').forEach((orb, i) => {
      gsap.to(orb, { y: i ? -80 : 90, x: i ? -40 : 50, scrollTrigger:{ trigger:'.hero', scrub:1 } });
    });
    gsap.utils.toArray('.float-card').forEach((card, i) => {
      gsap.from(card, { opacity:0, y:30, scale:.92, delay:.3 + i*.12, duration:.9 });
    });
    gsap.from('.site-header', { y:-30, opacity:0, duration:.8, delay:.25 });
  } else {
    const io = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold:.12 });
    document.querySelectorAll('[data-reveal], [data-stagger] > *').forEach(el=>io.observe(el));
  }

  document.querySelectorAll('[data-counter]').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-counter'), 10);
    if(!target) return;
    const animate = () => {
      const start = target - 6;
      const duration = 1100;
      const begin = performance.now();
      const tick = now => {
        const p = Math.min((now - begin) / duration, 1);
        counter.textContent = Math.round(start + (target - start) * p);
        if(p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting){ animate(); io.disconnect(); }
    });
    io.observe(counter);
  });

  document.querySelectorAll('.mag-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.08}px, ${y * 0.16}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
  });
})();
