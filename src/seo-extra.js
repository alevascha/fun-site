// Extra on-page content for tools that already get search impressions:
// "How to use" steps, an explainer and more FAQs. getSeo() merges it into
// each tool's SEO entry, so it shows on the page, in the prerendered HTML
// and in the FAQPage structured data. Written for the searches Search
// Console showed (Oct 2026).

export const SEO_EXTRA = {
  'contrast-checker': {
    en: {
      howTo: [
        'Type a hex code or use the color picker for the text color and the background color.',
        'Read the contrast ratio and the WCAG 2.2 results for normal text, large text and UI components.',
        'If a level fails, use the one-click fix to adjust the text or the background just enough to pass.',
        'Copy the link to share the exact color pair with your team or in a design review.',
      ],
      about: [
        'Color contrast is the difference in luminance between text and its background, written as a ratio from 1:1 (no contrast) to 21:1 (black on white). WCAG, the accessibility standard most products follow, sets minimums so text stays readable for people with low vision, color blindness or a screen in bright sunlight.',
        'This contrast checker works as a contrast ratio calculator and a fixer at the same time: instead of guessing new colors, it moves only the lightness of the color you choose, keeping your brand hue, until the pair reaches AA (4.5:1) or AAA (7:1).',
      ],
      faq: [
        { q: 'What is the difference between WCAG AA and AAA?', a: 'AA is the level most laws and audits ask for: 4.5:1 for normal text and 3:1 for large text. AAA is stricter, 7:1 and 4.5:1, and is usually applied to body text in products that need the highest readability.' },
        { q: 'Does contrast apply to icons and buttons?', a: 'Yes. WCAG 1.4.11 asks for at least 3:1 between UI components (button borders, form fields, icons that carry meaning) and the colors next to them.' },
        { q: 'Is this contrast checker free?', a: 'Yes. It is free, needs no sign-up and runs entirely in your browser.' },
      ],
    },
    es: {
      howTo: [
        'Escribe un código hex o usa el selector de color para el texto y para el fondo.',
        'Revisa la proporción de contraste y los resultados WCAG 2.2 para texto normal, texto grande y componentes de interfaz.',
        'Si un nivel falla, usa la corrección en un clic para ajustar el texto o el fondo lo justo para que pase.',
        'Copia el enlace para compartir exactamente ese par de colores con tu equipo o en una revisión de diseño.',
      ],
      about: [
        'El contraste de color es la diferencia de luminosidad entre un texto y su fondo, expresada como una proporción de 1:1 (sin contraste) a 21:1 (negro sobre blanco). WCAG, el estándar de accesibilidad que siguen la mayoría de productos, fija mínimos para que el texto se lea bien en personas con baja visión, daltonismo o con la pantalla bajo el sol.',
        'Este verificador de contraste funciona como calculadora de contraste y como corrector a la vez: en lugar de adivinar colores nuevos, mueve solo la luminosidad del color que elijas, manteniendo el tono de tu marca, hasta que el par llegue a AA (4.5:1) o AAA (7:1).',
      ],
      faq: [
        { q: '¿Cuál es la diferencia entre WCAG AA y AAA?', a: 'AA es el nivel que piden la mayoría de leyes y auditorías: 4.5:1 para texto normal y 3:1 para texto grande. AAA es más estricto, 7:1 y 4.5:1, y suele aplicarse al texto principal en productos que necesitan la máxima legibilidad.' },
        { q: '¿El contraste aplica también a íconos y botones?', a: 'Sí. WCAG 1.4.11 pide al menos 3:1 entre los componentes de interfaz (bordes de botones, campos de formulario, íconos con significado) y los colores que los rodean.' },
        { q: '¿Este verificador de contraste es gratis?', a: 'Sí. Es gratis, no pide registro y funciona por completo en tu navegador.' },
      ],
    },
  },

  'gradient-generator': {
    en: {
      howTo: [
        'Choose a gradient type: linear, radial, conic or mesh.',
        'Drag the color points on the canvas (or use the arrow keys) and adjust their spread, or press Shuffle colors for a harmonious set.',
        'Optionally turn on motion to animate the gradient.',
        'Copy the CSS and paste it into your project. It works in every modern browser, no images needed.',
      ],
      about: [
        'A mesh gradient blends several colors that come from different points of a surface, instead of along a single line. It is the soft, organic background you see on modern landing pages and app splash screens.',
        'CSS has no mesh-gradient() function, so this mesh gradient generator builds one by stacking several radial gradients over a base color. You get the look of a design-tool mesh gradient as a few lines of lightweight CSS, which scales to any size and loads instantly.',
      ],
      faq: [
        { q: 'Can I use the gradient in Figma?', a: 'The tool exports CSS. To use the same look in Figma, recreate the color points as layered radial gradients, or take a screenshot of the canvas as a background image.' },
        { q: 'Is a CSS gradient better than an image for performance?', a: 'Usually yes: a few lines of CSS weigh almost nothing, stay sharp at any size and need no extra download, while a large background image can slow down the first paint.' },
      ],
    },
    es: {
      howTo: [
        'Elige un tipo de degradado: lineal, radial, cónico o mesh.',
        'Arrastra los puntos de color en el lienzo (o usa las flechas del teclado) y ajusta su difusión, o pulsa Mezclar colores para obtener un conjunto armónico.',
        'Si quieres, activa el movimiento para animar el degradado.',
        'Copia el CSS y pégalo en tu proyecto. Funciona en todos los navegadores modernos, sin imágenes.',
      ],
      about: [
        'Un degradado mesh mezcla varios colores que salen de distintos puntos de una superficie, en lugar de seguir una sola línea. Es el fondo suave y orgánico que se ve en landing pages modernas y pantallas de bienvenida de apps.',
        'CSS no tiene una función mesh-gradient(), así que este generador de degradados mesh lo arma apilando varios degradados radiales sobre un color base. Obtienes el aspecto de un mesh gradient de herramienta de diseño en unas pocas líneas de CSS liviano, que se adapta a cualquier tamaño y carga al instante.',
      ],
      faq: [
        { q: '¿Puedo usar el degradado en Figma?', a: 'La herramienta exporta CSS. Para lograr el mismo aspecto en Figma, recrea los puntos de color como degradados radiales en capas, o usa una captura del lienzo como imagen de fondo.' },
        { q: '¿Un degradado CSS es mejor que una imagen para el rendimiento?', a: 'Normalmente sí: unas líneas de CSS casi no pesan, se ven nítidas a cualquier tamaño y no requieren descarga extra, mientras que una imagen de fondo grande puede retrasar la primera carga.' },
      ],
    },
  },

  'color-blindness': {
    en: {
      howTo: [
        'Add the colors of your palette, or press Random to try an example palette.',
        'Pick a vision type (protanopia, deuteranopia, tritanopia or achromatopsia) and its severity.',
        'Compare the original and simulated palettes side by side, and check them in a real UI preview with charts and status pills.',
        'Read the takeaways to see which colors become hard to tell apart, then adjust them.',
      ],
      about: [
        'Color blindness, or color vision deficiency, changes how some colors look: with protanopia and deuteranopia reds and greens get confused, with tritanopia blues and yellows do, and achromatopsia removes color entirely. About 1 in 12 men see color differently.',
        'This color blindness simulator shows your palette through each type of vision, so you can catch colors that collapse into the same shade before your users do. It is especially useful for charts, status colors (success, warning, error) and maps, where color carries meaning.',
      ],
      faq: [
        { q: 'What is the most common type of color blindness?', a: 'Deuteranomaly, a reduced sensitivity to green, is the most common. Together, the red-green types affect about 8% of men and 0.5% of women.' },
        { q: 'How do I make charts readable for color blind users?', a: 'Use colors that differ in lightness, not only in hue, and add direct labels, patterns or icons so no information depends on color alone.' },
      ],
    },
    es: {
      howTo: [
        'Agrega los colores de tu paleta, o pulsa Aleatoria para probar con una paleta de ejemplo.',
        'Elige un tipo de visión (protanopia, deuteranopia, tritanopia o acromatopsia) y su severidad.',
        'Compara la paleta original y la simulada lado a lado, y revísala en una interfaz real con gráficos y etiquetas de estado.',
        'Lee las conclusiones para ver qué colores se vuelven difíciles de distinguir y ajústalos.',
      ],
      about: [
        'El daltonismo, o deficiencia de la visión del color, cambia cómo se ven algunos colores: con protanopia y deuteranopia se confunden el rojo y el verde, con tritanopia el azul y el amarillo, y la acromatopsia elimina el color por completo. Cerca de 1 de cada 12 hombres ve los colores de forma distinta.',
        'Este simulador de daltonismo muestra tu paleta a través de cada tipo de visión, para que detectes colores que se vuelven el mismo tono antes que tus usuarios. Es muy útil en gráficos, colores de estado (éxito, advertencia, error) y mapas, donde el color tiene significado.',
      ],
      faq: [
        { q: '¿Cuál es el tipo de daltonismo más común?', a: 'La deuteranomalía, una menor sensibilidad al verde, es la más común. En conjunto, los tipos rojo-verde afectan a cerca del 8% de los hombres y al 0.5% de las mujeres.' },
        { q: '¿Cómo hago gráficos legibles para personas daltónicas?', a: 'Usa colores que se diferencien en luminosidad, no solo en tono, y agrega etiquetas directas, patrones o íconos para que ninguna información dependa solo del color.' },
      ],
    },
  },

  'type-scale': {
    en: {
      howTo: [
        'Set a base font size and a ratio (for example 16px and 1.25, a major third).',
        'Switch the mode to Fluid and set a different base and ratio for mobile and desktop, so sizes grow with the screen.',
        'Preview the scale with your own font and sample text, at any viewport width.',
        'Export the scale as CSS variables (with clamp() in fluid mode) or as design tokens in JSON, and copy it.',
      ],
      about: [
        'A type scale is the set of font sizes in a design system, from small captions to large headings. A modular scale multiplies each size by the same ratio, which gives the hierarchy a consistent rhythm instead of random numbers.',
        'This type scale generator also works as a clamp() generator for fluid typography: for each step it calculates a CSS clamp() value that grows smoothly from your mobile size to your desktop size, so headings never jump abruptly between breakpoints.',
      ],
      faq: [
        { q: 'How does CSS clamp() work for font sizes?', a: 'clamp(min, preferred, max) keeps a value between a minimum and a maximum. For type, the preferred value mixes rem and vw, so the size grows with the viewport but never gets smaller than the min or larger than the max.' },
        { q: 'Which type scale ratio should I use?', a: 'For interfaces, 1.2 (minor third) or 1.25 (major third) keep sizes close together. For editorial or marketing pages, 1.333 (perfect fourth) or larger gives more dramatic headings.' },
      ],
    },
    es: {
      howTo: [
        'Define un tamaño base y una proporción (por ejemplo 16px y 1.25, una tercera mayor).',
        'Cambia el modo a Fluida y define una base y una proporción distintas para móvil y escritorio, para que los tamaños crezcan con la pantalla.',
        'Previsualiza la escala con tu tipografía y tu texto, en cualquier ancho de pantalla.',
        'Exporta la escala como variables CSS (con clamp() en modo fluido) o como design tokens en JSON, y cópiala.',
      ],
      about: [
        'Una escala tipográfica es el conjunto de tamaños de letra de un design system, desde los textos pequeños hasta los títulos grandes. Una escala modular multiplica cada tamaño por la misma proporción, lo que le da a la jerarquía un ritmo coherente en lugar de números al azar.',
        'Este generador de escalas tipográficas también funciona como generador de clamp() para tipografía fluida: para cada paso calcula un valor CSS clamp() que crece suavemente desde tu tamaño en móvil hasta tu tamaño en escritorio, para que los títulos no salten de golpe entre breakpoints.',
      ],
      faq: [
        { q: '¿Cómo funciona CSS clamp() para tamaños de letra?', a: 'clamp(mínimo, preferido, máximo) mantiene un valor entre un mínimo y un máximo. En tipografía, el valor preferido mezcla rem y vw, así que el tamaño crece con la pantalla pero nunca baja del mínimo ni supera el máximo.' },
        { q: '¿Qué proporción de escala tipográfica uso?', a: 'Para interfaces, 1.2 (tercera menor) o 1.25 (tercera mayor) mantienen los tamaños cerca. Para páginas editoriales o de marketing, 1.333 (cuarta justa) o más da títulos más dramáticos.' },
      ],
    },
  },

  'hue-hunt': {
    en: {
      howTo: [
        'Look at the target color.',
        'Move the hue, saturation and lightness sliders until your mix looks the same.',
        'Press Lock in my guess to see your score, then go to the next color. A game has five colors.',
        'Play the daily challenge (the same five colors for everyone that day) and share your result, or keep practicing in free play.',
      ],
      about: [
        'Hue Hunt is a color matching game that trains your eye for color. Every color can be described by its hue (where it sits on the color wheel), its saturation (how vivid it is) and its lightness (how light or dark it is), and learning to judge each one separately is what makes designers fast at picking colors.',
        'Your score uses the same perceptual distance (ΔE in CIE Lab) that color scientists use, so it rewards what the eye actually notices. A few minutes a day sharpens your sense of color for palettes, brand work and UI.',
      ],
      faq: [
        { q: 'Is Hue Hunt free?', a: 'Yes. It is free, needs no account and works on phones and computers.' },
        { q: 'Is there a new challenge every day?', a: 'Yes. The daily challenge changes every day and gives everyone the same five colors, so you can compare scores with friends.' },
      ],
    },
    es: {
      howTo: [
        'Mira el color objetivo.',
        'Mueve los controles de tono, saturación y luminosidad hasta que tu mezcla se vea igual.',
        'Pulsa Confirmar mi color para ver tu puntaje y pasa al siguiente color. Una partida tiene cinco colores.',
        'Juega el reto diario (los mismos cinco colores para todos ese día) y comparte tu resultado, o sigue practicando en juego libre.',
      ],
      about: [
        'Caza de color es un juego para igualar colores que entrena tu ojo. Cualquier color se describe por su tono (dónde está en la rueda de color), su saturación (qué tan intenso es) y su luminosidad (qué tan claro u oscuro es), y aprender a juzgar cada uno por separado es lo que hace rápidos a los diseñadores al elegir colores.',
        'Tu puntaje usa la misma distancia perceptual (ΔE en CIE Lab) que usan los científicos del color, así que premia lo que el ojo realmente nota. Unos minutos al día afinan tu sentido del color para paletas, marcas e interfaces.',
      ],
      faq: [
        { q: '¿Caza de color es gratis?', a: 'Sí. Es gratis, no necesita cuenta y funciona en celulares y computadoras.' },
        { q: '¿Hay un reto nuevo cada día?', a: 'Sí. El reto diario cambia cada día y le da a todos los mismos cinco colores, para que compares tu puntaje con amigos.' },
      ],
    },
  },
};
