module.exports = function (eleventyConfig) {
  eleventyConfig.addCollection("ratings", collection =>
    collection.getFilteredByTag("ratingCategory").sort((left, right) => left.data.order - right.data.order)
  );

  return {
    dir: {
      input: "portfolio-src",
      includes: "_includes",
      output: "."
    }
  };
};
