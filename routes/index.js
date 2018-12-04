var express = require('express');
var router = express.Router();

var table = require('../database/tables');
var con = require('../database/connection');
var Query = require('node-mysql-ejq');

var query = new Query(con);

router.use(function(req, res, next) {
 	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 	next();
});

router.post('/', function(req, res){
	console.log('work');
	res.send();
});

router.post('/api/tables', function(req, res){
	res.send(table);
});

router.post('/api/insert/:table', async function(req, res){
	var data = req.body;
	var table = req.params.table;
	if(table=='user'){
		res.status(401).send('asdf')
	} else {
		try{
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
	console.log(req.body);
	var table = req.params.table;
	var where = req.body;
	
	try{
		var select = await query.select({table: table, where: where});
		res.send(select);
	} catch(e){
		res.status(500).send();
		console.log(e)
	}
});

router.post('/api/update/:table', async function(req, res){
	var table = req.params.table;
	var data = req.body;
	try{
		var update = await query.update({table: table, where: {id: data.id}, data: data});
		res.send();
	} catch(e){
		res.status(500).send();
		throw new Error(e);
	}
});



module.exports = router;