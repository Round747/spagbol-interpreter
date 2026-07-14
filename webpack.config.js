const path = require("path");

module.exports = {
    mode: "production",
    entry: "./src/index.ts",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.ttf$/,
                type: "asset/resource"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    watch: true
}