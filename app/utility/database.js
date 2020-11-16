const { Pool, Client } = require("pg");

const pool = new Pool({
	user: process.env.DB_USER,
	host: "192.168.9.101",
	database: process.env.DB_DB,
	password: process.env.DB_PASS,
	port: "6543",
});
async function Connect() {
	return new Promise(async (resolve) => {
		var tries = 20;
		while (tries) {
			try {
				const client = await pool.connect();
				resolve(client);
				break;
			} catch (err) {
				tries--;
				console.log(`Failed to conenct to database, ${tries} tries remaining`);
				await new Promise((res) => setTimeout(res, 7500));
			}
		}
		resolve(-1);
	});
}
query = async (sql, params, logging) => {
	var t = process.hrtime();
	const client = await Connect();
	if (client == -1) {
		console.error("Failed to connect to database");
		return;
	}
	try {
		const res = await client.query(sql, params);
		t = process.hrtime(t);
		if (res == null || res.rowCount == 0) {
			if (logging) console.info({ time: new Date().toTimeString().substr(0, 8), result: "No results from query", sql: sql, duration: Math.round(t[1] / 1000000) + "ms" });
			client.release();
			return -1;
		}

		if (logging)
			console.log({ time: new Date().toTimeString().substr(0, 8), result: "Executed query", duration: Math.round(t[1] / 1000000) + "ms", sql: sql, rows: res.rows });
		client.release();
		return res;
	} catch (err) {
		console.log({ time: new Date().toTimeString().substr(0, 8), result: "Error executing query", sql: sql, params: params });
		if (logging) console.error(err.stack);
		client.release();
		return -2;
	}
};

module.exports.query = query;
