// The long copy for each plugin's page (/plugins/:slug). Name, pitch,
// features, emoji and accent live in pro-content.js (PRO_PLUGINS, matched by
// id); this file adds the slugs, the long description and the screenshots'
// headlines. Images: /plugin-assets/<id>/ui-N.webp (the real plugin window, made by
// fun-lab-plugins' `npm run assets`) (icon.png too).

export const PLUGIN_PAGES = {
  'palette-generator': {
    slug: 'palette-generator', slugEs: 'generador-de-paletas',
    en: {
      description: [
        'Palette Generator turns one brand color into a color system that is ready to ship: perceptually even OKLCH scales named like Tailwind, Material or Radix, a neutral tinted with your brand, and a semantic layer (bg, surface, border, text, accent) with Light and Dark modes that alias the scale and are picked by contrast.',
        'Everything lands in Figma as Variables (updated in place on the next run, so bindings and aliases survive), color styles and a documented board, and goes out as CSS, Tailwind v3 and v4, SCSS or W3C tokens, with OKLCH and Display P3 values.',
      ],
      shots: [
        ['A whole color system from one color', 'OKLCH scales named like Tailwind, Material or Radix, plus a tinted neutral.'],
        ['Every step on every step', 'The contrast grid shows which pairs pass 4.5:1 and 3:1 before you pick them.'],
        ['Light and Dark, picked by contrast', 'Semantic tokens alias the scale, so a brand change flows everywhere.'],
        ['Ship it as code', 'CSS, Tailwind v3 and v4, SCSS or W3C tokens, with OKLCH and Display P3.'],
        ['Groups that collapse, flagged', 'Preview the palette with protan, deutan and tritan vision.'],
      ],
    },
    es: {
      description: [
        'El Generador de paletas convierte un color de marca en un sistema de color listo para producción: escalas OKLCH perceptualmente parejas, con nombres como Tailwind, Material o Radix, un neutro teñido con tu marca y una capa semántica (fondo, superficie, borde, texto, acento) con modos claro y oscuro que apuntan a la escala y se eligen por contraste.',
        'Todo llega a Figma como Variables (se actualizan en su lugar en la siguiente corrida, así que los vínculos y alias se mantienen), estilos de color y un tablero documentado, y sale como CSS, Tailwind v3 y v4, SCSS o tokens W3C, con valores OKLCH y Display P3.',
      ],
      shots: [
        ['Un sistema de color completo desde un color', 'Escalas OKLCH con nombres como Tailwind, Material o Radix, y un neutro teñido.'],
        ['Cada paso contra cada paso', 'La cuadrícula de contraste muestra qué pares pasan 4.5:1 y 3:1 antes de elegirlos.'],
        ['Claro y oscuro, elegidos por contraste', 'Los tokens semánticos apuntan a la escala: un cambio de marca llega a todos lados.'],
        ['Llévalo a código', 'CSS, Tailwind v3 y v4, SCSS o tokens W3C, con OKLCH y Display P3.'],
        ['Grupos que se confunden, marcados', 'Mira la paleta con visión protan, deutan y tritan.'],
      ],
    },
  },
  'contrast-checker': {
    slug: 'contrast-checker', slugEs: 'verificador-de-contraste',
    en: {
      description: [
        'Contrast Checker measures every text layer against the colors actually painted behind it: overlays, opacity, gradients and stacked fills are composited, not guessed. Then it fixes what fails, with one click or all at once.',
        'Most checkers test one pair at a time and round 4.49 up to a pass. This one checks the whole selection, page or file, truncates instead of rounding, and checks text bound to variables in every mode, so a color that passes in Light but fails in Dark is caught before it ships.',
      ],
      shots: [
        ['Find what fails. Fix it in one click.', 'Every text, border and icon, measured against what is really behind it.'],
        ['Light passes. Dark doesn’t. Now you know.', 'Text bound to variables is checked in every mode of its collection.'],
        ['WCAG 2.2 and APCA, side by side', 'Switch the standard and every verdict, ratio and fix follows.'],
        ['Any two colors, or two layers', 'Hex in, verdicts out for body, large text and UI, with the closest color that passes.'],
        ['Fixes that keep your design system', 'Rebind the nearest passing token instead of detaching it to a raw hex.'],
      ],
    },
    es: {
      description: [
        'El Verificador de contraste mide cada capa de texto contra los colores que de verdad están pintados detrás: superposiciones, opacidad, degradados y rellenos apilados se combinan, no se adivinan. Después corrige lo que falla, con un clic o todo de una vez.',
        'La mayoría de los verificadores revisan un par a la vez y redondean 4.49 a aprobado. Este revisa toda la selección, la página o el archivo, trunca en vez de redondear y revisa el texto vinculado a variables en cada modo, así que un color que pasa en claro pero falla en oscuro se detecta antes de publicarlo.',
      ],
      shots: [
        ['Encuentra lo que falla. Corrígelo en un clic.', 'Cada texto, borde e ícono, medido contra lo que de verdad hay detrás.'],
        ['En claro pasa. En oscuro no. Ahora lo sabes.', 'El texto vinculado a variables se revisa en cada modo de su colección.'],
        ['WCAG 2.2 y APCA, lado a lado', 'Cambia el estándar y cada veredicto, proporción y corrección lo siguen.'],
        ['Dos colores cualesquiera, o dos capas', 'Pones un hex y obtienes el veredicto para texto, texto grande e interfaz, con el color más cercano que pasa.'],
        ['Correcciones que respetan tu design system', 'Vincula el token más cercano que pasa en lugar de dejar un hex suelto.'],
      ],
    },
  },
  'type-scale': {
    slug: 'type-scale', slugEs: 'escala-tipografica',
    en: {
      description: [
        'Type Scale builds a modular scale and writes it into Figma as text styles bound to number variables, with a mode per breakpoint, so one style resizes itself in a frame set to Desktop, Tablet or Mobile. Code gets the matching fluid clamp() values.',
        'Re-run it and everything updates in place: same styles, same variables, same specimen boards. Already have a file full of sizes? The audit infers the scale they come from and snaps stray text to it.',
      ],
      shots: [
        ['A type scale that resizes itself', 'Styles bound to variables with a mode per breakpoint.'],
        ['Every breakpoint at a glance', 'Mobile, Tablet and Desktop sizes, line heights and readability checks.'],
        ['Find the scale your file already uses', 'Then snap the stray sizes to it, in one undo step.'],
        ['Fluid type for code', 'clamp() in CSS, Tailwind v4 @theme, SCSS or tokens, in rem or px.'],
        ['Styles, variables and specimens', 'Semantic names, two families, a fluid space scale.'],
      ],
    },
    es: {
      description: [
        'Escala tipográfica arma una escala modular y la escribe en Figma como estilos de texto vinculados a variables numéricas, con un modo por breakpoint: un mismo estilo cambia de tamaño en un frame configurado como escritorio, tablet o móvil. El código recibe los valores clamp() fluidos equivalentes.',
        'Vuelve a correrlo y todo se actualiza en su lugar: los mismos estilos, las mismas variables, los mismos muestrarios. ¿Ya tienes un archivo lleno de tamaños? La auditoría deduce de qué escala vienen y ajusta el texto suelto a ella.',
      ],
      shots: [
        ['Una escala que cambia de tamaño sola', 'Estilos vinculados a variables con un modo por breakpoint.'],
        ['Todos los breakpoints de un vistazo', 'Tamaños de móvil, tablet y escritorio, interlineados y alertas de legibilidad.'],
        ['Encuentra la escala que ya usa tu archivo', 'Y ajusta los tamaños sueltos a ella, con un solo deshacer.'],
        ['Tipografía fluida para código', 'clamp() en CSS, @theme de Tailwind v4, SCSS o tokens, en rem o px.'],
        ['Estilos, variables y muestrarios', 'Nombres semánticos, dos familias, una escala de espaciado fluida.'],
      ],
    },
  },
  'color-blindness': {
    slug: 'color-blindness-simulator', slugEs: 'simulador-de-daltonismo',
    en: {
      description: [
        'Color Blindness Simulator shows any frame, images and illustrations included, the way people with each type of color vision see it: the three dichromacies, the three anomalous types (deuteranomaly alone is about 5% of men), achromatopsia and achromatomaly. The model is Machado et al. 2009, with a severity slider.',
        'Add low vision too: blur, cataract, contrast loss, bright light, ghosting, tunnel vision and macular degeneration. Place labeled boards next to the frame, refresh them after edits, and list the color pairs that collapse for someone, with a fix. Everything runs on your machine.',
      ],
      shots: [
        ['Everyone sees it differently', 'Eight color vision types, side by side, on the real pixels.'],
        ['Low vision, too', 'Cataract, tunnel vision, macular degeneration and more.'],
        ['Colors that collapse, caught', 'Pairs that look alike for someone, with a color that tells them apart.'],
        ['Know who you design for', 'Every type with how common it is, and a severity slider.'],
      ],
    },
    es: {
      description: [
        'El Simulador de daltonismo muestra cualquier frame, con imágenes e ilustraciones incluidas, como lo ve cada tipo de visión del color: las tres dicromacias, los tres tipos anómalos (solo la deuteranomalía afecta a cerca del 5% de los hombres), la acromatopsia y la acromatomalía. El modelo es Machado et al. 2009, con control de severidad.',
        'Suma también baja visión: desenfoque, catarata, pérdida de contraste, luz fuerte, doble imagen, visión de túnel y degeneración macular. Coloca tableros con etiquetas junto al frame, actualízalos después de editar y lista los pares de colores que alguien no distingue, con una corrección. Todo corre en tu computadora.',
      ],
      shots: [
        ['Cada persona lo ve distinto', 'Ocho tipos de visión del color, lado a lado, sobre los píxeles reales.'],
        ['Baja visión, también', 'Catarata, visión de túnel, degeneración macular y más.'],
        ['Colores que se confunden, detectados', 'Pares que alguien ve iguales, con un color que los separa.'],
        ['Conoce para quién diseñas', 'Cada tipo con qué tan común es, y un control de severidad.'],
      ],
    },
  },
  'token-drift': {
    slug: 'token-drift', slugEs: 'token-drift',
    en: {
      description: [
        'Token Drift scans the selection, the page or every page for values that aren’t bound to a variable or style: fills, strokes and gradient stops, text (including mixed-style runs), effects, spacing, radius, stroke width and opacity. Each one gets the closest token, picked by role (text, surface, border, icon) and shown with its distance, and binds in one click, or every exact match at once, in one undo step.',
        'It also finds detached instances and reattaches them keeping their text, relinks broken variable bindings, merges duplicate tokens, and keeps a coverage trend so you can see drift go down. Works on every Figma plan.',
      ],
      shots: [
        ['How much of the file uses the system?', 'A coverage score, the trend, and every value that drifts.'],
        ['The closest token, explained', 'Picked by role and distance. Bind one group or every exact match.'],
        ['Your rules, saved in the file', 'Collections and libraries to suggest from, ignored values, allowed radii.'],
        ['Detached, broken, duplicated', 'Reattach instances, relink broken variables, merge duplicate tokens.'],
      ],
    },
    es: {
      description: [
        'Token Drift revisa la selección, la página o todas las páginas en busca de valores que no están vinculados a una variable o estilo: rellenos, bordes y paradas de degradado, texto (incluidos los tramos con estilos mixtos), efectos, espaciado, radios, grosor de borde y opacidad. A cada uno le sugiere el token más cercano según su rol (texto, superficie, borde, ícono), con su distancia, y lo vincula en un clic, o todas las coincidencias exactas de una vez, con un solo deshacer.',
        'También encuentra instancias desvinculadas y las revincula conservando su texto, repara variables rotas, une tokens duplicados y guarda la tendencia de cobertura para que veas cómo baja la deriva. Funciona en cualquier plan de Figma.',
      ],
      shots: [
        ['¿Cuánto del archivo usa el sistema?', 'Un puntaje de cobertura, la tendencia y cada valor que se desvía.'],
        ['El token más cercano, explicado', 'Elegido por rol y distancia. Vincula un grupo o todas las coincidencias exactas.'],
        ['Tus reglas, guardadas en el archivo', 'Colecciones y librerías para sugerir, valores ignorados, radios permitidos.'],
        ['Desvinculado, roto, duplicado', 'Revincula instancias, repara variables rotas, une tokens duplicados.'],
      ],
    },
  },
  'token-converter': {
    slug: 'token-converter', slugEs: 'token-converter',
    en: {
      description: [
        'Token Converter reads your local variables and styles through the plugin API, so it works on every Figma plan and in Dev Mode, and turns them into code: CSS custom properties, SCSS, Tailwind v4 @theme or a v3 config, JS and TypeScript, flat JSON, W3C design tokens, Style Dictionary, SwiftUI, Android XML, Jetpack Compose, Flutter, and a Markdown table for people and AI tools.',
        'Aliases stay aliases (or resolve), modes become data attributes, classes or media queries, and text, shadow and gradient styles become composite tokens. A snapshot in the file shows what changed since the last export, renames included, as a changelog. Tokens JSON imports back into variables.',
      ],
      shots: [
        ['Variables to Tailwind v4, ready to paste', 'Namespaced @theme, modes in a base layer, aliases kept.'],
        ['Swift, Compose, Android, Flutter', 'The same tokens for every platform, with dark values.'],
        ['What changed since the last export', 'Changed, added, renamed and removed, as a changelog for the PR.'],
        ['Your names, your formats', 'Color formats, mode selectors, prefixes and saved profiles.'],
      ],
    },
    es: {
      description: [
        'Token Converter lee tus variables y estilos locales con la API de plugins, así que funciona en cualquier plan de Figma y en Dev Mode, y los convierte en código: variables CSS, SCSS, @theme de Tailwind v4 o una configuración v3, JS y TypeScript, JSON plano, tokens W3C, Style Dictionary, SwiftUI, Android XML, Jetpack Compose, Flutter y una tabla en Markdown para personas y herramientas de IA.',
        'Los alias siguen siendo alias (o se resuelven), los modos se vuelven atributos data, clases o media queries, y los estilos de texto, sombra y degradado se vuelven tokens compuestos. Una instantánea en el archivo muestra qué cambió desde la última exportación, incluidos los renombres, como un registro de cambios. Los tokens JSON se importan de vuelta a variables.',
      ],
      shots: [
        ['Variables a Tailwind v4, listas para pegar', '@theme con espacios de nombres, modos en una capa base, alias conservados.'],
        ['Swift, Compose, Android, Flutter', 'Los mismos tokens para cada plataforma, con valores oscuros.'],
        ['Qué cambió desde la última exportación', 'Cambiados, agregados, renombrados y eliminados, como registro para el PR.'],
        ['Tus nombres, tus formatos', 'Formatos de color, selectores de modo, prefijos y perfiles guardados.'],
      ],
    },
  },
  'a11y-handoff': {
    slug: 'a11y-handoff', slugEs: 'a11y-handoff',
    en: {
      description: [
        'A11y Handoff reads a screen and drafts the accessibility notes developers need: the focus order with a role for every stop (named for ARIA, VoiceOver or TalkBack), keyboard patterns, headings, landmarks, alt text, form labels, required fields and autocomplete, and motion that needs a reduced-motion fallback. It flags touch targets by platform, small text, and a focus order that doesn’t follow the layers.',
        'You review the draft, then it draws the annotations on the canvas (one layer per type, so each can be hidden), a notes panel, and native Dev Mode annotations developers see without the plugin. Export the spec as Markdown for the ticket, or CSV and JSON.',
      ],
      shots: [
        ['The accessibility spec, drafted', 'Violations, things to review and checks passed, on one screen.'],
        ['Focus order with real roles', 'ARIA, VoiceOver or TalkBack names, reorder and relabel in place.'],
        ['Forms and motion, covered', 'Labels, required fields, autocomplete, errors and reduced motion.'],
        ['Hand it off where developers look', 'Dev Mode annotations, canvas layers you can toggle, Markdown export.'],
      ],
    },
    es: {
      description: [
        'A11y Handoff lee una pantalla y redacta las notas de accesibilidad que necesita el equipo de desarrollo: el orden de foco con un rol para cada parada (con los nombres de ARIA, VoiceOver o TalkBack), patrones de teclado, títulos, regiones, texto alternativo, etiquetas de formulario, campos obligatorios y autocompletado, y el movimiento que necesita una alternativa reducida. Marca áreas táctiles según la plataforma, texto pequeño y un orden de foco que no sigue las capas.',
        'Revisas el borrador y luego dibuja las anotaciones en el lienzo (una capa por tipo, para ocultar cada una), un panel de notas y anotaciones nativas de Dev Mode que el equipo ve sin el plugin. Exporta la especificación en Markdown para el ticket, o en CSV y JSON.',
      ],
      shots: [
        ['La especificación de accesibilidad, redactada', 'Fallas, cosas por revisar y revisiones aprobadas, en una pantalla.'],
        ['Orden de foco con roles reales', 'Nombres de ARIA, VoiceOver o TalkBack; reordena y renombra en el lugar.'],
        ['Formularios y movimiento, cubiertos', 'Etiquetas, campos obligatorios, autocompletado, errores y movimiento reducido.'],
        ['Entrégalo donde el equipo mira', 'Anotaciones de Dev Mode, capas en el lienzo que puedes ocultar, exportación en Markdown.'],
      ],
    },
  },
  'text-stress': {
    slug: 'text-stress-test', slugEs: 'prueba-de-estres-de-texto',
    en: {
      description: [
        'Text Stress Test makes every text in your frames as long as it would be in another language, using real expansion data: a six-letter button can double in German, so short labels grow more than long sentences. It works on a labeled copy next to the original, or in place with one-click restore, and keeps bold and link runs as they were.',
        'Then it lists what breaks, in pixels: text cut off by its box, clipped or spilling out of a container, hidden by an ellipsis, compound words wider than their box, line heights too tight for tall scripts, frames that grow. Wrap or shrink to fit with one click, and export the report.',
      ],
      shots: [
        ['Your UI in 14 languages and scripts', 'Real expansion ratios, and short labels grow more.'],
        ['What breaks, in pixels', 'Cut off, clipped, truncated, long words, tight lines.'],
        ['Try any string first', 'German compounds, Japanese, right-to-left, pseudo-locale.'],
        ['Fix it on the copy', 'Wrap or shrink to fit, then export the report for the team.'],
      ],
    },
    es: {
      description: [
        'Text Stress Test alarga cada texto de tus frames hasta lo que mediría en otro idioma, con datos reales de expansión: un botón de seis letras puede duplicarse en alemán, así que las etiquetas cortas crecen más que las frases largas. Trabaja sobre una copia con etiqueta junto al original, o en el mismo lugar con restaurar en un clic, y conserva las negritas y los enlaces como estaban.',
        'Después lista lo que se rompe, en píxeles: texto cortado por su caja, recortado o desbordado de un contenedor, oculto por puntos suspensivos, palabras compuestas más anchas que su caja, interlineados muy justos para escrituras altas y frames que crecen. Ajusta o reduce para que entre con un clic y exporta el reporte.',
      ],
      shots: [
        ['Tu interfaz en 14 idiomas y escrituras', 'Proporciones reales de expansión: las etiquetas cortas crecen más.'],
        ['Lo que se rompe, en píxeles', 'Cortado, recortado, truncado, palabras largas, interlineado justo.'],
        ['Prueba cualquier texto antes', 'Compuestos en alemán, japonés, de derecha a izquierda, pseudo-idioma.'],
        ['Corrígelo en la copia', 'Ajusta o reduce para que entre, y exporta el reporte para el equipo.'],
      ],
    },
  },
};

export const pluginPath = (id, lang) => {
  const p = PLUGIN_PAGES[id];
  return lang === 'es' ? `/es/plugins/${p.slugEs}` : `/plugins/${p.slug}`;
};
export const pluginBySlug = (slug, lang) => Object.keys(PLUGIN_PAGES).find(id => (lang === 'es' ? PLUGIN_PAGES[id].slugEs : PLUGIN_PAGES[id].slug) === slug);
