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
          "Move lightness the minimum amount needed to reach the target ratio - in the direction that increases contrast.",
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
          "Hover states that lighten a button behind white text - contrast drops exactly when users interact."
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
        "p": "Breakpoint typography jumps: 32px on a phone, then suddenly 48px at 768px. Fluid typography grows smoothly with the viewport instead, so every screen width gets a size that fits - with less CSS."
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
        "p": "Use a Variables export that preserves aliases and modes - either a plugin that writes the W3C Design Tokens format or one that exports collections and modes as JSON. Aliases matter: if surface points to paper/50, code should say so instead of copying the hex value."
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
        "p": "A button that reads “Save” in English becomes “Speichern” in German and “Guardar cambios” in Spanish. If your layout was designed around the English length, translation breaks it - usually after launch, in a market you can’t easily test."
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
          "Building sentences from pieces (“You have ” + n + “ items”) - word order changes between languages."
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
          "Truncate with an ellipsis only for user data (names, file names) - and expose the full text."
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
          "Dates, numbers and currencies change format by locale - use Intl.DateTimeFormat and Intl.NumberFormat.",
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
  },
  "figma-font-tokens-to-css-variables": {
    "en": [
      {
        "p": "Colors usually make it from Figma to code without trouble. Typography is where design systems drift: a heading is 32px in Figma, 2rem in one component and 30px in another. Turning your type styles into tokens, and those tokens into CSS variables, gives design and code one source of truth."
      },
      {
        "h": "1. Model typography as variables in Figma"
      },
      {
        "p": "Figma text styles are not variables, so start by creating variables for the pieces a text style is made of. A common setup is one collection called `Typography` with:"
      },
      {
        "list": [
          "String variables for font families, such as `font/family/display` and `font/family/body`",
          "Number variables for sizes, such as `font/size/sm`, `font/size/md`, `font/size/xl`",
          "Number variables for weights (`font/weight/regular` = 400) and line heights (`font/line-height/tight` = 1.2)"
        ]
      },
      {
        "p": "Then bind those variables to your text styles in the Typography panel. Now a change to `font/size/md` updates every style that uses it."
      },
      {
        "h": "2. Export the variables as design tokens"
      },
      {
        "p": "Export the collection as JSON, ideally in the W3C design tokens format (`$value` and `$type` for each token). A variables export plugin or Tokens Studio can do it. A font size token looks like this:"
      },
      {
        "code": "{\n  \"font\": {\n    \"size\": {\n      \"md\": { \"$type\": \"dimension\", \"$value\": \"16px\" }\n    },\n    \"family\": {\n      \"body\": { \"$type\": \"fontFamily\", \"$value\": [\"Inter\", \"sans-serif\"] }\n    }\n  }\n}"
      },
      {
        "h": "3. Convert the tokens to CSS variables"
      },
      {
        "p": "Paste or open the JSON in the Design Token Converter and choose CSS as the output. It names each variable from its path, adds px to unitless sizes, quotes multi-word font names, and splits typography composites into one variable per property:"
      },
      {
        "code": ":root {\n  --font-family-body: Inter, sans-serif;\n  --font-size-md: 16px;\n  --font-weight-regular: 400;\n  --font-line-height-tight: 1.2;\n}"
      },
      {
        "tip": "Keep aliases as references (for example `--font-size-body: var(--font-size-md)`) so changing a primitive updates every semantic token that points to it."
      },
      {
        "h": "4. Use the variables in your components"
      },
      {
        "p": "Reference the variables instead of raw values: `font: var(--font-weight-regular) var(--font-size-md)/var(--font-line-height-tight) var(--font-family-body)`. When the design changes, you re-export and convert again, and the code follows without hunting for hard-coded sizes."
      },
      {
        "h": "Make it fluid"
      },
      {
        "p": "If your sizes should grow with the screen, generate them with the Type Scale tool instead of fixed values: it outputs `clamp()` values for each step that you can drop into the same variables."
      }
    ],
    "es": [
      {
        "p": "Los colores suelen pasar de Figma al código sin problema. La tipografía es donde los design systems se desordenan: un título mide 32px en Figma, 2rem en un componente y 30px en otro. Convertir tus estilos de texto en tokens, y esos tokens en variables CSS, le da a diseño y código una sola fuente de verdad."
      },
      {
        "h": "1. Modela la tipografía como variables en Figma"
      },
      {
        "p": "Los estilos de texto de Figma no son variables, así que empieza creando variables para las piezas que forman un estilo de texto. Una estructura común es una colección llamada `Typography` con:"
      },
      {
        "list": [
          "Variables de texto para las familias tipográficas, como `font/family/display` y `font/family/body`",
          "Variables numéricas para los tamaños, como `font/size/sm`, `font/size/md`, `font/size/xl`",
          "Variables numéricas para los pesos (`font/weight/regular` = 400) y el interlineado (`font/line-height/tight` = 1.2)"
        ]
      },
      {
        "p": "Luego vincula esas variables a tus estilos de texto en el panel de tipografía. Así, un cambio en `font/size/md` actualiza todos los estilos que lo usan."
      },
      {
        "h": "2. Exporta las variables como design tokens"
      },
      {
        "p": "Exporta la colección como JSON, idealmente en el formato de design tokens del W3C (`$value` y `$type` en cada token). Puede hacerlo un plugin de exportación de variables o Tokens Studio. Un token de tamaño se ve así:"
      },
      {
        "code": "{\n  \"font\": {\n    \"size\": {\n      \"md\": { \"$type\": \"dimension\", \"$value\": \"16px\" }\n    },\n    \"family\": {\n      \"body\": { \"$type\": \"fontFamily\", \"$value\": [\"Inter\", \"sans-serif\"] }\n    }\n  }\n}"
      },
      {
        "h": "3. Convierte los tokens en variables CSS"
      },
      {
        "p": "Pega o abre el JSON en el Convertidor de Design Tokens y elige CSS como salida. Nombra cada variable según su ruta, agrega px a los tamaños sin unidad, pone comillas a las fuentes con varias palabras y separa los tokens compuestos de tipografía en una variable por propiedad:"
      },
      {
        "code": ":root {\n  --font-family-body: Inter, sans-serif;\n  --font-size-md: 16px;\n  --font-weight-regular: 400;\n  --font-line-height-tight: 1.2;\n}"
      },
      {
        "tip": "Mantén los alias como referencias (por ejemplo `--font-size-body: var(--font-size-md)`), así cambiar un valor base actualiza todos los tokens semánticos que apuntan a él."
      },
      {
        "h": "4. Usa las variables en tus componentes"
      },
      {
        "p": "Usa las variables en lugar de valores sueltos: `font: var(--font-weight-regular) var(--font-size-md)/var(--font-line-height-tight) var(--font-family-body)`. Cuando cambia el diseño, vuelves a exportar y convertir, y el código lo sigue sin buscar tamaños escritos a mano."
      },
      {
        "h": "Hazla fluida"
      },
      {
        "p": "Si tus tamaños deben crecer con la pantalla, genéralos con la herramienta de Escala tipográfica en lugar de valores fijos: entrega valores `clamp()` para cada paso que puedes poner en esas mismas variables."
      }
    ]
  },
  "color-matching-game": {
    "en": [
      {
        "p": "Matching a color by eye sounds easy until you try it. Two colors that look identical next to each other can be far apart in numbers, and a small shift in lightness can make a match look completely wrong. Designers who pick colors quickly are not guessing: they break each color into three parts and adjust them one at a time."
      },
      {
        "h": "Hue, saturation and lightness"
      },
      {
        "list": [
          "Hue is the color family: where it sits on the color wheel, from red through yellow, green, blue and back.",
          "Saturation is how vivid it is, from gray to the most intense version of that hue.",
          "Lightness is how close it is to black or white."
        ]
      },
      {
        "p": "Most people try to fix everything at once, so a near miss on lightness makes them change the hue, and the color drifts further away."
      },
      {
        "h": "The method: lightness first"
      },
      {
        "p": "Our eyes are far more sensitive to lightness than to the other two, so a match with the wrong lightness never looks right. Match it first, squinting helps because it hides the hue. Then find the hue, and finish with saturation, which is the hardest to judge and matters least."
      },
      {
        "tip": "Compare colors side by side, not one after the other. Your eye adapts to a color within seconds, which is why a match that looked perfect can look off a moment later."
      },
      {
        "h": "Practice with a daily color game"
      },
      {
        "p": "Hue Hunt is a free color matching game built around this method. You get five target colors and three sliders: hue, saturation and lightness. Your score uses ΔE, the perceptual color distance that color science uses, so it rewards what you actually see rather than raw numbers. The daily challenge gives everyone the same five colors, so you can compare scores, and free play lets you keep going."
      },
      {
        "h": "Why it helps in real work"
      },
      {
        "p": "Training your eye pays off when you sample colors from a photo, rebuild a brand palette without the source file, or tweak a UI color that looks off in dark mode. The same three-step habit, lightness then hue then saturation, works in any color picker."
      }
    ],
    "es": [
      {
        "p": "Igualar un color a ojo parece fácil hasta que lo intentas. Dos colores que se ven idénticos uno al lado del otro pueden estar lejos en números, y un pequeño cambio de luminosidad puede hacer que una coincidencia se vea totalmente mal. Los diseñadores que eligen colores rápido no adivinan: dividen cada color en tres partes y las ajustan una por una."
      },
      {
        "h": "Tono, saturación y luminosidad"
      },
      {
        "list": [
          "El tono es la familia del color: dónde está en la rueda de color, del rojo al amarillo, verde, azul y de vuelta.",
          "La saturación es qué tan intenso es, desde el gris hasta la versión más viva de ese tono.",
          "La luminosidad es qué tan cerca está del negro o del blanco."
        ]
      },
      {
        "p": "La mayoría intenta corregir todo a la vez, así que un pequeño error de luminosidad los lleva a cambiar el tono, y el color se aleja todavía más."
      },
      {
        "h": "El método: primero la luminosidad"
      },
      {
        "p": "Nuestros ojos son mucho más sensibles a la luminosidad que a lo demás, así que una coincidencia con la luminosidad equivocada nunca se ve bien. Iguálala primero; entrecerrar los ojos ayuda porque oculta el tono. Después busca el tono y termina con la saturación, que es la más difícil de juzgar y la que menos importa."
      },
      {
        "tip": "Compara los colores lado a lado, no uno después del otro. Tu ojo se adapta a un color en segundos, por eso una coincidencia que parecía perfecta puede verse distinta un momento después."
      },
      {
        "h": "Practica con un juego de color diario"
      },
      {
        "p": "Caza de color es un juego gratis para igualar colores basado en este método. Tienes cinco colores objetivo y tres controles: tono, saturación y luminosidad. Tu puntaje usa ΔE, la distancia perceptual que usa la ciencia del color, así que premia lo que realmente ves y no los números. El reto diario le da a todos los mismos cinco colores para comparar puntajes, y el juego libre te deja seguir practicando."
      },
      {
        "h": "Por qué sirve en el trabajo real"
      },
      {
        "p": "Entrenar el ojo rinde cuando tomas colores de una foto, reconstruyes una paleta de marca sin el archivo original o ajustas un color de interfaz que se ve raro en modo oscuro. El mismo hábito de tres pasos, luminosidad, tono y saturación, funciona en cualquier selector de color."
      }
    ]
  }
};
