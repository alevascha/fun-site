// Guide metadata (titles, slugs, dates). Article bodies live in
// guide-sections.js so they only load when a guide is opened.

export const GUIDES = [
  {
    "slug": "fix-low-color-contrast",
    "tool": "contrast-checker",
    "date": "2026-10-02",
    "minutes": 5,
    "en": {
      "title": "How to fix low color contrast (WCAG 2.2)",
      "description": "What the WCAG contrast ratios mean, why “just make it darker” often breaks your brand, and a reliable way to fix failing color pairs."
    },
    "es": {
      "slug": "corregir-bajo-contraste",
      "title": "Cómo corregir el bajo contraste de color (WCAG 2.2)",
      "description": "Qué significan los ratios de contraste de WCAG, por qué “oscurecerlo” suele romper tu marca y una forma confiable de corregir combinaciones que fallan."
    }
  },
  {
    "slug": "fluid-typography-with-clamp",
    "tool": "type-scale",
    "date": "2026-10-02",
    "minutes": 6,
    "en": {
      "title": "Fluid typography with CSS clamp(): a practical guide",
      "description": "How to make font sizes grow smoothly between mobile and desktop with clamp(), how the math works, and how to keep it accessible."
    },
    "es": {
      "slug": "tipografia-fluida-con-clamp",
      "title": "Tipografía fluida con CSS clamp(): guía práctica",
      "description": "Cómo hacer que los tamaños de letra crezcan suavemente entre móvil y escritorio con clamp(), cómo funciona el cálculo y cómo mantenerlo accesible."
    }
  },
  {
    "slug": "figma-variables-to-tailwind-v4",
    "tool": "token-converter",
    "date": "2026-10-02",
    "minutes": 6,
    "en": {
      "title": "Figma Variables to Tailwind v4 and CSS, aliases intact",
      "description": "How to export Figma Variables, what the W3C design token format looks like, and how to turn tokens into a Tailwind v4 @theme and CSS variables."
    },
    "es": {
      "slug": "variables-de-figma-a-tailwind-v4",
      "title": "De Variables de Figma a Tailwind v4 (y CSS) sin perder los alias",
      "description": "Cómo exportar Variables de Figma, cómo es el formato de design tokens del W3C y cómo convertir tokens en un @theme de Tailwind v4 y variables CSS."
    }
  },
  {
    "slug": "design-for-translation",
    "tool": "text-expansion",
    "date": "2026-10-02",
    "minutes": 5,
    "en": {
      "title": "Designing UI that survives translation",
      "description": "How much text grows when translated, the CSS patterns that break, and the resilient alternatives - with pseudo-localization to catch problems early."
    },
    "es": {
      "slug": "disenar-para-la-traduccion",
      "title": "Diseñar interfaces que sobrevivan a la traducción",
      "description": "Cuánto crece el texto al traducirlo, los patrones de CSS que se rompen y las alternativas resistentes, con pseudolocalización para detectar problemas a tiempo."
    }
  },
  {
    "slug": "figma-font-tokens-to-css-variables",
    "tool": "token-converter",
    "date": "2026-10-14",
    "minutes": 5,
    "en": {
      "title": "How to export font tokens from Figma to CSS variables",
      "description": "Turn the typography in your Figma file (font families, sizes, weights and line heights) into design tokens and clean CSS custom properties, step by step."
    },
    "es": {
      "slug": "tokens-de-tipografia-de-figma-a-css",
      "title": "Cómo exportar tokens de tipografía de Figma a variables CSS",
      "description": "Convierte la tipografía de tu archivo de Figma (familias, tamaños, pesos e interlineado) en design tokens y variables CSS limpias, paso a paso."
    }
  },
  {
    "slug": "color-matching-game",
    "tool": "hue-hunt",
    "date": "2026-10-14",
    "minutes": 4,
    "en": {
      "title": "Color matching game: how to train your eye for color",
      "description": "Why matching colors by eye is hard, the hue, saturation and lightness method designers use, and a free daily color game to practice it."
    },
    "es": {
      "slug": "juego-para-igualar-colores",
      "title": "Juego para igualar colores: cómo entrenar tu ojo",
      "description": "Por qué cuesta igualar colores a ojo, el método de tono, saturación y luminosidad que usan los diseñadores y un juego diario gratis para practicarlo."
    }
  },
  {
    "slug": "kerning-by-eye",
    "tool": "kern-me",
    "date": "2026-10-16",
    "minutes": 5,
    "en": {
      "title": "Kerning by eye: how to space letters in headlines and logos",
      "description": "What kerning is, how it differs from tracking, which letter pairs cause trouble, and a practical way to kern headlines and logos in Figma and CSS."
    },
    "es": {
      "slug": "kerning-a-ojo",
      "title": "Kerning a ojo: cómo espaciar letras en titulares y logos",
      "description": "Qué es el kerning, en qué se diferencia del tracking, qué pares de letras dan problemas y una forma práctica de ajustar titulares y logos en Figma y CSS."
    }
  },
  {
    "slug": "keyboard-focus-order",
    "tool": "tab-order",
    "date": "2026-10-16",
    "minutes": 6,
    "en": {
      "title": "Keyboard focus order: designing the Tab sequence (WCAG 2.4.3)",
      "description": "What WCAG 2.4.3 asks for, the layouts that break focus order (grids, sidebars, dialogs, CSS reordering), and how to design and test the Tab sequence."
    },
    "es": {
      "slug": "orden-del-foco-con-teclado",
      "title": "Orden del foco con teclado: cómo diseñar la secuencia del Tab (WCAG 2.4.3)",
      "description": "Qué pide WCAG 2.4.3, los diseños que rompen el orden del foco (grillas, barras laterales, diálogos, reordenar con CSS) y cómo diseñar y probar la secuencia del Tab."
    }
  }
];

export const getGuide = slug => GUIDES.find(g => g.slug === slug);
export const getGuideByEsSlug = slug => GUIDES.find(g => g.es.slug === slug);
