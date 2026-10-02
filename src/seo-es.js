// Spanish versions of every page: translated URL slug, tool name, search
// title/description, intro, features and FAQ. English equivalents live in
// experiments.js + seo.js.

export const ES = {
  'palette-generator': {
    slug: 'generador-de-paletas',
    name: 'Generador de paletas',
    card: 'Elige un tono y una armonía y obtén una paleta accesible completa con verificación de contraste AA/AAA en vivo.',
    title: 'Generador de paletas de colores accesibles (WCAG AA/AAA)',
    description: 'Generador gratuito de paletas de colores accesibles: elige un tono y una armonía y obtén escalas completas con verificación de contraste WCAG AA/AAA en vivo.',
    intro: 'Elige un tono en la rueda, una armonía y tus colores de texto: cada tono se actualiza en vivo con verificación WCAG. Los puntos muestran qué colores de texto son seguros sobre cada tono; haz clic en un punto punteado para corregirlo.',
    features: [
      'Armonías: complementaria, análoga, complementaria dividida, tríada, cuadrada, compuesta y monocromática',
      'Siete tonos por muestra con puntos de contraste AA/AAA para tus colores de texto',
      'Haz clic en un tono que falla para llevarlo a la luminosidad más cercana que pasa',
      'Exporta la paleta completa como JSON o variables CSS',
    ],
    faq: [
      { q: '¿Qué hace que una paleta de colores sea accesible?', a: 'Las combinaciones de texto y fondo necesitan suficiente contraste: 4.5:1 para texto normal y 3:1 para texto grande según WCAG AA, o 7:1 y 4.5:1 para AAA. El generador revisa cada tono contra tus colores de texto mientras editas.' },
      { q: '¿Puedo usar la paleta en código?', a: 'Sí. Copia todos los tonos como variables CSS o JSON y pégalos en tus design tokens o en tu hoja de estilos.' },
    ],
  },
  'contrast-checker': {
    slug: 'verificador-de-contraste',
    name: 'Verificador de contraste',
    card: 'Pega dos colores, mira el ratio WCAG y corrige una combinación que falla con un clic.',
    title: 'Verificador de contraste de color WCAG con corrección en un clic',
    description: 'Comprueba el contraste entre el color del texto y el fondo según WCAG 2.2 AA y AAA, y corrige una combinación que falla con un clic. Gratis, sin registro.',
    intro: 'Pega dos colores, mira el ratio de contraste y corrige una combinación que no pasa con un solo clic.',
    features: [
      'Ratio de contraste y resultado AA/AAA para texto normal, texto grande y componentes de interfaz',
      'Corrección en un clic que ajusta el texto o el fondo lo mínimo necesario para pasar',
      'Vista previa con títulos, texto, botones e iconos',
      'Enlace para compartir cada combinación de colores',
    ],
    faq: [
      { q: '¿Qué ratio de contraste exige WCAG?', a: 'WCAG 2.2 AA exige 4.5:1 para texto normal y 3:1 para texto grande (24px, o 18.66px en negrita) y componentes de interfaz. AAA exige 7:1 para texto normal y 4.5:1 para texto grande.' },
      { q: '¿Cómo funciona la corrección en un clic?', a: 'Mantiene el tono y la saturación del color que eliges cambiar y ajusta solo su luminosidad, lo mínimo necesario para alcanzar el siguiente nivel que falla.' },
    ],
  },
  'image-palette': {
    slug: 'paleta-desde-imagen',
    name: 'Imagen → Paleta',
    card: 'Sube una imagen, extrae sus colores dominantes y descubre qué combinaciones se pueden usar juntas.',
    title: 'Extrae una paleta de colores de una imagen',
    description: 'Sube o pega una imagen para extraer sus colores dominantes, ver cuánto ocupa cada uno y qué combinaciones pasan el contraste WCAG. Funciona en tu navegador.',
    intro: 'Suelta, pega o elige una imagen. Los colores dominantes se extraen con clustering k-means y cada par pasa por las mismas verificaciones WCAG que el generador de paletas. Tu imagen nunca sale de tu navegador.',
    features: [
      'Colores dominantes con k-means y el porcentaje de la imagen que ocupa cada uno',
      'Contraste de cada color frente a texto blanco y negro',
      'Matriz de contraste completa y los pares que pasan AA',
      'Copia como variables CSS o abre un color en el generador de paletas',
    ],
    faq: [
      { q: '¿Mi imagen se sube a algún servidor?', a: 'No. La imagen se lee y analiza en un canvas dentro de tu navegador; nunca sale de tu dispositivo.' },
      { q: '¿Cuántos colores puedo extraer?', a: 'Entre 4 y 10. Los colores casi idénticos se combinan para que la paleta sea útil.' },
    ],
  },
  'color-blindness': {
    slug: 'simulador-de-daltonismo',
    name: 'Simulador de daltonismo',
    card: 'Mira una paleta con protanopia, deuteranopia, tritanopia y acromatopsia, y detecta los colores que se confunden.',
    title: 'Simulador de daltonismo para paletas de colores',
    description: 'Mira una paleta como la ven las personas con protanopia, deuteranopia, tritanopia y acromatopsia, y detecta colores que se vuelven indistinguibles.',
    intro: 'Pega una paleta (o tráela desde otras herramientas) y mírala con los principales tipos de deficiencia en la visión del color. Los pares que se confunden se marcan, para que sepas dónde añadir una etiqueta, un patrón o más contraste de luminosidad.',
    features: [
      'Simulaciones basadas en Machado et al. (2009), con severidad ajustable',
      'Marca los pares de colores que se confunden en cada tipo de visión',
      'Vista previa de la paleta en un gráfico y en etiquetas de estado, no solo en muestras',
      'Paletas compartibles mediante la URL',
    ],
    faq: [
      { q: '¿Qué tan común es el daltonismo?', a: 'Alrededor de 1 de cada 12 hombres y 1 de cada 200 mujeres tiene algún tipo de deficiencia en la visión del color; los tipos rojo-verde (protan y deutan) son los más comunes.' },
      { q: '¿Cómo corrijo colores que se confunden?', a: 'No dependas solo del tono: varía la luminosidad entre colores y añade etiquetas, iconos o patrones, como exige WCAG 1.4.1 (Uso del color).' },
    ],
  },
  'type-scale': {
    slug: 'escala-tipografica',
    name: 'Generador de escala tipográfica',
    card: 'Elige un tamaño base y una proporción y obtén una escala tipográfica completa con vista previa, clamp() fluido y tokens.',
    title: 'Generador de escala tipográfica con CSS clamp() fluido',
    description: 'Genera una escala tipográfica modular a partir de un tamaño base y una proporción, mírala en vivo y exporta CSS clamp() fluido o design tokens.',
    intro: 'Elige un tamaño base y una proporción para obtener una escala tipográfica modular. Activa el modo fluido para usar una proporción más compacta en móvil y otra más marcada en escritorio: el resultado son valores clamp() que escalan suavemente entre ambos.',
    features: [
      'Proporciones clásicas, de segunda menor a la proporción áurea',
      'Modo fluido: base y proporción distintas para móvil y escritorio, exportadas como CSS clamp()',
      'Vista previa en vivo con tu texto, fuente y ancho de pantalla',
      'Exporta como variables CSS o design tokens W3C',
    ],
    faq: [
      { q: '¿Qué es una escala tipográfica modular?', a: 'Un conjunto de tamaños donde cada paso es el anterior multiplicado por una proporción fija, como 1.25. Da a los títulos y al texto una jerarquía coherente y predecible.' },
      { q: '¿Qué es la tipografía fluida?', a: 'Tamaños de letra que crecen suavemente con el ancho de la pantalla entre un mínimo y un máximo, escritos con CSS clamp(), en lugar de saltar en cada breakpoint.' },
    ],
  },
  'gradient-generator': {
    slug: 'generador-de-degradados',
    name: 'Generador de degradados',
    card: 'Degradados lineales, radiales, cónicos o de malla: arrastra los puntos, mezcla colores y copia el CSS.',
    title: 'Generador de degradados de malla en CSS',
    description: 'Crea degradados lineales, radiales, cónicos y de malla de forma visual: arrastra puntos de color, mezcla colores armónicos, añade movimiento y copia el CSS.',
    intro: 'Crea degradados lineales, radiales, cónicos o de malla. Arrastra los puntos, mezcla colores armónicos y copia el CSS listo para usar.',
    features: [
      'Degradados de malla hechos con capas de radial-gradient, sin imágenes',
      'Puntos y paradas de color arrastrables (ratón, táctil o teclado)',
      'Mezcla de colores basada en armonías y ajustes predefinidos',
      'Movimiento opcional que respeta la preferencia de reducir el movimiento',
    ],
    faq: [
      { q: '¿Cómo se hacen degradados de malla en CSS?', a: 'Apilando varias capas de radial-gradient() en distintas posiciones sobre un color base. El generador escribe ese CSS por ti.' },
      { q: '¿El degradado animado afecta la accesibilidad?', a: 'El CSS exportado incluye una regla prefers-reduced-motion que desactiva la animación para quienes piden menos movimiento.' },
    ],
  },
  'component-states': {
    slug: 'estados-de-componentes',
    name: 'Explorador de estados de componentes',
    card: 'Botones, campos y tarjetas en todos sus estados (hover, foco, presionado, deshabilitado, error) con verificación de contraste.',
    title: 'Generador de estados de componentes UI (hover, foco, deshabilitado)',
    description: 'Genera los estados hover, foco, presionado, deshabilitado, error y carga de botones, campos, interruptores y tarjetas desde un solo color, con verificación WCAG.',
    intro: 'Un color de acento entra y salen todos los estados interactivos, con las microinteracciones que les dan vida. Juega con los componentes en vivo y revisa cada estado lado a lado con su verificación WCAG (texto 4.5:1; anillos de foco, bordes y pistas 3:1).',
    features: [
      'Botones, campos, interruptores, casillas y tarjetas seleccionables en todos sus estados',
      'Tonos de hover y presionado que nunca reducen el contraste de la etiqueta',
      'Verificación WCAG por estado: texto 4.5:1, anillos de foco, bordes y pistas 3:1',
      'Área de pruebas en vivo con microinteracciones y exportación de tokens CSS',
    ],
    faq: [
      { q: '¿Los estados deshabilitados deben cumplir el contraste?', a: 'No. WCAG 1.4.3 exime a los componentes inactivos, pero aun así deben verse claramente como deshabilitados.' },
      { q: '¿Cuánto contraste necesita un anillo de foco?', a: 'Al menos 3:1 frente a los colores adyacentes (WCAG 1.4.11 y 2.4.13); la herramienta lo comprueba en cada estado de foco.' },
    ],
  },
  'token-converter': {
    slug: 'convertidor-de-tokens',
    name: 'Convertidor de design tokens',
    card: 'Pega tokens W3C, Tokens Studio o Variables de Figma y obtén CSS, SCSS, Tailwind v4 o SwiftUI, con alias incluidos.',
    title: 'Convertidor de design tokens: Variables de Figma a CSS, Tailwind y SwiftUI',
    description: 'Convierte design tokens W3C, Tokens Studio o JSON de Variables de Figma en variables CSS, SCSS, Tailwind v4, SwiftUI o JSON plano. Con alias y modos.',
    intro: 'Pega design tokens W3C, un archivo de Tokens Studio o una exportación de Variables de Figma. Los alias se resuelven (o se mantienen como referencias cuando el formato lo permite), los compuestos como la tipografía se expanden, y obtienes CSS, SCSS, Tailwind v4, SwiftUI o JSON plano, todo en tu navegador.',
    features: [
      'Lee exportaciones W3C/DTCG, Tokens Studio y Variables de Figma (con modos)',
      'Mantiene los alias como referencias o los resuelve a valores',
      'Genera CSS, SCSS, @theme de Tailwind v4, SwiftUI y JSON plano',
      'Expande compuestos de tipografía y muestra cada token',
    ],
    faq: [
      { q: '¿Qué es el formato de design tokens del W3C?', a: 'Un formato JSON del Design Tokens Community Group donde cada token tiene $value y $type, agrupados en objetos anidados, con alias escritos como {grupo.token}.' },
      { q: '¿Funciona con Tailwind CSS v4?', a: 'Sí. Genera un bloque @theme con los espacios de nombres de Tailwind v4, como --color-*, --spacing-*, --radius-* y --text-*.' },
    ],
  },
  'motion-playground': {
    slug: 'curvas-de-animacion',
    name: 'Laboratorio de movimiento',
    card: 'Arrastra curvas cubic-bezier, ajusta un resorte real, míralos competir y exporta tokens de movimiento.',
    title: 'Generador de curvas cubic-bezier y animaciones con resorte',
    description: 'Edita curvas cubic-bezier y resortes físicos lado a lado, míralos competir y exporta resortes CSS linear(), Framer Motion o tokens de movimiento SwiftUI.',
    intro: 'Dale forma a una curva cubic-bezier arrastrando sus controles, ajusta un resorte físico y míralos competir contra una animación lineal. Los resortes se exportan como easing linear() de CSS, así que funcionan en cualquier lugar sin JavaScript.',
    features: [
      'Editor de cubic-bezier arrastrable con ajustes predefinidos (Material, back, anticipate…)',
      'Simulador de resorte con rigidez, amortiguación y masa, tiempo de asentamiento y rebote',
      'Resortes exportados como easing linear() de CSS, sin JavaScript',
      'Exporta a CSS, design tokens, Framer Motion y SwiftUI',
    ],
    faq: [
      { q: '¿CSS puede hacer animaciones con resorte?', a: 'Sí. La función linear() puede aproximar cualquier curva, incluido un resorte, listando puntos muestreados. El laboratorio la genera a partir de una simulación física real.' },
      { q: '¿Cómo convierto un resorte a SwiftUI?', a: 'La exportación convierte rigidez, amortiguación y masa en .spring(response:dampingFraction:) de SwiftUI.' },
    ],
  },
  'auto-trim': {
    slug: 'recortar-transparencia',
    name: 'Recorte automático',
    card: 'Suelta tus PNG y recupéralos sin los bordes transparentes vacíos, en lote, en tu navegador y en un solo ZIP.',
    title: 'Recorta píxeles transparentes de imágenes PNG (en lote)',
    description: 'Recorta automáticamente los bordes transparentes vacíos, o un fondo sólido, de muchas imágenes PNG a la vez en tu navegador, y descárgalas en un ZIP.',
    intro: 'Suelta PNG, WebP o capturas de pantalla y recupéralas sin los bordes vacíos: relleno transparente, o un fondo sólido si quieres. Funciona en lote, todo queda en tu navegador y puedes descargar un solo ZIP.',
    features: [
      'Recorte en lote de bordes transparentes o de color sólido',
      'Umbral de transparencia, tolerancia del fondo y margen ajustables',
      'Mira exactamente qué se recortó antes de descargar',
      'Descarga una imagen o todas en un ZIP; nada se sube',
    ],
    faq: [
      { q: '¿Mis imágenes se suben a un servidor?', a: 'No. El recorte ocurre en un canvas dentro de tu navegador, así que tus archivos nunca salen de tu dispositivo.' },
      { q: '¿Puede quitar un fondo blanco?', a: 'Puede recortar un borde sólido que coincida con el píxel superior izquierdo, con la tolerancia que elijas. No recorta el fondo alrededor del sujeto.' },
    ],
  },
  'text-expansion': {
    slug: 'prueba-de-expansion-de-texto',
    name: 'Prueba de expansión de texto',
    card: 'Mira cómo se rompe una interfaz en alemán, español o pseudotraducción, y qué CSS la hace resistir la traducción.',
    title: 'Prueba de expansión de texto y pseudolocalización',
    description: 'Mira cómo se rompe tu interfaz al traducir el texto: alemán, español y pseudolocalización en una interfaz de ejemplo, con soluciones de CSS frágil vs resistente.',
    intro: 'El alemán suele ser un 30% más largo que el inglés, y las etiquetas cortas pueden duplicarse. Cambia de idioma, sube la pseudolocalización y achica la pantalla para ver qué se rompe. Activa el diseño resistente para ver el CSS que hace que la misma interfaz sobreviva a la traducción.',
    features: [
      'Traducciones reales al alemán y al español, más pseudolocalización',
      'Expansión basada en las pautas de IBM, con intensidad ajustable',
      'Detecta automáticamente etiquetas, botones, pestañas y encabezados recortados',
      'Compara CSS frágil con las soluciones resistentes lado a lado',
    ],
    faq: [
      { q: '¿Cuánto más largo es el texto traducido?', a: 'El alemán suele ser alrededor de un 30% más largo que el inglés, y los textos cortos pueden duplicarse o triplicarse. Planificar la expansión evita botones y etiquetas recortados.' },
      { q: '¿Qué es la pseudolocalización?', a: 'Reemplazar el texto de la interfaz por versiones del inglés con acentos, relleno y corchetes, para encontrar recortes y textos fijos antes de tener traducciones reales.' },
    ],
  },
  'a11y-audit': {
    slug: 'auditoria-de-accesibilidad',
    name: 'Mini auditoría de accesibilidad',
    card: 'Pega HTML y encuentra textos alternativos y etiquetas que faltan, botones sin nombre, saltos de títulos, objetivos táctiles pequeños y bajo contraste.',
    title: 'Verificador de accesibilidad HTML gratuito (WCAG)',
    description: 'Pega HTML y revísalo: textos alternativos y etiquetas que faltan, botones sin nombre, orden de títulos, objetivos táctiles pequeños y bajo contraste, con referencias WCAG.',
    intro: 'Pega una página o un fragmento de HTML. Se renderiza en un entorno aislado (los scripts nunca se ejecutan) y se revisan textos alternativos y etiquetas, botones y enlaces sin nombre, orden de títulos, objetivos táctiles menores de 24×24px y bajo contraste. Haz clic en un problema para encontrarlo en la vista previa.',
    features: [
      'Renderiza tu HTML en un entorno aislado con los scripts desactivados',
      'Revisa textos alternativos, etiquetas de formularios, nombres de botones y enlaces, títulos, ids y orden de tabulación',
      'Mide el tamaño real de los objetivos táctiles (WCAG 2.5.8) y el contraste del texto (1.4.3)',
      'Haz clic en un problema para resaltar el elemento, con una solución sugerida',
    ],
    faq: [
      { q: '¿Las herramientas automáticas encuentran todos los problemas de accesibilidad?', a: 'No: las verificaciones automáticas detectan aproximadamente un tercio de los problemas reales. Prueba siempre también con teclado y con un lector de pantalla.' },
      { q: '¿Cuál es el tamaño mínimo de un objetivo táctil?', a: 'WCAG 2.2 AA (2.5.8) exige al menos 24×24 píxeles CSS; 44×44 es el nivel AAA y un tamaño cómodo para pantallas táctiles.' },
    ],
  },
  'multi-size': {
    slug: 'vista-previa-multiformato',
    name: 'Vista previa multiformato',
    card: 'Un mensaje en tamaños de redes sociales y anuncios display, con zonas seguras y punto focal arrastrable. Exporta cada PNG.',
    title: 'Vista previa de tamaños para redes sociales y anuncios display',
    description: 'Diseña un mensaje en Instagram, Stories, LinkedIn, X, YouTube, Pinterest y tamaños de anuncios IAB con zonas seguras, y exporta todos los PNG a la vez.',
    intro: 'Escribe un mensaje y míralo en publicaciones sociales, stories y tamaños de anuncios display a la vez, con las zonas que cubre la interfaz de cada plataforma marcadas en rojo. Arrastra el punto focal para mantener lo importante de tu imagen en el encuadre y exporta cada tamaño como PNG.',
    features: [
      '12 tamaños: publicaciones, stories, miniaturas y anuncios display IAB estándar',
      'Zonas seguras de la interfaz de stories y de la marca de tiempo de los videos',
      'Punto focal arrastrable para mantener el sujeto de tu imagen en el encuadre',
      'Exporta PNG individuales o todos los tamaños en un ZIP',
    ],
    faq: [
      { q: '¿Qué tamaño tiene una story de Instagram?', a: '1080×1920 píxeles (9:16). Mantén el texto fuera del 14% superior y el 20% inferior, donde están la barra del perfil y el campo de respuesta.' },
      { q: '¿Cuáles son los tamaños de anuncios display más comunes?', a: 'Rectángulo mediano (300×250), leaderboard (728×90), media página (300×600), rascacielos ancho (160×600), billboard (970×250) y banner móvil (320×50).' },
    ],
  },
};

// Non-tool pages: English path → Spanish path.
export const PAGE_PATHS = {
  '/': '/es',
  '/about': '/es/acerca-de',
  '/privacy': '/es/privacidad',
  '/pro': '/es/pro',
  '/guides': '/es/guias',
  '/changelog': '/es/novedades',
  '/confirm': '/es/confirmar',
  '/unsubscribe': '/es/baja',
};

export const HOME_ES = {
  title: "Herramientas gratuitas de diseño y accesibilidad — Ale's Fun Lab",
  description: 'Herramientas gratuitas de diseño y accesibilidad de Alejandro Vasquez: paletas de colores, verificador de contraste WCAG, convertidor de design tokens, escalas tipográficas, curvas de animación y más.',
};

export const esPath = id => (ES[id] ? `/es/${ES[id].slug}` : null);
