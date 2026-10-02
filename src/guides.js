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
      "title": "From Figma Variables to Tailwind v4 (and CSS) without losing aliases",
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
      "description": "How much text grows when translated, the CSS patterns that break, and the resilient alternatives — with pseudo-localization to catch problems early."
    },
    "es": {
      "slug": "disenar-para-la-traduccion",
      "title": "Diseñar interfaces que sobrevivan a la traducción",
      "description": "Cuánto crece el texto al traducirlo, los patrones de CSS que se rompen y las alternativas resistentes, con pseudolocalización para detectar problemas a tiempo."
    }
  }
];

export const getGuide = slug => GUIDES.find(g => g.slug === slug);
export const getGuideByEsSlug = slug => GUIDES.find(g => g.es.slug === slug);
