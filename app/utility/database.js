const { Pool, Client } = require("pg");

const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "icc_database",
	password: "admin",
	port: "5432",
});

query = async (sql, params, logging) => {
	var t = process.hrtime();
	const client = await pool.connect().catch((err) => {
		console.error("Error connecting to pool");
		console.error(err.stack);
		return -3;
	});
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
