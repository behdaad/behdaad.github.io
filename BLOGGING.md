# Blogging

Blog posts are written in Markdown and generated with [Eleventy](https://www.11ty.dev/).

## Write a post

Create a Markdown file in `blog-src/posts/`, for example `blog-src/posts/my-post.md`:

```md
---
layout: base.njk
title: My post title
description: A short summary shown on the blog index.
date: 2026-08-04
tags: [English]
permalink: "/{{ page.fileSlug }}/"
pageClass: post
relativeRoot: ../..
blogRoot: ..
---

## A heading

Write the post in Markdown here.
```

Put images in `assets/blog/` and reference them with a root-relative path:

```md
![A useful description](../../assets/blog/my-image.jpg)
```

## Build and publish

The repository's pre-commit hook automatically runs this build and stages the
generated `blog/` files. Enable the versioned hook once after cloning:

```sh
git config core.hooksPath .githooks
```

Run this locally after writing or editing a post:

```sh
npm run build:blog
```

Commit the Markdown source, generated files in `blog/`, and any new assets. On the server, publishing remains:

```sh
git pull
```
