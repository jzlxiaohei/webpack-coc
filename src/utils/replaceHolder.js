//深度遍历对象,对每个非对象属性,应用func
// 对象属性,接着遍历
function traverse(o,func) {
    for (var i in o) {
        func.call(this,o[i],i,o);
        if (o[i] !== null && typeof(o[i])=="object") {
            traverse(o[i],func);
        }
    }
}
// 字符串替换,把holderObj里的key,全替换成value
function replaceFn(str,holderObj){
    for(var i in holderObj){
        str = str.replace(i,holderObj[i])
    }
    return str;
}
//直接改变根据占位符key-value(比如'[project_name]' :'webpack-coc'),
// 把configObj中的字符串中,holderObj的key全替换成value
export default function replaceHolder(holderObj,configObj){
    if(typeof configObj == 'string'){
        return replaceFn(configObj,holderObj)
    }
    traverse(configObj,function(val,key,obj){
        if(typeof val == 'string' || val instanceof String){
            obj[key] = replaceFn(val,holderObj);
        }
    })
    return configObj;
}