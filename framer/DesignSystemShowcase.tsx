// Design System Docs — Framer code component for alevasquez.dev case studies.
// Each project passes its real token spec (JSON, from the Projects CMS
// "Design Tokens" field): named colors, fonts, type scale, spacing, radii,
// shadows, motion, button styles and documentation (principles, do's and
// don'ts, accessibility notes) taken from the brand's live product.
// Everything renders live in the brand's own styles.
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

const EASE = [0.16, 1, 0.3, 1]

type TypeStep = { name: string; size: number; lh?: number; weight?: number; tracking?: string; font?: "heading" | "body" | "mono"; sample?: string }
type Spec = {
    brand?: string
    summary?: string
    fonts?: { heading?: string; body?: string; mono?: string; headingWeight?: number; tracking?: string; url?: string }
    colors?: Record<string, string>
    semantic?: { success?: string; warning?: string; error?: string; info?: string }
    scales?: string[]
    gradient?: string
    bg?: string
    surface?: string
    text?: string
    muted?: string
    border?: string
    focus?: string
    radius?: Record<string, number>
    shadow?: string
    shadows?: Record<string, string>
    spacing?: number[]
    typeScale?: TypeStep[]
    motion?: { fast?: number; base?: number; slow?: number; easing?: string }
    primary?: { bg?: string; ink?: string; border?: string }
    secondary?: { bg?: string; ink?: string; border?: string }
    highlight?: "gradient" | "marker" | "color"
    highlightColor?: string
    sample?: Record<string, any>
    docs?: {
        principles?: { title: string; body: string }[]
        dos?: { do: string; dont: string; kind?: "primary" | "contrast" | "radius" | "copy" | "spacing" | "color" }[]
        a11y?: string[]
        facts?: { label: string; value: string }[]
    }
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
const grade = (r: number) => (r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large" : "Fail")
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
const LIGHT = [96, 90, 81, 70, 60, 50, 41, 33, 24, 15]
const scale = (base: string) => { const [h, s] = toHsl(parse(base)); return STEPS.map((step, i) => ({ step, rgb: fromHsl(h, Math.min(95, s), LIGHT[i]) })) }
const alpha = (c: string, a: number) => { const [r, g, b] = parse(c); return `rgba(${r},${g},${b},${a})` }
const inkOn = (c: string) => (contrast(parse(c), [255, 255, 255]) >= contrast(parse(c), [17, 16, 17]) ? "#FFFFFF" : "#111011")

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
        primary: { bg: primary, ink: inkOn(primary) },
        secondary: { bg: "#FFFFFF", ink: "#111011", border: "rgba(17,16,17,.25)" },
        highlight: "color", highlightColor: primary,
    }
}

// Generated type scale (major third) when a spec doesn't list one.
const DEFAULT_SCALE: TypeStep[] = [
    { name: "Display", size: 56, lh: 1.05, font: "heading" },
    { name: "H1", size: 44, lh: 1.1, font: "heading" },
    { name: "H2", size: 36, lh: 1.15, font: "heading" },
    { name: "H3", size: 28, lh: 1.2, font: "heading" },
    { name: "H4", size: 22, lh: 1.3, font: "heading" },
    { name: "Body L", size: 18, lh: 1.6, weight: 400, font: "body" },
    { name: "Body", size: 16, lh: 1.6, weight: 400, font: "body" },
    { name: "Small", size: 14, lh: 1.5, weight: 400, font: "body" },
    { name: "Caption", size: 12, lh: 1.4, weight: 500, font: "body" },
    { name: "Overline", size: 11, lh: 1.2, weight: 600, tracking: ".12em", font: "mono" },
]

// Generic, brand-agnostic guidance rendered when a spec has no docs.
const DEFAULT_DOS = [
    { kind: "primary", do: "Use one primary action per view so the next step is obvious.", dont: "Stack several primary buttons that compete for attention." },
    { kind: "contrast", do: "Keep body text at 4.5:1 contrast or more against its background.", dont: "Use light gray text on tinted surfaces for anything people must read." },
    { kind: "radius", do: "Reuse the radius tokens so related elements feel like a family.", dont: "Mix arbitrary corner radii on the same screen." },
    { kind: "copy", do: "Write buttons as short verbs that say what happens.", dont: "Use vague labels like “Click here” or “Submit”." },
]
const DEFAULT_A11Y = [
    "Every interactive element shows a visible focus ring (2px, offset from the edge).",
    "Touch targets are at least 44×44px; inline links get extra hit area.",
    "Color is never the only signal: states pair color with an icon or text.",
    "Motion respects prefers-reduced-motion; nothing essential depends on animation.",
    "Form fields keep visible labels and announce errors next to the field.",
]

// ---------- generic pieces ----------
function Tabs({ value, onChange, options, narrow }) {
    const id = useId() // one sliding pill per tab group (and per instance)
    return (
        <div role="tablist" style={{ display: "flex", gap: 4, padding: 4, borderRadius: 999, background: "rgba(255,255,255,.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1)", overflowX: "auto", maxWidth: "100%", scrollbarWidth: "none" }}>
            {options.map((o) => (
                <button key={o} role="tab" aria-selected={value === o} onClick={() => onChange(o)} style={{ position: "relative", flex: "none", border: 0, background: "transparent", cursor: "pointer", padding: narrow ? "8px 12px" : "9px 16px", borderRadius: 999, font: "600 13px/1 Inter, sans-serif", color: value === o ? "#111011" : "rgba(247,247,247,.75)", transition: "color .2s" }}>
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

function Panel({ title, children, t, style = {}, note = "" }) {
    return (
        <div style={{ background: t.bg, borderRadius: Math.min(t.r.card, 24), padding: 20, boxShadow: `inset 0 0 0 1px ${t.border}`, display: "flex", flexDirection: "column", gap: 14, minWidth: 0, ...style }}>
            {title && <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}><Label t={t}>{title}</Label>{note && <span style={{ font: `500 11px/1.2 ${t.mono}`, color: t.muted }}>{note}</span>}</div>}
            {children}
        </div>
    )
}

function Grid({ min = 260, children, gap = 16 }) {
    return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap }}>{children}</div>
}

function Reveal({ i = 0, children, style = {} }) {
    return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: Math.min(i * 0.04, 0.4) }} style={style}>{children}</motion.div>
}

// ---------- components (all in the brand's tokens) ----------
function Button({ kind = "primary", state = "Default", t, children, size = "M", icon = null, full = false }: any) {
    const [hover, setHover] = useState(false)
    const [down, setDown] = useState(false)
    const disabled = state === "Disabled"
    const h = !disabled && (state === "Hover" || hover)
    const p = !disabled && (state === "Pressed" || down)
    const fs = size === "S" ? 13 : size === "L" ? 17 : 15
    const styles = {
        primary: { ...t.primary, bg: t.primary.bg === "gradient" ? t.gradient : t.primary.bg },
        secondary: { ...t.secondary, bg: t.secondary.bg === "gradient" ? t.gradient : t.secondary.bg },
        ghost: { bg: "transparent", ink: t.text },
        danger: { bg: t.sem.error, ink: inkOn(t.sem.error) },
    }
    const s = styles[kind] || styles.primary
    return (
        <motion.button
            disabled={disabled}
            onHoverStart={() => setHover(true)} onHoverEnd={() => { setHover(false); setDown(false) }}
            onTapStart={() => setDown(true)} onTap={() => setDown(false)} onTapCancel={() => setDown(false)}
            animate={{ scale: p ? 0.96 : 1, y: h && !p ? -2 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
                position: "relative", overflow: "hidden", border: 0, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: full ? "100%" : undefined,
                minHeight: size === "S" ? 34 : size === "L" ? 52 : 44,
                padding: icon && !children ? 0 : `0 ${Math.round(fs * 1.6)}px`, aspectRatio: icon && !children ? "1" : undefined,
                borderRadius: t.r.button, background: s.bg, color: s.ink,
                font: `600 ${fs}px/1 ${t.body}`, whiteSpace: "nowrap",
                boxShadow: [s.border ? `inset 0 0 0 1px ${s.border}` : "", kind === "ghost" ? `inset 0 0 0 1px ${h ? t.border : "transparent"}` : "", h && kind !== "ghost" ? t.shadow : "", state === "Focus" ? `0 0 0 2px ${t.bg}, 0 0 0 4px ${t.focus}` : ""].filter(Boolean).join(", ") || "none",
            }}
        >
            <span style={{ position: "absolute", inset: 0, background: kind === "primary" || kind === "danger" ? "#000" : t.text, opacity: p ? 0.16 : h ? 0.07 : 0, transition: "opacity .2s" }} />
            {icon && <span style={{ position: "relative", display: "flex" }}>{icon}</span>}
            {children && <span style={{ position: "relative" }}>{children}</span>}
        </motion.button>
    )
}

const Icon = {
    plus: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>,
    arrow: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>,
    search: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5 14 14" /></svg>,
    check: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5 6 10l5-6" /></svg>,
    info: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="8" cy="8" r="6.5" /><path d="M8 7v4M8 5h0" /></svg>,
    warn: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2 14.5 13.5h-13L8 2zM8 6.5v3M8 11.5h0" /></svg>,
    x: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" /></svg>,
    chevron: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5 7 8.5l3-3" /></svg>,
}

function Headline({ text, t, size, weight = null }) {
    const parts = (text || "").split(/(\{[^}]+\})/)
    return (
        <div style={{ fontFamily: t.heading, fontWeight: weight || t.hw, letterSpacing: t.tracking, fontSize: size, lineHeight: 1.08, color: t.text }}>
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

function Toggle({ t, initial = true, label = "" }) {
    const [on, setOn] = useState(initial)
    return (
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", font: `500 14px/1.2 ${t.body}`, color: t.text }}>
            <button onClick={() => setOn(!on)} role="switch" aria-checked={on} aria-label={label || "Toggle"} style={{ width: 46, height: 26, borderRadius: 999, border: 0, padding: 3, cursor: "pointer", background: on ? t.accentFill : t.borderSolid, display: "flex", justifyContent: on ? "flex-end" : "flex-start", flex: "none" }}>
                <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 32 }} style={{ width: 20, height: 20, borderRadius: 999, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }} />
            </button>
            {label}
        </label>
    )
}

function Checkbox({ t, label, initial = false }) {
    const [on, setOn] = useState(initial)
    return (
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", font: `500 14px/1.3 ${t.body}`, color: t.text }}>
            <button role="checkbox" aria-checked={on} onClick={() => setOn(!on)} style={{ width: 22, height: 22, flex: "none", borderRadius: Math.min(6, t.r.input), border: 0, cursor: "pointer", display: "grid", placeItems: "center", color: t.primaryInk, background: on ? t.accentFill : t.bg, boxShadow: on ? "none" : `inset 0 0 0 1.5px ${t.borderSolid}`, transition: "background .2s" }}>
                <AnimatePresence>{on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: "flex" }}>{Icon.check}</motion.span>}</AnimatePresence>
            </button>
            {label}
        </label>
    )
}

function Radios({ t, options }) {
    const [v, setV] = useState(options[0])
    return (
        <div role="radiogroup" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {options.map((o) => (
                <label key={o} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", font: `500 14px/1.3 ${t.body}`, color: t.text }}>
                    <button role="radio" aria-checked={v === o} onClick={() => setV(o)} style={{ width: 22, height: 22, flex: "none", borderRadius: 999, border: 0, cursor: "pointer", display: "grid", placeItems: "center", background: t.bg, boxShadow: `inset 0 0 0 ${v === o ? 2 : 1.5}px ${v === o ? t.focus : t.borderSolid}` }}>
                        {v === o && <motion.span layoutId={`radio-${options.join()}`} style={{ width: 10, height: 10, borderRadius: 999, background: t.accentFill }} />}
                    </button>
                    {o}
                </label>
            ))}
        </div>
    )
}

function Field({ t, label, placeholder, helper, state, icon = null, multiline = false, select = null }) {
    const [value, setValue] = useState("")
    const [focus, setFocus] = useState(false)
    const error = state === "Error"
    const disabled = state === "Disabled"
    const ring = error ? t.sem.error : t.focus
    const shadow = error ? `inset 0 0 0 1.5px ${t.sem.error}` : focus || state === "Focus" ? `inset 0 0 0 1.5px ${ring}, 0 0 0 4px ${alpha(ring, 0.18)}` : `inset 0 0 0 1px ${t.borderSolid}`
    const base = { font: `400 15px/1.3 ${t.body}`, color: t.text, background: t.bg, border: 0, outline: 0, padding: icon ? "12px 14px 12px 40px" : "12px 14px", borderRadius: t.r.input, boxShadow: shadow, opacity: disabled ? 0.5 : 1, transition: "box-shadow .2s", width: "100%", boxSizing: "border-box" as const, resize: "none" as const, appearance: "none" as const }
    return (
        <label style={{ display: "flex", flexDirection: "column", gap: 6, font: `500 13px/1.2 ${t.body}`, color: t.text, minWidth: 0 }}>
            {label}
            <span style={{ position: "relative", display: "block" }}>
                {icon && <span style={{ position: "absolute", left: 14, top: 14, color: t.muted, display: "flex" }}>{icon}</span>}
                {select ? (
                    <>
                        <select disabled={disabled} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ ...base, paddingRight: 36, cursor: "pointer" }}>{select.map((o) => <option key={o}>{o}</option>)}</select>
                        <span style={{ position: "absolute", right: 14, top: 15, color: t.muted, display: "flex", pointerEvents: "none" }}>{Icon.chevron}</span>
                    </>
                ) : multiline ? (
                    <textarea rows={3} value={value} disabled={disabled} onChange={(e) => setValue(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholder={placeholder} style={base} />
                ) : (
                    <input value={value} disabled={disabled} onChange={(e) => setValue(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholder={placeholder} aria-invalid={error || undefined} style={base} />
                )}
            </span>
            {helper !== undefined && <span style={{ font: `400 12px/1.3 ${t.body}`, color: error ? t.sem.error : t.muted, display: "flex", gap: 6, alignItems: "center" }}>{error && Icon.warn}{error ? t.s.invalid : helper}</span>}
        </label>
    )
}

function Badge({ t, color, children, solid = false }) {
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: t.r.chip, font: `600 12px/1 ${t.body}`, background: solid ? color : alpha(color, 0.14), color: solid ? inkOn(color) : contrast(parse(color), parse(t.bg)) >= 4.5 ? color : t.text, boxShadow: solid ? "none" : `inset 0 0 0 1px ${alpha(color, 0.35)}` }}><span style={{ width: 6, height: 6, borderRadius: 9, background: solid ? inkOn(color) : color }} />{children}</span>
}

function Alert({ t, kind, title, body }) {
    const [open, setOpen] = useState(true)
    const c = t.sem[kind]
    return (
        <AnimatePresence>
            {open && (
                <motion.div layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginTop: -10 }} role={kind === "error" ? "alert" : "status"}
                    style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", borderRadius: Math.min(t.r.card, 14), background: alpha(c, 0.1), boxShadow: `inset 3px 0 0 ${c}, inset 0 0 0 1px ${alpha(c, 0.25)}` }}>
                    <span style={{ color: c, display: "flex", paddingTop: 1 }}>{kind === "success" ? Icon.check : kind === "info" ? Icon.info : Icon.warn}</span>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                        <strong style={{ font: `600 14px/1.3 ${t.body}`, color: t.text }}>{title}</strong>
                        <span style={{ font: `400 13px/1.45 ${t.body}`, color: t.muted }}>{body}</span>
                    </span>
                    <button onClick={() => setOpen(false)} aria-label="Dismiss" style={{ border: 0, background: "transparent", cursor: "pointer", color: t.muted, display: "flex", padding: 2 }}>{Icon.x}</button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function BrandTabs({ t, items }) {
    const [v, setV] = useState(items[0])
    const id = useId()
    return (
        <div role="tablist" style={{ display: "flex", gap: 18, boxShadow: `inset 0 -1px 0 ${t.border}` }}>
            {items.map((o) => (
                <button key={o} role="tab" aria-selected={v === o} onClick={() => setV(o)} style={{ position: "relative", border: 0, background: "transparent", cursor: "pointer", padding: "10px 0", font: `600 14px/1 ${t.body}`, color: v === o ? t.text : t.muted }}>
                    {o}
                    {v === o && <motion.span layoutId={id} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2.5, borderRadius: 2, background: t.accentFill }} />}
                </button>
            ))}
        </div>
    )
}

function Progress({ t, value }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", font: `500 13px/1 ${t.body}`, color: t.text }}><span>{t.s.progress || "Progress"}</span><span style={{ color: t.muted }}>{value}%</span></div>
            <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} style={{ height: 8, borderRadius: 99, background: t.borderSolid, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.1, ease: EASE }} style={{ height: "100%", borderRadius: 99, background: t.gradient }} />
            </div>
        </div>
    )
}

function Stepper({ t, steps, current }) {
    return (
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", alignItems: "center", gap: 8 }}>
            {steps.map((s, i) => {
                const done = i < current, now = i === current
                return (
                    <li key={s} style={{ display: "flex", alignItems: "center", gap: 8, flex: i < steps.length - 1 ? 1 : "none", minWidth: 0 }}>
                        <span aria-current={now ? "step" : undefined} style={{ width: 28, height: 28, flex: "none", borderRadius: 99, display: "grid", placeItems: "center", font: `600 12px/1 ${t.body}`, background: done || now ? t.accentFill : t.bg, color: done || now ? t.primaryInk : t.muted, boxShadow: done || now ? "none" : `inset 0 0 0 1.5px ${t.borderSolid}` }}>{done ? Icon.check : i + 1}</span>
                        <span style={{ font: `500 12px/1.2 ${t.body}`, color: now ? t.text : t.muted, whiteSpace: "nowrap" }}>{s}</span>
                        {i < steps.length - 1 && <span style={{ flex: 1, minWidth: 12, height: 2, borderRadius: 2, background: done ? t.accentFill : t.borderSolid }} />}
                    </li>
                )
            })}
        </ol>
    )
}

function Pagination({ t }) {
    const [p, setP] = useState(2)
    const pages = [1, 2, 3, 4, 5]
    const btn = (active) => ({ minWidth: 36, height: 36, border: 0, cursor: "pointer", borderRadius: Math.min(t.r.button, 10), font: `600 13px/1 ${t.body}`, background: active ? t.text : "transparent", color: active ? t.bg : t.text, boxShadow: active ? "none" : `inset 0 0 0 1px ${t.border}` })
    return (
        <nav aria-label="Pagination" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button style={btn(false)} onClick={() => setP(Math.max(1, p - 1))} aria-label="Previous page">‹</button>
            {pages.map((n) => <button key={n} style={btn(n === p)} aria-current={n === p ? "page" : undefined} onClick={() => setP(n)}>{n}</button>)}
            <button style={btn(false)} onClick={() => setP(Math.min(5, p + 1))} aria-label="Next page">›</button>
        </nav>
    )
}

function Avatars({ t, names }) {
    const fills = Object.values(t.colors) as string[]
    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {names.map((n, i) => {
                const c = fills[i % fills.length]
                return <span key={n} title={n} style={{ width: 36, height: 36, marginLeft: i ? -10 : 0, borderRadius: 99, display: "grid", placeItems: "center", font: `600 13px/1 ${t.body}`, background: c, color: inkOn(c), boxShadow: `0 0 0 2.5px ${t.bg}` }}>{n.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>
            })}
            <span style={{ marginLeft: 10, font: `500 13px/1 ${t.body}`, color: t.muted }}>+12</span>
        </div>
    )
}

function Tooltip({ t, label, children }) {
    const [show, setShow] = useState(false)
    return (
        <span style={{ position: "relative", display: "inline-flex" }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
            {children}
            <AnimatePresence>
                {show && (
                    <motion.span role="tooltip" initial={{ opacity: 0, y: 4, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 4, x: "-50%" }}
                        style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", whiteSpace: "nowrap", padding: "7px 10px", borderRadius: 8, font: `500 12px/1 ${t.body}`, background: t.text, color: t.bg, pointerEvents: "none", zIndex: 2 }}>{label}</motion.span>
                )}
            </AnimatePresence>
        </span>
    )
}

function Table({ t }) {
    const rows = t.s.table || [["Hypertrophy Block", "Active", "12 wk"], ["Peaking Phase", "Draft", "6 wk"], ["Off-season", "Completed", "8 wk"]]
    const tone = { Active: t.sem.success, Draft: t.sem.warning, Completed: t.sem.info, Paused: t.sem.warning, Error: t.sem.error }
    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", font: `400 14px/1.3 ${t.body}`, color: t.text }}>
                <thead><tr>{(t.s.tableHead || ["Name", "Status", "Length"]).map((h) => <th key={h} style={{ textAlign: "left", padding: "10px 12px", font: `600 12px/1 ${t.body}`, color: t.muted, boxShadow: `inset 0 -1px 0 ${t.border}` }}>{h}</th>)}</tr></thead>
                <tbody>{rows.map((r, i) => (
                    <motion.tr key={i} whileHover={{ backgroundColor: alpha(t.focus, 0.06) }}>
                        <td style={{ padding: "12px", fontWeight: 600, boxShadow: `inset 0 -1px 0 ${t.border}` }}>{r[0]}</td>
                        <td style={{ padding: "12px", boxShadow: `inset 0 -1px 0 ${t.border}` }}><Badge t={t} color={tone[r[1]] || t.focus}>{r[1]}</Badge></td>
                        <td style={{ padding: "12px", color: t.muted, boxShadow: `inset 0 -1px 0 ${t.border}` }}>{r[2]}</td>
                    </motion.tr>
                ))}</tbody>
            </table>
        </div>
    )
}

function Modal({ t }) {
    return (
        <div style={{ position: "relative", height: 210, borderRadius: Math.min(t.r.card, 18), background: alpha(t.text, 0.55), display: "grid", placeItems: "center", overflow: "hidden" }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}
                role="dialog" aria-label="Example dialog" style={{ width: "min(86%, 320px)", background: t.bg, borderRadius: t.r.card, padding: 18, display: "flex", flexDirection: "column", gap: 10, boxShadow: t.shadows.lg }}>
                <strong style={{ font: `${t.hw} 17px/1.2 ${t.heading}`, letterSpacing: t.tracking, color: t.text }}>{t.s.modalTitle || "Discard changes?"}</strong>
                <span style={{ font: `400 13px/1.45 ${t.body}`, color: t.muted }}>{t.s.modalBody || "Your edits will be lost. This can't be undone."}</span>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Button kind="ghost" t={t} size="S">Cancel</Button>
                    <Button kind="danger" t={t} size="S">{t.s.modalCta || "Discard"}</Button>
                </div>
            </motion.div>
        </div>
    )
}

function MiniNav({ t }) {
    const [active, setActive] = useState(0)
    const items = t.s.nav || ["Dashboard", "Programs", "Athletes", "Reports"]
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 12px", borderRadius: Math.min(t.r.card, 16), background: t.bg, boxShadow: `inset 0 0 0 1px ${t.border}`, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, font: `${t.hw} 15px/1 ${t.heading}`, color: t.text }}><span style={{ width: 22, height: 22, borderRadius: 7, background: t.gradient }} />{t.brand}</span>
            <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {items.map((n, i) => <button key={n} onClick={() => setActive(i)} style={{ border: 0, cursor: "pointer", padding: "8px 12px", borderRadius: t.r.chip > 40 ? 99 : 8, font: `600 13px/1 ${t.body}`, background: active === i ? alpha(t.focus, 0.12) : "transparent", color: active === i ? t.text : t.muted }}>{n}</button>)}
            </span>
        </div>
    )
}

// ---------- spec drawings ----------
function Measure({ t, children, label, side = "bottom" }) {
    return (
        <span style={{ position: "relative", display: "inline-flex" }}>
            {children}
            <span style={{ position: "absolute", left: 0, right: 0, [side]: -18, height: 10, borderLeft: `1px solid ${t.sem.error}`, borderRight: `1px solid ${t.sem.error}`, display: "flex", alignItems: "center" }}>
                <span style={{ flex: 1, height: 1, background: t.sem.error }} />
            </span>
            <span style={{ position: "absolute", [side]: -34, left: "50%", transform: "translateX(-50%)", font: `600 11px/1 ${t.mono}`, color: t.sem.error, whiteSpace: "nowrap" }}>{label}</span>
        </span>
    )
}

// ---------- main ----------
export default function DesignSystemShowcase(props) {
    const { brand, spec: specText, primary, secondary, accent, style } = props
    const [tab, setTab] = useState("Overview")
    const [state, setState] = useState("Default")

    const spec: Spec = useMemo(() => {
        try { if (specText && specText.trim()) return JSON.parse(specText) } catch (e) {}
        return fallbackSpec(primary, secondary, accent)
    }, [specText, primary, secondary, accent])
    useFonts(spec.fonts?.url)

    const t = useMemo(() => {
        const colors = spec.colors || {}
        const f = spec.fonts || {}
        const q = (n?: string, fb = "") => (n ? `"${n}", ${fb}` : fb)
        const first = (Object.values(colors)[0] as string) || "#CD57FF"
        const prim = { bg: first, ink: "#FFFFFF", ...(spec.primary || {}) }
        const shadow = spec.shadow || "0 10px 30px rgba(0,0,0,.08)"
        const text = spec.text || "#111011"
        return {
            brand: spec.brand || brand || "Brand",
            colors,
            heading: q(f.heading, "Inter, system-ui, sans-serif"),
            body: q(f.body, "Inter, system-ui, sans-serif"),
            mono: q(f.mono || f.body, "ui-monospace, monospace"),
            fontNames: f,
            hw: f.headingWeight || 600,
            tracking: f.tracking || "-0.02em",
            bg: spec.bg || "#FFFFFF",
            surface: spec.surface || "#F4F4F2",
            text,
            muted: spec.muted || "#6B6866",
            border: spec.border || "rgba(17,16,17,.12)",
            borderSolid: alpha(text, 0.22),
            focus: spec.focus || first,
            gradient: spec.gradient || first,
            accentFill: prim.bg === "gradient" ? spec.gradient || first : prim.bg,
            primaryInk: prim.ink,
            sem: { success: "#12B76A", warning: "#F79009", error: "#D92D20", info: "#2E90FA", ...(spec.semantic || {}) },
            r: { button: 12, card: 20, input: 10, chip: 999, ...(spec.radius || {}) },
            shadow,
            shadows: { sm: "0 1px 2px rgba(16,24,40,.08)", md: shadow, lg: "0 24px 48px -12px rgba(16,24,40,.25)", ...(spec.shadows || {}) },
            spacing: spec.spacing || [4, 8, 12, 16, 24, 32, 48, 64],
            typeScale: spec.typeScale || DEFAULT_SCALE,
            motion: { fast: 150, base: 250, slow: 400, easing: "cubic-bezier(.16,1,.3,1)", ...(spec.motion || {}) },
            primary: prim,
            secondary: { bg: "#FFFFFF", ink: text, ...(spec.secondary || {}) },
            highlight: spec.highlight || "color",
            highlightColor: spec.highlightColor || first,
            scales: (spec.scales || []).map((k) => [k, colors[k] || k]).filter(([, v]) => v),
            s: { headline: `Design at {scale}`, cta: "Get started", secondary: "Learn more", input: "Email", placeholder: "you@company.com", helper: "We never share it.", invalid: "Enter a valid email", card: spec.brand || brand || "Component", cardMeta: "v2.0", cardCta: "Open", chips: ["Active", "Pending", "New"], ...(spec.sample || {}) },
            docs: spec.docs || {},
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
    const TABS = ["Overview", "Components", "Tokens", "Type", "Specs", "Guidelines", "Accessibility"]
    const font = (k?: string) => (k === "body" ? t.body : k === "mono" ? t.mono : t.heading)

    // Text/background pairs for the contrast matrix.
    const pairs = useMemo(() => {
        const fgs = [["Text", t.text], ["Muted", t.muted], ...Object.entries(t.colors).slice(0, 4)] as [string, string][]
        const bgs = [["Background", t.bg], ["Surface", t.surface], ...(t.primary.bg !== "gradient" ? [["Primary", t.primary.bg]] : [])] as [string, string][]
        return { fgs, bgs }
    }, [t])

    return (
        <div ref={root} style={{ ...style, width: "100%", boxSizing: "border-box", background: "#121212", color: "#F7F7F7", borderRadius: 32, padding: narrow ? 16 : 28, display: "flex", flexDirection: "column", gap: 20, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: narrow ? "8px 4px 0" : "4px 4px 0" }}>
                <div>
                    <div style={{ font: "600 12px/1 Inter, sans-serif", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(219,219,219,.7)", marginBottom: 10 }}>Design system documentation · live</div>
                    <div style={{ fontFamily: '"Crimson Pro", Georgia, serif', fontWeight: 300, fontSize: narrow ? 28 : 38, lineHeight: 1.05, letterSpacing: "-.02em" }}>{t.brand} design system</div>
                </div>
                <Tabs value={tab} onChange={setTab} options={TABS} narrow={narrow} />
            </div>

            {/* The brand's own canvas: its colors, fonts and radii. */}
            <div style={{ background: t.surface, color: t.text, borderRadius: 24, padding: narrow ? 14 : 24, fontFamily: t.body, overflow: "hidden" }}>
                <AnimatePresence mode="wait">
                    <motion.div key={tab} role="tabpanel" aria-label={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {tab === "Overview" && (
                            <>
                                <Panel t={t} style={{ padding: narrow ? 20 : 32, alignItems: "flex-start", gap: 18, boxShadow: t.shadow }}>
                                    <Headline text={t.s.headline} t={t} size={narrow ? 28 : 44} />
                                    {spec.summary && <p style={{ margin: 0, font: `400 16px/1.6 ${t.body}`, color: t.muted, maxWidth: 620 }}>{spec.summary}</p>}
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        <Button kind="primary" t={t} icon={Icon.arrow}>{t.s.cta}</Button>
                                        <Button kind="secondary" t={t}>{t.s.secondary}</Button>
                                    </div>
                                </Panel>
                                {t.docs.facts && (
                                    <Grid min={170} gap={12}>
                                        {t.docs.facts.map((f, i) => (
                                            <Reveal key={f.label} i={i}><Panel t={t} style={{ gap: 6 }}><span style={{ font: `${t.hw} 28px/1 ${t.heading}`, letterSpacing: t.tracking, color: t.text }}>{f.value}</span><span style={{ font: `500 13px/1.3 ${t.body}`, color: t.muted }}>{f.label}</span></Panel></Reveal>
                                        ))}
                                    </Grid>
                                )}
                                {t.docs.principles && (
                                    <Grid min={240}>
                                        {t.docs.principles.map((p, i) => (
                                            <Reveal key={p.title} i={i}><Panel t={t} title={`Principle ${i + 1}`}><strong style={{ font: `${t.hw} 18px/1.25 ${t.heading}`, letterSpacing: t.tracking }}>{p.title}</strong><span style={{ font: `400 14px/1.55 ${t.body}`, color: t.muted }}>{p.body}</span></Panel></Reveal>
                                        ))}
                                    </Grid>
                                )}
                            </>
                        )}

                        {tab === "Components" && (
                            <>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                    <Label t={t}>Preview state</Label>
                                    {["Default", "Hover", "Pressed", "Focus", "Disabled", "Error"].map((s) => (
                                        <button key={s} onClick={() => setState(s)} aria-pressed={state === s} style={{ border: 0, cursor: "pointer", padding: "7px 12px", borderRadius: t.r.chip, font: `600 12px/1 ${t.body}`, background: state === s ? t.text : t.bg, color: state === s ? t.bg : t.text, boxShadow: `inset 0 0 0 1px ${t.border}`, transition: "background .2s, color .2s" }}>{s}</button>
                                    ))}
                                </div>
                                <Panel title="Buttons" t={t} note="primary · secondary · ghost · danger · icon">
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                        <Button kind="primary" state={state} t={t}>{t.s.cta}</Button>
                                        <Button kind="secondary" state={state} t={t}>{t.s.secondary}</Button>
                                        <Button kind="ghost" state={state} t={t}>Cancel</Button>
                                        <Button kind="danger" state={state} t={t}>Delete</Button>
                                        <Tooltip t={t} label="Add item"><Button kind="primary" state={state} t={t} icon={Icon.plus} /></Tooltip>
                                    </div>
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                        {["S", "M", "L"].map((sz) => <Button key={sz} kind="primary" state={state} t={t} size={sz}>Size {sz}</Button>)}
                                        <Button kind="secondary" state={state} t={t} icon={Icon.arrow}>With icon</Button>
                                    </div>
                                </Panel>
                                <Grid min={250}>
                                    <Panel title="Text input" t={t}><Field t={t} label={t.s.input} placeholder={t.s.placeholder} helper={t.s.helper} state={state} /></Panel>
                                    <Panel title="Search" t={t}><Field t={t} label="Search" placeholder={t.s.search || "Search…"} icon={Icon.search} state={state} /></Panel>
                                    <Panel title="Select" t={t}><Field t={t} label={t.s.selectLabel || "Plan"} state={state} select={t.s.select || ["Starter", "Pro", "Team"]} /></Panel>
                                    <Panel title="Textarea" t={t}><Field t={t} label="Notes" placeholder="Write a note…" multiline helper="Max 280 characters" state={state} /></Panel>
                                </Grid>
                                <Grid min={220}>
                                    <Panel title="Checkbox" t={t}>
                                        <Checkbox t={t} label={t.s.check1 || "Email me updates"} initial />
                                        <Checkbox t={t} label={t.s.check2 || "Remember this device"} />
                                    </Panel>
                                    <Panel title="Radio" t={t}><Radios t={t} options={t.s.radios || ["Monthly", "Yearly", "Lifetime"]} /></Panel>
                                    <Panel title="Switch" t={t}>
                                        <Toggle t={t} label={t.s.switch1 || "Notifications"} />
                                        <Toggle t={t} initial={false} label={t.s.switch2 || "Dark mode"} />
                                    </Panel>
                                    <Panel title="Badges & chips" t={t}>
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            <Badge t={t} color={t.sem.success}>Success</Badge>
                                            <Badge t={t} color={t.sem.warning}>Warning</Badge>
                                            <Badge t={t} color={t.sem.error}>Error</Badge>
                                            <Badge t={t} color={t.sem.info}>Info</Badge>
                                            {t.s.chips.map((c, i) => <Badge key={c} t={t} color={(Object.values(t.colors)[i] as string) || t.focus} solid={i === 0}>{c}</Badge>)}
                                        </div>
                                    </Panel>
                                </Grid>
                                <Grid min={300}>
                                    <Panel title="Alerts" t={t}>
                                        <Alert t={t} kind="success" title={t.s.alertOk || "Saved"} body={t.s.alertOkBody || "Your changes are live."} />
                                        <Alert t={t} kind="warning" title={t.s.alertWarn || "Trial ends in 3 days"} body={t.s.alertWarnBody || "Upgrade to keep your data."} />
                                        <Alert t={t} kind="error" title={t.s.alertErr || "Payment failed"} body={t.s.alertErrBody || "Check your card details and try again."} />
                                    </Panel>
                                    <Panel title="Navigation" t={t}>
                                        <MiniNav t={t} />
                                        <BrandTabs t={t} items={t.s.tabs || ["Overview", "Activity", "Settings"]} />
                                        <Pagination t={t} />
                                    </Panel>
                                </Grid>
                                <Grid min={300}>
                                    <Panel title="Card" t={t}>
                                        <motion.div whileHover={{ y: -4, boxShadow: t.shadow }} style={{ borderRadius: t.r.card, overflow: "hidden", background: t.bg, boxShadow: `inset 0 0 0 1px ${t.border}` }}>
                                            <div style={{ height: 72, background: t.gradient }} />
                                            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                                                <div>
                                                    <div style={{ font: `${t.hw} 17px/1.2 ${t.heading}`, letterSpacing: t.tracking, color: t.text }}>{t.s.card}</div>
                                                    <div style={{ font: `400 13px/1.4 ${t.body}`, color: t.muted }}>{t.s.cardMeta}</div>
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                                    <Avatars t={t} names={t.s.people || ["Ana Ruiz", "Ben Cole", "Kai Lee"]} />
                                                    <Button kind="primary" t={t} size="S">{t.s.cardCta}</Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Panel>
                                    <Panel title="Progress & steps" t={t}>
                                        <Progress t={t} value={t.s.progressValue || 68} />
                                        <Stepper t={t} steps={t.s.steps || ["Account", "Details", "Review"]} current={1} />
                                    </Panel>
                                </Grid>
                                <Grid min={320}>
                                    <Panel title="Data table" t={t}><Table t={t} /></Panel>
                                    <Panel title="Dialog" t={t}><Modal t={t} /></Panel>
                                </Grid>
                            </>
                        )}

                        {tab === "Tokens" && (
                            <>
                                <Panel title="Brand color" t={t} note="click to copy">
                                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${narrow ? 120 : 140}px, 1fr))`, gap: 10 }}>
                                        {Object.entries(t.colors).map(([n, v], i) => <Token key={n} name={n} value={v as string} t={t} i={i} />)}
                                    </div>
                                </Panel>
                                <Panel title="Semantic color" t={t}>
                                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${narrow ? 120 : 140}px, 1fr))`, gap: 10 }}>
                                        {Object.entries(t.sem).map(([n, v], i) => <Token key={n} name={n} value={v as string} t={t} i={i} />)}
                                        <Token name="text" value={t.text} t={t} i={4} />
                                        <Token name="muted" value={t.muted} t={t} i={5} />
                                        <Token name="surface" value={t.surface} t={t} i={6} />
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
                                            {scale(v).map((s, i) => (
                                                <motion.div key={s.step} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.03 }} title={hex(s.rgb)}
                                                    style={{ height: 56, borderRadius: Math.min(t.r.input, 10), background: hex(s.rgb), color: inkOn(hex(s.rgb)), padding: 6, font: `600 10px/1.2 ${t.mono}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                                    <span>{s.step}</span><span style={{ opacity: 0.8 }}>{hex(s.rgb).slice(1)}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </Panel>
                                ))}
                                <Panel title="Spacing" t={t} note="4px base grid">
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {t.spacing.map((s, i) => (
                                            <div key={s} style={{ display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "center", gap: 12 }}>
                                                <span style={{ font: `500 12px/1 ${t.mono}`, color: t.muted }}>space-{i + 1} · {s}</span>
                                                <motion.span initial={{ width: 0 }} animate={{ width: Math.min(s * 4, 100) + "%" }} transition={{ duration: 0.6, ease: EASE, delay: i * 0.04 }} style={{ height: 12, maxWidth: s * 4, borderRadius: 3, background: t.accentFill, opacity: 0.85 }} />
                                            </div>
                                        ))}
                                    </div>
                                </Panel>
                                <Grid min={260}>
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
                                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                                            {Object.entries(t.shadows).map(([k, v]) => (
                                                <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                                    <motion.div whileHover={{ y: -4 }} title={v as string} style={{ width: 72, height: 56, borderRadius: Math.min(t.r.card, 14), background: t.bg, boxShadow: v as string }} />
                                                    <span style={{ font: `500 11px/1.2 ${t.mono}`, color: t.muted }}>shadow-{k}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Panel>
                                    <Panel title="Motion" t={t}>
                                        {(["fast", "base", "slow"] as const).map((k) => <MotionToken key={k} t={t} name={k} ms={t.motion[k]} />)}
                                        <code style={{ font: `500 11px/1.4 ${t.mono}`, color: t.muted }}>ease · {t.motion.easing}</code>
                                    </Panel>
                                </Grid>
                            </>
                        )}

                        {tab === "Type" && (
                            <Panel title={`${t.fontNames.heading || "Inter"} · ${t.fontNames.body || "Inter"}${t.fontNames.mono ? ` · ${t.fontNames.mono}` : ""}`} t={t} note={`${t.typeScale.length} styles`}>
                                {t.typeScale.map((st, i) => {
                                    const wgt = st.weight || (st.font === "heading" ? t.hw : 400)
                                    const sz = narrow ? Math.round(Math.min(st.size, 16 + (st.size - 16) * 0.6)) : st.size
                                    return (
                                        <Reveal key={st.name} i={i} style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "150px 1fr", alignItems: "baseline", gap: narrow ? 4 : 16, paddingBottom: 12, borderBottom: i < t.typeScale.length - 1 ? `1px solid ${t.border}` : "none" }}>
                                            <span style={{ font: `500 11px/1.5 ${t.mono}`, color: t.muted }}>{st.name}<br />{st.size}/{Math.round(st.size * (st.lh || 1.3))} · {wgt}{st.tracking ? ` · ${st.tracking}` : ""}</span>
                                            <span style={{ fontFamily: font(st.font), fontWeight: wgt, fontSize: sz, letterSpacing: st.tracking || (st.font === "heading" ? t.tracking : "0"), lineHeight: st.lh || 1.3, color: t.text, textTransform: st.font === "mono" && st.size < 13 ? "uppercase" : "none", overflowWrap: "anywhere" }}>
                                                {st.sample || (st.font === "heading" ? (t.s.typeSample || "Built from one source of truth") : st.font === "mono" ? "Tokens · components · patterns" : "Every screen uses the same tokens, so product, marketing and code stay in sync.")}
                                            </span>
                                        </Reveal>
                                    )
                                })}
                            </Panel>
                        )}

                        {tab === "Specs" && (
                            <>
                                <Panel title="Button anatomy" t={t} note="measurements from tokens">
                                    <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "center", padding: "12px 4px 40px" }}>
                                        <Measure t={t} label={`height 44 · radius ${t.r.button >= 50 ? "pill" : t.r.button}`}><Button kind="primary" t={t}>{t.s.cta}</Button></Measure>
                                        <Measure t={t} label="padding-x 24"><Button kind="secondary" t={t}>{t.s.secondary}</Button></Measure>
                                        <Measure t={t} label="44 × 44 target"><Button kind="primary" t={t} icon={Icon.plus} /></Measure>
                                    </div>
                                </Panel>
                                <Grid min={260}>
                                    <Panel title="Input anatomy" t={t}>
                                        <Field t={t} label="Label · 13/500" placeholder="Placeholder · 15/400" helper="Helper text · 12/400" state="Default" />
                                        <ul style={{ margin: 0, paddingLeft: 18, font: `400 13px/1.6 ${t.body}`, color: t.muted }}>
                                            <li>Height 44 · padding 12/14 · radius {t.r.input}px</li>
                                            <li>Border 1px {t.borderSolid} → focus 1.5px + 4px halo</li>
                                            <li>Error swaps border and helper to the error token</li>
                                        </ul>
                                    </Panel>
                                    <Panel title="Card anatomy" t={t}>
                                        <div style={{ borderRadius: t.r.card, background: t.bg, boxShadow: `inset 0 0 0 1px ${t.border}`, padding: 16, display: "grid", gap: 8, position: "relative" }}>
                                            <span style={{ height: 40, borderRadius: Math.max(4, t.r.card - 10), background: alpha(t.focus, 0.15), display: "grid", placeItems: "center", font: `500 11px/1 ${t.mono}`, color: t.muted }}>media</span>
                                            <span style={{ height: 12, width: "60%", borderRadius: 4, background: t.borderSolid }} />
                                            <span style={{ height: 10, width: "40%", borderRadius: 4, background: t.border }} />
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: 18, font: `400 13px/1.6 ${t.body}`, color: t.muted }}>
                                            <li>Padding 16 · gap 8 · radius {t.r.card}px</li>
                                            <li>Rest: 1px border · hover: shadow-md + lift 4px</li>
                                        </ul>
                                    </Panel>
                                    <Panel title="Breakpoints" t={t}>
                                        {[["Mobile", "< 640", 30], ["Tablet", "640–1023", 60], ["Desktop", "1024–1439", 85], ["Wide", "≥ 1440", 100]].map(([n, r, p]: any, i) => (
                                            <div key={n} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 10, alignItems: "center" }}>
                                                <span style={{ font: `600 12px/1.2 ${t.body}` }}>{n}<br /><span style={{ font: `500 11px/1.2 ${t.mono}`, color: t.muted }}>{r}</span></span>
                                                <motion.span initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }} style={{ height: 10, borderRadius: 99, background: t.gradient, opacity: 0.4 + i * 0.18 }} />
                                            </div>
                                        ))}
                                    </Panel>
                                </Grid>
                            </>
                        )}

                        {tab === "Guidelines" && (
                            <Grid min={440} gap={20}>
                                {(t.docs.dos || DEFAULT_DOS).map((d, i) => (
                                    <Reveal key={i} i={i}>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12, height: "100%" }}>
                                            <DoDont t={t} ok kind={d.kind} text={d.do} />
                                            <DoDont t={t} ok={false} kind={d.kind} text={d.dont} />
                                        </div>
                                    </Reveal>
                                ))}
                            </Grid>
                        )}

                        {tab === "Accessibility" && (
                            <>
                                <Panel title="Contrast matrix" t={t} note="WCAG 2.2 · text on background">
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ borderCollapse: "separate", borderSpacing: 6, font: `500 12px/1.2 ${t.body}` }}>
                                            <thead><tr><th />{pairs.bgs.map(([n, c]) => <th key={n} style={{ font: `600 11px/1.2 ${t.mono}`, color: t.muted, textAlign: "left", padding: "0 4px" }}>{n}<br />{hex(parse(c))}</th>)}</tr></thead>
                                            <tbody>{pairs.fgs.map(([fn, fc]) => (
                                                <tr key={fn}>
                                                    <th style={{ font: `600 12px/1.2 ${t.body}`, color: t.text, textAlign: "left", paddingRight: 8, whiteSpace: "nowrap" }}>{fn}</th>
                                                    {pairs.bgs.map(([bn, bc]) => {
                                                        const r = contrast(parse(fc), parse(bc))
                                                        const pass = r >= 4.5
                                                        return (
                                                            <td key={bn} style={{ background: bc, color: fc, borderRadius: 10, padding: "10px 12px", minWidth: 96, boxShadow: `inset 0 0 0 1px ${t.border}` }}>
                                                                <div style={{ font: `600 15px/1 ${t.body}` }}>Aa {r.toFixed(2)}</div>
                                                                <div style={{ marginTop: 6, display: "inline-block", padding: "3px 6px", borderRadius: 6, font: `700 10px/1 ${t.mono}`, background: pass ? t.sem.success : r >= 3 ? t.sem.warning : t.sem.error, color: "#fff" }}>{grade(r)}</div>
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            ))}</tbody>
                                        </table>
                                    </div>
                                </Panel>
                                <Grid min={260}>
                                    <Panel title="Focus ring" t={t}>
                                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                                            <Button kind="primary" state="Focus" t={t}>Focused</Button>
                                            <Button kind="secondary" state="Focus" t={t}>Focused</Button>
                                        </div>
                                        <span style={{ font: `400 13px/1.5 ${t.body}`, color: t.muted }}>2px gap + 2px {hex(parse(t.focus))} ring, visible on every surface. Tab through this page to try it.</span>
                                    </Panel>
                                    <Panel title="Touch targets" t={t}>
                                        <div style={{ display: "flex", gap: 18, alignItems: "flex-end" }}>
                                            {[[24, "24 · min (AA)"], [44, "44 · recommended"]].map(([s, l]: any) => (
                                                <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                                    <span style={{ width: s, height: s, borderRadius: 8, background: alpha(t.focus, 0.18), boxShadow: `inset 0 0 0 1.5px dashed ${t.focus}`, outline: `1.5px dashed ${t.focus}`, outlineOffset: -1.5 }} />
                                                    <span style={{ font: `500 11px/1.2 ${t.mono}`, color: t.muted }}>{l}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Panel>
                                    <Panel title="Not color alone" t={t}>
                                        <Field t={t} label={t.s.input} placeholder={t.s.placeholder} helper="" state="Error" />
                                        <span style={{ font: `400 13px/1.5 ${t.body}`, color: t.muted }}>Errors pair the red border with an icon and a written message.</span>
                                    </Panel>
                                </Grid>
                                <Panel title="Checklist" t={t}>
                                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                                        {(t.docs.a11y || DEFAULT_A11Y).map((a, i) => (
                                            <Reveal key={i} i={i}>
                                                <li style={{ display: "flex", gap: 10, alignItems: "flex-start", font: `400 14px/1.5 ${t.body}`, color: t.text }}>
                                                    <span style={{ flex: "none", width: 22, height: 22, borderRadius: 99, display: "grid", placeItems: "center", background: alpha(t.sem.success, 0.16), color: t.sem.success }}>{Icon.check}</span>{a}
                                                </li>
                                            </Reveal>
                                        ))}
                                    </ul>
                                </Panel>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

function Token({ name, value, t, i }) {
    const [copied, setCopied] = useState(false)
    const rgb = parse(value)
    const onWhite = contrast(rgb, [255, 255, 255]), onInk = contrast(rgb, parse(t.text))
    return (
        <motion.button
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.04, 0.4) }}
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

function MotionToken({ t, name, ms }) {
    const [go, setGo] = useState(false)
    return (
        <button onClick={() => setGo(!go)} style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, display: "grid", gridTemplateColumns: "88px 1fr", alignItems: "center", gap: 10, textAlign: "left" }} aria-label={`Play ${name} motion, ${ms} milliseconds`}>
            <span style={{ font: `500 12px/1.2 ${t.mono}`, color: t.muted }}>{name} · {ms}ms</span>
            <span style={{ position: "relative", height: 24, borderRadius: 99, background: t.surface, boxShadow: `inset 0 0 0 1px ${t.border}` }}>
                <motion.span animate={{ left: go ? "calc(100% - 22px)" : "2px" }} transition={{ duration: ms / 1000, ease: [0.16, 1, 0.3, 1] }} style={{ position: "absolute", top: 2, width: 20, height: 20, borderRadius: 99, background: t.accentFill }} />
            </span>
        </button>
    )
}

// Rendered do/don't examples (a small live demo above each rule).
function DoDont({ t, ok, kind, text }) {
    const c = ok ? t.sem.success : t.sem.error
    let demo = null
    if (kind === "primary") demo = ok
        ? <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}><Button kind="primary" t={t} size="S">{t.s.cta}</Button><Button kind="ghost" t={t} size="S">Later</Button></div>
        : <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}><Button kind="primary" t={t} size="S">{t.s.cta}</Button><Button kind="primary" t={t} size="S">Buy</Button></div>
    else if (kind === "contrast") demo = <span style={{ font: `500 14px/1.4 ${t.body}`, color: ok ? t.text : alpha(t.text, 0.35) }}>Readable body text</span>
    else if (kind === "radius") demo = <div style={{ display: "flex", gap: 8 }}>{(ok ? [t.r.button, t.r.button, t.r.button] : [2, 18, 999]).map((r, i) => <span key={i} style={{ width: 40, height: 28, borderRadius: Math.min(r, 14), background: alpha(t.focus, 0.25), boxShadow: `inset 0 0 0 1.5px ${t.focus}` }} />)}</div>
    else if (kind === "copy") demo = <Button kind="primary" t={t} size="S">{ok ? t.s.cta : "Click here"}</Button>
    else if (kind === "spacing") demo = <div style={{ display: "flex", gap: ok ? 8 : 2 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 28, height: 28, borderRadius: 6, background: alpha(t.focus, 0.3), marginTop: ok ? 0 : i * 5 }} />)}</div>
    else if (kind === "color") demo = <div style={{ display: "flex", gap: 6 }}>{(ok ? [t.accentFill, t.text, t.muted] : ["#FF00AA", "#00E5FF", "#FFD000", "#7CFF00"]).map((x, i) => <span key={i} style={{ width: 22, height: 22, borderRadius: 99, background: x }} />)}</div>
    return (
        <div style={{ borderRadius: Math.min(t.r.card, 16), background: t.bg, border: `1px solid ${t.border}`, borderTop: `3px solid ${c}`, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
            {demo && <div style={{ minHeight: 88, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, background: t.surface, borderBottom: `1px solid ${t.border}`, overflow: "hidden" }}>{demo}</div>}
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, font: `700 12px/1 ${t.body}`, color: c, textTransform: "uppercase", letterSpacing: ".06em" }}>{ok ? Icon.check : Icon.x}{ok ? "Do" : "Don't"}</span>
                <span style={{ font: `400 13px/1.45 ${t.body}`, color: t.text }}>{text}</span>
            </div>
        </div>
    )
}

DesignSystemShowcase.defaultProps = { brand: "", spec: "", primary: "#CD57FF", secondary: "#33363F", accent: "#FFCE1F" }

addPropertyControls(DesignSystemShowcase, {
    brand: { type: ControlType.String, title: "Brand" },
    spec: { type: ControlType.String, title: "Tokens JSON", displayTextArea: true },
    primary: { type: ControlType.Color, title: "Primary" },
    secondary: { type: ControlType.Color, title: "Secondary" },
    accent: { type: ControlType.Color, title: "Accent" },
})
