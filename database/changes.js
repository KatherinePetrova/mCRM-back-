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
		await con.query('CREATE TABLE changy (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), previousval VARCHAR(255), newval VARCHAR(255), created DATETIME DEFAULT CURRENT_TIMESTAMP, deal INT REFERENCES deal(id), responsible INT REFERENCES user(id))');
		console.log('change table created succesfully!');
		await con.query('CREATE TABLE tab (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), deal INT REFERENCES deal(id), process INT REFERENCES process(id))');
		console.log('tab table created succesfully!');
		await con.query('CREATE TABLE comment (id INT AUTO_INCREMENT PRIMARY KEY, text VARCHAR(255), created DATETIME DEFAULT CURRENT_TIMESTAMP, deal INT REFERENCES deal(id), responsible INT REFERENCES user(id))');
		console.log('comment table created succesfully!');
		await con.query('ALTER TABLE add_document ADD tab INT REFERENCES tab(id)');
		console.log('add_document table changed!');
	} catch(e){
		throw new Error(e);
	}
}

changeStructure();