/* eslint-disable */
const config = require('./webpack.config');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const server = new WebpackDevServer(webpack(config), config.devServer);
server.listen(8080, 'localhost', () => console.log('running on 8080'));

