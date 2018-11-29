var express = require('express');
var router = express.Router();

var table = require('../database/tables');
var con = require('../database/connection');
var Query = require('node-mysql-ejq');

var formidable = require('express-formidable');

var query = new Query(con);

router.use(formidable({
	encoding: 'utf-8',
	uploadDir: __dirname + '/../xlsx_files',
	multiples: true,
	keepExtensions: true
}));

router.post('/', function(req, res){
	console.log(req.files);
	res.send();
})

module.exports=router;