import type { ComponentType } from "react"
import { useEffect, useRef, useState } from "react"

/* Light/dark switch for the site's color styles (Framer code override).

   Framer ships every color style as light values plus an
   `@media (prefers-color-scheme: dark)` block. This forces those blocks on
   or off through the CSSOM, so it doesn't depend on which <style> tag holds
   them or on how Framer minifies the CSS (the old override edited the first
   <style> tag's text and broke when Framer moved fonts there).

   The forced state is encoded in the media text itself, so it can always be
   undone and re-applied:
     on  → "(prefers-color-scheme: dark), (min-width: 0px)"   always matches
     off → "(prefers-color-scheme: dark) and (max-width: 0px)" never matches

   Applied to the nav's toggle button as Overrides → Switcher → themeSwicther
   (name kept from the original override so the button stays connected). */

type Theme = "light" | "dark"
const KEY = "currentToggleState" // same key as the previous override
const MARK = "data-theme-toggle"
// The icon inside the button is its own component: Variant 1 = sun (shown
// in dark mode), Variant 2 = moon (shown in light mode). Its own tap flips it.
const ICON = { dark: "Variant 1", light: "Variant 2" }
const SCHEME = /^\(prefers-color-scheme:\s*(dark|light)\)(?:,\s*\(min-width:\s*0px\)| and \(max-width:\s*0px\))?$/

const systemTheme = (): Theme =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

function savedTheme(): Theme | null {
    try {
        const v = localStorage.getItem(KEY)
        return v === "dark" || v === "light" ? v : null
    } catch {
        return null
    }
}

function forceRules(rules: CSSRuleList, theme: Theme) {
    for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSMediaRule)) continue
        const m = rule.media.mediaText.match(SCHEME)
        if (!m) continue
        const base = `(prefers-color-scheme: ${m[1]})`
        const next = m[1] === theme ? `${base}, (min-width: 0px)` : `${base} and (max-width: 0px)`
        if (rule.media.mediaText !== next) rule.media.mediaText = next
    }
}

export function applyTheme(theme: Theme) {
    if (typeof document === "undefined") return
    for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList
        try {
            rules = sheet.cssRules
        } catch {
            continue // cross-origin stylesheet
        }
        forceRules(rules, theme)
    }
    const root = document.documentElement
    root.style.colorScheme = theme
    root.dataset.theme = theme
}

export function themeSwicther(Component): ComponentType {
    return (props) => {
        // Starts as null so server and first client render match.
        const [theme, setTheme] = useState<Theme | null>(null)
        const syncing = useRef(false)

        useEffect(() => {
            setTheme(savedTheme() ?? systemTheme())
            // Follow the OS while the visitor hasn't picked a theme.
            const mq = window.matchMedia("(prefers-color-scheme: dark)")
            const onSystem = () => {
                if (!savedTheme()) setTheme(systemTheme())
            }
            mq.addEventListener("change", onSystem)
            return () => mq.removeEventListener("change", onSystem)
        }, [])

        useEffect(() => {
            if (!theme) return
            applyTheme(theme)
            window.dispatchEvent(new CustomEvent("themeChange", { detail: theme }))
            // Framer adds <style> tags when new components appear (page
            // changes, lazy sections): force those too.
            let t = 0
            const mo = new MutationObserver(() => {
                clearTimeout(t)
                t = window.setTimeout(() => applyTheme(theme), 30)
            })
            mo.observe(document.head, { childList: true, subtree: true, characterData: true })
            syncIcons(theme)
            return () => {
                mo.disconnect()
                clearTimeout(t)
            }
        }, [theme])

        // Puts the icon on the right variant (e.g. a visitor arriving in dark
        // mode) by tapping it once; that tap must not toggle the theme.
        function syncIcons(t: Theme) {
            document.querySelectorAll(`[${MARK}]`).forEach((root) => {
                const icon = root.querySelector('[data-framer-name="Variant 1"], [data-framer-name="Variant 2"]')
                if (!icon || icon.getAttribute("data-framer-name") === ICON[t]) return
                syncing.current = true
                for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
                    const Ev = type.startsWith("pointer") ? PointerEvent : MouseEvent
                    icon.dispatchEvent(new Ev(type, { bubbles: true, cancelable: true, pointerType: "mouse", isPrimary: true } as PointerEventInit))
                }
                syncing.current = false
            })
        }

        const toggle = () => {
            if (syncing.current) return
            const next: Theme = (theme ?? systemTheme()) === "dark" ? "light" : "dark"
            try {
                localStorage.setItem(KEY, next)
            } catch {}
            setTheme(next)
        }

        const label = theme === "light" ? "Switch to dark mode" : "Switch to light mode"
        return (
            <Component
                {...props}
                {...{ [MARK]: "" }}
                onClick={toggle}
                role="button"
                tabIndex={0}
                aria-label={label}
                title={label}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        toggle()
                    }
                }}
            />
        )
    }
}
