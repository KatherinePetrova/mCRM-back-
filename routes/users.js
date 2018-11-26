var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var Query = require('node-mysql-ejq');
var table = require('../database/tables');
var con = require('../database/connection');

var query = new Query(con);
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/signup', async function(req, res, next) {
	console.log(req.body);
	var data = req.body;
	try {
		let salt = await bcrypt.genSalt(10);
		data.password = await bcrypt.hashSync(data.password, salt);
		let insert = await query.insert({table: 'user', data: data})
		res.status(200).send('successfully logged');
	} catch (e) {
		console.log(e);
		next(e)
	}
});

router.post('/signin', async function(req, res, next) {
	console.log('request to sign in');
	var data = req.body;
	try {
		var select = await query.select({table: 'user', where: {name: data.name}});
		console.log(select.length)
		if(select.length==0){
			res.status(401).send()
		} else {
			select = select[0];
			var bol = bcrypt.compare(data.password, select.password);
			if(bol){
				var token = jwt.sign({id: data.id, login: data.name}, "secret", {expiresIn: "12h"});
				res.send(token)
			} else {
				res.status(401).send()
			}
		}

	} catch(e) {
		console.log(e);
		res.status(500).send()
	}
});
module.exports = router;
