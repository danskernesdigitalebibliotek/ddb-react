const path = require("path");
const glob = require("glob");
const BundleAnalyzerPlugin = require("@bundle-analyzer/webpack-plugin");

const polyfill = require("./polyfill.config.js");

module.exports = (_env, argv) => {
  const production = argv.mode === "production";

  const entry = glob
    .sync("./src/apps/**/*.mount.js")
    .reduce((acc, entryPath) => {
      const distPath = entryPath
        .replace(/src\/apps\/.+\//, "")
        .replace(".mount.js", "");
      acc[distPath] = entryPath;
      return acc;
    }, {});

  const plugins = [];
  if (process.env.BUNDLE_ANALYZER_TOKEN) {
    plugins.push(
      new BundleAnalyzerPlugin({ token: process.env.BUNDLE_ANALYZER_TOKEN })
    );
  }

  return {
    entry: {
      ...entry,
      mount: "./src/core/mount.js"
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist")
    },
    mode: argv.mode,
    devtool: production ? "source-map" : "inline-source-map",
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        name: () => "bundle",
        chunks: "all"
      }
    },
    resolve: {
      extensions: [".js", ".jsx", ".json"]
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: new RegExp(`node_modules/(?!(${polyfill.join("|")})/).*`),
          use: [
            {
              loader: "babel-loader",
              options: {
                configFile: path.resolve(__dirname, "babel.config.json")
              }
            },
            "eslint-loader"
          ]
        }
      ]
    },
    stats: {
      entrypoints: false,
      modules: false
    },
    plugins
  };
};
