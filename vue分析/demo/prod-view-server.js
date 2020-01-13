/**
 * 用于预览打包后的产品的服务器,默认:demo
 */
'use strict'
const express = require('express')
const opn = require('opn')
const path = require('path')
const ejs = require('ejs')
const proxy = require('http-proxy-middleware');
const router = express.Router()
let app = express()

app.set('view engine', 'html')
app.engine('html', ejs.__express)

app.use('/', express.static('./'))
app.get('/demo', (req, res) => {
  res.status(200).render('./demo.html')
})
app.listen('9999', () => {
  console.log('listen at :9999')
})
