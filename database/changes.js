var table = require('./tables');

var mysql = require(`mysql`);
var util = require(`util`);

var con = mysql.createConnection({
	host: `localhost`,
	user: `root`,
	//password: `mansmans310796`,
	password: `Mandriva2012`,
	database: 'mCRM'
});

con.query = util.promisify(con.query);

async function changeStructure(){
	try{
		await con.query(`ALTER TABLE ${table.step} ADD successy BOOLEAN`);
		console.log(`${table.step} table changed`);

		
	} catch(e){
		throw new Error(e);
		console.log(e);
	}
}

changeStructure();