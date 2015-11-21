var express = require('express')
var app = express()
var path = require('path')

app.use(
    express.static(
        'assets'
    )
)

app.listen(3333,function(){
    console.log('server start:'+3333)
})