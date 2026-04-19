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

'use strict'

/* ─────────────────────────────────────────
   1. MENÚ MÓVIL
───────────────────────────────────────── */
;(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger')
  const mobileMenu = document.getElementById('mobile-menu')
  if (!hamburger || !mobileMenu) return

  function openMenu() {
    hamburger.classList.add('open')
    mobileMenu.classList.add('open')
    hamburger.setAttribute('aria-expanded', 'true')
    document.body.style.overflow = 'hidden' // evita scroll con menú abierto
  }

  function closeMenu() {
    hamburger.classList.remove('open')
    mobileMenu.classList.remove('open')
    hamburger.setAttribute('aria-expanded', 'false')
    document.body.style.overflow = ''
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu()
  })

  // Cierra al pulsar un enlace del menú
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu)
  })

  // Cierra al pulsar fuera del menú
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMenu()
    }
  })
})()

/* ─────────────────────────────────────────
   2. SCROLL REVEAL
   Marca como visible cada elemento .reveal
   cuando entra en el viewport
───────────────────────────────────────── */
;(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal')
  if (!elements.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target) // solo animamos una vez
        }
      })
    },
    { threshold: 0.12 }
  )

  elements.forEach((el) => observer.observe(el))
})()

/* ─────────────────────────────────────────
   3. ANIMACIÓN DE BARRAS DE MÉTRICAS
   Se activa cuando el bloque entra en vista
───────────────────────────────────────── */
;(function initMetricBars() {
  const visual = document.querySelector('.why-visual')
  if (!visual) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.metric-fill').forEach((fill) => {
            fill.classList.add('animate')
          })
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.35 }
  )

  observer.observe(visual)
})()

/* ─────────────────────────────────────────
   4. NAV ACTIVO EN SCROLL
   Resalta el enlace de la sección visible
───────────────────────────────────────── */
;(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]')
  const navLinks = document.querySelectorAll('nav a[href^="#"]')
  if (!sections.length || !navLinks.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        navLinks.forEach((link) => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          )
        })
      })
    },
    { rootMargin: '-40% 0px -50% 0px' }
  )

  sections.forEach((s) => observer.observe(s))
})()

/* ─────────────────────────────────────────
   5. FORMULARIO
   Incluye tres capas de protección anti-spam:
   a) Honeypot  – campo oculto que bots rellenan
   b) Tiempo    – rechaza envíos en menos de 4s
   c) Rate limit– máximo 3 envíos por sesión
   Y después envía los datos a Formspree.
───────────────────────────────────────── */
;(function initContactForm() {
  /* ── Configuración ── */
  // ⚠️ IMPORTANTE: sustituye este endpoint por el tuyo de Formspree
  // Crea tu formulario gratis en https://formspree.io/
  // y pega aquí la URL que te dan (ej: https://formspree.io/f/xabcdefg)
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xvzdqoyn'

  const MAX_SUBMISSIONS = 3 // máximo envíos por sesión de pestaña
  const MIN_FILL_TIME = 4000 // ms mínimos para rellenar el formulario (humano)

  /* ── Referencias al DOM ── */
  const form = document.getElementById('contact-form')
  const btnSubmit = document.getElementById('btn-submit')
  const btnText = document.getElementById('btn-text')
  const btnLoading = document.getElementById('btn-loading')
  const successBox = document.getElementById('form-success')
  const errorGlobal = document.getElementById('form-error-global')
  const tsField = document.getElementById('form-timestamp')

  if (!form) return

  /* ── Estado interno ── */
  let submissionCount = 0

  // Guardamos el momento en que el usuario empieza a interactuar con el form
  // (se usa para el control de tiempo mínimo)
  let formStartTime = Date.now()
  form.addEventListener(
    'focusin',
    () => {
      if (!tsField.value) {
        formStartTime = Date.now()
        tsField.value = formStartTime
      }
    },
    { once: true }
  )

  /* ── Helpers de validación ── */

  function showError(input, message) {
    input.classList.add('error')
    const errorSpan = input.parentElement.querySelector('.field-error')
    if (errorSpan) errorSpan.textContent = message
  }

  function clearError(input) {
    input.classList.remove('error')
    const errorSpan = input.parentElement.querySelector('.field-error')
    if (errorSpan) errorSpan.textContent = ''
  }

  function isValidEmail(email) {
    // Expresión regular básica pero suficiente para frontend
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  }

  function validateForm() {
    let valid = true

    const nombre = document.getElementById('nombre')
    const email = document.getElementById('email')
    const servicio = document.getElementById('servicio')
    const mensaje = document.getElementById('mensaje')

    // Nombre
    if (!nombre.value.trim()) {
      showError(nombre, 'El nombre es obligatorio.')
      valid = false
    } else if (nombre.value.trim().length < 2) {
      showError(nombre, 'Mínimo 2 caracteres.')
      valid = false
    } else {
      clearError(nombre)
    }

    // Email
    if (!email.value.trim()) {
      showError(email, 'El email es obligatorio.')
      valid = false
    } else if (!isValidEmail(email.value.trim())) {
      showError(email, 'Introduce un email válido.')
      valid = false
    } else {
      clearError(email)
    }

    // Servicio
    if (!servicio.value) {
      showError(servicio, 'Selecciona una opción.')
      valid = false
    } else {
      clearError(servicio)
    }

    // Mensaje
    if (!mensaje.value.trim()) {
      showError(mensaje, 'El mensaje es obligatorio.')
      valid = false
    } else if (mensaje.value.trim().length < 20) {
      showError(mensaje, 'Escribe al menos 20 caracteres.')
      valid = false
    } else {
      clearError(mensaje)
    }

    return valid
  }

  /* ── Limpia errores en tiempo real mientras el usuario escribe ── */
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => clearError(field))
  })

  /* ── Controles de UI ── */

  function setLoading(loading) {
    btnSubmit.disabled = loading
    btnText.hidden = loading
    btnLoading.hidden = !loading
  }

  function showGlobalError(message) {
    errorGlobal.textContent = message
    errorGlobal.hidden = false
  }

  function hideGlobalError() {
    errorGlobal.hidden = true
  }

  function showSuccess() {
    form.hidden = true
    successBox.hidden = false
  }

  /* ── Envío del formulario ── */

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    hideGlobalError()

    /* ── a) HONEYPOT: si el campo oculto tiene contenido, es un bot ── */
    const honeypot = document.getElementById('website')
    if (honeypot && honeypot.value.trim() !== '') {
      // Silencioso: fingimos éxito para no dar pistas al bot
      showSuccess()
      return
    }

    /* ── b) TIEMPO MÍNIMO: rechaza si se envía en menos de 4 segundos ── */
    const elapsed = Date.now() - formStartTime
    if (elapsed < MIN_FILL_TIME) {
      showGlobalError(
        'El formulario se envió demasiado rápido. Por favor, inténtalo de nuevo.'
      )
      return
    }

    /* ── c) RATE LIMIT por sesión ── */
    if (submissionCount >= MAX_SUBMISSIONS) {
      showGlobalError(
        'Has alcanzado el límite de envíos. Contáctanos directamente por WhatsApp o email.'
      )
      return
    }

    /* ── Validación de campos ── */
    if (!validateForm()) {
      // Hacemos scroll al primer campo con error
      const firstError = form.querySelector('.error')
      if (firstError)
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    /* ── Envío a Formspree ── */
    setLoading(true)

    try {
      const formData = new FormData(form)

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      })

      if (response.ok) {
        submissionCount++
        showSuccess()
      } else {
        // Formspree puede devolver errores detallados en JSON
        const data = await response.json().catch(() => ({}))
        const msg =
          data?.errors?.[0]?.message || 'Error al enviar. Inténtalo de nuevo.'
        showGlobalError(msg)
        setLoading(false)
      }
    } catch (err) {
      // Error de red (sin conexión, etc.)
      showGlobalError(
        'Sin conexión. Comprueba tu internet e inténtalo de nuevo.'
      )
      setLoading(false)
    }
  })
})()

/* ─────────────────────────────────────────
   6. AÑO ACTUAL EN EL FOOTER
───────────────────────────────────────── */
;(function setCurrentYear() {
  const yearEl = document.getElementById('year')
  if (yearEl) yearEl.textContent = new Date().getFullYear()
})()

/* ─────────────────────────────────────────
   7. INTERNACIONALIZACIÓN (i18n)
   Cambia todos los textos con data-i18n="clave"
   al idioma seleccionado y lo guarda en localStorage
───────────────────────────────────────── */
;(function initI18n() {
  const TRANSLATIONS = {
    es: {
      'hero.label': 'Agencia digital · Resultados reales',
      'hero.title':
        'Tu presencia digital que <em>trabaja</em><br>mientras tú descansas',
      'hero.desc':
        'Desarrollamos webs profesionales, estrategias SEO y campañas de marketing digital orientadas a resultados. No vendemos páginas web: construimos activos de negocio.',
      'hero.cta.wa': 'Hablar por WhatsApp',
      'hero.cta.services': 'Ver servicios',
      'stats.traffic': 'Más tráfico orgánico de media',
      'stats.conversions': 'Más conversiones con buen diseño',
      'stats.response': 'Tiempo de respuesta máximo',
      'stats.delivery': 'Proyectos entregados a tiempo',
      'services.label': 'Qué hacemos',
      'services.title': 'Servicios diseñados para crecer',
      'services.subtitle':
        'Cada servicio está orientado a un objetivo claro: que tu negocio consiga más clientes.',
      'services.web.title': 'Desarrollo Web',
      'services.web.desc':
        'Webs rápidas, seguras y optimizadas para conversión. Diseñadas para transmitir profesionalidad y captar clientes desde el primer segundo.',
      'services.seo.title': 'SEO y Posicionamiento',
      'services.seo.desc':
        'Aparece en Google cuando tus clientes te buscan. Estrategias de posicionamiento local y nacional con resultados medibles y sostenidos.',
      'services.marketing.title': 'Marketing Digital',
      'services.marketing.desc':
        'Campañas de publicidad y estrategias de contenido que llevan tráfico cualificado a tu negocio. Sin gastar en quienes nunca van a comprarte.',
      'projects.label': 'Nuestro trabajo',
      'projects.title': 'Proyectos que generan resultados',
      'projects.subtitle':
        'Cada proyecto tiene un objetivo claro detrás. Aquí van algunos ejemplos.',
      'projects.p1.title': 'Plataforma de Eventos con Galería en Tiempo Real',
      'projects.p1.desc':
        'Sistema de subida de fotos con QR para invitados, galería en directo y descarga automática.',
      'projects.p1.result': '✓ +200 fotos gestionadas en tiempo real',
      'projects.p2.title': 'Tienda Online con Posicionamiento Local',
      'projects.p2.desc':
        'Desarrollo de tienda y estrategia SEO local para aumentar visitas orgánicas y pedidos.',
      'projects.p2.result': '✓ +65% de tráfico orgánico en 3 meses',
      'projects.p3.title': 'Web y Campañas para Empresa de Servicios',
      'projects.p3.desc':
        'Rediseño completo con nueva identidad, web de captación y campañas en Google y Meta.',
      'projects.p3.result': '✓ 3x más consultas desde la web en 60 días',
      'why.label': 'Por qué elegirnos',
      'why.title': 'Trabajamos como socios, no como proveedores',
      'why.subtitle':
        'Nos implicamos en tu negocio para entender qué necesitas realmente y darte soluciones que funcionen.',
      'why.w1.title': 'Entrega rápida y sin sorpresas',
      'why.w1.desc':
        'Plazos claros desde el inicio. Sin retrasos, sin costes ocultos.',
      'why.w2.title': 'Orientación a resultados medibles',
      'why.w2.desc':
        'Todo lo que hacemos tiene un KPI detrás. Sabrás exactamente qué está funcionando.',
      'why.w3.title': 'Soporte continuo post-entrega',
      'why.w3.desc':
        'No desaparecemos al entregar el proyecto. Estamos para lo que necesites.',
      'why.w4.title': 'Enfoque local y nacional',
      'why.w4.desc':
        'Conocemos el mercado español y sabemos cómo posicionarte en él.',
      'process.label': 'Cómo trabajamos',
      'process.title': 'Un proceso claro de principio a fin',
      'process.subtitle':
        'Sin tecnicismos ni reuniones interminables. Solo trabajo bien hecho.',
      'process.s1.title': 'Análisis inicial',
      'process.s1.desc':
        'Estudiamos tu negocio, tu competencia y tus objetivos antes de escribir una sola línea de código.',
      'process.s2.title': 'Propuesta y diseño',
      'process.s2.desc':
        'Presentamos una propuesta clara con presupuesto cerrado y primer diseño para tu aprobación.',
      'process.s3.title': 'Desarrollo',
      'process.s3.desc':
        'Construimos tu proyecto con tecnología moderna, optimizado para velocidad y SEO desde el inicio.',
      'process.s4.title': 'Lanzamiento',
      'process.s4.desc':
        'Publicamos, configuramos analíticas y te entregamos con formación para que gestiones tu web.',
      'contact.label': 'Contacto',
      'contact.title': '¿Empezamos a trabajar juntos?',
      'contact.desc':
        'Cuéntanos tu proyecto. Respondemos en menos de 24 horas con una propuesta inicial sin compromiso.',
      'contact.wa.title': 'WhatsApp directo',
      'contact.wa.desc': 'La forma más rápida de contactar',
      'contact.email.desc': 'Para consultas más detalladas',
      'form.title': 'Cuéntanos tu proyecto',
      'form.name': 'Nombre',
      'form.company': 'Empresa',
      'form.email': 'Email',
      'form.phone': 'Teléfono',
      'form.service': '¿Qué necesitas?',
      'form.message': 'Cuéntanos más',
      'form.submit': 'Enviar consulta →',
      'form.notice':
        'Sin spam. Respondemos en menos de 24 h en días laborables.',
      'form.success.title': '¡Mensaje recibido!',
      'form.success.desc':
        'Te contactaremos en menos de 24 horas. Si lo necesitas antes, escríbenos por WhatsApp.',
      'form.success.cta': 'Ir al WhatsApp',
      'form.placeholder.name': 'Tu nombre',
      'form.placeholder.company': 'Opcional',
      'form.placeholder.email': 'tu@email.com',
      'form.placeholder.phone': '+34 600 000 000',
      'form.placeholder.message':
        '¿Qué tienes en mente? Cuánto más detalle nos des, mejor podremos ayudarte.',
      'form.service.placeholder': 'Selecciona un servicio',
      'form.service.web': 'Desarrollo web',
      'form.service.seo': 'SEO y posicionamiento',
      'form.service.marketing': 'Marketing digital',
      'form.service.bundle': 'Paquete completo',
      'form.service.unsure': 'No lo tengo claro aún',
      'form.sending': 'Enviando…',
      'footer.tagline':
        'Agencia digital especializada en desarrollo web, SEO y marketing digital. Resultados reales para negocios reales.',
      'footer.copy': '© 2025 Torreodev. Todos los derechos reservados.',
      'footer.made': 'Hecho con 💛 en Extremadura'
    },

    en: {
      'hero.label': 'Digital agency · Real results',
      'hero.title':
        'Your digital presence that <em>works</em><br>while you rest',
      'hero.desc':
        "We build professional websites, SEO strategies and digital marketing campaigns focused on results. We don't sell web pages: we build business assets.",
      'hero.cta.wa': 'Chat on WhatsApp',
      'hero.cta.services': 'See services',
      'stats.traffic': 'More organic traffic on average',
      'stats.conversions': 'More conversions with great design',
      'stats.response': 'Maximum response time',
      'stats.delivery': 'Projects delivered on time',
      'services.label': 'What we do',
      'services.title': 'Services built to grow',
      'services.subtitle':
        'Each service has a clear goal: getting your business more clients.',
      'services.web.title': 'Web Development',
      'services.web.desc':
        'Fast, secure and conversion-optimised websites. Designed to project professionalism and attract clients from the very first second.',
      'services.seo.title': 'SEO & Positioning',
      'services.seo.desc':
        'Show up on Google when your clients are searching. Local and national positioning strategies with measurable, sustained results.',
      'services.marketing.title': 'Digital Marketing',
      'services.marketing.desc':
        'Advertising campaigns and content strategies that bring qualified traffic to your business. No wasted spend on people who will never buy.',
      'projects.label': 'Our work',
      'projects.title': 'Projects that deliver results',
      'projects.subtitle':
        'Every project has a clear goal behind it. Here are some examples.',
      'projects.p1.title': 'Event Platform with Real-Time Gallery',
      'projects.p1.desc':
        'QR-based photo upload system for guests, live gallery and automatic download.',
      'projects.p1.result': '✓ +200 photos managed in real time',
      'projects.p2.title': 'Online Store with Local SEO',
      'projects.p2.desc':
        'E-commerce development and local SEO strategy to increase organic visits and orders.',
      'projects.p2.result': '✓ +65% organic traffic in 3 months',
      'projects.p3.title': 'Website & Campaigns for a Service Business',
      'projects.p3.desc':
        'Full redesign with new identity, lead-generation website and Google & Meta campaigns.',
      'projects.p3.result': '✓ 3x more enquiries from the website in 60 days',
      'why.label': 'Why choose us',
      'why.title': 'We work as partners, not vendors',
      'why.subtitle':
        'We get involved in your business to understand what you truly need and deliver solutions that work.',
      'why.w1.title': 'Fast delivery, no surprises',
      'why.w1.desc':
        'Clear deadlines from the start. No delays, no hidden costs.',
      'why.w2.title': 'Focused on measurable results',
      'why.w2.desc':
        "Everything we do has a KPI behind it. You'll know exactly what's working.",
      'why.w3.title': 'Ongoing post-delivery support',
      'why.w3.desc':
        "We don't disappear after handing over the project. We're here whenever you need us.",
      'why.w4.title': 'Local and national focus',
      'why.w4.desc':
        'We know the Spanish market and how to position you within it.',
      'process.label': 'How we work',
      'process.title': 'A clear process from start to finish',
      'process.subtitle':
        'No jargon, no endless meetings. Just work done right.',
      'process.s1.title': 'Initial analysis',
      'process.s1.desc':
        'We study your business, your competition and your goals before writing a single line of code.',
      'process.s2.title': 'Proposal & design',
      'process.s2.desc':
        'We present a clear proposal with a fixed budget and an initial design for your approval.',
      'process.s3.title': 'Development',
      'process.s3.desc':
        'We build your project with modern technology, optimised for speed and SEO from the ground up.',
      'process.s4.title': 'Launch',
      'process.s4.desc':
        'We publish, set up analytics and hand over with training so you can manage your website.',
      'contact.label': 'Contact',
      'contact.title': 'Ready to work together?',
      'contact.desc':
        'Tell us about your project. We reply within 24 hours with an initial proposal, no commitment needed.',
      'contact.wa.title': 'Direct WhatsApp',
      'contact.wa.desc': 'The fastest way to reach us',
      'contact.email.desc': 'For more detailed enquiries',
      'form.title': 'Tell us about your project',
      'form.name': 'Name',
      'form.company': 'Company',
      'form.email': 'Email',
      'form.phone': 'Phone',
      'form.service': 'What do you need?',
      'form.message': 'Tell us more',
      'form.submit': 'Send enquiry →',
      'form.notice': 'No spam. We reply within 24 h on business days.',
      'form.success.title': 'Message received!',
      'form.success.desc':
        "We'll get back to you within 24 hours. If you need us sooner, message us on WhatsApp.",
      'form.success.cta': 'Go to WhatsApp',
      'form.placeholder.name': 'Your name',
      'form.placeholder.company': 'Optional',
      'form.placeholder.email': 'you@email.com',
      'form.placeholder.phone': '+34 600 000 000',
      'form.placeholder.message':
        'What do you have in mind? The more detail you give us, the better we can help.',
      'form.service.placeholder': 'Select a service',
      'form.service.web': 'Web development',
      'form.service.seo': 'SEO & positioning',
      'form.service.marketing': 'Digital marketing',
      'form.service.bundle': 'Full package',
      'form.service.unsure': 'Not sure yet',
      'form.sending': 'Sending…',
      'footer.tagline':
        'Digital agency specialising in web development, SEO and digital marketing. Real results for real businesses.',
      'footer.copy': '© 2025 Torreodev. All rights reserved.',
      'footer.made': 'Made with 💛 in Extremadura'
    },

    pl: {
      'hero.label': 'Agencja cyfrowa · Realne wyniki',
      'hero.title':
        'Twoja obecność w sieci, która <em>pracuje</em><br>kiedy ty odpoczywasz',
      'hero.desc':
        'Tworzymy profesjonalne strony internetowe, strategie SEO i kampanie marketingu cyfrowego nastawione na wyniki. Nie sprzedajemy stron — budujemy aktywa biznesowe.',
      'hero.cta.wa': 'Napisz na WhatsApp',
      'hero.cta.services': 'Zobacz usługi',
      'stats.traffic': 'Więcej ruchu organicznego średnio',
      'stats.conversions': 'Więcej konwersji dzięki dobremu projektowi',
      'stats.response': 'Maksymalny czas odpowiedzi',
      'stats.delivery': 'Projektów dostarczonych na czas',
      'services.label': 'Co robimy',
      'services.title': 'Usługi zaprojektowane, by rosnąć',
      'services.subtitle':
        'Każda usługa ma jeden jasny cel: więcej klientów dla Twojego biznesu.',
      'services.web.title': 'Tworzenie stron www',
      'services.web.desc':
        'Szybkie, bezpieczne i zoptymalizowane pod kątem konwersji strony internetowe. Zaprojektowane, by budować profesjonalny wizerunek i pozyskiwać klientów od pierwszej sekundy.',
      'services.seo.title': 'SEO i pozycjonowanie',
      'services.seo.desc':
        'Pojawiaj się w Google, gdy Twoi klienci szukają tego, co oferujesz. Strategie pozycjonowania lokalnego i krajowego z mierzalnymi i trwałymi efektami.',
      'services.marketing.title': 'Marketing cyfrowy',
      'services.marketing.desc':
        'Kampanie reklamowe i strategie contentowe, które przyciągają wartościowy ruch do Twojego biznesu. Bez marnowania budżetu na osoby, które nigdy nie kupią.',
      'projects.label': 'Nasze realizacje',
      'projects.title': 'Projekty, które generują wyniki',
      'projects.subtitle':
        'Za każdym projektem stoi konkretny cel. Oto kilka przykładów.',
      'projects.p1.title': 'Platforma eventowa z galerią w czasie rzeczywistym',
      'projects.p1.desc':
        'System przesyłania zdjęć przez QR dla gości, galeria na żywo i automatyczne pobieranie.',
      'projects.p1.result': '✓ +200 zdjęć obsłużonych w czasie rzeczywistym',
      'projects.p2.title': 'Sklep internetowy z lokalnym SEO',
      'projects.p2.desc':
        'Wdrożenie sklepu i lokalna strategia SEO w celu zwiększenia ruchu organicznego i zamówień.',
      'projects.p2.result': '✓ +65% ruchu organicznego w 3 miesiące',
      'projects.p3.title': 'Strona i kampanie dla firmy usługowej',
      'projects.p3.desc':
        'Kompleksowy redesign z nową identyfikacją, strona pozyskująca leady oraz kampanie w Google i Meta.',
      'projects.p3.result': '✓ 3x więcej zapytań ze strony w 60 dni',
      'why.label': 'Dlaczego my',
      'why.title': 'Pracujemy jak partnerzy, nie jak dostawcy',
      'why.subtitle':
        'Angażujemy się w Twój biznes, by zrozumieć, czego naprawdę potrzebujesz i dostarczyć rozwiązania, które działają.',
      'why.w1.title': 'Szybka realizacja bez niespodzianek',
      'why.w1.desc':
        'Jasne terminy od początku. Bez opóźnień, bez ukrytych kosztów.',
      'why.w2.title': 'Nastawienie na mierzalne wyniki',
      'why.w2.desc':
        'Wszystko, co robimy, ma swój KPI. Będziesz dokładnie wiedzieć, co działa.',
      'why.w3.title': 'Wsparcie po wdrożeniu',
      'why.w3.desc':
        'Nie znikamy po oddaniu projektu. Jesteśmy, kiedy nas potrzebujesz.',
      'why.w4.title': 'Zasięg lokalny i krajowy',
      'why.w4.desc':
        'Znamy rynek hiszpański i wiemy, jak się na nim pozycjonować.',
      'process.label': 'Jak pracujemy',
      'process.title': 'Przejrzysty proces od początku do końca',
      'process.subtitle':
        'Bez technicznego żargonu i niekończących się spotkań. Po prostu dobra robota.',
      'process.s1.title': 'Analiza wstępna',
      'process.s1.desc':
        'Badamy Twój biznes, konkurencję i cele, zanim napiszemy choćby jedną linię kodu.',
      'process.s2.title': 'Oferta i projekt graficzny',
      'process.s2.desc':
        'Przedstawiamy przejrzystą ofertę ze stałą ceną i wstępny projekt do Twojej akceptacji.',
      'process.s3.title': 'Realizacja',
      'process.s3.desc':
        'Budujemy projekt w nowoczesnych technologiach, zoptymalizowany pod szybkość i SEO od samego początku.',
      'process.s4.title': 'Wdrożenie',
      'process.s4.desc':
        'Publikujemy, konfigurujemy analitykę i przekazujemy projekt ze szkoleniem, abyś mógł zarządzać swoją stroną.',
      'contact.label': 'Kontakt',
      'contact.title': 'Zaczynamy współpracę?',
      'contact.desc':
        'Opowiedz nam o swoim projekcie. Odpowiadamy w ciągu 24 godzin z wstępną propozycją, bez żadnych zobowiązań.',
      'contact.wa.title': 'WhatsApp — kontakt bezpośredni',
      'contact.wa.desc': 'Najszybszy sposób, żeby się z nami skontaktować',
      'contact.email.desc': 'Do bardziej szczegółowych zapytań',
      'form.title': 'Opowiedz nam o projekcie',
      'form.name': 'Imię i nazwisko',
      'form.company': 'Firma',
      'form.email': 'E-mail',
      'form.phone': 'Telefon',
      'form.service': 'Czego potrzebujesz?',
      'form.message': 'Napisz więcej',
      'form.submit': 'Wyślij zapytanie →',
      'form.notice': 'Bez spamu. Odpowiadamy w ciągu 24 h w dni robocze.',
      'form.success.title': 'Wiadomość odebrana!',
      'form.success.desc':
        'Skontaktujemy się z Tobą w ciągu 24 godzin. Jeśli potrzebujesz szybciej, napisz na WhatsApp.',
      'form.success.cta': 'Przejdź do WhatsApp',
      'form.placeholder.name': 'Imię i nazwisko',
      'form.placeholder.company': 'Opcjonalnie',
      'form.placeholder.email': 'ty@email.com',
      'form.placeholder.phone': '+34 600 000 000',
      'form.placeholder.message':
        'Co masz na myśli? Im więcej szczegółów podasz, tym lepiej możemy Ci pomóc.',
      'form.service.placeholder': 'Wybierz usługę',
      'form.service.web': 'Tworzenie stron www',
      'form.service.seo': 'SEO i pozycjonowanie',
      'form.service.marketing': 'Marketing cyfrowy',
      'form.service.bundle': 'Pakiet kompletny',
      'form.service.unsure': 'Jeszcze nie wiem',
      'form.sending': 'Wysyłanie…',
      'footer.tagline':
        'Agencja cyfrowa specjalizująca się w tworzeniu stron www, SEO i marketingu cyfrowym. Realne wyniki dla prawdziwych biznesów.',
      'footer.copy': '© 2025 Torreodev. Wszelkie prawa zastrzeżone.',
      'footer.made': 'Stworzone z 💛 w Extremadurze'
    }
  }

  // Idiomas en los que el atributo lang del <html> cambia
  const LANG_ATTR = { es: 'es', en: 'en', pl: 'pl' }

  function applyLanguage(lang) {
    const dict = TRANSLATIONS[lang]
    if (!dict) return

    // Actualiza lang del documento (bueno para SEO y lectores de pantalla)
    document.documentElement.setAttribute('lang', LANG_ATTR[lang])
    document.documentElement.setAttribute('data-lang', lang)

    // Traduce todos los elementos marcados con data-i18n
    // Traduce contenido de texto (innerHTML)
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n')
      if (dict[key] === undefined) return
      // <option> y <input>/<textarea> con placeholder usan atributo, no innerHTML
      if (el.tagName === 'OPTION') {
        el.textContent = dict[key]
      } else if (el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', dict[key])
      } else {
        el.innerHTML = dict[key]
      }
    })

    // Actualiza botones del selector
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang)
    })

    // Persiste la elección del usuario
    try {
      localStorage.setItem('td_lang', lang)
    } catch (_) {}
  }

  // Lee el idioma guardado o usa español por defecto
  function getSavedLang() {
    try {
      return localStorage.getItem('td_lang') || 'es'
    } catch (_) {
      return 'es'
    }
  }

  // Conecta los botones
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () =>
      applyLanguage(btn.getAttribute('data-lang'))
    )
  })

  // Aplica idioma al cargar la página
  applyLanguage(getSavedLang())
})()
