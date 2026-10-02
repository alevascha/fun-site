// Design System Snapshot — Framer code component for alevasquez.dev case studies.
// Each project passes its real token spec (JSON, from the Projects CMS
// "Design Tokens" field): named colors, fonts, radii, shadows and button
// styles taken from the brand's live product. Everything renders live.
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

const EASE = [0.16, 1, 0.3, 1]

type Spec = {
    fonts?: { heading?: string; body?: string; mono?: string; headingWeight?: number; tracking?: string; url?: string }
    colors?: Record<string, string>
    scales?: string[]
    gradient?: string
    bg?: string
    surface?: string
    text?: string
    muted?: string
    border?: string
    focus?: string
    radius?: { button?: number; card?: number; input?: number; chip?: number }
    shadow?: string
    primary?: { bg?: string; ink?: string; border?: string }
    secondary?: { bg?: string; ink?: string; border?: string }
    highlight?: "gradient" | "marker" | "color"
    highlightColor?: string
    sample?: { headline?: string; cta?: string; secondary?: string; input?: string; placeholder?: string; helper?: string; invalid?: string; valid?: string; card?: string; cardMeta?: string; cardCta?: string; chips?: string[] }
}

// ---------- color helpers ----------
function parse(c: string): number[] {
    if (!c) return [0, 0, 0]
    const v = c.match(/var\([^,]+,\s*(.+)\)$/)
    if (v) c = v[1]
    if (c[0] === "#") {
        let h = c.slice(1)
        if (h.length === 3) h = h.split("").map((x) => x + x).join("")
        const n = parseInt(h.slice(0, 6), 16)
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }
    const n = c.match(/[\d.]+/g)
    return n ? [+n[0], +n[1], +n[2]] : [0, 0, 0]
}
const hex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase()
function toHsl([r, g, b]: number[]) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
    if (max === min) return [0, 0, l * 100]
    const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    return [h * 60, s * 100, l * 100]
}
function fromHsl(h: number, s: number, l: number) {
    s /= 100; l /= 100
    const k = (n: number) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l)
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return [f(0) * 255, f(8) * 255, f(4) * 255]
}
const lum = (rgb: number[]) => {
    const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: number[], b: number[]) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
const grade = (r: number) => (r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA18" : "—")
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
const LIGHT = [96, 90, 81, 70, 60, 50, 41, 33, 24, 15]
const scale = (base: string) => { const [h, s] = toHsl(parse(base)); return STEPS.map((step, i) => ({ step, rgb: fromHsl(h, Math.min(95, s), LIGHT[i]) })) }

// Fonts: load the brand's Google Fonts once per URL.
function useFonts(url?: string) {
    useEffect(() => {
        if (!url || typeof document === "undefined" || !/^https:\/\/fonts\.googleapis\.com\//.test(url)) return
        if (document.querySelector(`link[data-dss-font="${url}"]`)) return
        const l = document.createElement("link")
        l.rel = "stylesheet"; l.href = url; l.setAttribute("data-dss-font", url)
        document.head.appendChild(l)
    }, [url])
}

// ---------- defaults (used when a project has no spec yet) ----------
function fallbackSpec(primary: string, secondary: string, accent: string): Spec {
    return {
        colors: { primary, secondary, accent, ink: "#111011", surface: "#F4F4F2", white: "#FFFFFF" },
        scales: ["primary", "accent"],
        bg: "#FFFFFF", surface: "#F4F4F2", text: "#111011", muted: "#6B6866", border: "rgba(17,16,17,.12)",
        radius: { button: 12, card: 20, input: 10, chip: 999 },
        shadow: "0 10px 30px rgba(17,16,17,.08)",
        primary: { bg: primary, ink: contrast(parse(primary), [255, 255, 255]) >= 3 ? "#FFFFFF" : "#111011" },
        secondary: { bg: "#FFFFFF", ink: "#111011", border: "rgba(17,16,17,.25)" },
        highlight: "color", highlightColor: primary,
    }
}

// ---------- pieces ----------
function Tabs({ value, onChange, options }) {
    const id = useId() // one sliding pill per tab group (and per instance)
    return (
        <div role="tablist" style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 999, background: "rgba(255,255,255,.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)" }}>
            {options.map((o) => (
                <button key={o} role="tab" aria-selected={value === o} onClick={() => onChange(o)} style={{ position: "relative", border: 0, background: "transparent", cursor: "pointer", padding: "9px 16px", borderRadius: 999, font: "600 13px/1 Inter, sans-serif", color: value === o ? "#111011" : "rgba(247,247,247,.75)", transition: "color .2s" }}>
                    {value === o && <motion.span layoutId={id} transition={{ type: "spring", stiffness: 420, damping: 34 }} style={{ position: "absolute", inset: 0, borderRadius: 999, background: "#F7F7F7" }} />}
                    <span style={{ position: "relative" }}>{o}</span>
                </button>
            ))}
        </div>
    )
}

function Label({ children, t }) {
    return <div style={{ font: `500 11px/1.2 ${t.mono}`, letterSpacing: ".08em", textTransform: "uppercase", color: t.muted }}>{children}</div>
}

function Panel({ title, children, t, style = {} }) {
    return (
        <div style={{ background: t.bg, borderRadius: t.r.card, padding: 20, boxShadow: `inset 0 0 0 1px ${t.border}`, display: "flex", flexDirection: "column", gap: 14, minWidth: 0, ...style }}>
            {title && <Label t={t}>{title}</Label>}
            {children}
        </div>
    )
}

function Token({ name, value, t, i }) {
    const [copied, setCopied] = useState(false)
    const rgb = parse(value)
    const onWhite = contrast(rgb, [255, 255, 255]), onInk = contrast(rgb, parse(t.text))
    return (
        <motion.button
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.04 }}
            whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
            onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200) }}
            title={`Copy ${value}`}
            style={{ border: 0, cursor: "pointer", textAlign: "left", padding: 0, background: t.bg, borderRadius: Math.min(t.r.card, 16), boxShadow: `inset 0 0 0 1px ${t.border}`, overflow: "hidden", display: "flex", flexDirection: "column" }}
        >
            <span style={{ height: 64, background: value, boxShadow: `inset 0 -1px 0 ${t.border}` }} />
            <span style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ font: `600 13px/1.2 ${t.body}`, color: t.text }}>{name}</span>
                <span style={{ font: `500 11px/1.2 ${t.mono}`, color: t.muted }}>{copied ? "Copied ✓" : value.toUpperCase()}</span>
                <span style={{ font: `500 10px/1.2 ${t.mono}`, color: t.muted }}>on white {grade(onWhite)} · on ink {grade(onInk)}</span>
            </span>
        </motion.button>
    )
}

function Button({ kind, state, t, children, size = 15 }) {
    const [hover, setHover] = useState(false)
    const [down, setDown] = useState(false)
    const disabled = state === "Disabled"
    const h = !disabled && (state === "Hover" || hover)
    const p = !disabled && (state === "Pressed" || down)
    const s = kind === "primary" ? t.primary : t.secondary
    const bg = s.bg === "gradient" ? t.gradient : s.bg
    return (
        <motion.button
            onHoverStart={() => setHover(true)} onHoverEnd={() => { setHover(false); setDown(false) }}
            onTapStart={() => setDown(true)} onTap={() => setDown(false)} onTapCancel={() => setDown(false)}
            animate={{ scale: p ? 0.96 : 1, y: h && !p ? -2 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
                position: "relative", overflow: "hidden", border: 0, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
                padding: `${Math.round(size * 0.85)}px ${Math.round(size * 1.7)}px`, borderRadius: t.r.button, background: bg, color: s.ink,
                font: `600 ${size}px/1 ${t.body}`, whiteSpace: "nowrap",
                boxShadow: [s.border ? `inset 0 0 0 1px ${s.border}` : "", h ? t.shadow : "", state === "Focus" ? `0 0 0 3px ${t.bg}, 0 0 0 5px ${t.focus}` : ""].filter(Boolean).join(", ") || "none",
            }}
        >
            <span style={{ position: "absolute", inset: 0, background: kind === "primary" ? "#000" : t.text, opacity: p ? 0.16 : h ? 0.08 : 0, transition: "opacity .2s" }} />
            <span style={{ position: "relative" }}>{children}</span>
        </motion.button>
    )
}

function Headline({ text, t, size }) {
    const parts = (text || "").split(/(\{[^}]+\})/)
    return (
        <div style={{ fontFamily: t.heading, fontWeight: t.hw, letterSpacing: t.tracking, fontSize: size, lineHeight: 1.08, color: t.text }}>
            {parts.map((p, i) => {
                if (!/^\{/.test(p)) return <span key={i}>{p}</span>
                const w = p.slice(1, -1)
                if (t.highlight === "gradient") return <span key={i} style={{ backgroundImage: t.gradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{w}</span>
                if (t.highlight === "marker") return <span key={i} style={{ background: t.highlightColor, padding: "0 .15em", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{w}</span>
                return <span key={i} style={{ color: t.highlightColor }}>{w}</span>
            })}
        </div>
    )
}

function Toggle({ t }) {
    const [on, setOn] = useState(true)
    const onBg = t.primary.bg === "gradient" ? t.gradient : t.primary.bg
    return (
        <button onClick={() => setOn(!on)} aria-pressed={on} aria-label="Toggle" style={{ width: 46, height: 26, borderRadius: 999, border: 0, padding: 3, cursor: "pointer", background: on ? onBg : t.border, display: "flex", justifyContent: on ? "flex-end" : "flex-start" }}>
            <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 32 }} style={{ width: 20, height: 20, borderRadius: 999, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }} />
        </button>
    )
}

// ---------- main ----------
export default function DesignSystemShowcase(props) {
    const { brand, spec: specText, primary, secondary, accent, style } = props
    const [tab, setTab] = useState("Components")
    const [state, setState] = useState("Default")
    const [value, setValue] = useState("")
    const [focus, setFocus] = useState(false)

    const spec: Spec = useMemo(() => {
        try { if (specText && specText.trim()) return JSON.parse(specText) } catch (e) {}
        return fallbackSpec(primary, secondary, accent)
    }, [specText, primary, secondary, accent])
    useFonts(spec.fonts?.url)

    const t = useMemo(() => {
        const colors = spec.colors || {}
        const f = spec.fonts || {}
        const q = (n?: string, fb = "") => (n ? `"${n}", ${fb}` : fb)
        const first = Object.values(colors)[0] || "#CD57FF"
        return {
            colors,
            heading: q(f.heading, "Inter, system-ui, sans-serif"),
            body: q(f.body, "Inter, system-ui, sans-serif"),
            mono: q(f.mono || f.body, "ui-monospace, monospace"),
            hw: f.headingWeight || 600,
            tracking: f.tracking || "-0.02em",
            bg: spec.bg || "#FFFFFF",
            surface: spec.surface || "#F4F4F2",
            text: spec.text || "#111011",
            muted: spec.muted || "#6B6866",
            border: spec.border || "rgba(17,16,17,.12)",
            focus: spec.focus || first,
            gradient: spec.gradient || first,
            r: { button: 12, card: 20, input: 10, chip: 999, ...(spec.radius || {}) },
            shadow: spec.shadow || "0 10px 30px rgba(0,0,0,.08)",
            primary: { bg: first, ink: "#FFFFFF", ...(spec.primary || {}) },
            secondary: { bg: "#FFFFFF", ink: spec.text || "#111011", ...(spec.secondary || {}) },
            highlight: spec.highlight || "color",
            highlightColor: spec.highlightColor || first,
            scales: (spec.scales || []).map((k) => [k, colors[k] || k]).filter(([, v]) => v),
            s: { headline: `Design at {scale}`, cta: "Get started", secondary: "Learn more", input: "Email", placeholder: "you@company.com", helper: "We never share it.", invalid: "Enter a valid email", valid: "Looks good ✓", card: brand || "Component", cardMeta: "v2.0", cardCta: "Open", chips: ["Active", "Pending", "New"], ...(spec.sample || {}) },
        }
    }, [spec, brand])

    const root = useRef<HTMLDivElement>(null)
    const [w, setW] = useState(1000)
    useEffect(() => {
        const el = root.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])
    const narrow = w < 640
    const validEmail = /^\S+@\S+\.\S+$/.test(value)
    const inputShadow = focus || state === "Focus" ? `inset 0 0 0 1.5px ${t.focus}, 0 0 0 4px ${t.focus}33` : `inset 0 0 0 1px ${t.border}`

    return (
        <div ref={root} style={{ ...style, width: "100%", boxSizing: "border-box", background: "#121212", color: "#F7F7F7", borderRadius: 32, padding: narrow ? 16 : 28, display: "flex", flexDirection: "column", gap: 20, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between", padding: narrow ? "8px 4px 0" : "4px 4px 0" }}>
                <div>
                    <div style={{ font: "600 12px/1 Inter, sans-serif", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(219,219,219,.7)", marginBottom: 10 }}>Design system snapshot · live</div>
                    <div style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontWeight: 300, fontSize: narrow ? 28 : 38, lineHeight: 1.05, letterSpacing: "-.02em" }}>{brand || "Brand"} tokens & components</div>
                </div>
                <Tabs value={tab} onChange={setTab} options={["Components", "Tokens", "Type"]} />
            </div>

            {/* The brand's own canvas: its colors, fonts and radii. */}
            <div style={{ background: t.surface, color: t.text, borderRadius: 24, padding: narrow ? 14 : 24, fontFamily: t.body, overflow: "hidden" }}>
                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {tab === "Components" && (
                            <>
                                <Panel t={t} style={{ padding: narrow ? 20 : 32, alignItems: "flex-start", gap: 18, boxShadow: t.shadow }}>
                                    <Headline text={t.s.headline} t={t} size={narrow ? 28 : 40} />
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        <Button kind="primary" state={state} t={t}>{t.s.cta}</Button>
                                        <Button kind="secondary" state={state} t={t}>{t.s.secondary}</Button>
                                    </div>
                                </Panel>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                    <Label t={t}>State</Label>
                                    {["Default", "Hover", "Pressed", "Focus", "Disabled"].map((s) => (
                                        <button key={s} onClick={() => setState(s)} style={{ border: 0, cursor: "pointer", padding: "6px 12px", borderRadius: t.r.chip, font: `600 12px/1 ${t.body}`, background: state === s ? t.text : t.bg, color: state === s ? t.bg : t.text, boxShadow: `inset 0 0 0 1px ${t.border}`, transition: "background .2s, color .2s" }}>{s}</button>
                                    ))}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 16 }}>
                                    <Panel title="Input" t={t}>
                                        <label style={{ display: "flex", flexDirection: "column", gap: 6, font: `500 13px/1.2 ${t.body}`, color: t.muted }}>
                                            {t.s.input}
                                            <input value={value} onChange={(e) => setValue(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} disabled={state === "Disabled"} placeholder={t.s.placeholder}
                                                style={{ font: `400 15px/1.2 ${t.body}`, color: t.text, background: t.bg, border: 0, outline: 0, padding: "12px 14px", borderRadius: t.r.input, boxShadow: inputShadow, opacity: state === "Disabled" ? 0.45 : 1, transition: "box-shadow .2s", width: "100%", boxSizing: "border-box" }} />
                                        </label>
                                        <span style={{ font: `400 12px/1.3 ${t.body}`, color: value && !validEmail ? "#D92D20" : t.muted }}>{value && !validEmail ? t.s.invalid : value ? t.s.valid : t.s.helper}</span>
                                    </Panel>
                                    <Panel title="Selection & status" t={t}>
                                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                            <Toggle t={t} />
                                            {t.s.chips.map((b, i) => {
                                                const c = Object.values(t.colors)[i % Math.max(1, Object.values(t.colors).length)] as string
                                                return <span key={b} style={{ padding: "6px 10px", borderRadius: t.r.chip, font: `600 12px/1 ${t.body}`, background: `${hex(parse(c))}22`, color: contrast(parse(c), parse(t.bg)) >= 3 ? c : t.text, boxShadow: `inset 0 0 0 1px ${hex(parse(c))}44` }}>{b}</span>
                                            })}
                                        </div>
                                    </Panel>
                                    <Panel title="Card" t={t}>
                                        <motion.div whileHover={{ y: -4, boxShadow: t.shadow }} style={{ borderRadius: t.r.card, overflow: "hidden", background: t.bg, boxShadow: `inset 0 0 0 1px ${t.border}` }}>
                                            <div style={{ height: 56, background: t.gradient }} />
                                            <div style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ font: `${t.hw} 16px/1.2 ${t.heading}`, letterSpacing: t.tracking, color: t.text }}>{t.s.card}</div>
                                                    <div style={{ font: `400 12px/1.3 ${t.body}`, color: t.muted }}>{t.s.cardMeta}</div>
                                                </div>
                                                <Button kind="primary" state="Default" t={t} size={13}>{t.s.cardCta}</Button>
                                            </div>
                                        </motion.div>
                                    </Panel>
                                </div>
                            </>
                        )}

                        {tab === "Tokens" && (
                            <>
                                <Panel title="Color" t={t}>
                                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${narrow ? 120 : 140}px, 1fr))`, gap: 10 }}>
                                        {Object.entries(t.colors).map(([n, v], i) => <Token key={n} name={n} value={v as string} t={t} i={i} />)}
                                    </div>
                                </Panel>
                                {spec.gradient && (
                                    <Panel title="Gradient" t={t}>
                                        <div style={{ height: 56, borderRadius: t.r.input, background: spec.gradient }} />
                                        <code style={{ font: `500 12px/1.4 ${t.mono}`, color: t.muted, overflowWrap: "anywhere" }}>{spec.gradient}</code>
                                    </Panel>
                                )}
                                {t.scales.map(([n, v]) => (
                                    <Panel key={n} title={`${n} · tonal scale`} t={t}>
                                        <div style={{ display: "grid", gridTemplateColumns: `repeat(${narrow ? 5 : 10}, minmax(0, 1fr))`, gap: 6 }}>
                                            {scale(v).map((s, i) => {
                                                const ink = contrast(s.rgb, [255, 255, 255]) >= contrast(s.rgb, [17, 16, 17]) ? "#fff" : "#111011"
                                                return (
                                                    <motion.div key={s.step} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.03 }} title={hex(s.rgb)}
                                                        style={{ height: 56, borderRadius: Math.min(t.r.input, 10), background: hex(s.rgb), color: ink, padding: 6, font: `600 10px/1.2 ${t.mono}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                                        <span>{s.step}</span><span style={{ opacity: 0.8 }}>{hex(s.rgb).slice(1)}</span>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    </Panel>
                                ))}
                                <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 16 }}>
                                    <Panel title="Radius" t={t}>
                                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                                            {Object.entries(t.r).map(([k, v]) => (
                                                <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                                    <motion.div whileHover={{ rotate: -6, scale: 1.08 }} style={{ width: 56, height: 56, borderRadius: Math.min(v as number, 28), background: t.surface, boxShadow: `inset 0 0 0 1.5px ${t.focus}` }} />
                                                    <span style={{ font: `500 11px/1.2 ${t.mono}`, color: t.muted }}>{k} · {(v as number) >= 50 ? "pill" : `${v}px`}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Panel>
                                    <Panel title="Elevation" t={t}>
                                        <motion.div whileHover={{ y: -4 }} style={{ height: 72, borderRadius: t.r.card, background: t.bg, boxShadow: t.shadow }} />
                                        <code style={{ font: `500 11px/1.4 ${t.mono}`, color: t.muted, overflowWrap: "anywhere" }}>{t.shadow}</code>
                                    </Panel>
                                </div>
                            </>
                        )}

                        {tab === "Type" && (
                            <Panel title={`${spec.fonts?.heading || "Inter"} · ${spec.fonts?.body || "Inter"}${spec.fonts?.mono ? ` · ${spec.fonts.mono}` : ""}`} t={t}>
                                {[
                                    ["Display", narrow ? 34 : 52, t.heading, t.hw, t.tracking, null],
                                    ["Heading", narrow ? 24 : 32, t.heading, t.hw, t.tracking, null],
                                    ["Body", 16, t.body, 400, "0", "Everything you need, built from one source of truth."],
                                    ["Label", 12, t.mono, 500, ".08em", "TOKENS · COMPONENTS · PATTERNS"],
                                ].map(([name, size, fam, wgt, ls, txt]: any, i) => (
                                    <motion.div key={name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                                        style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "120px 1fr", alignItems: "baseline", gap: narrow ? 4 : 16, paddingBottom: 12, borderBottom: i < 3 ? `1px solid ${t.border}` : "none" }}>
                                        <span style={{ font: `500 11px/1.4 ${t.mono}`, color: t.muted }}>{name} · {size}px / {wgt}</span>
                                        {txt ? <span style={{ fontFamily: fam, fontWeight: wgt, fontSize: size, letterSpacing: ls, lineHeight: 1.4, color: t.text }}>{txt}</span> : <Headline text={t.s.headline} t={{ ...t, hw: wgt }} size={size} />}
                                    </motion.div>
                                ))}
                            </Panel>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

DesignSystemShowcase.defaultProps = { brand: "Brand", spec: "", primary: "#CD57FF", secondary: "#33363F", accent: "#FFCE1F" }

addPropertyControls(DesignSystemShowcase, {
    brand: { type: ControlType.String, title: "Brand" },
    spec: { type: ControlType.String, title: "Tokens JSON", displayTextArea: true },
    primary: { type: ControlType.Color, title: "Primary" },
    secondary: { type: ControlType.Color, title: "Secondary" },
    accent: { type: ControlType.Color, title: "Accent" },
})
