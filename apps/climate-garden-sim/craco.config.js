const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  webpack: {
    plugins: [
      new CopyPlugin({
        patterns: [
          // Copy database directory to build output
          {
            from: path.resolve(__dirname, 'database'),
            to: 'database',
          },
          // Copy sql.js WASM file
          {
            from: path.resolve(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm'),
            to: 'sql-wasm.wasm',
          },
        ],
      }),
    ],
    configure: (webpackConfig) => {
      // Add Node.js polyfills for sql.js
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util"),
        "buffer": require.resolve("buffer"),
        "vm": require.resolve("vm-browserify"),
        "fs": false, // fs cannot be polyfilled in browser
      };

      // Ensure .db files are treated as assets
      webpackConfig.module.rules.push({
        test: /\.db$/,
        type: 'asset/resource',
        generator: {
          filename: 'database/[name][ext]',
        },
      });

      // Handle WASM files properly
      webpackConfig.experiments = {
        ...webpackConfig.experiments,
        syncWebAssembly: true,
        asyncWebAssembly: true,
      };

      return webpackConfig;
    },
  },
  devServer: {
    // Ensure database files are served during development
    static: [
      {
        directory: path.join(__dirname, 'public'),
      },
      {
        directory: path.join(__dirname, 'database'),
        publicPath: '/database',
      },
    ],
  },
};