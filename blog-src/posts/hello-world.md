---
layout: base.njk
title: Hello, world!
description: The first post on my new blog.
date: 2026-08-04
tags: [English]
permalink: "/{{ page.fileSlug }}/"
pageClass: post
relativeRoot: ../..
blogRoot: ..
---

## It works

This post started as a Markdown file and was generated as a plain HTML page. That means the blog remains fast, simple, and easy to publish: build it locally, commit the result, and pull the repository on the server.

Future posts can include images just as easily:

```markdown
![A useful description](../../assets/blog/my-image.jpg)
```

The image file lives in `assets/blog/`, alongside the rest of the site's static assets.
