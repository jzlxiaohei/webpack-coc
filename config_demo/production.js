module.exports = {
    entry: {
    },
    output: {
        filename: "[name]-[chunkhash].js",
        chunkFilename:'[name]-[chunkhash].js',
        path: '[dist_path]/[project_name]',
        libraryTarget:'var',
        publicPath:'/[project_name]'
    },
    //devtool: 'eval',
    externals:{
        jquery:'jQuery',
        react:'React',
        "react-dom":'ReactDOM'
    },

    resolve:{
        //alias:{}
    },
    module: {
        //noParse:[],
        loaders: [
            {
                test: /[\.jsx|\.js ]$/,
                exclude: /node_modules/,
                loader: "babel-loader?stage=0&optional[]=runtime"
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader!less-loader')
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'file-loader?name=/img/[name]-[hash].[ext]'
            }
        ]
    },
    devtool:'sourcemap',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new ExtractTextPlugin("[name]-[chunkhash].css"),
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                except: ['$', 'exports', 'require']
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name:'commons',
            filename:'commons-[chunkhash].js',
            minChunks:function(module,count){
                //引用测试大于某个次数
                if(count>=3){
                    return true;
                }

                var resourceName = module.resource
                if(resourceName){
                    resourceName = resourceName.substring(resourceName.lastIndexOf(path.sep)+1)
                }
                var reg = /^(\w)+.common/
                if(reg.test(resourceName)){
                    return true;
                }

                return false;
            }
        })
    ],
    postcss: function () {
        return [autoprefixer, precss];
    }
}