# Journal (blog)

Plain static HTML, matching the rest of the Clicknectar site. No CMS, no
build step, no dependencies — each post is one file, written directly as
crawlable HTML so it's indexed as-is (no client-side rendering to wait on).

## Adding a new post

1. Copy `blog/posts/_template.html` to `blog/posts/your-slug.html`.
   Use a short, readable, hyphenated slug — it becomes the URL and matters
   for SEO (e.g. `local-seo-vs-national-seo.html`).
2. Fill in every `{{PLACEHOLDER}}` in the file:
   - `<title>`, meta description, canonical URL, Open Graph tags, and the
     JSON-LD block all need the real title / summary / date / slug.
   - Keep the meta description under ~155 characters.
   - Voice: calm, short sentences, no exclamation points, no urgency
     language. See the site's existing posts for the tone.
3. Add an entry to `blog/index.html`, inside `<div class="post-list">`,
   above the previous newest post (newest first):
   ```html
   <div class="post-row">
     <div class="post-row-date">Mon YYYY</div>
     <div class="post-row-main">
       <a class="post-title-link" href="posts/your-slug.html">
         <p class="post-category">Category</p>
         <h2 class="post-title">Your Title</h2>
         <p class="post-excerpt">One or two sentence excerpt.</p>
         <span class="post-read">Read the piece</span>
       </a>
     </div>
   </div>
   ```
4. Add the new post's URL to `/sitemap.xml` (repo root of the
   `clicknectar/` folder) so search engines can discover it without
   waiting to be linked elsewhere.
5. Delete the template comment block if you copied it along with the file.

## Notes

- All internal links are relative (`../../` from a post back to the site
  root), so the site keeps working if it's ever moved off the `/blog/`
  path or served from a subdirectory.
- `og:image` currently points at the wordmark as a fallback. If a post
  warrants a real image, add one under `blog/assets/` and point `og:image`
  at it instead.
- There's no pagination yet. If the list grows past 15–20 posts, split
  `blog/index.html` into paginated pages before it gets unwieldy.
