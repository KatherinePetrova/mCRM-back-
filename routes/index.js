var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var table = require('../database/tables');
var con = require('../database/connection');
var Query = require('node-mysql-ejq');

var query = new Query(con);

var secret = "secret";

router.post('/', function(req, res){
	console.log('work');
	res.send();
});

router.post('/api/tables', async function(req, res){
	try{
		await jwt.verify(req.cookies.token, secret, function(err, decoded){
			if(err){
				res.status(401).send();
			}

		});
		res.send(table);
	}catch(e){
		res.status(500).send()
	}
});

router.post('/api/insert/:table', async function(req, res){
	var data = req.body
	var table = req.params.table;
	if(table=='user'){
		res.status(401).send()
	 } else {
		try{
			await jwt.verify(req.cookies.token, secret, function(err, decoded){
				if(err){
					res.status(401).send();
				}
			});
			var insert = await query.insert({table: table, data: data});
			var select = await query.select({table: table, where: {id: insert.insertId}});
			select = select[0];
			res.send(select);
		} catch(e){
			res.status(500).send();
			throw new Error(e);
		}
	}
	
});

router.post('/api/select/:table/:id', async function(req, res){
	var table = req.params.table;
	var id = req.params.id;
	await jwt.verify(req.cookies.token, secret, function(err, decoded){
		if(err){			
			res.status(401).send();
		}
	});	
	if(id==0){
		try{
			var select = await query.select({table: table});
			res.send(select);
		}
		catch(e){
			res.status(500).send();
			throw new Error(e);
		}
	} else {
		try{
			var select = await query.select({table: table, where: {id: id}});
			select = select[0];
			res.send(select);
		} catch(e){
			res.status(500).send();
			throw new Error(e);
		}
	}
});

router.post('/api/where/:table', async function(req, res){
	console.log(req.cookies)
	var table = req.params.table;
	var where = req.body.data;
	try{
		await jwt.verify(req.cookies.token, secret, function(err, decoded){
			if(err){
				res.status(401).send();
			}
		});
		var select = await query.select({table: table, where: where});
		res.send(select);
	} catch(e){
		res.status(500).send(e);
	}
});

router.post('/api/update/:table', async function(req, res){
	var table = req.params.table;
	var data = req.body;
	for(var key in data){
		if(key=='changed'){
			data[key] = new Date();
		}
	}
	try{
		await jwt.verify(req.cookies.token, secret, function(err, decoded){
			if(err){
				res.status(401).send();
			}

		});
		var update = await query.update({table: table, where: {id: data.id}, data: data});
		res.send();
	} catch(e){
		res.status(500).send();
		throw new Error(e);
	}
});



module.exports = router;