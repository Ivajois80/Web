'use strict';

// ── Helpers ───────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ── Header scroll ─────────────────────────────
const header = document.querySelector('.header');
const scrollTopBtn = $('scrollTop');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 40);
  scrollTopBtn?.classList.toggle('hidden', window.scrollY < 400);
}, { passive: true });

scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Menú hamburguesa ──────────────────────────
const hamburger = $('hamburger');
const navLinks = $('navLinks');

hamburger?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

$$('#navLinks .nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger?.classList.remove('active');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ── Nav activo por scroll ─────────────────────
const sections = $$('section[id]');
const navItems = $$('.nav-link');

window.addEventListener('scroll', () => {
  let currentId = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    // El menú cambia cuando el inicio de la sección llega a 250px del borde superior
    if (window.scrollY >= sectionTop - 250) {
      currentId = section.getAttribute('id');
    }
  });

  if (currentId) {
    navItems.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === `#${currentId}`) {
        l.classList.add('active');
      }
    });
  }
}, { passive: true });

// ── Dark Mode ─────────────────────────────────
const themeToggle = $('themeToggle');
const iconMoon = themeToggle?.querySelector('.icon-moon');
const iconSun  = themeToggle?.querySelector('.icon-sun');
let isDark = localStorage.getItem('agamfi-theme') === 'dark';

function applyTheme() {
  document.body.classList.toggle('dark', isDark);
  iconMoon?.classList.toggle('hidden', isDark);
  iconSun?.classList.toggle('hidden', !isDark);
}
applyTheme();

themeToggle?.addEventListener('click', () => {
  isDark = !isDark;
  localStorage.setItem('agamfi-theme', isDark ? 'dark' : 'light');
  applyTheme();
});

// ── Destello táctil en móvil (evita que el :hover se quede pegado) ────────
themeToggle?.addEventListener('touchend', () => {
  // Quitamos clases anteriores por si acaso
  themeToggle.classList.remove('touch-flash-moon', 'touch-flash-sun');

  // Forzamos reflow para reiniciar la animación si se pulsa rápido
  void themeToggle.offsetWidth;

  // La clase se aplica ANTES del click que cambia el icono,
  // así mostramos el destello del icono que había en ese momento
  const flashClass = iconMoon?.classList.contains('hidden')
    ? 'touch-flash-sun'
    : 'touch-flash-moon';

  themeToggle.classList.add(flashClass);

  // Al terminar la animación se quita sola
  themeToggle.addEventListener('animationend', () => {
    themeToggle.classList.remove(flashClass);
  }, { once: true });
}, { passive: true });

// ── Reveal on scroll ──────────────────────────
$$('.reveal').forEach(el => {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 }).observe(el);
});

// ── Modales: Hazte Socio / Bizum ─────────────
function openModal(id) {
  $(id)?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  $(id)?.classList.add('hidden');
  document.body.style.overflow = '';
}

$('btnSocio')?.addEventListener('click', () => openModal('modalSocio'));
$('btnBizum')?.addEventListener('click', () => openModal('modalBizum'));
$('closeSocio')?.addEventListener('click', () => closeModal('modalSocio'));
$('closeBizum')?.addEventListener('click', () => closeModal('modalBizum'));

['modalSocio', 'modalBizum'].forEach(id => {
  $(id)?.addEventListener('click', e => { if (e.target === $(id)) closeModal(id); });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal('modalSocio'); closeModal('modalBizum'); }
});

// ── Validación formulario ─────────────────────
const form = $('contactForm');

function setError(inputId, errorId, msg) {
  $(inputId)?.classList.add('error');
  if ($( errorId)) $(errorId).textContent = msg;
}
function clearError(inputId, errorId) {
  $(inputId)?.classList.remove('error');
  if ($(errorId)) $(errorId).textContent = '';
}

function validate() {
  let ok = true;
  const name    = $('inputName')?.value.trim();
  const contact = $('inputContact')?.value.trim();
  const message = $('inputMessage')?.value.trim();
  const terms   = $('inputTerms')?.checked;

  clearError('inputName',    'errorName');
  clearError('inputContact', 'errorContact');
  clearError('inputMessage', 'errorMessage');
  clearError('inputTerms',   'errorTerms');

  if (!name)              { setError('inputName',    'errorName',    'El nombre es obligatorio.');            ok = false; }
  if (!contact)           { setError('inputContact', 'errorContact', 'Indica un email o teléfono.');          ok = false; }
  if (!message || message.length < 5) { setError('inputMessage', 'errorMessage', 'Escribe un mensaje.'); ok = false; }
  if (!terms)             { setError('inputTerms',   'errorTerms',   'Debes aceptar los términos y condiciones.'); ok = false; }
  return ok;
}

['inputName','inputContact','inputMessage'].forEach(id => {
  $(id)?.addEventListener('input', () => clearError(id, 'error' + id.replace('input','')));
});
$('inputTerms')?.addEventListener('change', () => clearError('inputTerms', 'errorTerms'));

form?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validate()) return;

  const btn    = $('submitForm');
  const txt    = $('submitText');
  const loader = $('submitLoader');
  const succ   = $('formSuccess');

  txt?.classList.add('hidden');
  loader?.classList.remove('hidden');
  btn.disabled = true;

  try {
    const formData = new FormData(form);
    const response = await fetch('https://formsubmit.co/ajax/grupofibro@gmail.com', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      txt?.classList.remove('hidden');
      loader?.classList.add('hidden');
      btn.disabled = false;
      succ?.classList.remove('hidden');
      form.reset();
      setTimeout(() => succ?.classList.add('hidden'), 6000);
    } else {
      throw new Error('Error en el servidor');
    }
  } catch (error) {
    console.error('Error enviando el formulario:', error);
    alert('Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo.');
    txt?.classList.remove('hidden');
    loader?.classList.add('hidden');
    btn.disabled = false;
  }
});
