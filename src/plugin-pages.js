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
  'mode-matrix': {
    slug: 'mode-matrix', slugEs: 'mode-matrix',
    en: {
      description: [
        "Mode Matrix reads the variables a frame really uses, follows aliases to their collections, and lays out one copy per mode: Light and Dark as rows, brands as columns, any other collection fixed to the mode you pick. Every copy is set to its modes with Figma's own mode switching, so it is exactly what a developer would see.",
        "Each copy is then checked: text that drops below WCAG AA in that mode, with both colors and the ratio, and variables with no value in a mode. Click a cell to select the failing layers, run it again to update the board in place, and copy the result as Markdown for the pull request."
      ],
      shots: [["Pick rows and columns", "Any two collections: Light and Dark by brand, density, platform."], ["Every mode, checked", "Text contrast per copy, and values missing in a mode."], ["Click a cell, see why", "Both colors, the ratio, and one click to select the layer."], ["Ready for the pull request", "Copy the whole matrix as Markdown."]],
    },
    es: {
      description: [
        "Mode Matrix lee las variables que un frame usa de verdad, sigue los alias hasta sus colecciones y arma una copia por modo: Light y Dark como filas, marcas como columnas y cualquier otra colección fija en el modo que elijas. Cada copia queda en sus modos con el cambio de modo propio de Figma, así que es exactamente lo que vería quien desarrolla.",
        "Después revisa cada copia: el texto que baja de WCAG AA en ese modo, con los dos colores y el ratio, y las variables sin valor en algún modo. Haz clic en una celda para seleccionar las capas que fallan, vuelve a correrlo para actualizar el tablero en su lugar y copia el resultado en Markdown para el pull request."
      ],
      shots: [["Elige filas y columnas", "Dos colecciones cualquiera: Light y Dark por marca, densidad o plataforma."], ["Cada modo, revisado", "Contraste de texto en cada copia, y valores que faltan en un modo."], ["Haz clic en una celda y ve por qué", "Los dos colores, el ratio y un clic para seleccionar la capa."], ["Listo para el pull request", "Copia toda la matriz en Markdown."]],
    },
  },
  'breakpoint-stress': {
    slug: 'breakpoint-stress-test', slugEs: 'prueba-de-estres-de-breakpoints',
    en: {
      description: [
        "Breakpoint Stress Test copies the selected frames at the widths you pick, from a 320 px phone to a 1920 px screen, and places them in a row next to the original. Constraints and auto layout do their work just as they would if you dragged the edge yourself, only for every width at once.",
        "Then it checks every layer of every copy: content that spills out or gets clipped, fixed-width layers wider than their column, text cut off or truncated, layers that stop sticking to the right edge, lines too long to read on wide screens and tap targets under 44 px on phones. Problems are marked on the copies, listed with Select, and exported as Markdown. One click removes the copies."
      ],
      shots: [["Every width at once", "Phones, tablets, laptops, wide screens, or your own."], ["What breaks at each width", "Clipped, too wide, cut off, not pinned, in pixels."], ["Filter, then select", "Jump to any problem layer on the copy."], ["Wide screens too", "Lines too long to read, flagged past 80 characters."]],
    },
    es: {
      description: [
        "Breakpoint Stress Test copia los frames seleccionados en los anchos que elijas, de un teléfono de 320 px a una pantalla de 1920 px, y los pone en fila junto al original. Las restricciones y el auto layout hacen su trabajo igual que si arrastraras el borde tú, solo que en todos los anchos a la vez.",
        "Después revisa cada capa de cada copia: contenido que se desborda o se recorta, capas de ancho fijo más anchas que su columna, texto cortado o truncado, capas que dejan de quedar pegadas al borde derecho, líneas demasiado largas para leer en pantallas anchas y áreas táctiles de menos de 44 px en teléfonos. Los problemas se marcan en las copias, se listan con Seleccionar y se exportan en Markdown. Un clic borra las copias."
      ],
      shots: [["Todos los anchos a la vez", "Teléfonos, tablets, laptops, pantallas anchas, o los tuyos."], ["Lo que se rompe en cada ancho", "Recortado, demasiado ancho, cortado, sin fijar, en píxeles."], ["Filtra y selecciona", "Salta a cualquier capa con problemas en la copia."], ["También pantallas anchas", "Líneas demasiado largas para leer, marcadas desde 80 caracteres."]],
    },
  },
  'spec-sheet': {
    slug: 'spec-sheet', slugEs: 'spec-sheet',
    en: {
      description: [
        "Spec Sheet reads a component, a component set or any instance of one and collects what a developer asks for: every property with its type, default and options, every variant with its size, the numbered parts, the auto layout (padding, gap, alignment, sizing, radius, stroke) and every variable and style the component uses, with resolved values.",
        "It also lists the colors, sizes and spacing that are still hard-coded, so the spec doubles as a token audit. Draw the spec board next to the component with the sections you want, run it again after a change to update the board in place, or copy everything as Markdown or JSON. In Dev Mode it reads and copies without changing the file."
      ],
      shots: [["Every property, typed", "Variants, booleans, text and swaps, with defaults and options."], ["Anatomy, numbered", "Each part with its kind, the component it uses and its size."], ["Tokens, and what is not one yet", "Variables and styles with values, plus hard-coded leftovers."], ["Spacing a developer can copy", "Padding, gap, alignment, sizing, radius and stroke."]],
    },
    es: {
      description: [
        "Spec Sheet lee un componente, un set de componentes o cualquier instancia y junta lo que pide quien desarrolla: cada propiedad con su tipo, valor por defecto y opciones, cada variante con su tamaño, las partes numeradas, el auto layout (padding, gap, alineación, tamaño, radio, borde) y cada variable y estilo que usa el componente, con su valor final.",
        "También lista los colores, tamaños y espaciados que siguen escritos a mano, así que la especificación sirve además como auditoría de tokens. Dibuja el tablero junto al componente con las secciones que quieras, vuelve a correrlo después de un cambio para actualizarlo en su lugar, o copia todo en Markdown o JSON. En Dev Mode lee y copia sin cambiar el archivo."
      ],
      shots: [["Cada propiedad, con su tipo", "Variantes, booleanas, texto e intercambios, con valores por defecto y opciones."], ["La anatomía, numerada", "Cada parte con su tipo, el componente que usa y su tamaño."], ["Tokens, y lo que aún no lo es", "Variables y estilos con sus valores, más lo que sigue escrito a mano."], ["Medidas que se pueden copiar", "Padding, gap, alineación, tamaño, radio y borde."]],
    },
  },
  'copy-lint': {
    slug: 'copy-lint', slugEs: 'copy-lint',
    en: {
      description: [
        "Copy Lint reads every visible text in the selection, the page or the whole file and checks it against writing rules: long dashes, double spaces, straight or curly quotes, ellipses, repeated words, too many exclamation marks, text typed in capitals, sentence or title case on labels, your terminology (use Sign in, not Log in), words to avoid, lorem ipsum and placeholders, vague link text like click here, button labels that run long and the same label written two ways.",
        "Most issues fix in one click, or all at once. Fixes are applied edit by edit, so a bold word or a link in the middle of a sentence keeps its style. Ignore a single match or a whole rule on a text, keep names capitalized, and save the rules and glossary in the file so everyone lints the same way. Export the report as Markdown or CSV."
      ],
      shots: [["Every text, every rule", "Dashes, case, quotes, glossary and placeholders, in one list."], ["Fix one, or all at once", "See the change before you make it, styles kept."], ["Your rules, in the file", "Terminology, words to avoid, names, and every rule on or off."], ["All clear", "Ship copy that reads like one team wrote it."]],
    },
    es: {
      description: [
        "Copy Lint lee cada texto visible de la selección, la página o todo el archivo y lo revisa con reglas de escritura: guiones largos, espacios dobles, comillas rectas o curvas, puntos suspensivos, palabras repetidas, exceso de signos de exclamación, texto escrito en mayúsculas, mayúscula inicial o Title Case en etiquetas, tu terminología (Iniciar sesión y no Entrar), palabras a evitar, lorem ipsum y textos de relleno, enlaces vagos como haz clic aquí, botones con etiquetas largas y la misma etiqueta escrita de dos formas.",
        "La mayoría se corrige en un clic, o todo a la vez. Las correcciones se aplican edición por edición, así que una palabra en negrita o un enlace en medio de una frase conservan su estilo. Ignora una coincidencia o una regla completa en un texto, conserva la mayúscula de los nombres y guarda las reglas y el glosario en el archivo para que todo el equipo revise igual. Exporta el reporte en Markdown o CSV."
      ],
      shots: [["Cada texto, cada regla", "Guiones, mayúsculas, comillas, glosario y textos de relleno, en una lista."], ["Corrige uno, o todo a la vez", "Ve el cambio antes de hacerlo, con los estilos intactos."], ["Tus reglas, en el archivo", "Terminología, palabras a evitar, nombres y cada regla activable."], ["Todo en orden", "Textos que suenan a un solo equipo."]],
    },
  },
  'icon-audit': {
    slug: 'icon-audit', slugEs: 'icon-audit',
    en: {
      description: [
        "Icon Audit finds the icon components in the selection, the page or the whole file and learns what the set has in common: stroked or filled, the stroke weight at 24 px, one color or several, the padding and the naming pattern. Then it flags the icons that break it: sizes off your scale or not square, layers at half pixels, stroke weights or padding that don't match, extra colors, names in another case, hidden layers and the same drawing saved twice.",
        "On screens it finds icon instances scaled to sizes you don't use and icons pasted as loose vectors instead of instances. It also lists common icons the set is missing (close, search, chevrons, trash and more, synonyms included). Snap to the grid, match the stroke and rename in one click, and export the set as an SVG sprite that takes the text color, plus a JSON manifest."
      ],
      shots: [["Your icons, as one set", "What the set has in common, and which icons break it."], ["Every icon that breaks the set", "Size, grid, stroke, color, padding, names, duplicates."], ["On screens, and what's missing", "Scaled instances, loose vectors, and common icons to add."], ["Fix in one click", "Snap to grid, match the stroke, rename to the pattern."]],
    },
    es: {
      description: [
        "Icon Audit encuentra los componentes de íconos en la selección, la página o todo el archivo y aprende lo que el set tiene en común: con trazo o relleno, el grosor del trazo a 24 px, uno o varios colores, los márgenes y el patrón de nombres. Después marca los íconos que lo rompen: tamaños fuera de tu escala o no cuadrados, capas en medio píxel, grosores o márgenes distintos, colores de más, nombres en otro formato, capas ocultas y el mismo dibujo guardado dos veces.",
        "En las pantallas encuentra instancias escaladas a tamaños que no usas e íconos pegados como vectores sueltos en vez de instancias. También lista los íconos comunes que le faltan al set (cerrar, buscar, flechas, papelera y más, con sinónimos). Ajusta a la grilla, iguala el trazo y renombra en un clic, y exporta el set como un sprite SVG que toma el color del texto, más un manifiesto JSON."
      ],
      shots: [["Tus íconos, como un solo set", "Lo que el set tiene en común, y qué íconos lo rompen."], ["Cada ícono que rompe el set", "Tamaño, grilla, trazo, color, márgenes, nombres, duplicados."], ["En pantallas, y lo que falta", "Instancias escaladas, vectores sueltos e íconos comunes por agregar."], ["Arregla en un clic", "Ajusta a la grilla, iguala el trazo, renombra al patrón."]],
    },
  },
};

export const pluginPath = (id, lang) => {
  const p = PLUGIN_PAGES[id];
  return lang === 'es' ? `/es/plugins/${p.slugEs}` : `/plugins/${p.slug}`;
};
export const pluginBySlug = (slug, lang) => Object.keys(PLUGIN_PAGES).find(id => (lang === 'es' ? PLUGIN_PAGES[id].slugEs : PLUGIN_PAGES[id].slug) === slug);
