const dotenv = require("dotenv");

dotenv.config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const database = require("./app/utility/database.js");
const security = require("./app/utility/security.js");
const mailer = require("./app/utility/mailer.js");
const classes = require("./app/utility/classes.js");
const utility = require("./app/utility/utility.js");
const path = require("path");
const fs = require("fs");

//* -------------------
//* Setup
//* -------------------
var port = 4000;
const hostname = "0.0.0.0";

if (process.argv[2]) {
	port = Number(process.argv[2]);
}

app.set("view engine", "ejs");
app.set("views", utility.view);
app.set("view options", { layout: false });
app.use(express.static("client/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.use(
	cookieSession({
		name: "session",
		secret: process.env.COOKIE_KEY,
		maxAge: 60 * 60 * 1000,
	})
);

//* -------------------
//* Routing
//* -------------------

app.get("/favicon.ico", (req, res) => res.sendStatus(204));

app.use("/", function (req, res, next) {
	req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
	next();
});

app.use(require("./app/routes/login_route.js"));
app.use(require("./app/routes/profile_route.js"));

app.use(require("./app/routes/ICC/site_route.js"));
app.use(require("./app/routes/ICC/product_route.js"));
app.use(require("./app/routes/ICC/health_route.js"));
app.use(require("./app/routes/ICC/certification_route.js"));

app.use(require("./app/routes/admin/admin_route.js"));
app.use(require("./app/routes/admin/employees_route.js"));
app.use(require("./app/routes/admin/view_ICCs_route.js"));
app.use(require("./app/routes/admin/help_route.js"));

app.use(require("./app/utility/reports/region_employee_report.js"));
app.use(require("./app/utility/reports/region_icc_report.js"));
app.use(require("./app/utility/reports/qualification_report.js"));
app.use(require("./app/utility/reports/icc_report.js"));

app.get("/", async (req, res) => {
	res.redirect("/login");
});

app.get("/logout", async (req, res) => {
	req.session = null;
	res.redirect("/login");
	return;
});

app.get("/404", async (req, res) => {
	res.render("404", { page: req.session.page });
});

app.get("*", function (req, res) {
	req.session.page = req.url;
	res.status(200).redirect("/404");
});

app.post("*", function (req, res) {
	req.session.page = req.url;
	res.status(200).send({ redirect: "/404" });
});

//* -------------------
//* Start Server
//* -------------------

server.listen(port, hostname, async () => {
	console.log(`Server is running at port: ${port}!`);
	var adminQuery = await database.query("SELECT user_id FROM users WHERE first_name = 'Admin'", [], true);
	if (adminQuery < 0) {
		await CreateAccount(process.env.ADMIN_PASS, process.env.ADMIN_EMAIL, "Admin", "Account");
	}
	utility.RemoveOldReports();
});

async function CreateAccount(password, email, first_name, last_name) {
	//! Use this to add a admin account
	var user_id = security.GetUUID();
	var password = security.Encrypt(password);
	var email = email;
	var first_name = first_name;
	var last_name = last_name;
	var region_id = await database.query("SELECT id FROM regions WHERE name = 'admin'", [], true);
	if (region_id == -1) {
		region_id = await database.query("INSERT INTO regions (name) VALUES ('admin') RETURNING id", [], true);
	}
	region_id = region_id.rows[0].id;
	var admin_access = true;
	await database.query(
		"INSERT INTO users (user_id, first_name, last_name, email, password, region_id, admin_access, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
		[user_id, first_name, last_name, email, password, region_id, admin_access, ""],
		true
	);
}
