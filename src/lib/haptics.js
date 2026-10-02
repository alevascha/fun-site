// A tiny tap of vibration on supporting phones (Android); no-op elsewhere.
export function haptic(ms = 8) {
  try {
    if (window.matchMedia('(pointer: coarse)').matches) navigator.vibrate?.(ms);
  } catch { /* unsupported */ }
}
