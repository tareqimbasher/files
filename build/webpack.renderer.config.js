const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

const cssLoader = 'css-loader';

const sassLoader = {
    loader: 'sass-loader',
    options: {
        sassOptions: {
            includePaths: ['node_modules']
        }
    }
};

rules.push(
    { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
    { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
    { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
    { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' },

    {
        test: /\.css$/i,
        use: ["style-loader", cssLoader]
    },
    {
        test: /\.scss$/i,
        // For style loaded in src/main.js, it's not loaded by style-loader.
        // It's for shared styles for shadow-dom only.
        issuer: /[/\\]src[/\\]renderer[/\\]index\.(js|ts)$/,
        use: ['style-loader', cssLoader, sassLoader]
    },
    {
        test: /\.scss$/i,
        // For style loaded in other js/ts files, it's loaded by style-loader.
        // They are directly injected to HTML head.
        issuer: /(?<![/\\]src[/\\]renderer[/\\]index)\.(js|ts)$/,
        use: ['style-loader', cssLoader, sassLoader]
    },
    {
        test: /\.scss$/i,
        use: ['style-loader', cssLoader, sassLoader]
    },
    {
        test: /\.ts$/i,
        use: ["ts-loader", "@aurelia/webpack-loader"],
        exclude: /node_modules/,
    },
    {
        test: /\.html$/i,
        use: "@aurelia/webpack-loader",
        exclude: /node_modules/,
    }
);

module.exports = {
    module: {
        rules,
    },
    plugins: plugins,
    resolve: {
        extensions: [".js", ".ts", ".css", ".scss", ".json"],
    },
};
