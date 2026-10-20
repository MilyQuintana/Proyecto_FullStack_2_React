const path = require("path");
const fs = require("fs");

function detectarNavegador() {
    const env = process.env;
    const candidatos = {
        win32: [
            ["ProgramFiles", "Google\\Chrome\\Application\\chrome.exe"],
            ["ProgramFiles(x86)", "Google\\Chrome\\Application\\chrome.exe"],
            ["LOCALAPPDATA", "Google\\Chrome\\Application\\chrome.exe"],
            ["ProgramFiles", "BraveSoftware\\Brave-Browser\\Application\\brave.exe"],
            ["ProgramFiles(x86)", "BraveSoftware\\Brave-Browser\\Application\\brave.exe"],
            ["LOCALAPPDATA", "BraveSoftware\\Brave-Browser\\Application\\brave.exe"],
            ["ProgramFiles", "Microsoft\\Edge\\Application\\msedge.exe"],
            ["ProgramFiles(x86)", "Microsoft\\Edge\\Application\\msedge.exe"],
        ].map(([base, rel]) => env[base] && path.join(env[base], rel)),
        darwin: [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
        ],
        linux: [
            "/usr/bin/google-chrome",
            "/usr/bin/google-chrome-stable",
            "/usr/bin/brave-browser",
            "/usr/bin/microsoft-edge",
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
            "/snap/bin/chromium",
        ],
    };
    return (candidatos[process.platform] || []).find((ruta) => ruta && fs.existsSync(ruta));
}

if (!process.env.CHROME_BIN) {
    const navegador = detectarNavegador();
    if (navegador) process.env.CHROME_BIN = navegador;
}

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
