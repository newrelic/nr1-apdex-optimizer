module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|eot|svg|ttf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
      { test: /\.(woff|woff2)$/, loader: 'url-loader?prefix=font/&limit=5000' },
    ],
  },
};
