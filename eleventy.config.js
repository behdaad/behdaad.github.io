module.exports = function (eleventyConfig) {
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

  return {
    dir: {
      input: "blog-src",
      includes: "_includes",
      output: "blog"
    }
  };
};
