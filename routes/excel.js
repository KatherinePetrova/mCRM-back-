var express = require('express');
var router = express.Router();

var table = require('../database/tables');
var con = require('../database/connection');
var Query = require('node-mysql-ejq');

var formidable = require('express-formidable');

const xlsx = require('xlsx');
var renameKeys = require('rename-keys');

var query = new Query(con);

router.use(formidable({
	encoding: 'utf-8',
	uploadDir: __dirname + '/../xlsx_files',
	multiples: true,
	keepExtensions: true
}));

async function insertOrUpdate(item, data){
	var single = item;
	var data = data;

	var select = await query.select({table: single.table, where: {name: data}});
	if(select.length==0){
		single.data.name = data;
	} else {
		single.data = select[0];
		single.exists = true;
	}

	return single;
}

function dateToDate(item){
	var fSplit = item.split(' ');
	var date = fSplit[0].split('.');
	var time = fSplit[1].split(':');

	var year = parseInt(date[2]);
	var month = parseInt(date[1]) - 1;
	var day = parseInt(date[0]);

	var hour = parseInt(time[0]);
	var minute = parseInt(time[1]);
	var second = parseInt(time[2]);

	return new Date(year, month, day, hour, minute, second);
}

router.post('/insert', async function(req, res){
	
	try{

		const workbook = xlsx.readFile(req.files[''].path);
		const sheet_name_list = workbook.SheetNames;
		var result = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

		for(var i=0; i<result.length; i++){
			result[i] = renameKeys(result[i], function(key, val){
				var resultat = key;
				var splited = resultat.split('');
				for(var j=0; j<splited.length; j++){
					if(splited[j]==' '){
						splited[j] = '_';
					} else if(splited[j]==')' || splited[j]=='('){
						splited[j] = '';
					} else if(splited[j]=='.'){
						splited[j] = '';
					}
				}
				resultat = splited.join('');
				return resultat;
			});
		}

		var count = 0;
		for(var i=0; i<result.length; i++){

			var data = {
				deal: {
					table: table.deal,
					exists: false,
					data: {}
				},
				executor: {
					table: table.executor,
					exists: false,
					data: {
						id: 1
					}
				},
				customer: {
					table: table.customer,
					exists: false,
					data: {
						id: 1
					}
				},
				step: {
					table: table.step,
					exists: false,
					data: {}					}
				},
				process: {
					table: table.process,
					exists: false,
					data: {}
				},
				user: {
					table: table.user,
					exists: false,
					data: {}
				},
				add_user: {
					table: table.add_user,
					exists: false,
					data: {}
				},
				add_document: {
					table: table.add_document,
					exists: false,
					data: []
				},
				add_customer: {
					table: table.add_customer,
					exists: false,
					data: []
				}
			}

			for(var key in result[i]){

				if(key == 'Название_сделки'){

					data.deal = await insertOrUpdate(data.deal, result[i][key]);
				} else if(key == 'Компания'){

					data.executor = await insertOrUpdate(data.executor, result[i][key]);
				} else if(key == 'Основной_контакт'){

					data.customer = await insertOrUpdate(data.customer, result[i][key]);
				} else if(key == 'Этап_сделки'){

					data.step = await insertOrUpdate(data.step, result[i][key]);
				} else if(key == 'Воронка'){

					data.process = await insertOrUpdate(data.process, result[i][key]);
				} else if(key == 'Бюджет'){

					data.deal.data.budget = result[i][key];
				} else if(key == 'Ответственный'){

					var select = await query.select({table: data.add_user.table, where: {text: result[i][key]}});
					if(select.length==0){
						data.user.data.name = 'user' + count;
						data.add_user.data.name = 'ФИ';
						data.add_user.data.text = result[i][key];
						count++;
					} else {
						var select_user = await query.select({table: data.user.table, where: {id: select[0].user}});
						data.user.exists = true;
						data.user.data = select_user[0];
					}
				} else if(key == 'Дата_создания'){

					data.deal.data.created = dateToDate(result[i][key]);
				} else if(key == 'Дата_изменения'){

					data.deal.data.changed = dateToDate(result[i][key]);
				}
				else if(key == 'Дата_закрытия'){
					if(result[i][key]!='не закрыта'){
						data.deal.data.finished = dateToDate(result[i][key]);
					}
				} else{
					if(key.includes('контакт')){
						var sata = {};
						sata.name = key;
						sata.text = result[i][key];
						data.add_customer.data.push(sata);
					} else {
						var sata = {};
						sata.name = key;
						sata.text = result[i][key];
						data.add_document.data.push(sata);
					}
				}			
			}

			console.log(data);
			console.log(data.add_document.data);
			console.log(data.add_customer.data);

			if(data.process.exists){
				data.step.data.process = data.process.data.id;
			} else {
				var insert = await query.insert({table: data.process.table, data: data.process.data});
				data.step.data.process = insert.insertId;
			}

			if(data.step.exists){
				data.deal.data.step = data.step.data.id;
			} else {
				var insert = await query.insert({table: data.step.table, data: data.step.data});
				data.deal.data.step = insert.insertId;
			}

			if(data.customer.exists){
				data.deal.data.customer = data.customer.data.id;
				for(var j=0; j<data.add_customer.data.length; j++){
					data.add_customer.data[j].customer = data.customer.data.id;
				} 
			} else {
				var insert = await query.insert({table: data.customer.table, data: data.customer.data});
				data.deal.data.customer = insert.insertId;
				for(var j=0; j<data.add_customer.data.length; j++){
					data.add_customer.data[j].customer = insert.insertId;
				}
			}

			if(data.executor.exists){
				data.deal.data.executor = data.executor.data.id;
			} else {
				var insert = await query.insert({table: data.executor.table, data: data.executor.data});
				data.deal.data.executor = insert.insertId;
			}

			if(!data.user.exists){
				var insert = await query.insert({table: data.user.table, data: data.user.data});
				data.add_user.data.user = insert.insertId;
				var add_insert = await query.insert({table: data.add_user.table, data: data.add_user.data});
				data.deal.data.responsible = insert.insertId;
			} else {
				data.deal.data.responsible = data.user.data.id;
			}

			if(data.deal.exists){
				for(var j=0; j<data.add_document.data.length; j++){
					data.add_document.data[j].deal = data.deal.data.id;
				}
			} else {
				console.log(data.deal);
				var insert = await query.insert({table: data.deal.table, data: data.deal.data});
				for(var j=0; j<data.add_document.data.length; j++){
					data.add_document.data[j].deal = insert.insertId;
				}
			}

			for(var j=0; j<data.add_document.data.length; j++){
				var select = await query.select({table: data.add_document.table, where: {name: data.add_document.data[j].name, deal: data.add_document.data[j].deal, text: data.add_document.data[j].text}});
				if(select==0){
					var insert = await query.insert({table: data.add_document.table, data: data.add_document.data[j]});
				} else {
					var update = await query.update({table: data.add_document.table, data: data.add_document.data[j], where: {id: select[0].id}});
				}
				
			}

			for(var j=0; j<data.add_customer.data.length; j++){
				var select = await query.select({table: data.add_customer.table, where: {name: data.add_customer.data[j].name, customer: data.add_customer.data[j].customer, text: data.add_customer.data[j].text}});
				if(select==0){
					var insert = await query.insert({table: data.add_customer.table, data: data.add_customer.data[j]});
				} else {
					var update = await query.update({table: data.add_customer.table, data: data.add_customer.data[j], where: {id: select[0].id}});
				}
			}
		}

		res.send();

	} catch(e){
		res.status(500).send();
		throw new Error(e);
	}
});

router.post('/test', function(req, res){
	console.log(parseInt('04'));
	res.send();
});

module.exports=router;