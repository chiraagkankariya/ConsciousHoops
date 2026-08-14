## Problem

The link preview image (`og:image` / `twitter:image`) in `src/routes/__root.tsx` points to a cached screenshot of the old version of the site, which still shows "where the court meets the cushion". Social platforms (iMessage, Slack, WhatsApp, etc.) fetch that image URL when rendering link previews, so updating the page text alone doesn't change what people see.

## Fix

1. Generate a new share-preview image (1200×630, standard OG ratio) that reflects the current site:
   - Cream background (`#FAF6EF`)
   - Headline "Where the court meets the mind." in Playfair Display, with "the mind." in terra italic
   - Subtle ConsciousHoops branding / Boston tag
   - Save to `src/assets/og-preview.jpg`
2. Import that asset and wire it into both `og:image` and `twitter:image` in `src/routes/__root.tsx` (leaf-level — the root currently holds them, which is fine since there's only one route).
3. Heads-up to the user: platforms cache previews aggressively. After publishing, the new image won't show in already-shared links until the platform re-scrapes. They can force a refresh using each platform's debugger (e.g., Facebook Sharing Debugger, LinkedIn Post Inspector, Slack unfurl by re-pasting after cache expiry, iMessage by clearing the conversation's cached preview).

## Files touched

- `src/assets/og-preview.jpg` (new)
- `src/routes/__root.tsx` (update `og:image` + `twitter:image`)
