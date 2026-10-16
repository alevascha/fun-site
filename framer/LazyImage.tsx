import { forwardRef, type ComponentType } from "react"

// Code override: Framer → Assets → Code → "LazyImage". Apply withLazyImage to
// image frames that Framer loads eagerly although they sit below the fold.
//
// Framer lazy-loads images by itself, except inside components whose
// visibility is driven by a variable (its help article lists this exception).
// The project Card hides its images with the "Visible Image" variable on some
// breakpoints, so all its images downloaded up front, even on phones where
// that variant is never shown (about 1.2 MB on the home page). This only sets
// the browser's native loading="lazy" on the image: same file, same quality,
// same animations. Don't use it on images in the first screen (the hero).
export function withLazyImage(Component): ComponentType {
    return forwardRef((props: any, ref) => {
        const bg = props.background
        if (!bg || typeof bg !== "object" || !bg.src) return <Component ref={ref} {...props} />
        return <Component ref={ref} {...props} background={{ ...bg, loading: "lazy" }} />
    })
}
