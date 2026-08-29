module.exports = function (eleventyConfig) {
  const tagSlugs = {
    English: "english",
    فارسی: "farsi"
  };

  eleventyConfig.addFilter("dateDisplay", function (date) {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  });

  eleventyConfig.addCollection("post", function (collectionApi) {
    return collectionApi.getFilteredByGlob("blog-src/posts/*.md").reverse();
  });

  eleventyConfig.addFilter("tagSlug", function (tag) {
    return tagSlugs[tag] || encodeURIComponent(String(tag));
  });

  eleventyConfig.addCollection("tagArchive", function (collectionApi) {
    const archives = new Map();

    collectionApi.getFilteredByGlob("blog-src/posts/*.md").reverse().forEach(function (post) {
      (post.data.tags || []).forEach(function (tag) {
        if (!archives.has(tag)) {
          archives.set(tag, {
            name: tag,
            slug: tagSlugs[tag] || encodeURIComponent(String(tag)),
            posts: [],
            lang: post.data.lang,
            direction: post.data.direction
          });
        }

        archives.get(tag).posts.push(post);
      });
    });

    return Array.from(archives.values()).sort(function (a, b) {
      return a.slug.localeCompare(b.slug);
    });
  });

  eleventyConfig.addTransform("external-links-new-tab", function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
      return content;
    }

    return content.replace(/<a\b([^>]*\bhref=(["'])https?:\/\/[^"']+\2[^>]*)>/gi, function (match, attributes) {
      let updatedAttributes = attributes;

      if (/\btarget=(["'])[^"']*\1/i.test(updatedAttributes)) {
        updatedAttributes = updatedAttributes.replace(/\btarget=(["'])[^"']*\1/i, 'target="_blank"');
      } else {
        updatedAttributes += ' target="_blank"';
      }

      if (/\brel=(["'])[^"']*\1/i.test(updatedAttributes)) {
        updatedAttributes = updatedAttributes.replace(/\brel=(["'])([^"']*)\1/i, function (relMatch, quote, relValue) {
          const relTokens = new Set(relValue.split(/\s+/).filter(Boolean));
          relTokens.add("noopener");
          relTokens.add("noreferrer");
          return `rel="${Array.from(relTokens).join(" ")}"`;
        });
      } else {
        updatedAttributes += ' rel="noopener noreferrer"';
      }

      return `<a${updatedAttributes}>`;
    });
  });

  return {
    dir: {
      input: "blog-src",
      includes: "_includes",
      output: "."
    }
  };
};
