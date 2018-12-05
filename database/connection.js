var mysql = require(`mysql`);

module.exports = mysql.createConnection({
	host: `localhost`,
	user: `root`,
	password: `mansmans310796`,
	database: 'mCRM'
});