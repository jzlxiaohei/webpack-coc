import React from 'react'
import ReactDom from 'react-dom'
import IndexComponent from './js/IndexComponent.js'
import '../much_use/much_use'
import '../common/haha.common'
import '../common/mobile.common.less'

import './less/index.less'
import txPath from './img/touxiang.jpg'
console.log(txPath)
ReactDom.render(
    (
        <div>
            <IndexComponent/>
            <div className='avatar'/>
            <img src={txPath}/>
        </div>
    ),
    document.getElementById('mount-dom')
)

setTimeout(function(){
    require.ensure([],function(){
        require('./js/async.js')
    })
},1000)