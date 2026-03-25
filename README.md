# Torreodev — Guía de configuración

## Estructura de archivos

```
torreodev/
├── index.html          ← HTML principal
├── css/
│   └── styles.css      ← Todo el CSS
├── js/
│   └── main.js         ← Todo el JavaScript
├── img/                ← (crear esta carpeta)
│   ├── favicon.svg
│   └── og-image.jpg    ← Imagen para redes sociales (1200×630px)
└── README.md
```

---

## ⚙️ Configuración del formulario (Formspree)

1. Ve a **https://formspree.io** y crea una cuenta gratuita
2. Crea un nuevo formulario y copia tu **endpoint** (algo como `https://formspree.io/f/xabcdefg`)
3. Abre `js/main.js` y busca esta línea:
   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/TU_ID_AQUI';
   ```
4. Sustituye `TU_ID_AQUI` por el ID de tu formulario

El plan gratuito de Formspree incluye **50 envíos al mes**. Para más, hay planes de pago.

---

## 🛡️ Anti-spam implementado

El formulario tiene tres capas de protección:

| Capa | Qué hace |
|------|----------|
| **Honeypot** | Campo oculto invisible para humanos. Si un bot lo rellena, el envío se silencia sin dar pistas |
| **Tiempo mínimo** | Si el formulario se envía en menos de 4 segundos, se rechaza. Un humano tarda más |
| **Rate limit** | Máximo 3 envíos por sesión de pestaña, evitando envíos masivos desde el navegador |

Formspree también tiene su propio sistema anti-spam en el servidor.

---

## 🔍 SEO implementado

### Meta tags
- `<title>` con ciudad y servicios clave
- `<meta name="description">` descriptivo y con CTA implícito
- `<meta name="keywords">` con términos locales
- `<link rel="canonical">` para evitar contenido duplicado

### Open Graph (redes sociales)
- Cuando alguien comparta el enlace en WhatsApp, LinkedIn, etc., se mostrará:
  - Título, descripción e imagen de previsualización
- Cambia la URL de `og:image` por una imagen real de 1200×630px

### Schema.org (datos estructurados)
- Google puede mostrar tu nombre, teléfono y dirección en los resultados
- Edita el bloque `<script type="application/ld+json">` con tus datos reales

### SEO semántico
- Uso correcto de `<h1>`, `<h2>`, `<h3>` en jerarquía
- Uso de `<article>`, `<section>`, `<nav>`, `<footer>` semánticos
- Atributos `aria-label` y `role` para accesibilidad (Google lo valora)
- Imágenes con `alt` (añadir cuando pongas fotos reales)

---

## 📝 Personalización pendiente

- [ ] Sustituir `34600000000` por tu número de WhatsApp real
- [ ] Sustituir `hola@torreodev.com` por tu email real
- [ ] Configurar el endpoint de Formspree en `js/main.js`
- [ ] Crear `img/og-image.jpg` (1200×630px) para redes sociales
- [ ] Actualizar `<link rel="canonical">` con tu dominio real
- [ ] Añadir imágenes reales de proyectos en las cards
- [ ] Actualizar los datos del Schema.org (teléfono, email, ciudad)
- [ ] Actualizar `https://torreodev.com` por tu dominio real en todos los meta tags

---

## 🚀 Cuando escales a Node.js

Cuando crezcas y quieras tu propio backend, el proceso es simple:

1. Crear un servidor Express que reciba el `POST` del formulario
2. Usar **Nodemailer** para enviar el email desde tu propio servidor
3. Añadir **reCAPTCHA v3** de Google (invisible para el usuario)
4. Guardar los contactos en una base de datos (MongoDB o PostgreSQL)

Solo tendrás que cambiar `FORMSPREE_ENDPOINT` en `main.js` por la URL de tu propio endpoint.
