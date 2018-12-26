var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var table = require('../database/tables');
var con = require('../database/connection');
var Query = require('node-mysql-ejq');

var query = new Query(con);

var secret = "secret";

router.post('/test', async function(req, res){
	var select = await query.select({table: 'deal', limit: {from: 5, number: 5}});
	res.send(select)
});

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
	for(var key in data){
		if(key=='changed' || key=='created'){
			data[key] = new Date();
		}
	}
	if(table=='user'){
		res.status(401).send();
	 } else {
		try{
			await jwt.verify(req.cookies.token, secret, function(err, decoded){
				if(err){
					res.status(401).send();
				} else {
					if(table=='deal' || table=='comment' || table=='changy'){
						data.responsible = decoded.id;
					}
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

router.post('/api/where/:table/:from', async function(req, res){
	var table = req.params.table;
	var from = req.params.from;
	var where = req.body;
	try{
		await jwt.verify(req.cookies.token, secret, function(err, decoded){
			if(err){
				res.status(401).send();
			}
		});
		if(table=='deal'){
			var select = await query.select({table: table, where: where, limit: {from: from, number: 10}, orderby: 'changed'});
		} else {
			var select = await query.select({table: table, where: where, limit: {from: from, number: 10}});
		}	
		res.send(select);
	} catch(e){
		res.status(500).send(e);
	}
});

router.post('/api/like/:table', async function(req, res){
	var table = req.params.table;
	var like = req.body.like;
	try{
		await jwt.verify(req.cookies.token, secret, function(err, decoded){
		 	if(err){
		 		res.status(401).send();
			}
		});
		var sql = `SELECT * FROM ${table} WHERE `;
		var count = false;
		var pre_select = await query.select({table: table, where: {id: 1}});
		pre_select = pre_select[0];
		for(var key in pre_select){
			if(key=='created' || key=='changed' || key=='finished'){

			} else {
				if(!count){
					sql = sql + `${key} LIKE '%${like}%'`;
					count = true;
				} else {
					sql = sql + ` OR ${key} LIKE '%${like}%'`;
				}
			}
		}
		sql = sql + ' LIMIT 0, 10';
		var select = await con.query(sql)
		res.send(select);
	} catch(e){
		res.status(500).send(e);
	}
});

router.post('/api/update/:table', async function(req, res){
	var table = req.params.table;
	var data = req.body;
	for(var key in data){
		if(key == 'created' || key == "changed" || key == 'finished'){
			delete data[key]
		}
	}
	var user = {};
	try{
		await jwt.verify(req.cookies.token, secret, function(err, decoded){
			if(err){
				res.status(401).send();
			} else {
				user.id = decoded.id;
				user.name = decoded.name;
			}

		});
		if(table=='deal' || table=='add_document'){
			var select = await query.select({table: table, where: {id: data.id}});
			select = select[0];

			var changy = {};

			for(var key in select){
				if(key == 'created' || key == "changed" || key == 'finished'){
					delete data[key]
				}
			}
			for(var key in data){
				if(data[key]!=select[key]){
					changy.name = key;
					changy.previousval = select[key];
					changy.newval = data[key];
					changy.responsible = user.id;
					changy.deal = data.id;
					var insert = await query.insert({table: 'changy', data: changy});
				}
			}
			data.changed = new Date();
			var update = await query.update({table: table, where: {id: data.id}, data: data});
		} else {
			var update = await query.update({table: table, where: {id: data.id}, data: data});
		}
		
		res.send();
	} catch(e){
		res.status(500).send();
		throw new Error(e);
	}
});



module.exports = router;