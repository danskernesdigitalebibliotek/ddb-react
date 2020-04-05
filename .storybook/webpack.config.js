const path = require("path");
const fs = require("fs").promises
const DefinePlugin = require('webpack').DefinePlugin;
const chalk = require("chalk");

const customWebpack = require("../webpack.config.js");

// https://storybook.js.org/docs/configurations/custom-webpack-config/#full-control-mode
module.exports = async ({ config }) => {
  let token;
  try {
    token = await fs.readFile(path.resolve(__dirname, "../.token"), "utf8");
  } catch(err) {
    console.warn(chalk.yellow("warn") + " => Could not find the .token file in root");
  }
  if (!token) {
    console.warn(chalk.yellow("warn") + " => Token is empty. Requests to external services might not work!");
  }

  const custom = customWebpack(undefined, { mode: 'development' })
  const rules = [
    ...custom.module.rules,
    // We need to make use of css modules in our stories.
    {
      test: /\.scss$/,
      use: ["style-loader", "postcss-loader"],
      include: path.resolve(__dirname, "../")
    }
  ];
  const resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      react: "preact/compat",
      "react-dom": "preact/compat"
    }
  }
  const plugins = [
    ...config.plugins,
    new DefinePlugin({
      DDB_TOKEN: JSON.stringify(token),
      ENV: JSON.stringify(process.env.NODE_ENV)
    })
  ]
  return { ...config, plugins, resolve, module: { ...config.module, rules } };
};
