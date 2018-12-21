var table = require('./tables');

var mysql = require(`mysql`);
var util = require(`util`);

var con = mysql.createConnection({
	host: `localhost`,
	user: `root`,
	password: `Mandriva2012`,
	database: 'mCRM'
});

con.query = util.promisify(con.query);

async function convert(){
	for(key in table){
			await con.query(`ALTER TABLE ${table[key]} CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci`);
			console.log(`${key} table converted`);
	}
}
convert();