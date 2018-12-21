var table = require('./tables');

var mysql = require(`mysql`);
var util = require(`util`);

var con = mysql.createConnection({
	host: `localhost`,
	user: `root`,
	//password: `mansmans310796`,
	//password: `Mandriva2012`,
	database: 'mCRM'
});

con.query = util.promisify(con.query);

async function changeStructure(){
	try{
		await con.query(`CREATE TABLE ${table.cally} (id INT AUTO_INCREMENT PRIMARY KEY, typey VARCHAR(255), linky VARCHAR(255), fromytoy VARCHAR(255), created DATETIME DEFAULT CURRENT_TIMESTAMP, deal INT REFERENCES ${table.deal}(id))`);
		console.log(`${table.cally} table created`)
	} catch(e){
		throw new Error(e);
		console.log(e);
	}
}

changeStructure();