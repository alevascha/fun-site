// Search-facing copy for each experiment: a keyword-first <title>, a meta
// description (≤ ~155 chars), what the tool does, and a short FAQ. The same
// text is rendered visibly on the page (ToolPage) and baked into the
// prerendered HTML + JSON-LD, so crawlers and people see identical content.

export const SEO = {
  'palette-generator': {
    title: 'Accessible Color Palette Generator (WCAG AA/AAA)',
    description: 'Free accessible color palette generator: pick a hue and harmony, get full tone scales with live WCAG AA/AAA contrast checks and one-click fixes.',
    features: [
      'Color harmonies: complementary, analogous, split-complementary, triad, square, compound and monochrome',
      'Seven tones per swatch with live AA/AAA contrast dots for your text colors',
      'Click a failing tone to nudge it to the closest passing lightness',
      'Export the whole palette as JSON or CSS custom properties',
    ],
    faq: [
      { q: 'What makes a color palette accessible?', a: 'Text and background pairs need enough contrast: 4.5:1 for normal text and 3:1 for large text under WCAG AA, or 7:1 and 4.5:1 for AAA. The generator checks every tone against your text colors as you edit.' },
      { q: 'Can I use the palette in code?', a: 'Yes. Copy every tone as CSS custom properties or JSON and paste it into your design tokens or stylesheet.' },
    ],
  },
  'contrast-checker': {
    title: 'WCAG Color Contrast Checker with One-Click Fix',
    description: 'Check the contrast ratio of any text and background color against WCAG 2.2 AA and AAA, then fix a failing pair with one click. Free, no sign-up.',
    features: [
      'Contrast ratio plus pass/fail for AA and AAA, normal and large text, and UI components',
      'One-click fix that adjusts the text or the background just enough to pass',
      'Live preview with headings, body text, buttons and icons',
      'Shareable URL for every color pair',
    ],
    faq: [
      { q: 'What contrast ratio does WCAG require?', a: 'WCAG 2.2 AA requires 4.5:1 for normal text and 3:1 for large text (24px, or 18.66px bold) and for UI components. AAA requires 7:1 for normal text and 4.5:1 for large text.' },
      { q: 'How does the one-click fix work?', a: 'It keeps the hue and saturation of the color you choose to change and moves only its lightness, the smallest amount needed to reach the next failing threshold.' },
    ],
  },
  'image-palette': {
    title: 'Extract a Color Palette from an Image',
    description: 'Upload or paste an image to extract its dominant colors, see each one’s share, and find which color pairs pass WCAG contrast. Runs in your browser.',
    features: [
      'Dominant colors via k-means clustering, with the share of the image each one covers',
      'Contrast of every extracted color against white and black text',
      'A full contrast matrix and the color pairs that pass AA',
      'Copy as CSS variables or open a color in the palette generator',
    ],
    faq: [
      { q: 'Is my image uploaded anywhere?', a: 'No. The image is read and analyzed on a canvas in your browser; it never leaves your device.' },
      { q: 'How many colors can I extract?', a: 'Between 4 and 10. Near-duplicate colors are merged so the palette stays useful.' },
    ],
  },
  'color-blindness': {
    title: 'Color Blindness Simulator for Palettes',
    description: 'Preview a color palette as people with protanopia, deuteranopia, tritanopia and achromatopsia see it, and catch colors that become indistinguishable.',
    features: [
      'Simulations based on Machado et al. (2009), with adjustable severity',
      'Flags color pairs that collapse into each other for each vision type',
      'Preview the palette in a chart and status pills, not just swatches',
      'Shareable palettes through the URL',
    ],
    faq: [
      { q: 'How common is color blindness?', a: 'About 1 in 12 men and 1 in 200 women have some form of color vision deficiency; red-green types (protan and deutan) are the most common.' },
      { q: 'How do I fix colors that collapse?', a: 'Don’t rely on hue alone: vary lightness between colors and add labels, icons or patterns, as WCAG 1.4.1 (Use of Color) requires.' },
    ],
  },
  'type-scale': {
    title: 'Type Scale Generator with Fluid clamp() CSS',
    description: 'Generate a modular type scale from a base size and ratio, preview it live, and export fluid clamp() CSS or design tokens for your design system.',
    features: [
      'Classic ratios from minor second to the golden ratio',
      'Fluid mode: different base and ratio for mobile and desktop, output as CSS clamp()',
      'Live preview with your sample text, font and viewport width',
      'Export as CSS custom properties or W3C design tokens',
    ],
    faq: [
      { q: 'What is a modular type scale?', a: 'A set of font sizes where each step is the previous one multiplied by a fixed ratio, such as 1.25. It gives headings and body text a consistent, predictable hierarchy.' },
      { q: 'What is fluid typography?', a: 'Font sizes that grow smoothly with the viewport between a minimum and maximum, written with CSS clamp(), instead of jumping at breakpoints.' },
    ],
  },
  'gradient-generator': {
    title: 'CSS Mesh Gradient Generator',
    description: 'Create linear, radial, conic and mesh gradients visually: drag color points, shuffle harmonious colors, add motion and copy the CSS.',
    features: [
      'Mesh gradients built from layered radial gradients — no images needed',
      'Draggable color points and stops (mouse, touch or keyboard)',
      'Harmony-based color shuffle and presets',
      'Optional animated drift that respects reduced-motion preferences',
    ],
    faq: [
      { q: 'How are mesh gradients made in CSS?', a: 'By stacking several radial-gradient() layers at different positions over a base color. The generator writes that CSS for you.' },
      { q: 'Will the animated gradient hurt accessibility?', a: 'The exported CSS includes a prefers-reduced-motion rule that turns the animation off for people who ask for less motion.' },
    ],
  },
  'component-states': {
    title: 'UI Component States Generator (Hover, Focus, Disabled)',
    description: 'Generate hover, focus, pressed, disabled, error and loading states for buttons, inputs, toggles and cards from one accent color, with WCAG checks.',
    features: [
      'Buttons, inputs, toggles, checkboxes and selectable cards in every state',
      'Hover and pressed shades that never lower label contrast',
      'WCAG checks per state: text 4.5:1, focus rings, borders and tracks 3:1',
      'A live playground with micro-interactions, plus CSS token export',
    ],
    faq: [
      { q: 'Do disabled states need to meet contrast requirements?', a: 'No. WCAG 1.4.3 exempts inactive components, but they should still be clearly perceivable as disabled.' },
      { q: 'How much contrast does a focus ring need?', a: 'At least 3:1 against the adjacent colors (WCAG 1.4.11 and 2.4.13), which the tool checks for every focus state.' },
    ],
  },
  'token-converter': {
    title: 'Design Token Converter: Figma Variables to CSS, Tailwind, SwiftUI',
    description: 'Convert W3C design tokens, Tokens Studio or Figma Variables JSON into CSS variables, SCSS, Tailwind v4, SwiftUI or flat JSON. Aliases and modes included.',
    features: [
      'Reads W3C/DTCG, Tokens Studio and Figma Variables exports (with modes)',
      'Keeps aliases as references or resolves them to values',
      'Outputs CSS, SCSS, Tailwind v4 @theme, SwiftUI and flat JSON',
      'Expands typography composites and previews every token',
    ],
    faq: [
      { q: 'What is the W3C design token format?', a: 'A JSON format from the Design Tokens Community Group where each token has a $value and a $type, grouped into nested objects, with aliases written as {group.token}.' },
      { q: 'Does it work with Tailwind CSS v4?', a: 'Yes. It writes an @theme block using Tailwind v4 namespaces such as --color-*, --spacing-*, --radius-* and --text-*.' },
    ],
  },
  'motion-playground': {
    title: 'Cubic Bezier & Spring Easing Generator',
    description: 'Edit cubic-bezier curves and physical springs side by side, preview them racing, and export CSS linear() springs, Framer Motion or SwiftUI motion tokens.',
    features: [
      'Draggable cubic-bezier editor with presets (Material, back, anticipate…)',
      'Spring simulator with stiffness, damping and mass, settle time and overshoot',
      'Springs exported as CSS linear() easing — no JavaScript required',
      'Export to CSS, design tokens, Framer Motion and SwiftUI',
    ],
    faq: [
      { q: 'Can CSS do spring animations?', a: 'Yes. The linear() easing function can approximate any curve, including a spring, by listing sampled points. The playground generates it from a real physics simulation.' },
      { q: 'How do I convert a spring to SwiftUI?', a: 'The export maps stiffness, damping and mass to SwiftUI’s .spring(response:dampingFraction:).' },
    ],
  },
  'auto-trim': {
    title: 'Trim Transparent Pixels from PNG Images (Bulk)',
    description: 'Automatically crop empty transparent edges, or a solid background, from many PNG images at once, in your browser, and download them as a ZIP.',
    features: [
      'Bulk trimming of transparent or solid-color edges',
      'Adjustable alpha threshold, background tolerance and padding',
      'See exactly what was cropped before you download',
      'Download one image or everything as a ZIP — nothing is uploaded',
    ],
    faq: [
      { q: 'Are my images uploaded to a server?', a: 'No. Trimming happens on a canvas in your browser, so your files never leave your device.' },
      { q: 'Can it remove a white background?', a: 'It can crop away a solid border that matches the top-left pixel, within a tolerance you set. It does not cut the background out from around the subject.' },
    ],
  },
  'text-expansion': {
    title: 'Text Expansion & Pseudo-Localization Tester',
    description: 'See how your UI breaks when text is translated: German, Spanish and pseudo-localized strings in a sample UI, with fragile vs resilient CSS fixes.',
    features: [
      'Real German and Spanish translations plus pseudo-localization',
      'Expansion based on IBM’s guidelines, with adjustable intensity',
      'Detects clipped labels, buttons, tabs and table headers automatically',
      'Compare fragile CSS with the resilient fixes side by side',
    ],
    faq: [
      { q: 'How much longer is translated text?', a: 'German is often around 30% longer than English, and short strings can double or triple in length. Planning for expansion avoids clipped buttons and labels.' },
      { q: 'What is pseudo-localization?', a: 'Replacing UI text with accented, padded and bracketed versions of English, so you can find truncation and hard-coded strings before real translations exist.' },
    ],
  },
  'a11y-audit': {
    title: 'Free HTML Accessibility Checker (WCAG)',
    description: 'Paste HTML and check it for missing alt text and labels, unnamed buttons, heading order, small tap targets and low contrast, with WCAG references.',
    features: [
      'Renders your HTML in a sandbox with scripts disabled',
      'Checks alt text, form labels, button and link names, headings, ids and tab order',
      'Measures real tap target sizes (WCAG 2.5.8) and text contrast (1.4.3)',
      'Click an issue to highlight the element, with a suggested fix',
    ],
    faq: [
      { q: 'Can automated tools find every accessibility issue?', a: 'No — automated checks catch roughly a third of real issues. Always test with a keyboard and a screen reader too.' },
      { q: 'What is the minimum tap target size?', a: 'WCAG 2.2 AA (2.5.8) requires at least 24×24 CSS pixels; 44×44 is the enhanced AAA level and a comfortable size for touch.' },
    ],
  },
  'multi-size': {
    title: 'Social Media & Display Ad Size Previewer',
    description: 'Lay out one message across Instagram, Story, LinkedIn, X, YouTube, Pinterest and IAB ad sizes with safe zones, then export every PNG at once.',
    features: [
      '12 sizes: social posts, stories, thumbnails and standard IAB display ads',
      'Platform safe zones for story UI and video timestamps',
      'Draggable focal point keeps your image’s subject in frame',
      'Export single PNGs or every size as a ZIP',
    ],
    faq: [
      { q: 'What size is an Instagram story?', a: '1080×1920 pixels (9:16). Keep text out of roughly the top 14% and bottom 20%, where the profile bar and reply field sit.' },
      { q: 'What are the most common display ad sizes?', a: 'Medium rectangle (300×250), leaderboard (728×90), half page (300×600), wide skyscraper (160×600), billboard (970×250) and mobile banner (320×50).' },
    ],
  },
  'mobile-preview': {
    title: 'Mobile Website Preview — Test Any Site on iPhone, Android & iPad',
    description: 'See any website inside iPhone 16, iPhone SE, Pixel, Galaxy and iPad frames at real viewport sizes. Rotate to landscape or compare four devices side by side. Free.',
    features: [
      '7 devices at their real CSS viewport sizes, from iPhone SE to iPad Air',
      'Portrait and landscape, with status bars, notches and home indicators',
      'Compare four devices side by side at true relative scale',
      'Shareable links: the address, device and orientation live in the URL',
    ],
    faq: [
      { q: 'What is the viewport size of an iPhone 16 Pro?', a: '402×874 CSS pixels (1206×2622 physical pixels at 3x). The iPhone 16 Pro Max is 440×956, and the iPhone SE is 375×667.' },
      { q: 'Why does a site show up blank?', a: 'Many large sites send X-Frame-Options or a CSP frame-ancestors header that forbids being shown inside another page. Open them in a new tab and use your browser’s device mode instead.' },
      { q: 'Is this the same as testing on a real phone?', a: 'It shows the real responsive layout, since the page gets the device’s width. Touch behavior, browser UI and sites that detect phones by user agent still need a real device or your browser’s device mode.' },
    ],
  },
  'hue-hunt': {
    title: 'Hue Hunt — Color Matching Game for Designers',
    description: 'A free daily color game: match five colors by eye with hue, saturation and lightness sliders, scored by perceptual distance (ΔE). Share your result.',
    features: [
      'Daily challenge with the same five colors for everyone',
      'Scored by CIE ΔE, the perceptual distance designers use',
      'Big touch-friendly sliders that work great on phones',
      'Shareable emoji result, plus unlimited free play',
    ],
    faq: [
      { q: 'How is Hue Hunt scored?', a: 'Each guess is compared to the target in CIE Lab color space. A ΔE around 2 is barely noticeable and scores about 96; every point of ΔE costs two points.' },
      { q: 'Any tips for a better score?', a: 'Match lightness first, then hue, then saturation. Our eyes are most sensitive to lightness differences.' },
    ],
  },
  'pass-or-fail': {
    title: 'Pass or Fail — WCAG Contrast Game',
    description: 'Test your eye for accessible color contrast: twenty timed rounds deciding whether text passes WCAG AA (4.5:1 normal, 3:1 large). Free, with explanations.',
    features: [
      'Pairs generated near the AA thresholds, never right on the line',
      'Normal and large text rounds, like real interfaces',
      'Real ratios revealed after every call',
      'Keyboard controls (← / →) and big touch buttons',
    ],
    faq: [
      { q: 'What contrast does WCAG AA require?', a: '4.5:1 for normal text and 3:1 for large text (24px, or 18.66px bold) and for UI components.' },
      { q: 'Why is contrast hard to judge by eye?', a: 'Perceived contrast depends on hue, size and surroundings, so two pairs with the same ratio can look very different. That is why it is measured.' },
    ],
  },
  'optical-eye': {
    title: 'Optical Eye — Layout Precision Game for Designers',
    description: 'A free game that tests your eye for layout: center a play icon, even out padding, match spacing and size a circle against a square. Scored by pixel precision.',
    features: [
      'Seven layout flaws to fix with one slider each, no numbers',
      'Mix of exact rounds and optical ones designers learn the hard way',
      'The perfect value appears after every round, with the reason',
      'Shareable result with your precision per round',
    ],
    faq: [
      { q: 'Why does a play icon need to sit right of center?', a: 'A triangle’s visual weight is at its centroid, a third of the way from its flat side, so centering its bounding box makes it look shifted left. Nudging it right by about a sixth of its width fixes it.' },
      { q: 'Why should a circle be bigger than a square?', a: 'A circle covers less area than a square of the same width, so it looks smaller. Icon grids and typefaces make round shapes about 10 to 13% larger to compensate.' },
    ],
  },
  'state-panic': {
    title: 'State Panic — UI States Arcade Game',
    description: 'A fast arcade game about component states: pick hover, focus-visible, pressed, loading, error or disabled for each falling component before it hits the floor.',
    features: [
      'Six real UI states on buttons, inputs, toggles and cards',
      'Events written like real product situations',
      'Components morph into the state you choose',
      'Gets faster as you go; keys 1–6 work on desktop',
    ],
    faq: [
      { q: 'What is the difference between hover and focus-visible?', a: 'Hover is the mouse pointer resting on an element. Focus-visible appears when someone reaches it with the keyboard, and it must be clearly visible for accessibility.' },
      { q: 'Why design loading, error and disabled states?', a: 'Every interactive component spends time in these states in real products. Skipping them leads to frozen buttons, silent failures and confused users.' },
    ],
  },
  'easing-golf': {
    title: 'Easing Golf — Cubic-Bezier Animation Curve Game',
    description: 'Mini golf with animation curves: drag two cubic-bezier handles so the puck passes each flag at the right time, then putt. Six holes, par three each.',
    features: [
      'Six holes based on real easing curves, including overshoot and anticipation',
      'Drag the handles with touch, mouse or arrow keys',
      'Missed putts reveal the target points, so every stroke teaches',
      'Shareable scorecard with birdies and bogeys',
    ],
    faq: [
      { q: 'What is a cubic-bezier easing curve?', a: 'It maps animation time to progress with two control points. CSS writes it as cubic-bezier(x1, y1, x2, y2); values above 1 or below 0 on the y axis create overshoot and anticipation.' },
      { q: 'How do I get better at reading curves?', a: 'A steep start means fast early movement (ease out), a flat start means a slow start (ease in). Practice in the Motion Playground, then come back for a lower score.' },
    ],
  },
  'contrast-survival': {
    title: 'Contrast Survival — WCAG Contrast Reflex Game',
    description: 'The background keeps shifting color and lightness. Adjust the text lightness to keep passing WCAG AA (4.5:1), then AAA (7:1), and survive as long as you can.',
    features: [
      'Live WCAG contrast ratio while the background drifts',
      'AA for the first twenty seconds, then AAA at 7:1',
      'Slider and arrow-key controls',
      'Shareable survival time',
    ],
    faq: [
      { q: 'Why is mid-tone such a trap?', a: 'On a medium-light background neither white nor black text reaches high contrast, so the right text color flips around the middle. That is why mid-tone backgrounds are hard to use for text.' },
      { q: 'What is the difference between AA and AAA?', a: 'AA asks for 4.5:1 for normal text and 3:1 for large text. AAA asks for 7:1 and 4.5:1, which noticeably limits the colors you can use.' },
    ],
  },
  'token-rush': {
    title: 'Token Rush — Design Tokens Game',
    description: 'Replace hard-coded values in a component with the right semantic design tokens, against the clock. Then switch the theme and see what breaks.',
    features: [
      'Fourteen properties: color, spacing, radius and type',
      'Tokens that share a value on purpose, like space-md and radius-lg',
      'Faster answers score more; keys 1–6 work',
      'Theme switch at the end shows what stays hard-coded',
    ],
    faq: [
      { q: 'Why not pick a token just by its value?', a: 'Two tokens can share a value today and drift apart tomorrow. space-md and radius-lg are both 16px here, but only one of them should change when you adjust spacing.' },
      { q: 'What are semantic tokens?', a: 'Tokens named by purpose (text-secondary, bg-surface) instead of by value (gray-400). They let a theme change values in one place while components keep their meaning.' },
    ],
  },
};
