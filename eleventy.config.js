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

  return {
    dir: {
      input: "blog-src",
      includes: "_includes",
      output: "."
    }
  };
};
