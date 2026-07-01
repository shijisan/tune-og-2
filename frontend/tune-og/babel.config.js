module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      "react-native-reanimated/plugin",
      ['@babel/plugin-syntax-import-attributes', {deprecatedAssertSyntax: true}],
      '@babel/plugin-transform-export-namespace-from',
    ],
  };
};