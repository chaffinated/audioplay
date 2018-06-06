const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const { removeEmpty } = require('webpack-config-utils')

const PORT = 5000
const debugRegex = /^([dD]ebug|[lL]ocal)$/
const devRegex = /^([dD]ev)$/
const qaRegex = /^([qQ][aA]|[tT][eE]?[sS][tT])$/
const stagingRegex = /^([sS]taging|[sS][tT][gG])$/

module.exports = (environment = 'prod', argv) => {
  const isDevServer = argv['$0'] && argv['$0'].indexOf('webpack-dev-server') !== -1

  // Sanitize environment name
  let env = environment
  if (stagingRegex.test(env)) {
    env = 'staging'
  } else if (devRegex.test(env)) {
    env = 'dev'
  } else if (qaRegex.test(env)) {
    env = 'qa'
  } else if (debugRegex.test(env)) {
    env = 'debug'
  } else {
    env = 'prod'
  }

  const ifDev = (v) => env === 'debug' || env === 'dev' ? v : undefined
  const ifDevServer = (v) => isDevServer ? v : undefined
  const ifNotDevServer = (v) => !isDevServer ? v : undefined
  const ifNotDev = (v) => env !== 'debug' && env !== 'dev' ? v : undefined
  const ifProd = (v) => env === 'staging' || env === 'prod' ? v : undefined
  const ifNotProd = (v) => env !== 'staging' && env !== 'prod' ? v : undefined

  // Replace global variables depending on the environment ////////////////////
  const replaceQuery = {
    multiple: [
      {search: '__DEV__', replace: ifDev(true) || false, flags: 'g'},
      {search: '__QA__', replace: env === 'qa', flags: 'g'},
      {search: '__PROD__', replace: ifProd(true) || false, flags: 'g'}
    ]
  }

  // Loader Rules /////////////////////////////////////////////////////////////
  const jsRules = {
    test: /\.(jsx|js)$/,
    use: ['babel-loader'],
    exclude: [
      /__tests__/,
      path.resolve(__dirname, 'src/lib'),
      path.resolve(__dirname, '/node_modules/localforage')
    ]
  }
  const cssRules = {
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
  }
  const imgRules = {
    test: /\.(svg|png|jpg|jpeg|gif)$/,
    use: [{
      loader: 'file-loader',
      options: {
        name: '[path][name].[ext]',
        context: path.resolve(__dirname, 'src')
      }
    }]
  }
  const audioRules = {
    test: /\.(wav|aiff?|mp3|mp4|m4a)$/,
    use: [{
      loader: 'file-loader',
      options: {
        name: '[path][name].[ext]',
        context: path.resolve(__dirname, 'src')
      }
    }]
  }
  const htmlRules = {
    test: /\.html$/,
    use: [{
      loader: 'html-loader',
      options: {
        attrs: [':src']
      }
    }]
  }
  const shaderRules = {
    test: /\.(glsl|vs|fs)$/,
    loader: 'shader-loader',
    options: {
      glsl: {
        chunkPath: path.resolve('./src/glsl/chunks')
      }
    }
  }

  // Main Config //////////////////////////////////////////////////////////////
  const entry = {
    'js/main': './src/index.js',
    'js/vendor': ['whatwg-fetch', 'babel-polyfill'],
    'js/css': './src/index.css'
  }
  const filename = ifProd('[name].[chunkhash:8].js') || '[name].[hash:8].js'
  const publicPath = '/'

  const config = removeEmpty({
    entry,
    output: {
      path: path.resolve(__dirname, 'wwwroot'),
      filename,
      publicPath
    },
    module: {
      rules: [
        imgRules,
        audioRules,
        jsRules,
        cssRules,
        htmlRules,
        shaderRules
      ]
    },
    plugins: removeEmpty([
      new Dotenv({path: `./.env.${env}`}),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: ifNotDev('"production"') || '"development"'
        }
      }),
      new CleanWebpackPlugin(['dist/**/*']),
      new webpack.NamedModulesPlugin(),
      new webpack.EnvironmentPlugin({'NODE_ENV': env}),
      new webpack.optimize.CommonsChunkPlugin({names: ['js/vendor', 'js/runtime']}),
      new HtmlWebpackPlugin(removeEmpty({
        inject: true,
        template: './src/index.html'
      })),
      ifNotDev(new UglifyPlugin()),
      // ifProd(new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/)), // only include en locales from moment
      ifDev(new webpack.HotModuleReplacementPlugin())
    ]),
    resolve: {
      modules: [
        path.resolve('./node_modules')
      ],
      alias: {
        react: 'nervjs',
        'react-dom': 'nervjs'
      }
    },
    devtool: ifNotProd('eval-cheap-module-source-map'),
    devServer: ifDev({
      hot: true,
      port: PORT,
      historyApiFallback: true // fallback to root on URLs that aren't '/'
    })
  })

  return config
}
