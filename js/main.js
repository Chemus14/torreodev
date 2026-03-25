/* ══════════════════════════════════════════
   TORREODEV — main.js
   Módulos:
   1. Menú móvil
   2. Scroll reveal
   3. Barras de métricas animadas
   4. Nav activo en scroll
   5. Formulario: validación + anti-spam + Formspree
   6. Footer: año actual
══════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   1. MENÚ MÓVIL
───────────────────────────────────────── */
(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // evita scroll con menú abierto
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Cierra al pulsar un enlace del menú
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Cierra al pulsar fuera del menú
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMenu();
    }
  });
})();


/* ─────────────────────────────────────────
   2. SCROLL REVEAL
   Marca como visible cada elemento .reveal
   cuando entra en el viewport
───────────────────────────────────────── */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // solo animamos una vez
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────
   3. ANIMACIÓN DE BARRAS DE MÉTRICAS
   Se activa cuando el bloque entra en vista
───────────────────────────────────────── */
(function initMetricBars() {
  const visual = document.querySelector('.why-visual');
  if (!visual) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.metric-fill').forEach(fill => {
          fill.classList.add('animate');
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  observer.observe(visual);
})();


/* ─────────────────────────────────────────
   4. NAV ACTIVO EN SCROLL
   Resalta el enlace de la sección visible
───────────────────────────────────────── */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));
})();


/* ─────────────────────────────────────────
   5. FORMULARIO
   Incluye tres capas de protección anti-spam:
   a) Honeypot  – campo oculto que bots rellenan
   b) Tiempo    – rechaza envíos en menos de 4s
   c) Rate limit– máximo 3 envíos por sesión
   Y después envía los datos a Formspree.
───────────────────────────────────────── */
(function initContactForm() {

  /* ── Configuración ── */
  // ⚠️ IMPORTANTE: sustituye este endpoint por el tuyo de Formspree
  // Crea tu formulario gratis en https://formspree.io/
  // y pega aquí la URL que te dan (ej: https://formspree.io/f/xabcdefg)
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/TU_ID_AQUI';

  const MAX_SUBMISSIONS = 3;   // máximo envíos por sesión de pestaña
  const MIN_FILL_TIME   = 4000; // ms mínimos para rellenar el formulario (humano)

  /* ── Referencias al DOM ── */
  const form        = document.getElementById('contact-form');
  const btnSubmit   = document.getElementById('btn-submit');
  const btnText     = document.getElementById('btn-text');
  const btnLoading  = document.getElementById('btn-loading');
  const successBox  = document.getElementById('form-success');
  const errorGlobal = document.getElementById('form-error-global');
  const tsField     = document.getElementById('form-timestamp');

  if (!form) return;

  /* ── Estado interno ── */
  let submissionCount = 0;

  // Guardamos el momento en que el usuario empieza a interactuar con el form
  // (se usa para el control de tiempo mínimo)
  let formStartTime = Date.now();
  form.addEventListener('focusin', () => {
    if (!tsField.value) {
      formStartTime = Date.now();
      tsField.value = formStartTime;
    }
  }, { once: true });


  /* ── Helpers de validación ── */

  function showError(input, message) {
    input.classList.add('error');
    const errorSpan = input.parentElement.querySelector('.field-error');
    if (errorSpan) errorSpan.textContent = message;
  }

  function clearError(input) {
    input.classList.remove('error');
    const errorSpan = input.parentElement.querySelector('.field-error');
    if (errorSpan) errorSpan.textContent = '';
  }

  function isValidEmail(email) {
    // Expresión regular básica pero suficiente para frontend
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function validateForm() {
    let valid = true;

    const nombre   = document.getElementById('nombre');
    const email    = document.getElementById('email');
    const servicio = document.getElementById('servicio');
    const mensaje  = document.getElementById('mensaje');

    // Nombre
    if (!nombre.value.trim()) {
      showError(nombre, 'El nombre es obligatorio.');
      valid = false;
    } else if (nombre.value.trim().length < 2) {
      showError(nombre, 'Mínimo 2 caracteres.');
      valid = false;
    } else {
      clearError(nombre);
    }

    // Email
    if (!email.value.trim()) {
      showError(email, 'El email es obligatorio.');
      valid = false;
    } else if (!isValidEmail(email.value.trim())) {
      showError(email, 'Introduce un email válido.');
      valid = false;
    } else {
      clearError(email);
    }

    // Servicio
    if (!servicio.value) {
      showError(servicio, 'Selecciona una opción.');
      valid = false;
    } else {
      clearError(servicio);
    }

    // Mensaje
    if (!mensaje.value.trim()) {
      showError(mensaje, 'El mensaje es obligatorio.');
      valid = false;
    } else if (mensaje.value.trim().length < 20) {
      showError(mensaje, 'Escribe al menos 20 caracteres.');
      valid = false;
    } else {
      clearError(mensaje);
    }

    return valid;
  }


  /* ── Limpia errores en tiempo real mientras el usuario escribe ── */
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => clearError(field));
  });


  /* ── Controles de UI ── */

  function setLoading(loading) {
    btnSubmit.disabled = loading;
    btnText.hidden     = loading;
    btnLoading.hidden  = !loading;
  }

  function showGlobalError(message) {
    errorGlobal.textContent = message;
    errorGlobal.hidden      = false;
  }

  function hideGlobalError() {
    errorGlobal.hidden = true;
  }

  function showSuccess() {
    form.hidden      = true;
    successBox.hidden = false;
  }


  /* ── Envío del formulario ── */

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideGlobalError();

    /* ── a) HONEYPOT: si el campo oculto tiene contenido, es un bot ── */
    const honeypot = document.getElementById('website');
    if (honeypot && honeypot.value.trim() !== '') {
      // Silencioso: fingimos éxito para no dar pistas al bot
      showSuccess();
      return;
    }

    /* ── b) TIEMPO MÍNIMO: rechaza si se envía en menos de 4 segundos ── */
    const elapsed = Date.now() - formStartTime;
    if (elapsed < MIN_FILL_TIME) {
      showGlobalError('El formulario se envió demasiado rápido. Por favor, inténtalo de nuevo.');
      return;
    }

    /* ── c) RATE LIMIT por sesión ── */
    if (submissionCount >= MAX_SUBMISSIONS) {
      showGlobalError('Has alcanzado el límite de envíos. Contáctanos directamente por WhatsApp o email.');
      return;
    }

    /* ── Validación de campos ── */
    if (!validateForm()) {
      // Hacemos scroll al primer campo con error
      const firstError = form.querySelector('.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    /* ── Envío a Formspree ── */
    setLoading(true);

    try {
      const formData = new FormData(form);

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method:  'POST',
        body:    formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        submissionCount++;
        showSuccess();
      } else {
        // Formspree puede devolver errores detallados en JSON
        const data = await response.json().catch(() => ({}));
        const msg  = data?.errors?.[0]?.message || 'Error al enviar. Inténtalo de nuevo.';
        showGlobalError(msg);
        setLoading(false);
      }

    } catch (err) {
      // Error de red (sin conexión, etc.)
      showGlobalError('Sin conexión. Comprueba tu internet e inténtalo de nuevo.');
      setLoading(false);
    }
  });

})();


/* ─────────────────────────────────────────
   6. AÑO ACTUAL EN EL FOOTER
───────────────────────────────────────── */
(function setCurrentYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
