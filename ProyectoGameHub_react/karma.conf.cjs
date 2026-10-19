const path = require("path");
const fs = require("fs");

const LOCAL_CHROME = "/home/claude/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome";
if (!process.env.CHROME_BIN && fs.existsSync(LOCAL_CHROME)) process.env.CHROME_BIN = LOCAL_CHROME;

module.exports = function (config) {
    config.set({
        basePath: ".",
        frameworks: ["jasmine", "webpack"],
        files: [
            { pattern: "test/index.js", watched: false },
            { pattern: "public/img/**/*", included: false, served: true, watched: false },
        ],
        proxies: { "/img/": "/base/public/img/" },
        preprocessors: { "test/index.js": ["webpack", "sourcemap"] },
        webpack: {
            mode: "development",
            devtool: "inline-source-map",
            resolve: { extensions: [".js", ".jsx"] },
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        type: "javascript/auto",
                        resolve: { fullySpecified: false },
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader",
                            options: { babelrc: false, configFile: path.resolve(__dirname, ".babelrc.test.json"), cwd: __dirname },
                        },
                    },
                    { test: /\.css$/, use: ["style-loader", "css-loader"] },
                ],
            },
        },
        reporters: ["spec", "coverage"],
        specReporter: { suppressSkipped: true, showSpecTiming: true },
        coverageReporter: {
            dir: "coverage",
            subdir: ".",
            reporters: [{ type: "html" }, { type: "text-summary" }, { type: "lcovonly" }, { type: "json-summary" }],
        },
        browsers: ["ChromeHeadlessCI"],
        customLaunchers: {
            ChromeHeadlessCI: { base: "ChromeHeadless", flags: ["--no-sandbox", "--disable-gpu"] },
        },
        singleRun: true,
        client: { jasmine: { random: true } },
    });
};
