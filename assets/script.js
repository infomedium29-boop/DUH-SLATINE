(function(){
  document.documentElement.classList.add('reveal-ready');

  const preloader = document.querySelector('.preloader');
  const hidePreloader = () => preloader && preloader.classList.add('is-hidden');
  window.addEventListener('DOMContentLoaded', () => setTimeout(hidePreloader, 180));
  window.addEventListener('load', () => setTimeout(hidePreloader, 80));
  setTimeout(hidePreloader, 1400);

  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.scroll-progress span');
  let ticking = false;
  const updateScroll = () => {
    const scrolled = window.scrollY > 12;
    header && header.classList.toggle('is-scrolled', scrolled);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if(progress) progress.style.width = pct + '%';
    ticking = false;
  };
  const requestScrollUpdate = () => {
    if(!ticking){
      window.requestAnimationFrame(updateScroll);
      ticking = true;
    }
  };
  updateScroll();
  window.addEventListener('scroll', requestScrollUpdate, { passive:true });

  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if(toggle && panel){
    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true':'false');
      panel.setAttribute('aria-hidden', open ? 'false':'true');
      document.body.classList.toggle('menu-open', open);
    });
    panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      panel.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
      panel.setAttribute('aria-hidden','true');
      document.body.classList.remove('menu-open');
    }));
  }

  const supportsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(window.gsap && window.ScrollTrigger && supportsMotion){
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.defaults({ once:true });
    gsap.defaults({ ease:'power3.out', duration:0.62, overwrite:'auto' });

    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.to(el, {
        opacity:1,
        y:0,
        clearProps:'willChange',
        scrollTrigger:{ trigger:el, start:'top 88%' }
      });
    });

    gsap.utils.toArray('[data-stagger]').forEach((wrap) => {
      gsap.to(wrap.children, {
        opacity:1,
        y:0,
        stagger:0.07,
        clearProps:'willChange',
        scrollTrigger:{ trigger:wrap, start:'top 86%' }
      });
    });

    const line = document.querySelector('.chart-line');
    if(line){
      gsap.to('.chart-line', {
        strokeDashoffset:0,
        duration:1.1,
        scrollTrigger:{ trigger:'.line-chart', start:'top 88%' }
      });
      gsap.to('.chart-dot', {
        opacity:1,
        scale:1.1,
        duration:.45,
        delay:.35,
        scrollTrigger:{ trigger:'.line-chart', start:'top 88%' }
      });
    }

    gsap.utils.toArray('.float-card').forEach((card, i) => {
      gsap.from(card, { opacity:0, y:18, scale:.96, delay:.12 + i*.08, duration:.55, clearProps:'all' });
    });
  } else {
    const io = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold:.08, rootMargin:'0px 0px -6% 0px' });
    document.querySelectorAll('[data-reveal], [data-stagger] > *').forEach(el=>io.observe(el));
  }

  document.querySelectorAll('[data-counter]').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-counter'), 10);
    if(!target) return;
    const animate = () => {
      const start = Math.max(0, target - 6);
      const duration = 700;
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
    }, { threshold:.35 });
    io.observe(counter);
  });

  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(finePointer){
    document.querySelectorAll('.mag-card').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }, { passive:true });
    });

    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.045}px, ${y * 0.075}px)`;
      });
      btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
    });
  }
})();
