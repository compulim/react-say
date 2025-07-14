module.exports = api => {
  if (api.env('test')) {
    return {
      plugins: ["@babel/plugin-transform-object-rest-spread"],
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "current",
            },
          },
        ],
        "@babel/preset-react",
      ],
    };
  }

  return {
    plugins: ["@babel/plugin-transform-object-rest-spread", "@babel/plugin-transform-runtime"],
    presets: [
      [
        "@babel/preset-env",
        {
          forceAllTransforms: true,
          modules: "commonjs",
        },
      ],
      "@babel/preset-react",
    ],
  };
};
