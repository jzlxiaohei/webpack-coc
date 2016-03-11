#deprecated
 最新的想法，可以看一下这个[gulpfile](https://github.com/jzlxiaohei/react-antd-starter/blob/master/gulpfile.js),单独的gulp任务去打包lib，其他的由webpack打包。
 
 -----------
最开始,这个项目是个demo类的教程,教程已经迁移到[webpack-coc-demo](https://github.com/jzlxiaohei/webpack-coc-demo)

#WebpackCoc
可以先看上面教程,这样会更好理解本项目的目的.

整体的想法和文章是一致的.但是实际使用的过程中,发现

1. 路径问题很让人纠结,经常出问题,微调很耗时.

2. 另外一个工程里,可能有多个项目,这时候会有多个`webpack.config.js`,维护多个配置文件还是挺蛋疼的.

3. lib的打包比较慢.（后面知道通过`CommonChunkPlugin`的一个特别用法,也能搞定,不过个人认为lib就是lib,和`common`是有区别的)

#说明:

本项目多少有些功能,是为公司的使用而设计的.不过`webpack`的构建都是通过配置来的,你可以在执行前,改变配置就好.如果实在不爽,可以根据自己的业务,做相应的版本.

如果不改变配置,那么

1. 只支持npm,依赖`node_modules`的路径.`bower`已死,不要纠结.
2. 静态文件不改变命名,静态资源map文件中,通过加`?v=[chunkhash]`来加文件戳
3. 所有的entry,必须以`*.entry.js`命名
4. `CommonChunk`的依据: 被引用3次以上,文件以`*.common.*`命名,且被至少一个`entry`文件依赖
5. lib 目前只支持`jquery`,`react`,`react-dom`.但是加入新的lib并不难.比如加入`vue`并引人`vue-loader`只需要不到10行的代码.但是lib必须要暴露到全局.

#安装

    npm install webpack-coc
    
#使用

    var  path = require('path')
    
    var  WebpackCoc = require('webpack-coc')
    
    //配置参数后面详述
    var configMgr = new  WebpackCoc({
        project_name:'webpack-coc',
        src_path:path.join(__dirname , './assets/src'),
        dist_path:path.join(__dirname, './assets/dist'),
        node_module_path:path.join(__dirname,'../node_modules'),
        map_json_filename:'./assets/assets-map.json',
        map_json_path:__dirname,
        libs:['react','react-dom','jquery'],
        cdn_path:'/dist',
        dev_port:'9527'
    })
    
    //生成构建
    configMgr.buildProduction() //会返回最终生效的配置对象,可以打印出来确认
    configMgr.runProduction();
    
    //开发环境
    configMgr.buildDevelopment()
    configMgr.runDevelopment()
    
#参数说明
    
`project_name`:项目名称,必填.所有文件都会生成在文件名为`project_name`的文件夹下

`src_path`: 源代码所在的根路径,必填

`dist_path`: 打包文件的根路径.所有的打包文件都在`dist_path/project_name`下

`node_module_path`:`node_modules`的路径,只支持npm的管理,用bower的话,你需要自己修改相应的配置甚至源代码

`map_json_filename`和`map_json_path`:静态资源映射文件的文件名和路径.这个文件的内容形式如下,标准json格式

    {
      "webpack-coc/lib": {
        "js": "/dist/webpack-coc/lib.js?v=ac46dc0f05a4cc181b911ad1b8058f71e6fbc87d"
      },
      "webpack-coc/common": {
        "js": "/dist/webpack-coc/common.js?v=06598d42aaaed794fc9f",
        "css": "/dist/webpack-coc/common.css?v=06598d42aaaed794fc9f"
      },
      "webpack-coc/index/index.entry": {
        "js": "/dist/webpack-coc/index/index.entry.js?v=6a573fbcbb9245b32f9b",
        "css": "/dist/webpack-coc/index/index.entry.css?v=6a573fbcbb9245b32f9b"
      },
      "webpack-coc/contact/contact.entry": {
        "js": "/dist/webpack-coc/contact/contact.entry.js?v=b2e27e29b6fd11004a49"
      },
      "webpack-coc/other/other.entry": {
        "js": "/dist/webpack-coc/other/other.entry.js?v=95edb51bcbc304ccd1ad"
      }
    }
    
`libs`:需要的libs.默认配置了`jquery`,`react`,`react-dom`,所有的配置必须以`WebpackCoc.LibMap`的属性存在.jquery为例,

    WebpackCoc.LibMap['jquery']={
        path:'[node_module_path]/jquery/dist/jquery.min.js',
        externals:'jQuery'
        //noParse:'[node_module_path]/jquery/dist/jquery.min.js',
        //noParse和alias一般和path一样,如果不一样,再设置
    },
    
  有了上面的配置,会自动配置webpack的`alias`和`noParse`,合并所所有的libs,合并成`lib.js`.注意,仅仅是合并,并不压缩,所以提供的path应该是dist版本的路径
   
  如果要添加新的lib,基本同上,然后`options`中`libs`包含`vue`即可
 
    WebpackCoc.LibMap['vue']= {
        vue:{
            path:'[node_module_path]/vue/dist/vue.min.js',
            externals:'Vue'
        }
    }
    
`cdn_path`: cdn路径.css中应用图片的路径,如果不设置cdn路径的话,会是`background:url(/project_name/img/../xx.png)`.
但是这个可能不是你静态文件的根路径,前面要加路径.所以图片路径配置为`[cdn_path]/project_name/img/../xx.png`

`dev_port`: webpack-dev-server开发时,服务的端口号.

#开发

    本工具会自动识别`src_path`下所有 `*.entry.js`文件.假设现在开发index页,那么建文件夹index,然后添加`index.entry.js`,就可以写代码了
    
    //index/index.entry.js
    //支持babel stage-0 的语法
    import ReactDOM from 'react-dom' //引人库
    import IndexContainer from './IndexContainer.js' //引人js文件,这里假设范围react组件
    import './index.less' //引人less
    import logo from '.img/logo.png' //引人图片
    
    //index的一些逻辑
    ReactDom.render(
        <div>
            <IndexContainer />,
            <img src={logo}>
        </div>
        document.body
    )
    
打包后,`[cdn_path]/[project_name]`路径下,会生成`index/index.entry.js`,`index/index.entry.css`

在图片目录下(`[cdn_path]/[project_name]/img/`),生成`logo-[hash].png`,

而且引用图片的路径都会变为[cdn_path]/[project_name]/img/logo-[hash].png.图片引用的路径问题,完全不用你操心.

#example
    
[webpack-coc-example](https://github.com/jzlxiaohei/webpack-coc-example)
