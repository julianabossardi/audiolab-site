module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("uploads");
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Looks up a project by its exact "nome" — used so the featured bubbles
  // on the home page can link straight to their own project page once one
  // with a matching title exists in the CMS.
  eleventyConfig.addFilter("findByNome", (list, nome) => (list || []).find((p) => p.nome === nome) || null);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
