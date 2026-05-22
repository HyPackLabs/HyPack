# Guides

Add markdown guides to this folder. Subfolders become **categories** that show up in the Guides nav dropdown and on the guides listing page.

## Root-level guide

Create `overview.md` at the top level:

```md
---
title: HyPack overview
date: 2025-05-21
---

## What is HyPack?

HyPack helps you build and share Hytale modpacks.
```

URL: `/guides/overview`

## Category guides

Create a subfolder for each category, then add `.md` files inside it:

```
content/guides/
  getting-started/
    welcome.md
    first-modpack.md
```

- Folder name `getting-started` → category label **Getting Started**
- URL for `welcome.md`: `/guides/getting-started/welcome`
- Filtered listing: `/guides?category=getting-started`

## Frontmatter

Use `title` and `date` in each file (same as blog/changelog). The filename (without `.md`) is the URL segment; category folders are included in the path.
