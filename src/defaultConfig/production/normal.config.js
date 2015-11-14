/**
 * Created by zilong on 11/11/15.
 */
import path from 'path'
import shareConfig from './_share.config'
import clone from 'clone'
import  webpack from 'webpack'


const extraPlugins =  [
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
]
const productionConfig = clone(shareConfig);

for(let i=0;i<extraPlugins.length;i++){
    productionConfig.plugins.push(extraPlugins[i]);
}

export default productionConfig;