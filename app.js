// app.js - theme toggle, particles, footer carousel init, year and small helpers.
// Put this file in same folder and include after bootstrap

document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle (works for both pages if present)
  function initTheme(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const body = document.body;
    const saved = localStorage.getItem('pref-theme') || 'light';
    body.classList.toggle('dark-mode', saved === 'dark');
    body.classList.toggle('light-mode', saved !== 'dark');
    btn.textContent = saved === 'dark' ? 'Light' : 'Dark';
    btn.addEventListener('click', () => {
      const isDark = body.classList.contains('dark-mode');
      body.classList.toggle('dark-mode', !isDark);
      body.classList.toggle('light-mode', isDark);
      btn.textContent = !isDark ? 'Light' : 'Dark';
      localStorage.setItem('pref-theme', !isDark ? 'dark' : 'light');
    });
  }
  initTheme('themeToggle');
  initTheme('themeToggle2');

  // Banner particles (light-weight)
  (function initParticles() {
    const canvas = document.getElementById('bannerParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    window.addEventListener('resize', () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; });
    const particles = [];
    const count = Math.round((w * h) / 90000); // scale with size
    for (let i=0;i<count;i++){
      particles.push({ x:Math.random()*w, y:Math.random()*h, r:Math.random()*1.5+0.6, dx:(Math.random()-0.5)*0.4, dy:(Math.random()-0.5)*0.4, color:['rgba(255,255,255,0.12)','rgba(255,255,255,0.08)'][Math.floor(Math.random()*2)] });
    }
    function loop(){
      ctx.clearRect(0,0,w,h);
      for (const p of particles){
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
      }
      requestAnimationFrame(loop);
    }
    loop();
  })();

  // small helper: staggered reveal for banner words (for older browsers)
  (function animateWords() {
    const words = document.querySelectorAll('.banner-title .word');
    words.forEach(w => {
      const d = w.getAttribute('data-delay') || 0;
      setTimeout(()=>{ w.style.opacity = '1'; w.style.transform = 'translateY(0)'; }, Number(d));
    });
  })();

  // Footer carousel is handled by Bootstrap data attributes - but we ensure it auto cycles
  const carousel = document.querySelector('#imageCarousel.carousel');
  if (carousel && bootstrap && bootstrap.Carousel) {
    try {
      new bootstrap.Carousel(carousel, { interval: 3000, ride: 'carousel' });
    } catch(e) { /* ignore */ }
  }

  // Initialize AOS (if library loaded)
  if (window.AOS) AOS.init();

  // === ENROLL FORM (if present on page) - validation, modal & toast ===
  const enrollForm = document.getElementById('enrollForm');
  if (!enrollForm) return;

  // Elements
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const contact = document.getElementById('contact');
  const dob = document.getElementById('dob');
  const course = document.getElementById('course');
  const education = document.getElementById('education');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const terms = document.getElementById('terms');

  const errs = {
    name: document.getElementById('errName'),
    email: document.getElementById('errEmail'),
    contact: document.getElementById('errContact'),
    dob: document.getElementById('errDob'),
    course: document.getElementById('errCourse'),
    education: document.getElementById('errEducation'),
    password: document.getElementById('errPassword'),
    confirm: document.getElementById('errConfirm'),
    terms: document.getElementById('errTerms')
  };

  function showErr(el, msg){ if(el) el.textContent = msg || ''; }
  function clearErr(el){ if(el) el.textContent = ''; }

  function validName(){ const v = fullName.value.trim(); if(!v){ showErr(errs.name,'Name required'); return false;} if(!/^[A-Za-z\s]+$/.test(v)){ showErr(errs.name,'Only alphabets allowed'); return false;} clearErr(errs.name); return true; }
  function validEmail(){ const v = email.value.trim(); if(!v){ showErr(errs.email,'Email required'); return false;} if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ showErr(errs.email,'Invalid email'); return false;} clearErr(errs.email); return true; }
  function validContact(){ const v = (contact.value||'').replace(/\D/g,''); if(!v){ showErr(errs.contact,'Contact required'); return false;} if(!/^\d{11}$/.test(v)){ showErr(errs.contact,'Contact must be 11 digits'); return false;} clearErr(errs.contact); return true; }
  function validDob(){ const v = dob.value; if(!v){ showErr(errs.dob,'DOB required'); return false;} const b=new Date(v); if(isNaN(b.getTime())){ showErr(errs.dob,'Invalid date'); return false;} const t=new Date(); let age=t.getFullYear()-b.getFullYear(); if(t.getMonth()<b.getMonth()|| (t.getMonth()===b.getMonth() && t.getDate()<b.getDate())) age--; if(age<16){ showErr(errs.dob,'You must be 16+'); return false;} clearErr(errs.dob); return true; }
  function validCourse(){ if(!course.value){ showErr(errs.course,'Select a course'); return false;} clearErr(errs.course); return true; }
  function validEducation(){ if(!education.value){ showErr(errs.education,'Select education'); return false;} clearErr(errs.education); return true; }
  function validPassword(){ const v = password.value; const re = /(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/; if(!v){ showErr(errs.password,'Password required'); return false;} if(!re.test(v)){ showErr(errs.password,'At least 8 chars with upper,lower,number,symbol'); return false;} clearErr(errs.password); return true; }
  function validConfirm(){ if(confirmPassword.value !== password.value){ showErr(errs.confirm,'Passwords do not match'); return false;} clearErr(errs.confirm); return true; }
  function validTerms(){ if(!terms.checked){ showErr(errs.terms,'Accept terms'); return false;} clearErr(errs.terms); return true; }

  // Attach blur/change for live feedback
  if(fullName) fullName.addEventListener('blur', validName);
  if(email) email.addEventListener('blur', validEmail);
  if(contact) contact.addEventListener('blur', validContact);
  if(dob) dob.addEventListener('blur', validDob);
  if(course) course.addEventListener('change', validCourse);
  if(education) education.addEventListener('change', validEducation);
  if(password) password.addEventListener('blur', validPassword);
  if(confirmPassword) confirmPassword.addEventListener('blur', validConfirm);
  if(terms) terms.addEventListener('change', validTerms);

  const confirmModalEl = document.getElementById('confirmModal');
  const modal = (confirmModalEl) ? new bootstrap.Modal(confirmModalEl) : null;
  const successToastEl = document.getElementById('successToast');
  const successToast = (successToastEl && bootstrap.Toast) ? new bootstrap.Toast(successToastEl, {delay:4000}) : null;

  function buildSummary() {
    const list = document.getElementById('summaryList');
    if(!list) return;
    const gender = document.querySelector('input[name="gender"]:checked')?.value || '';
    list.innerHTML = `
      <li><strong>Name:</strong> ${fullName.value.trim()}</li>
      <li><strong>Email:</strong> ${email.value.trim()}</li>
      <li><strong>Contact:</strong> ${(contact.value||'').replace(/\D/g,'')}</li>
      <li><strong>Gender:</strong> ${gender}</li>
      <li><strong>DOB:</strong> ${dob.value}</li>
      <li><strong>Course:</strong> ${course.value}</li>
      <li><strong>Education:</strong> ${education.value}</li>
    `;
  }

  document.getElementById('submitBtn')?.addEventListener('click', () => {
    const ok = [validName(), validEmail(), validContact(), validDob(), validCourse(), validEducation(), validPassword(), validConfirm(), validTerms()].every(Boolean);
    if (!ok) {
      const firstErr = document.querySelector('.form-text.text-danger:not(:empty)');
      if(firstErr) firstErr.scrollIntoView({behavior:'smooth', block:'center'});
      return;
    }
    buildSummary();
    if(modal) modal.show();
  });

  document.getElementById('confirmSubmit')?.addEventListener('click', () => {
    if(! [validName(), validEmail(), validContact(), validDob(), validCourse(), validEducation(), validPassword(), validConfirm(), validTerms()].every(Boolean)) return;
    modal?.hide();
    successToast?.show();
    // Save to localStorage
    const key='enrollments';
    const arr= JSON.parse(localStorage.getItem(key)||'[]');
    arr.push({
      name: fullName.value.trim(),
      email: email.value.trim(),
      contact: (contact.value||'').replace(/\D/g,''),
      gender: document.querySelector('input[name="gender"]:checked')?.value||'',
      dob: dob.value,
      course: course.value,
      education: education.value,
      ts: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(arr));
    enrollForm.reset();
    Object.values(errs).forEach(clearErr);
  });

  // Prevent native submit
  enrollForm.addEventListener('submit', e => e.preventDefault());
});
