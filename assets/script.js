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


// GDPR / Cookie consent
(function(){
  const storageKey = 'duhSlatineCookieConsent';
  const banner = document.getElementById('cookieConsent');
  const modal = document.getElementById('cookieModal');
  const analyticsInput = document.getElementById('cookieAnalytics');
  const marketingInput = document.getElementById('cookieMarketing');

  function getConsent(){
    try { return JSON.parse(localStorage.getItem(storageKey)); } catch(e) { return null; }
  }

  function setConsent(consent){
    localStorage.setItem(storageKey, JSON.stringify({
      necessary: true,
      analytics: !!consent.analytics,
      marketing: !!consent.marketing,
      updatedAt: new Date().toISOString()
    }));
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: getConsent() }));
  }

  function showBanner(){
    if (banner && !getConsent()) banner.hidden = false;
  }

  function hideBanner(){
    if (banner) banner.hidden = true;
  }

  function openModal(){
    const current = getConsent();
    if (analyticsInput) analyticsInput.checked = !!(current && current.analytics);
    if (marketingInput) marketingInput.checked = !!(current && current.marketing);
    if (modal) modal.hidden = false;
  }

  function closeModal(){
    if (modal) modal.hidden = true;
  }

  function acceptAll(){
    setConsent({ analytics:true, marketing:true });
    hideBanner();
    closeModal();
  }

  function rejectAll(){
    setConsent({ analytics:false, marketing:false });
    hideBanner();
    closeModal();
  }

  function saveSelection(){
    setConsent({
      analytics: analyticsInput ? analyticsInput.checked : false,
      marketing: marketingInput ? marketingInput.checked : false
    });
    hideBanner();
    closeModal();
  }

  document.addEventListener('click', function(e){
    if (e.target.matches('[data-cookie-accept]')) acceptAll();
    if (e.target.matches('[data-cookie-reject]')) rejectAll();
    if (e.target.matches('[data-cookie-settings], .cookie-settings-link')) {
      e.preventDefault();
      openModal();
    }
    if (e.target.matches('[data-cookie-save]')) saveSelection();
    if (e.target.matches('[data-cookie-close]')) closeModal();
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeModal();
  });

  showBanner();

  // Primjer za buduće skripte:
  // window.addEventListener('cookieConsentUpdated', function(event) {
  //   if (event.detail.analytics) { /* ovdje učitati Google Analytics */ }
  //   if (event.detail.marketing) { /* ovdje učitati Meta Pixel */ }
  // });
})();


// HR / ENG language switcher and website translation
(function(){
  const translations = {
  "Početna": "Home",
  "O nama": "About us",
  "Usluge": "Services",
  "Cjenik": "Pricing",
  "Za koga radimo": "Who we work with",
  "Kontakt": "Contact",
  "Zatražite ponudu": "Request a quote",
  "Pošaljite upit": "Send an inquiry",
  "Brzi linkovi": "Quick links",
  "Kontakt forma": "Contact form",
  "Excel": "Excel",
  "vas@email.com": "your@email.com",
  "+385 ...": "+385 ...",
  "Politika privatnosti": "Privacy Policy",
  "Politika kolačića": "Cookie Policy",
  "Postavke kolačića": "Cookie settings",
  "Izrada web stranice: Medium29": "Website by: Medium29",
  "© 2026 Duh Slatine, vl. Ivana Golub. Sva prava pridržana.": "© 2026 Duh Slatine, owner Ivana Golub. All rights reserved.",
  "Duh Slatine početna": "Duh Slatine home",
  "Duh Slatine računovođa": "Duh Slatine accounting office",
  "Glavna navigacija": "Main navigation",
  "Otvori izbornik": "Open menu",
  "WhatsApp kontakt": "WhatsApp contact",
  "Detaljne postavke kolačića": "Detailed cookie settings",
  "Zatvori postavke": "Close settings",
  "Odabir jezika": "Language selection",
  "Duh Slatine, vl. Ivana Golub": "Duh Slatine, owner Ivana Golub",
  "Knjigovodstveni obrt sa sjedištem u Zvonimirovcu. Online knjigovodstvo, računovodstvo udruga i poslovno savjetovanje za obrtnike, poduzeća, udruge i poljoprivrednike.": "An accounting office based in Zvonimirovac. Online bookkeeping, association accounting and business advisory services for sole proprietors, companies, associations and farmers.",
  "✓ certificirani": "✓ certified",
  "merKnjigovođa": "merKnjigovođa",
  "certificirani merKnjigovođa": "certified merKnjigovođa",
  "DUH SLATINE obrt za računovodstvo i ostale usluge vl. Ivana Golub": "DUH SLATINE accounting and other services sole proprietorship, owner Ivana Golub",
  "Upisan u Obrtni registar pri Virovitičko-podravskoj županiji, Upravni odjel za gospodarstvo i poljoprivredu, Ispostava Slatina": "Registered in the Trades Register of Virovitica-Podravina County, Administrative Department for Economy and Agriculture, Slatina Branch Office",
  "Paušalni obrti": "Flat-rate sole proprietors",
  "Obrti u sustavu PDV-a": "VAT-registered sole proprietors",
  "Poduzeća": "Companies",
  "Natječajna dokumentacija": "Tender documentation",
  "Kontaktirajte nas": "Contact us",
  "Pogledajte cjenik": "View pricing",
  "Pošaljite WhatsApp poruku": "Send a WhatsApp message",
  "Kontakt putem WhatsAppa": "Contact via WhatsApp",
  "Saznajte više o nama →": "Learn more about us →",
  "Sve usluge": "All services",
  "Zatražite upit →": "Send an inquiry →",
  "Dogovorite izradu plana": "Arrange plan preparation",
  "Cijena na upit": "Price on request",
  "Najtraženije": "Most requested",
  "Za OPG": "For family farms",
  "Natječaj": "Tender",
  "/ mjesečno": "/ monthly",
  "/ godišnje": "/ annually",
  "/ jednokratno": "/ one-time",
  "od 125 €": "from €125",
  "od 150 €": "from €150",
  "od 250 €": "from €250",
  "Duh Slatine | Knjigovodstvo i poslovno savjetovanje": "Duh Slatine | Bookkeeping and business advisory services",
  "Profesionalno online knjigovodstvo za obrte, poduzeća i poljoprivrednike. Sjedište je Zvonimirovac, a suradnja je moguća potpuno digitalno.": "Professional online bookkeeping for sole proprietors, companies and farmers. Based in Zvonimirovac, with fully digital cooperation available.",
  "Online knjigovodstvo · Zvonimirovac": "Online bookkeeping · Zvonimirovac",
  "Pouzdano knjigovodstvo za obrte, poduzeća, udruge i poljoprivrednike": "Reliable bookkeeping for sole proprietors, companies, associations and farmers",
  "Duh Slatine, vl. Ivana Golub je knjigovodstveni obrt sa sjedištem u Zvonimirovcu. Pružamo profesionalne knjigovodstvene, računovodstvene i poslovno-savjetodavne usluge potpuno digitalno, tako da nije bitno odakle je klijent.": "Duh Slatine, owner Ivana Golub, is an accounting office based in Zvonimirovac. We provide professional bookkeeping, accounting and business advisory services fully digitally, so the client's location is not a limitation.",
  "početak rada": "year established",
  "Online": "Online",
  "PDV": "VAT",
  "OPG": "Family farm",
  "digitalna suradnja": "digital cooperation",
  "Poslovni pregled": "Business overview",
  "Financijski dashboard": "Financial dashboard",
  "Uredno": "Organized",
  "Klijent": "Client",
  "Usluga": "Service",
  "Status": "Status",
  "Obrt": "Sole proprietorship",
  "Poduzeće": "Company",
  "Računi": "Invoices",
  "Predano": "Submitted",
  "U obradi": "In progress",
  "Spremno": "Ready",
  "evidencije": "records",
  "tablice": "tables",
  "obračuni": "calculations",
  "Knjigovodstvo za obrte": "Bookkeeping for sole proprietors",
  "Uredno vođenje evidencija za paušalne obrte i obrte u sustavu PDV-a.": "Organized record keeping for flat-rate and VAT-registered sole proprietors.",
  "Računovodstvo za poduzeća": "Accounting for companies",
  "Praćenje dokumentacije, obveza i poslovnih promjena za mikro i mala poduzeća.": "Monitoring documentation, obligations and business changes for micro and small companies.",
  "Poslovno savjetovanje": "Business advisory services",
  "Savjeti za porezne obveze, organizaciju, troškove i unapređenje poslovanja.": "Advice on tax obligations, organization, costs and business improvement.",
  "Priprema dokumentacije": "Documentation preparation",
  "Poslovni planovi, natječaji i dokumentacija za zakup poljoprivrednog zemljišta.": "Business plans, tenders and documentation for leasing agricultural land.",
  "Sigurnost u svakom dokumentu": "Confidence in every document",
  "Knjigovodstvo koje prati vaše poslovanje": "Bookkeeping that follows your business",
  "Vođenje poslovnih knjiga nije samo administracija. Kvalitetno knjigovodstvo pomaže vam da bolje razumijete svoje poslovanje, planirate troškove, pratite obveze i donosite sigurnije poslovne odluke.": "Keeping business books is not just administration. Quality bookkeeping helps you better understand your business, plan costs, monitor obligations and make more confident business decisions.",
  "Preciznost i urednost": "Precision and orderliness",
  "Svaki dokument, obračun i evidencija vode se pažljivo i organizirano.": "Every document, calculation and record is handled carefully and in an organized way.",
  "Dostupnost i podrška": "Availability and support",
  "Klijenti imaju mogućnost savjetovanja, dogovora i digitalne razmjene dokumentacije bez potrebe za dolaskom u ured.": "Clients can receive advice, arrange cooperation and exchange documentation digitally without having to come to the office.",
  "Praktična rješenja": "Practical solutions",
  "Uz knjigovodstvo, nudimo prijedloge za unapređenje i stabilnije poslovanje.": "Alongside bookkeeping, we offer suggestions for improvement and more stable business operations.",
  "Za obrtnike, poduzetnike i poljoprivrednike": "For sole proprietors, entrepreneurs and farmers",
  "Manje brige oko papira, više fokusa na poslovanje.": "Less paperwork stress, more focus on business.",
  "Jasna komunikacija, uredna dokumentacija i stručna online podrška za poslovne odluke koje moraju biti donesene na vrijeme — bez obzira iz kojeg mjesta klijent posluje.": "Clear communication, organized documentation and professional online support for business decisions that must be made on time — regardless of where the client operates from.",
  "Računovodstvo udruga": "Association accounting",
  "Računovodstvo za udruge uz jasnu godišnju cijenu": "Accounting for associations with a clear annual price",
  "Duh Slatine vodi računovodstvo udruga kroz dvojno i jednostavno knjigovodstvo, uz digitalnu razmjenu dokumentacije i mogućnost potpuno online suradnje.": "Duh Slatine manages association accounting through double-entry and simple bookkeeping, with digital document exchange and the possibility of fully online cooperation.",
  "Za udruge": "For associations",
  "Dvojno i jednostavno knjigovodstvo za udruge, uredno praćenje dokumentacije i godišnja računovodstvena podrška.": "Double-entry and simple bookkeeping for associations, organized document tracking and annual accounting support.",
  "Kompletna knjigovodstvena podrška na jednom mjestu": "Complete bookkeeping support in one place",
  "Od paušalnih obrta, udruga i poduzeća do poslovnih planova — sve je organizirano jasno, uredno, profesionalno i dostupno kroz digitalnu suradnju.": "From flat-rate sole proprietors, associations and companies to business plans — everything is organized clearly, professionally and available through digital cooperation.",
  "Vođenje evidencija i podrška za obrtnike paušaliste.": "Record keeping and support for flat-rate sole proprietors.",
  "Detaljnije knjigovodstveno praćenje, evidencije i obračuni.": "More detailed bookkeeping monitoring, records and calculations.",
  "Poslovni planovi": "Business plans",
  "Izrada poslovnih planova za samozapošljavanje i priprema dokumentacije.": "Preparation of self-employment business plans and related documentation.",
  "O nama | Duh Slatine": "About us | Duh Slatine",
  "Duh Slatine, vl. Ivana Golub - knjigovodstveni obrt iz Zvonimirovca s potpuno digitaliziranom online suradnjom.": "Duh Slatine, owner Ivana Golub - an accounting office from Zvonimirovac with fully digital online cooperation.",
  "Iskustvo, odgovornost i individualan pristup": "Experience, responsibility and an individual approach",
  "Knjigovodstveni obrt iz Zvonimirovca koji radi potpuno digitalizirano i pruža online knjigovodstvenu podršku klijentima bez obzira na njihovu lokaciju.": "An accounting office from Zvonimirovac working fully digitally and providing online bookkeeping support to clients regardless of their location.",
  "Duh Slatine je knjigovodstveni obrt sa sjedištem u Zvonimirovcu, specijaliziran za obrte, mikro poduzeća, udruge, poduzetnike i poljoprivrednike. Cilj je klijentima omogućiti sigurnije, jednostavnije i organiziranije poslovanje kroz kvalitetno vođenje poslovnih knjiga, savjetovanje i pravovremenu podršku.": "Duh Slatine is an accounting office based in Zvonimirovac, specialized in sole proprietors, micro companies, associations, entrepreneurs and farmers. The goal is to help clients run a safer, simpler and more organized business through quality bookkeeping, advisory services and timely support.",
  "Naš pristup": "Our approach",
  "Knjigovodstvo koje se prilagođava stvarnim potrebama klijenta": "Bookkeeping adapted to the client's real needs",
  "Poseban naglasak stavljamo na individualan pristup, dugoročnu suradnju, razumijevanje malih poduzetnika, udruga i potpuno digitaliziran način rada. Kao online knjigovođa, omogućujemo suradnju bez fizičkog dolaska i bez obzira odakle je klijent.": "We place special emphasis on an individual approach, long-term cooperation, understanding small entrepreneurs and associations, and fully digital work. As an online bookkeeper, we enable cooperation without physical visits and regardless of where the client is located.",
  "Individualan pristup svakom poslovanju": "An individual approach to every business",
  "Jasna komunikacija i dogovor bez nepotrebnog kompliciranja": "Clear communication and agreements without unnecessary complication",
  "Potpuno digitalizirana suradnja bez potrebe za fizičkim dolaskom": "Fully digital cooperation without the need for physical visits",
  "Uredna dokumentacija i pravovremeno praćenje obveza": "Organized documentation and timely monitoring of obligations",
  "Savjetovanje za stabilnije i organiziranije poslovanje": "Advisory support for more stable and organized business operations",
  "Zašto odabrati nas?": "Why choose us?",
  "Stručna podrška s fokusom na povjerenje": "Professional support focused on trust",
  "Jasna komunikacija": "Clear communication",
  "Informacije su predstavljene razumljivo, bez nepotrebnog stručnog žargona.": "Information is presented clearly, without unnecessary professional jargon.",
  "Uredna dokumentacija": "Organized documentation",
  "Dokumenti i evidencije vode se precizno i organizirano.": "Documents and records are handled precisely and in an organized way.",
  "Stručna podrška": "Professional support",
  "Podrška u knjigovodstvu, porezima, poslovanju i planiranju.": "Support in bookkeeping, taxes, business operations and planning.",
  "Savjetovanje u poslovanju": "Business consulting",
  "Prijedlozi za unapređenje poslovanja i bolju organizaciju.": "Suggestions for business improvement and better organization.",
  "Mali poduzetnici": "Small entrepreneurs",
  "Razumijevanje potreba obrtnika, početnika i mikro poduzeća.": "Understanding the needs of sole proprietors, beginners and micro companies.",
  "Fleksibilan dogovor": "Flexible arrangements",
  "Mogućnost dogovora prema opsegu dokumentacije i vrsti poslovanja.": "The possibility of arranging cooperation according to documentation volume and business type.",
  "Usluge | Duh Slatine": "Services | Duh Slatine",
  "Knjigovodstvo za paušalne obrte, PDV obrte, poduzeća, poslovni planovi i natječajna dokumentacija.": "Bookkeeping for flat-rate sole proprietors, VAT-registered sole proprietors, companies, business plans and tender documentation.",
  "Knjigovodstvene, računovodstvene i savjetodavne usluge za sigurnije poslovanje": "Bookkeeping, accounting and advisory services for more secure business operations",
  "Od osnovnih evidencija do detaljnog računovodstva, računovodstva udruga, savjetovanja, planova i natječajne dokumentacije — uz mogućnost potpuno online suradnje.": "From basic records to detailed accounting, association accounting, consulting, plans and tender documentation — with the option of fully online cooperation.",
  "Knjigovodstvo za paušalne obrte": "Bookkeeping for flat-rate sole proprietors",
  "Vođenje evidencija i knjigovodstvena podrška za obrtnike paušaliste.": "Record keeping and bookkeeping support for flat-rate sole proprietors.",
  "Knjigovodstvo za obrte u sustavu PDV-a": "Bookkeeping for VAT-registered sole proprietors",
  "Vođenje poslovnih knjiga za obrte koji posluju u sustavu PDV-a.": "Keeping business books for sole proprietors operating within the VAT system.",
  "OPG u sustavu PDV-a": "Family farms in the VAT system",
  "Vođenje poslovnih knjiga za OPG-ove u sustavu PDV-a, uz urednu evidenciju dokumentacije i obračun PDV-a.": "Keeping business books for family farms in the VAT system, with organized documentation records and VAT calculation.",
  "Profesionalno vođenje poslovnih knjiga za poduzeća, mikro i male poslovne subjekte uz digitalnu razmjenu dokumentacije.": "Professional bookkeeping for companies, micro and small businesses with digital document exchange.",
  "Dvojno i jednostavno knjigovodstvo za udruge, digitalna razmjena dokumentacije i uredna godišnja računovodstvena podrška.": "Double-entry and simple bookkeeping for associations, digital document exchange and organized annual accounting support.",
  "Financijsko računovodstvo": "Financial accounting",
  "Praćenje financijskih tokova, poslovnih obveza i uredno vođenje dokumentacije.": "Monitoring cash flows, business obligations and organized documentation management.",
  "Robno i materijalno knjigovodstvo": "Inventory and material bookkeeping",
  "Evidencija robe, materijala i poslovnih promjena prema potrebama poslovanja.": "Records of goods, materials and business changes according to business needs.",
  "Savjeti za poslovanje, porezne obveze, organizaciju i unapređenje poslovnih procesa.": "Advice on business operations, tax obligations, organization and improvement of business processes.",
  "Poslovni planovi za samozapošljavanje": "Business plans for self-employment",
  "Izrada poslovnih planova za samozapošljavanje i priprema potrebne dokumentacije.": "Preparation of business plans for self-employment and required documentation.",
  "Dokumentacija za natječaje": "Tender documentation",
  "Priprema dokumentacije za natječaje, uključujući zakup državnog poljoprivrednog zemljišta.": "Preparation of tender documentation, including applications for leasing state-owned agricultural land.",
  "Proces rada": "Work process",
  "Jednostavan početak suradnje": "A simple start to cooperation",
  "Pošaljite osnovne informacije o svom poslovanju, a nakon toga slijedi prijedlog suradnje prema vrsti poslovanja, opsegu dokumentacije i digitalnom načinu rada.": "Send basic information about your business, followed by a cooperation proposal based on business type, documentation volume and digital workflow.",
  "Pošaljite upit putem forme ili WhatsAppa.": "Send an inquiry through the form or WhatsApp.",
  "Dogovaramo opseg usluge i način digitalne razmjene dokumentacije.": "We agree on the scope of service and the method of digital document exchange.",
  "Dobivate jasnu ponudu i početak online suradnje bez potrebe za fizičkim dolaskom.": "You receive a clear quote and can start online cooperation without having to come in person.",
  "Cjenik | Duh Slatine": "Pricing | Duh Slatine",
  "Transparentan cjenik knjigovodstvenih usluga.": "Transparent pricing for bookkeeping services.",
  "Transparentne cijene i dogovor prema opsegu poslovanja": "Transparent prices and arrangements based on the scope of business",
  "Cijene se mogu prilagoditi ovisno o opsegu dokumentacije, vrsti poslovanja, specifičnim potrebama klijenta i načinu digitalne suradnje.": "Prices may be adjusted depending on the volume of documentation, type of business, specific client needs and the method of digital cooperation.",
  "Za obrtnike paušaliste kojima je potrebno jednostavno i uredno vođenje evidencija.": "For flat-rate sole proprietors who need simple and organized record keeping.",
  "Za obrte koji posluju u sustavu PDV-a i trebaju detaljnije knjigovodstveno praćenje.": "For sole proprietors operating within the VAT system who need more detailed bookkeeping monitoring.",
  "Za OPG-ove kojima je potrebno vođenje poslovnih knjiga i obračun PDV-a.": "For family farms that need business book management and VAT calculation.",
  "Za mikro i mala poduzeća kojima je potrebno potpuno računovodstveno praćenje.": "For micro and small companies that need complete accounting support.",
  "Dvojno i jednostavno knjigovodstvo za udruge, uz uredno vođenje dokumentacije i godišnju računovodstvenu podršku.": "Double-entry and simple bookkeeping for associations, with organized documentation management and annual accounting support.",
  "Izrada poslovnog plana i priprema dokumentacije za samozapošljavanje.": "Preparation of a business plan and documentation for self-employment.",
  "Priprema dokumentacije za natječaje, zakup državnog poljoprivrednog zemljišta i slične potrebe.": "Preparation of documentation for tenders, leasing state-owned agricultural land and similar needs.",
  "Cijene su informativne i mogu se prilagoditi ovisno o opsegu dokumentacije, broju računa, vrsti poslovanja, vrsti udruge i specifičnim potrebama klijenta.": "Prices are informative and may be adjusted depending on the volume of documentation, number of invoices, business type, association type and the client's specific needs.",
  "Treba vam točna cijena?": "Need an exact price?",
  "Pošaljite kratki upit i dobit ćete prijedlog suradnje.": "Send a short inquiry and you will receive a cooperation proposal.",
  "Navedite naziv obrta/poduzeća, vrstu poslovanja i uslugu koja vam treba. Lokacija nije prepreka jer se suradnja može voditi potpuno online.": "Provide the name of your sole proprietorship/company, business type and the service you need. Location is not an obstacle because cooperation can be fully online.",
  "Za koga radimo | Duh Slatine": "Who we work with | Duh Slatine",
  "Knjigovodstvena podrška za obrtnike, poduzetnike, mikro poduzeća i poljoprivrednike.": "Bookkeeping support for sole proprietors, entrepreneurs, micro companies and farmers.",
  "Knjigovodstvena i računovodstvena podrška za različite vrste poslovanja": "Bookkeeping and accounting support for different types of business",
  "Bez obzira pokrećete li tek svoje poslovanje ili već imate razvijenu djelatnost, važno je imati knjigovođu koji razumije vaše potrebe. Zahvaljujući digitaliziranom načinu rada, nije bitno odakle poslujete.": "Whether you are just starting your business or already have an established activity, it is important to have a bookkeeper who understands your needs. Thanks to a digital way of working, it does not matter where you operate from.",
  "Obrtnici paušalisti": "Flat-rate sole proprietors",
  "Jednostavno i uredno vođenje evidencija za poslovanje bez nepotrebne administracije.": "Simple and organized record keeping without unnecessary administration.",
  "Detaljnije praćenje poslovnih knjiga, obračuna i dokumentacije.": "More detailed monitoring of business books, calculations and documentation.",
  "Mikro poduzeća": "Micro companies",
  "Računovodstvena podrška za male poslovne subjekte koji žele stabilan rast.": "Accounting support for small businesses that want stable growth.",
  "Udruge": "Associations",
  "Računovodstvo udruga, dvojno i jednostavno knjigovodstvo, uz jasnu cijenu od 500 € godišnje.": "Association accounting, double-entry and simple bookkeeping, with a clear annual price of €500.",
  "Poljoprivrednici": "Farmers",
  "Podrška kod poslovnih knjiga, natječaja i dokumentacije za poljoprivrednu djelatnost.": "Support with business books, tenders and documentation for agricultural activities.",
  "OPG-ovi u sustavu PDV-a": "Family farms in the VAT system",
  "Poslovne knjige i obračun PDV-a za OPG-ove, s cijenom od 125 € mjesečno.": "Business books and VAT calculation for family farms, priced from €125 per month.",
  "Samozaposleni": "Self-employed professionals",
  "Poslovni planovi, dokumentacija i savjetovanje za početak rada.": "Business plans, documentation and consulting for getting started.",
  "Poduzetnici početnici": "New entrepreneurs",
  "Jasne upute, podrška i savjetovanje u prvim koracima poslovanja.": "Clear guidance, support and consulting in the first steps of business.",
  "Poslovni subjekti kojima treba savjetovanje": "Businesses that need consulting",
  "Prijedlozi za unapređenje poslovanja, organizaciju i stabilnije odluke.": "Suggestions for business improvement, organization and more stable decisions.",
  "Individualan pristup": "Individual approach",
  "Svako poslovanje ima drugačije potrebe.": "Every business has different needs.",
  "Upravo zato se opseg usluge, cijena i način suradnje dogovaraju prema dokumentaciji, obvezama i planovima vašeg poslovanja. Suradnja može biti potpuno online, bez potrebe za osobnim sastankom.": "That is why the scope of service, price and cooperation model are agreed according to your documentation, obligations and business plans. Cooperation can be fully online, without the need for an in-person meeting.",
  "Kontakt | Duh Slatine": "Contact | Duh Slatine",
  "Pošaljite upit za knjigovodstvene usluge ili kontaktirajte putem WhatsAppa.": "Send an inquiry for bookkeeping services or contact us via WhatsApp.",
  "Zatražite ponudu ili savjetovanje": "Request a quote or consultation",
  "Pošaljite osnovne informacije o svom poslovanju, a mi ćemo vam se javiti s prijedlogom suradnje. Dokumentaciju i komunikaciju možemo voditi potpuno digitalno.": "Send basic information about your business and we will get back to you with a cooperation proposal. Documentation and communication can be handled fully digitally.",
  "E-mail kontakt": "E-mail contact",
  "Za detaljniji upit i slanje dokumentacije preporučujemo kontakt putem e-maila. Dokumentaciju možete slati digitalno, bez dolaska u ured.": "For a more detailed inquiry and sending documentation, we recommend contact by e-mail. Documentation can be sent digitally, without coming to the office.",
  "Brži kontakt putem WhatsAppa": "Faster contact via WhatsApp",
  "Za brži dogovor ili kratko pitanje možete nas kontaktirati i putem WhatsAppa.": "For faster arrangements or a quick question, you can also contact us via WhatsApp.",
  "Pošaljite upit putem forme, a odgovor ćete dobiti na e-mail u najkraćem mogućem roku. Suradnja je moguća online, bez obzira na vašu lokaciju.": "Send an inquiry through the form and you will receive a reply by e-mail as soon as possible. Cooperation is possible online, regardless of your location.",
  "Ime i prezime": "Full name",
  "E-mail": "E-mail",
  "Broj telefona": "Phone number",
  "Naziv obrta/poduzeća": "Sole proprietorship/company name",
  "Vrsta poslovanja": "Business type",
  "Odaberite uslugu": "Choose a service",
  "Paušalni obrt": "Flat-rate sole proprietorship",
  "Obrt u sustavu PDV-a": "VAT-registered sole proprietorship",
  "OPG (poslovne knjige, sustav PDV-a)": "Family farm (business books, VAT system)",
  "Računovodstvo udruge": "Association accounting",
  "Poslovni plan": "Business plan",
  "Savjetovanje": "Consulting",
  "Ostalo": "Other",
  "Poruka": "Message",
  "Vaše ime i prezime": "Your full name",
  "Naziv obrta ili poduzeća": "Sole proprietorship or company name",
  "Npr. paušalni obrt, udruga, OPG, poduzeće": "E.g. flat-rate sole proprietorship, association, family farm, company",
  "Ukratko opišite što vam treba...": "Briefly describe what you need...",
  "Politika privatnosti | Duh Slatine": "Privacy Policy | Duh Slatine",
  "Politika privatnosti web stranice Duh Slatine.": "Privacy Policy of the Duh Slatine website.",
  "GDPR": "GDPR",
  "Zadnje ažuriranje: 18.06.2026.": "Last updated: 18 June 2026.",
  "Ova Politika privatnosti objašnjava kako Duh Slatine, vl. Ivana Golub, obrađuje osobne podatke posjetitelja web stranice i osoba koje pošalju upit putem kontakt forme, e-maila, telefona, WhatsAppa ili društvenih mreža.": "This Privacy Policy explains how Duh Slatine, owner Ivana Golub, processes personal data of website visitors and people who send an inquiry through the contact form, e-mail, phone, WhatsApp or social media.",
  "Voditelj obrade": "Data controller",
  "Duh Slatine, vl. Ivana Golub, knjigovodstveni obrt sa sjedištem u Zvonimirovcu.": "Duh Slatine, owner Ivana Golub, an accounting office based in Zvonimirovac.",
  "Kontakt:": "Contact:",
  "Koje podatke možemo obrađivati": "What data we may process",
  "ime i prezime ili naziv poslovnog subjekta,": "full name or business entity name,",
  "e-mail adresu, broj telefona i sadržaj poruke,": "e-mail address, phone number and message content,",
  "podatke potrebne za pripremu ponude i pružanje knjigovodstvenih usluga,": "data needed to prepare a quote and provide bookkeeping services,",
  "tehničke podatke koje preglednik šalje prilikom posjeta stranici.": "technical data sent by the browser when visiting the website.",
  "Svrha obrade": "Purpose of processing",
  "Podatke obrađujemo radi odgovora na upit, izrade ponude, dogovora poslovne suradnje, pružanja usluga, ispunjavanja zakonskih obveza i poboljšanja korisničkog iskustva na web stranici.": "We process data in order to respond to inquiries, prepare quotes, arrange business cooperation, provide services, meet legal obligations and improve the user experience on the website.",
  "Pravna osnova": "Legal basis",
  "Obrada se temelji na poduzimanju radnji prije sklapanja ugovora, izvršavanju ugovora, zakonskim obvezama, legitimnom interesu i, gdje je potrebno, privoli korisnika.": "Processing is based on taking steps prior to entering into a contract, performance of a contract, legal obligations, legitimate interest and, where necessary, the user's consent.",
  "Čuvanje podataka": "Data retention",
  "Osobni podaci čuvaju se onoliko dugo koliko je potrebno za svrhu zbog koje su prikupljeni, odnosno u rokovima propisanim važećim zakonima.": "Personal data is kept for as long as necessary for the purpose for which it was collected, or for the periods prescribed by applicable laws.",
  "Prava korisnika": "User rights",
  "Imate pravo zatražiti pristup, ispravak, brisanje, ograničenje obrade, prenosivost podataka i prigovor na obradu, kada su ispunjeni uvjeti propisani važećim propisima.": "You have the right to request access, correction, deletion, restriction of processing, data portability and objection to processing, when the conditions prescribed by applicable regulations are met.",
  "Za pitanja o privatnosti možete nas kontaktirati na": "For privacy-related questions, you can contact us at",
  "Politika kolačića | Duh Slatine": "Cookie Policy | Duh Slatine",
  "Politika kolačića web stranice Duh Slatine.": "Cookie Policy of the Duh Slatine website.",
  "Ova stranica koristi kolačiće kako bi web stranica ispravno radila, kako bi zapamtila vaš odabir privole te, uz vašu privolu, omogućila analitiku i marketinško praćenje ako se takvi alati povežu na stranicu.": "This website uses cookies so the website can function properly, remember your consent choice and, with your consent, enable analytics and marketing tracking if such tools are connected to the website.",
  "Što su kolačići?": "What are cookies?",
  "Kolačići su male tekstualne datoteke koje se spremaju u preglednik korisnika prilikom posjeta web stranici.": "Cookies are small text files stored in the user's browser when visiting a website.",
  "Vrste kolačića": "Types of cookies",
  "Neophodni kolačići": "Necessary cookies",
  "– potrebni su za osnovni rad stranice i spremanje odabira privole.": "– required for the basic operation of the website and for saving the consent choice.",
  "Analitički kolačići": "Analytics cookies",
  "– koriste se za razumijevanje posjeta i korištenja stranice, samo ako ih prihvatite.": "– used to understand visits and website usage, only if you accept them.",
  "Marketinški kolačići": "Marketing cookies",
  "– koriste se za oglašavanje i mjerenje kampanja, samo ako ih prihvatite.": "– used for advertising and campaign measurement, only if you accept them.",
  "Upravljanje kolačićima": "Cookie management",
  "Svoj odabir možete promijeniti u bilo kojem trenutku klikom na": "You can change your choice at any time by clicking",
  "Napomena": "Note",
  "Ako se na web stranicu naknadno doda Google Analytics, Meta Pixel ili sličan alat, preporuka je da se te skripte učitavaju tek nakon prihvaćanja odgovarajuće kategorije kolačića.": "If Google Analytics, Meta Pixel or a similar tool is later added to the website, those scripts should load only after the appropriate cookie category has been accepted.",
  "Privatnost i kolačići": "Privacy and cookies",
  "Koristimo kolačiće za bolje korisničko iskustvo": "We use cookies for a better user experience",
  "Neophodni kolačići omogućuju rad stranice. Analitičke i marketinške kolačiće koristimo samo ako ih prihvatite.": "Necessary cookies enable the website to function. Analytics and marketing cookies are used only if you accept them.",
  "Odbij": "Reject",
  "Postavke": "Settings",
  "Prihvati sve": "Accept all",
  "Postavke privatnosti": "Privacy settings",
  "Možete odabrati koje kategorije kolačića želite dopustiti. Neophodni kolačići uvijek su aktivni jer su potrebni za rad web stranice.": "You can choose which categories of cookies you want to allow. Necessary cookies are always active because they are required for the website to function.",
  "Osnovne funkcije stranice, sigurnost i spremanje odabira privole.": "Basic website functions, security and storing the consent choice.",
  "Pomažu razumjeti kako posjetitelji koriste stranicu, ako su povezani alati poput Google Analyticsa.": "Help understand how visitors use the website, if tools such as Google Analytics are connected.",
  "Koriste se za oglašavanje i mjerenje kampanja, ako su povezani alati poput Meta Pixela.": "Used for advertising and campaign measurement, if tools such as Meta Pixel are connected.",
  "Odbij sve": "Reject all",
  "Spremi odabir": "Save selection"
};
  const storageKey = 'duhSlatineLanguage';
  const supported = ['hr', 'en'];

  function normalize(value){
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function withOriginalSpacing(originalValue, translatedValue){
    const leading = String(originalValue).match(/^\s*/)[0];
    const trailing = String(originalValue).match(/\s*$/)[0];
    return leading + translatedValue + trailing;
  }

  function currentLanguage(){
    try {
      const saved = localStorage.getItem(storageKey);
      return supported.includes(saved) ? saved : 'hr';
    } catch(e) {
      return 'hr';
    }
  }

  function setStoredLanguage(lang){
    try { localStorage.setItem(storageKey, lang); } catch(e) {}
  }

  function translateTextNodes(lang){
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if(!node.nodeValue || !normalize(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if(!parent || ['SCRIPT','STYLE','NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if(parent.closest('[data-i18n-ignore]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while(walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      if(!node.__i18nOriginal) node.__i18nOriginal = normalize(node.nodeValue);
      const original = node.__i18nOriginal;
      const translated = lang === 'en' && translations[original] ? translations[original] : original;
      node.nodeValue = withOriginalSpacing(node.nodeValue, translated);
    });
  }

  function translateAttributes(lang){
    const attrNames = ['aria-label','title','placeholder','alt','content'];
    document.querySelectorAll('*').forEach(el => {
      attrNames.forEach(attr => {
        if(!el.hasAttribute(attr)) return;
        if(attr === 'content' && !(el.tagName === 'META' && el.getAttribute('name') === 'description')) return;
        const key = '__i18n_' + attr;
        if(!el[key]) el[key] = normalize(el.getAttribute(attr));
        const original = el[key];
        const translated = lang === 'en' && translations[original] ? translations[original] : original;
        el.setAttribute(attr, translated);
      });
    });
  }

  function translateDocument(lang){
    document.documentElement.lang = lang === 'en' ? 'en' : 'hr';
    if(!document.__i18nTitleOriginal) document.__i18nTitleOriginal = normalize(document.title);
    document.title = lang === 'en' && translations[document.__i18nTitleOriginal]
      ? translations[document.__i18nTitleOriginal]
      : document.__i18nTitleOriginal;
    translateTextNodes(lang);
    translateAttributes(lang);
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      const active = btn.getAttribute('data-lang-switch') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  document.addEventListener('click', function(e){
    const btn = e.target.closest('[data-lang-switch]');
    if(!btn) return;
    const lang = btn.getAttribute('data-lang-switch');
    if(!supported.includes(lang)) return;
    setStoredLanguage(lang);
    translateDocument(lang);
  });

  const apply = () => translateDocument(currentLanguage());
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
