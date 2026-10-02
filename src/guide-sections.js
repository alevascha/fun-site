// Guide article bodies, keyed by guide slug, in both languages (titles and
// descriptions are in guides.js). Kept separate so the bodies only load when
// a guide is opened. Also used for the prerendered HTML.
//
// Section blocks: { h } heading, { p } paragraph, { list: [] }, { code },
// { tip } callout. Inline `code` in text is rendered as <code>.

export const SECTIONS = {
  "fix-low-color-contrast": {
    "en": [
      {
        "p": "Low contrast is the most common accessibility issue on the web. It makes text hard to read for people with low vision, for anyone on a cheap screen or in sunlight, and for all of us as our eyes age. The good news: it is also the easiest one to measure and fix."
      },
      {
        "h": "The numbers you need"
      },
      {
        "p": "WCAG compares the relative luminance of two colors and gives a ratio between 1:1 (no contrast) and 21:1 (black on white)."
      },
      {
        "list": [
          "AA, normal text: at least 4.5:1",
          "AA, large text (24px, or 18.66px bold): at least 3:1",
          "AA, UI components and icons (borders, focus rings, input outlines): at least 3:1",
          "AAA, normal text: 7:1 · AAA, large text: 4.5:1"
        ]
      },
      {
        "p": "AA is the level most laws and procurement rules reference. Aim for AA everywhere and AAA for long-form reading."
      },
      {
        "h": "Why “make it darker” isn’t a plan"
      },
      {
        "p": "Darkening a brand color until it passes often turns a lively purple into a muddy one, and different designers darken by different amounts. The fix should change as little as possible and be repeatable."
      },
      {
        "h": "A reliable way to fix a failing pair"
      },
      {
        "list": [
          "Decide which side is allowed to move. Usually the text color moves and the background (your brand surface) stays.",
          "Keep the hue and saturation and change only the lightness. That keeps the color recognizably “yours”.",
          "Move lightness the minimum amount needed to reach the target ratio — in the direction that increases contrast.",
          "Check the other states too: hover, pressed and disabled colors are often forgotten."
        ]
      },
      {
        "tip": "The Contrast Checker does exactly this: it proposes the smallest lightness change for the text or the background, and you apply it with one click."
      },
      {
        "h": "Common traps"
      },
      {
        "list": [
          "Placeholder text in inputs: it is real text and needs 4.5:1 if it carries meaning (better: don’t use placeholders as labels).",
          "Text on images or gradients: check the lightest area behind the text, or add a scrim.",
          "Light gray “secondary” text: #999 on white is only 2.85:1. #767676 is the lightest gray that passes 4.5:1 on white.",
          "Hover states that lighten a button behind white text — contrast drops exactly when users interact."
        ]
      },
      {
        "h": "Contrast is necessary, not sufficient"
      },
      {
        "p": "Passing ratios won’t help someone who can’t tell your red error from your green success. Pair color with text or icons, and check your palette with a color-blindness simulator too."
      }
    ],
    "es": [
      {
        "p": "El bajo contraste es el problema de accesibilidad más común en la web. Dificulta la lectura a personas con baja visión, a cualquiera con una pantalla barata o bajo el sol, y a todos a medida que envejecemos. La buena noticia: también es el más fácil de medir y corregir."
      },
      {
        "h": "Los números que necesitas"
      },
      {
        "p": "WCAG compara la luminancia relativa de dos colores y da un ratio entre 1:1 (sin contraste) y 21:1 (negro sobre blanco)."
      },
      {
        "list": [
          "AA, texto normal: al menos 4.5:1",
          "AA, texto grande (24px, o 18.66px en negrita): al menos 3:1",
          "AA, componentes de interfaz e iconos (bordes, anillos de foco, contornos de campos): al menos 3:1",
          "AAA, texto normal: 7:1 · AAA, texto grande: 4.5:1"
        ]
      },
      {
        "p": "AA es el nivel que citan la mayoría de las leyes y normas de contratación. Apunta a AA en todo y a AAA para la lectura larga."
      },
      {
        "h": "Por qué “oscurecerlo” no es un plan"
      },
      {
        "p": "Oscurecer un color de marca hasta que pase suele convertir un morado vivo en uno apagado, y cada diseñador lo oscurece distinto. La corrección debe cambiar lo mínimo posible y ser repetible."
      },
      {
        "h": "Una forma confiable de corregir una combinación"
      },
      {
        "list": [
          "Decide qué lado puede moverse. Normalmente se mueve el color del texto y el fondo (tu superficie de marca) se queda.",
          "Mantén el tono y la saturación y cambia solo la luminosidad. Así el color sigue siendo reconociblemente “tuyo”.",
          "Mueve la luminosidad lo mínimo necesario para alcanzar el ratio objetivo, en la dirección que aumenta el contraste.",
          "Revisa también los otros estados: hover, presionado y deshabilitado suelen olvidarse."
        ]
      },
      {
        "tip": "El Verificador de contraste hace exactamente esto: propone el menor cambio de luminosidad para el texto o el fondo, y lo aplicas con un clic."
      },
      {
        "h": "Trampas comunes"
      },
      {
        "list": [
          "El texto de ejemplo (placeholder) en los campos: es texto real y necesita 4.5:1 si transmite información (mejor: no uses placeholders como etiquetas).",
          "Texto sobre imágenes o degradados: revisa la zona más clara detrás del texto, o añade una capa oscura.",
          "Texto gris “secundario”: #999 sobre blanco da solo 2.85:1. #767676 es el gris más claro que pasa 4.5:1 sobre blanco.",
          "Estados hover que aclaran un botón detrás de texto blanco: el contraste baja justo cuando la persona interactúa."
        ]
      },
      {
        "h": "El contraste es necesario, pero no suficiente"
      },
      {
        "p": "Pasar los ratios no ayuda a quien no distingue tu rojo de error de tu verde de éxito. Acompaña el color con texto o iconos, y revisa tu paleta también con un simulador de daltonismo."
      }
    ]
  },
  "fluid-typography-with-clamp": {
    "en": [
      {
        "p": "Breakpoint typography jumps: 32px on a phone, then suddenly 48px at 768px. Fluid typography grows smoothly with the viewport instead, so every screen width gets a size that fits — with less CSS."
      },
      {
        "h": "The building block: clamp()"
      },
      {
        "code": "font-size: clamp(2rem, 1.5rem + 2.5vw, 3rem);"
      },
      {
        "p": "clamp(minimum, preferred, maximum) never goes below the minimum or above the maximum, and in between follows the preferred value. The preferred part is a straight line: a fixed rem amount plus a share of the viewport width."
      },
      {
        "h": "The math, once"
      },
      {
        "p": "Pick a size at a small viewport (say 32px at 360px) and at a large one (48px at 1280px). The slope is (48 − 32) / (1280 − 360) ≈ 0.0174, which is 1.74vw. The intercept is 32 − 0.0174 × 360 ≈ 25.7px ≈ 1.61rem. So:"
      },
      {
        "code": "font-size: clamp(2rem, 1.61rem + 1.74vw, 3rem);"
      },
      {
        "tip": "The Type Scale Generator does this math for every step of your scale, with a different base and ratio for mobile and desktop."
      },
      {
        "h": "Scale the ratio, not just the size"
      },
      {
        "p": "Headings need more contrast with body text on a big screen than on a phone. A good pattern: use a tighter ratio on mobile (like 1.2) and a bolder one on desktop (like 1.333). Small steps barely change, while display sizes grow a lot."
      },
      {
        "h": "Keep it accessible"
      },
      {
        "list": [
          "Always include a rem part in the preferred value. Pure vw values ignore the user’s font-size setting, and zooming stops working (WCAG 1.4.4).",
          "Use rem for the minimum and maximum, never px, for the same reason.",
          "Tighten line-height as size grows: around 1.5 for body, 1.1–1.2 for large headings.",
          "Test at 200% zoom: text should still grow."
        ]
      },
      {
        "h": "Turn it into tokens"
      },
      {
        "p": "Store each step as a custom property (--text-sm, --text-base, --text-xl…) or as design tokens, so designers and developers talk about the same sizes. The generator exports both."
      }
    ],
    "es": [
      {
        "p": "La tipografía por breakpoints salta: 32px en un teléfono y de pronto 48px a partir de 768px. La tipografía fluida crece suavemente con el ancho de la pantalla, así que cada tamaño de pantalla recibe una medida que encaja, con menos CSS."
      },
      {
        "h": "La pieza clave: clamp()"
      },
      {
        "code": "font-size: clamp(2rem, 1.5rem + 2.5vw, 3rem);"
      },
      {
        "p": "clamp(mínimo, preferido, máximo) nunca baja del mínimo ni sube del máximo, y entre ambos sigue el valor preferido. La parte preferida es una línea recta: una cantidad fija en rem más una fracción del ancho de la pantalla."
      },
      {
        "h": "El cálculo, una sola vez"
      },
      {
        "p": "Elige un tamaño para una pantalla pequeña (por ejemplo 32px a 360px) y otro para una grande (48px a 1280px). La pendiente es (48 − 32) / (1280 − 360) ≈ 0.0174, es decir, 1.74vw. La ordenada es 32 − 0.0174 × 360 ≈ 25.7px ≈ 1.61rem. Entonces:"
      },
      {
        "code": "font-size: clamp(2rem, 1.61rem + 1.74vw, 3rem);"
      },
      {
        "tip": "El Generador de escala tipográfica hace este cálculo para cada paso de tu escala, con base y proporción distintas para móvil y escritorio."
      },
      {
        "h": "Escala la proporción, no solo el tamaño"
      },
      {
        "p": "Los títulos necesitan más diferencia con el texto en una pantalla grande que en un teléfono. Un buen patrón: una proporción más compacta en móvil (como 1.2) y una más marcada en escritorio (como 1.333). Los pasos pequeños casi no cambian y los tamaños grandes crecen mucho."
      },
      {
        "h": "Mantenla accesible"
      },
      {
        "list": [
          "Incluye siempre una parte en rem en el valor preferido. Los valores solo en vw ignoran el tamaño de letra que configuró la persona y el zoom deja de funcionar (WCAG 1.4.4).",
          "Usa rem para el mínimo y el máximo, nunca px, por la misma razón.",
          "Reduce el interlineado a medida que crece el tamaño: alrededor de 1.5 para el texto, 1.1–1.2 para títulos grandes.",
          "Prueba con zoom al 200%: el texto debe seguir creciendo."
        ]
      },
      {
        "h": "Conviértela en tokens"
      },
      {
        "p": "Guarda cada paso como una variable CSS (--text-sm, --text-base, --text-xl…) o como design tokens, para que diseño y desarrollo hablen de los mismos tamaños. El generador exporta ambos."
      }
    ]
  },
  "figma-variables-to-tailwind-v4": {
    "en": [
      {
        "p": "Design tokens are the shared names for your design decisions: color.brand.500, space.md, radius.pill. Keeping them in sync between Figma and code is where most design systems drift. Here is a workflow that keeps one source of truth."
      },
      {
        "h": "1. Structure your Variables for code"
      },
      {
        "list": [
          "Primitives collection: raw values (violet/500, gray/900, space/4). One mode.",
          "Semantic collection: meaning, not value (surface, text, accent, border). Modes for Light and Dark, each aliasing a primitive.",
          "Name with slashes in Figma (color/brand/500). They become dots or dashes in code."
        ]
      },
      {
        "h": "2. Export"
      },
      {
        "p": "Use a Variables export that preserves aliases and modes — either a plugin that writes the W3C Design Tokens format or one that exports collections and modes as JSON. Aliases matter: if surface points to paper/50, code should say so instead of copying the hex value."
      },
      {
        "h": "3. Know the W3C format"
      },
      {
        "code": "{\n  \"color\": {\n    \"$type\": \"color\",\n    \"brand\": { \"500\": { \"$value\": \"#8B6CF0\" } },\n    \"action\": { \"primary\": { \"$value\": \"{color.brand.500}\" } }\n  }\n}"
      },
      {
        "p": "Each token has a $value and a $type (which can be inherited from its group). Aliases are written as {group.token}."
      },
      {
        "h": "4. Generate Tailwind v4 and CSS"
      },
      {
        "p": "Tailwind v4 is configured in CSS with an @theme block. Namespaces decide which utilities exist: --color-* creates bg-*, text-* and border-* colors, --spacing-* feeds padding and margin, --radius-* feeds rounded-*, --text-* sets font sizes."
      },
      {
        "code": "@import \"tailwindcss\";\n\n@theme {\n  --color-brand-500: #8B6CF0;\n  --color-action-primary: #8B6CF0;\n  --spacing-md: 16px;\n  --radius-pill: 999px;\n}"
      },
      {
        "tip": "The Design Token Converter reads W3C, Tokens Studio and Figma Variables exports, lets you pick a mode, keeps aliases as var() references where the format allows, and writes Tailwind v4, CSS, SCSS or SwiftUI."
      },
      {
        "h": "5. Light and dark modes"
      },
      {
        "p": "Generate one CSS block per mode and switch with a data attribute: :root for light and [data-theme=\"dark\"] for dark. Because components use semantic names (surface, text), nothing else changes."
      },
      {
        "h": "Keep it in sync"
      },
      {
        "p": "Treat the token file as code: commit it, review changes in pull requests, and regenerate outputs in CI. Designers change Variables, export, and a pull request shows exactly which tokens moved."
      }
    ],
    "es": [
      {
        "p": "Los design tokens son los nombres compartidos de tus decisiones de diseño: color.brand.500, space.md, radius.pill. Mantenerlos sincronizados entre Figma y el código es donde más se desvían los design systems. Este es un flujo que mantiene una sola fuente de verdad."
      },
      {
        "h": "1. Estructura tus Variables pensando en código"
      },
      {
        "list": [
          "Colección de primitivos: valores crudos (violet/500, gray/900, space/4). Un solo modo.",
          "Colección semántica: significado, no valor (surface, text, accent, border). Modos Claro y Oscuro, cada uno apuntando a un primitivo.",
          "Nombra con barras en Figma (color/brand/500). En código se convierten en puntos o guiones."
        ]
      },
      {
        "h": "2. Exporta"
      },
      {
        "p": "Usa una exportación de Variables que conserve alias y modos: un plugin que escriba el formato de Design Tokens del W3C o uno que exporte colecciones y modos como JSON. Los alias importan: si surface apunta a paper/50, el código debería decirlo en vez de copiar el hexadecimal."
      },
      {
        "h": "3. Conoce el formato del W3C"
      },
      {
        "code": "{\n  \"color\": {\n    \"$type\": \"color\",\n    \"brand\": { \"500\": { \"$value\": \"#8B6CF0\" } },\n    \"action\": { \"primary\": { \"$value\": \"{color.brand.500}\" } }\n  }\n}"
      },
      {
        "p": "Cada token tiene un $value y un $type (que puede heredarse de su grupo). Los alias se escriben como {grupo.token}."
      },
      {
        "h": "4. Genera Tailwind v4 y CSS"
      },
      {
        "p": "Tailwind v4 se configura en CSS con un bloque @theme. Los espacios de nombres deciden qué utilidades existen: --color-* crea colores para bg-*, text-* y border-*, --spacing-* alimenta padding y margin, --radius-* alimenta rounded-* y --text-* define tamaños de letra."
      },
      {
        "code": "@import \"tailwindcss\";\n\n@theme {\n  --color-brand-500: #8B6CF0;\n  --color-action-primary: #8B6CF0;\n  --spacing-md: 16px;\n  --radius-pill: 999px;\n}"
      },
      {
        "tip": "El Convertidor de design tokens lee exportaciones W3C, Tokens Studio y Variables de Figma, te deja elegir un modo, mantiene los alias como referencias var() cuando el formato lo permite y escribe Tailwind v4, CSS, SCSS o SwiftUI."
      },
      {
        "h": "5. Modos claro y oscuro"
      },
      {
        "p": "Genera un bloque CSS por modo y cambia con un atributo: :root para claro y [data-theme=\"dark\"] para oscuro. Como los componentes usan nombres semánticos (surface, text), nada más cambia."
      },
      {
        "h": "Mantenlo sincronizado"
      },
      {
        "p": "Trata el archivo de tokens como código: guárdalo en el repositorio, revisa los cambios en pull requests y regenera las salidas en CI. El equipo de diseño cambia las Variables, exporta, y un pull request muestra exactamente qué tokens cambiaron."
      }
    ]
  },
  "design-for-translation": {
    "en": [
      {
        "p": "A button that reads “Save” in English becomes “Speichern” in German and “Guardar cambios” in Spanish. If your layout was designed around the English length, translation breaks it — usually after launch, in a market you can’t easily test."
      },
      {
        "h": "How much does text grow?"
      },
      {
        "p": "Short strings grow the most. IBM’s long-standing guidance: strings up to 10 characters can grow 100–200%, 11–20 characters around 80–100%, and paragraphs over 70 characters about 30%. German averages roughly 30% longer than English; Spanish and French around 15–25%."
      },
      {
        "h": "The CSS that breaks"
      },
      {
        "list": [
          "Fixed widths on buttons, tabs, labels and badges (width: 120px).",
          "white-space: nowrap combined with overflow: hidden, which silently cuts text off.",
          "Nav bars that assume every item fits on one line.",
          "Table headers with fixed column widths.",
          "Building sentences from pieces (“You have ” + n + “ items”) — word order changes between languages."
        ]
      },
      {
        "h": "Resilient alternatives"
      },
      {
        "list": [
          "min-width instead of width, and allow buttons to grow taller (min-height, line-height ~1.2).",
          "flex-wrap on navs and action rows; horizontally scrollable tab bars instead of squeezed tabs.",
          "overflow-wrap: anywhere plus hyphens: auto with the correct lang attribute, so long German compounds break cleanly.",
          "Stack labels above fields when space runs out instead of giving labels a fixed width.",
          "Truncate with an ellipsis only for user data (names, file names) — and expose the full text."
        ]
      },
      {
        "tip": "The Text Expansion Stress Test shows a sample UI in English, German, Spanish and pseudo-localized text, flags every clipped element, and lets you compare fragile and resilient CSS side by side."
      },
      {
        "h": "Catch it early with pseudo-localization"
      },
      {
        "p": "Before translations exist, replace English with accented, padded and bracketed text: “Save” becomes “⟦Šáṽé lorem⟧”. Clipped brackets reveal truncation, unaccented text reveals hard-coded strings, and the padding simulates expansion. Run it in your design reviews and visual tests."
      },
      {
        "h": "Don’t forget"
      },
      {
        "list": [
          "Dates, numbers and currencies change format by locale — use Intl.DateTimeFormat and Intl.NumberFormat.",
          "Right-to-left languages mirror the layout; use logical properties (margin-inline-start) from day one.",
          "Set the lang attribute on the page (and on any mixed-language fragment) so screen readers pronounce text correctly."
        ]
      }
    ],
    "es": [
      {
        "p": "Un botón que dice “Save” en inglés se convierte en “Speichern” en alemán y “Guardar cambios” en español. Si tu diseño se pensó para la longitud del inglés, la traducción lo rompe, normalmente después del lanzamiento y en un mercado que no puedes probar fácilmente."
      },
      {
        "h": "¿Cuánto crece el texto?"
      },
      {
        "p": "Los textos cortos son los que más crecen. La pauta clásica de IBM: los textos de hasta 10 caracteres pueden crecer entre 100 y 200%, los de 11 a 20 caracteres alrededor de 80–100%, y los párrafos de más de 70 caracteres cerca de un 30%. El alemán es en promedio un 30% más largo que el inglés; el español y el francés, alrededor de 15–25%."
      },
      {
        "h": "El CSS que se rompe"
      },
      {
        "list": [
          "Anchos fijos en botones, pestañas, etiquetas y badges (width: 120px).",
          "white-space: nowrap combinado con overflow: hidden, que corta el texto sin avisar.",
          "Barras de navegación que asumen que todo cabe en una línea.",
          "Encabezados de tabla con anchos de columna fijos.",
          "Armar frases por partes (“You have ” + n + “ items”): el orden de las palabras cambia entre idiomas."
        ]
      },
      {
        "h": "Alternativas resistentes"
      },
      {
        "list": [
          "min-width en vez de width, y permite que los botones crezcan en alto (min-height, line-height ~1.2).",
          "flex-wrap en navegaciones y filas de acciones; barras de pestañas con scroll horizontal en vez de pestañas apretadas.",
          "overflow-wrap: anywhere y hyphens: auto con el atributo lang correcto, para que las palabras compuestas largas del alemán se corten bien.",
          "Coloca las etiquetas encima de los campos cuando falte espacio, en vez de darles un ancho fijo.",
          "Usa puntos suspensivos solo para datos del usuario (nombres, archivos) y muestra el texto completo."
        ]
      },
      {
        "tip": "La Prueba de expansión de texto muestra una interfaz de ejemplo en inglés, alemán, español y pseudotraducción, marca cada elemento recortado y te deja comparar CSS frágil y resistente lado a lado."
      },
      {
        "h": "Detéctalo a tiempo con pseudolocalización"
      },
      {
        "p": "Antes de tener traducciones, reemplaza el inglés por texto con acentos, relleno y corchetes: “Save” se convierte en “⟦Šáṽé lorem⟧”. Los corchetes cortados revelan recortes, el texto sin acentos revela textos fijos en el código y el relleno simula la expansión. Úsalo en tus revisiones de diseño y pruebas visuales."
      },
      {
        "h": "No olvides"
      },
      {
        "list": [
          "Fechas, números y monedas cambian de formato según el idioma: usa Intl.DateTimeFormat e Intl.NumberFormat.",
          "Los idiomas de derecha a izquierda invierten el diseño; usa propiedades lógicas (margin-inline-start) desde el principio.",
          "Define el atributo lang en la página (y en cualquier fragmento en otro idioma) para que los lectores de pantalla pronuncien bien."
        ]
      }
    ]
  }
};
