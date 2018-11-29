var table = require('./tables');

var mysql = require(`mysql`);
var util = require(`util`);

var con = mysql.createConnection({
	host: `localhost`,
	user: `root`,
	//password: `mansmans310796`,
});

con.query = util.promisify(con.query);

var database = `mCRM`;

async function createDatabase(){
	try{
		await con.query(`CREATE DATABASE ${database}`);
		console.log(`${database} database created`);
		await con.changeUser({database: database});

		await con.query(`CREATE TABLE ${table.process} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`);
		console.log(`${table.process} table created`);

		await con.query(`CREATE TABLE ${table.step} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), process INT REFERENCES ${table.process}(id))`);
		console.log(`${table.step} table created`);

		await con.query(`CREATE TABLE ${table.customer} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`);
		console.log(`${table.customer} table created`);

		await con.query(`CREATE TABLE ${table.add_customer} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), text VARCHAR(255), customer INT REFERENCES ${table.customer}(id))`);
		console.log(`${table.add_customer} table created`);

		await con.query(`CREATE TABLE ${table.executor} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`);
		console.log(`${table.executor} table created`);

		await con.query(`CREATE TABLE ${table.add_executor} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), text VARCHAR(255), executor INT REFERENCES ${table.executor}(id))`);
		console.log(`${table.add_executor} table created`); 

		await con.query(`CREATE TABLE ${table.user} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), password VARCHAR(255), email VARCHAR(255))`);
		console.log(`${table.user} table created`);

		await con.query(`CREATE TABLE ${table.add_user} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), text VARCHAR(255), user INT REFERENCES ${table.user}(id))`);
		console.log(`${table.add_user} table created`);

		await con.query(`CREATE TABLE ${table.deal} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), customer INT REFERENCES ${table.customer}(id), executor INT REFERENCES ${table.executor}(id), responsible INT REFERENCES ${table.user}(id), budget INT, step INT REFERENCES ${table.step}(id), date DATETIME DEFAULT CURRENT_TIMESTAMP)`);
		console.log(`${table.deal} table created`);

		await con.query(`CREATE TABLE ${table.add_document} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), text VARCHAR(255), deal INT REFERENCES ${table.deal}(id))`);
		console.log(`${table.add_document} table created`);

		await con.query(`CREATE TABLE ${table.config} (value VARCHAR(255))`);
		console.log(`${table.config} table created`);

		for(key in table){
			await con.query(`ALTER TABLE ${table[key]} CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci`);
			console.log(`${key} table converted`);
		}

		console.log('\n\ndatabase succesfully created!\n\n')
	} catch(e){
		await con.query(`DROP SCHEMA ${database}`);
		console.log(`\n\n\nError occured, database droped\nCreating error report...\n\n\n`)
		throw new Error(e)
	}
}

createDatabase();