// Add a new entry here each time a new experiment is built.
// `path` must match a <Route> in App.jsx. Omit `path` (or set active:false)
// for a "coming soon" placeholder card.
export const experiments = [
  {
    id: 'palette-generator',
    path: '/palette-generator',
    emoji: '🎨',
    accent: '#ff8a8a',
    title: 'Palette Generator',
    description: 'Pick a hue, choose a color harmony, and get a full accessible palette with live AA/AAA contrast checking.',
    tag: 'New',
    active: true,
  },
  {
    id: 'placeholder-1',
    emoji: '🧪',
    accent: '#7cc4ff',
    title: 'Coming soon',
    description: "Something else fun is brewing here.",
    active: false,
  },
  {
    id: 'placeholder-2',
    emoji: '🛸',
    accent: '#ffd56e',
    title: 'Coming soon',
    description: 'Another experiment, not quite ready yet.',
    active: false,
  },
  {
    id: 'placeholder-3',
    emoji: '🌀',
    accent: '#c792ff',
    title: 'Coming soon',
    description: 'This slot is reserved for the next idea.',
    active: false,
  },
];
