const express = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const pdf = require("html-pdf");
var format = require("date-fns/format");
var formatISO = require("date-fns/formatISO");
const { utcToZonedTime } = require("date-fns-tz");
const timeZone = "Pacific/Auckland";
const path = require("path");
const fs = require("fs");

const database = require("../database.js");
const security = require("../security.js");
const mailer = require("../mailer.js");
const classes = require("../classes.js");
const utility = require("../utility.js");

app.post("/generate/type1/report", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access) {
		var forwardPeriod = req.body.forwardPeriod;
		var start = process.hrtime();
		var now = new Date();

		var outputPath = path.join(__dirname, "../../../", "client", "public", "tmp");
		var outputName = `Region Employee Report ${format(now, "yyyy-MM-dd hh-mm a")}.pdf`;

		var buffer = await GenerateBuffer(req, forwardPeriod);

		pdf
			.create(buffer, {
				format: "A4",
				header: {
					height: "37mm",
					contents: `<div class="center">
					<p class="header" id="title">General Region Report - ${forwardPeriod} Days</p>
				</div>
				<div style="margin-top: -15px">
					<div style="float: left; text-align: left;">
						<p class="info">Report Generated on ${format(utcToZonedTime(new Date(), timeZone), "dd/MM/yyyy hh:mm a")}</p>
					</div>
					<div style="float: right; text-align: right;">
						<p class="info">Report Type: Employee Expiring/Expired/Allocated</p>
					</div>
					<div style="clear: both;"></div>
				</div>
				<hr class="thick divider" />`,
				},
				footer: {
					height: "20mm",
					contents: {
						default: '<span style="color: #333; font-size: 12px">{{page}} | </span><span style="color: #777;">Page</span>',
					},
				},
				phantomPath: path.resolve(process.cwd(), "node_modules/phantomjs-prebuilt/bin/phantomjs"),
			})
			.toFile(path.join(outputPath, outputName), (err, result) => {
				if (err) return console.log(err);

				var end = process.hrtime(start);
				var time = Math.round((end[0] * 1000000000 + end[1]) / 1000000) + "ms";

				res.send({ file: outputName });
				utility.RemoveOldReports();
			});
	} else {
		req.session.error = "You do not have permission to do this";
		return res.send({ redirect: "/profile" });
	}
});
async function GenerateBuffer(req, forwardPeriod) {
	var buffer = `
	<html>
		<head>
			<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>
			<style rel="stylesheet" media="all" type="text/css">
			* {
				font-family: "Roboto";
				font-size: 10px;
			}
			body {
				padding-left: 60px;
				padding-right: 60px;
				padding-top: 20px;
				padding-bottom: 20px;
			}
			.center {
				text-align: center;
			}
			.header {
				font-size: 20px;
				font-weight: 700;
				color: #247ba0;
			}
			.info {
				font-size: 10px;
				font-weight: 400;
				color: #457b9d;
			}
			.sub-header {
				font-size: 12px;
				font-weight: 600;
				color: #247ba0;
			}

			.thick.divider {
				width: 100%;
				height: 2px;
				border: none;
				background-color: #247ba0;
				color: #247ba0;
			}
			
			.divider {
				width: 100%;
				height: 1px;
				border: none;
				background-color: #247ba0;
				color: #247ba0;
				margin-bottom: -10px;
			}
			</style>
		</head>
		<body>
			
			<div id="template-body">`;
	for (var i = 0; i < req.body.regions.length; i++) {
		var regionQuery = await database.query("SELECT id FROM regions WHERE name = $1", [req.body.regions[i]], true);
		var result = await GenerateRegion(regionQuery.rows[0].id, req.body.regions[i], forwardPeriod);
		if (result != "") {
			buffer += result;
		} else {
			buffer += `<div>
			<hr class="divider" />
			<div>
				<p class="sub-header">Region - ${req.body.regions[i]}</p>
			</div>
			<div class="center">
				<p class="sub-header">No Applicable Data</p>
			</div>`;
		}
	}
	buffer += `
			</div>
		</body>
	</html>`;
	return buffer;
}

async function GenerateRegion(region_id, region_name, forwardPeriod) {
	var flag = false;
	var userQuery = await database.query("SELECT user_id, first_name, last_name FROM users WHERE region_id = $1 ORDER BY first_name ASC", [region_id]);
	var html = `
	<div>
		<hr class="divider" />
		<div>
			<p class="sub-header">Region - ${region_name}</p>
		</div>
		<div>
			<table style="width: 100%">
				<thead>
					<tr>
						<th style="width: 100px" align="left" class="sub-header">Name</th>
						<th align="left" class="sub-header">ICC</th>
						<th align="right" class="sub-header">Expiration Date</th>
					</tr>
				</thead>
				<tbody>`;
	for (var i = 0; i < userQuery.rows.length; i++) {
		var user_id = userQuery.rows[i].user_id;
		var name = `${userQuery.rows[i].first_name} ${userQuery.rows[i].last_name}`;
		var rows = await GetICCs(user_id, forwardPeriod);
		for (var j = 0; j < rows.length; j++) {
			flag = true;
			var row = rows[j];
			html += `
			<tr>
				<td>${name}</td>
				<td>${row.icc}</td>
				<td style="text-align: right;">${row.expiration_date}</td>
			</tr>`;
		}
		html += `<tr><td></td></tr>`;
		html += `<tr><td></td></tr>`;
	}
	html += `
				</tbody>
			</table>
		</div>
	</div>`;
	if (flag) {
		return html;
	} else {
		return "";
	}
}

async function GetICCs(user_id, forwardPeriod) {
	var rows = [];
	var siteQuery = await database.query(
		"SELECT site_templates.name AS name, site_templates.duration as duration, expiration_date FROM employee_site_inductions INNER JOIN site_templates ON site_templates.id = template_id WHERE user_id = $1 ORDER BY expiration_date ASC",
		[user_id]
	);
	if (!(siteQuery < 0)) {
		for (var i = 0; i < siteQuery.rows.length; i++) {
			var dataRow = siteQuery.rows[i];
			if (validateRow(dataRow, forwardPeriod) && (dataRow.duration != "" || dataRow.duration != null)) {
				var expiration_date = dataRow.expiration_date;
				if (expiration_date != "" && expiration_date != null) {
					expiration_date = format(dataRow.expiration_date, "dd/MM/yyyy");
				} else {
					expiration_date = "";
				}
				rows.push({ icc: dataRow.name, expiration_date: expiration_date });
			}
		}
	}

	var productQuery = await database.query(
		"SELECT product_templates.name AS name, product_templates.duration as duration, expiration_date FROM employee_product_certifications INNER JOIN product_templates ON product_templates.id = template_id WHERE user_id = $1 ORDER BY expiration_date ASC",
		[user_id]
	);
	if (!(productQuery < 0)) {
		for (var i = 0; i < productQuery.rows.length; i++) {
			var dataRow = productQuery.rows[i];
			if (validateRow(dataRow, forwardPeriod) && (dataRow.duration != "" || dataRow.duration != null)) {
				var expiration_date = dataRow.expiration_date;
				if (expiration_date != "" && expiration_date != null) {
					expiration_date = format(dataRow.expiration_date, "dd/MM/yyyy");
				} else {
					expiration_date = "";
				}
				rows.push({ icc: dataRow.name, expiration_date: expiration_date });
			}
		}
	}

	var healthQuery = await database.query(
		"SELECT health_templates.name AS name, health_templates.duration as duration, expiration_date FROM employee_health_qualifications INNER JOIN health_templates ON health_templates.id = template_id WHERE user_id = $1 ORDER BY expiration_date ASC",
		[user_id]
	);
	if (!(healthQuery < 0)) {
		for (var i = 0; i < healthQuery.rows.length; i++) {
			var dataRow = healthQuery.rows[i];
			if (validateRow(dataRow, forwardPeriod) && (dataRow.duration != "" || dataRow.duration != null)) {
				var expiration_date = dataRow.expiration_date;
				if (expiration_date != "" && expiration_date != null) {
					expiration_date = format(dataRow.expiration_date, "dd/MM/yyyy");
				} else {
					expiration_date = "";
				}
				rows.push({ icc: dataRow.name, expiration_date: expiration_date });
			}
		}
	}

	var certificationQuery = await database.query(
		"SELECT certification_templates.name AS name, certification_templates.duration as duration, expiration_date FROM employee_certifications INNER JOIN certification_templates ON certification_templates.id = template_id WHERE user_id = $1 ORDER BY expiration_date ASC",
		[user_id]
	);
	if (!(certificationQuery < 0)) {
		for (var i = 0; i < certificationQuery.rows.length; i++) {
			var dataRow = certificationQuery.rows[i];
			if (validateRow(dataRow, forwardPeriod) && (dataRow.duration != "" || dataRow.duration != null)) {
				var expiration_date = dataRow.expiration_date;
				if (expiration_date != "" && expiration_date != null) {
					expiration_date = format(dataRow.expiration_date, "dd/MM/yyyy");
				} else {
					expiration_date = "";
				}
				rows.push({ icc: dataRow.name, expiration_date: expiration_date });
			}
		}
	}
	rows.sort((a, b) => {
		var flag1 = false;
		var flag2 = false;
		if (a.expiration_date == "") {
			flag1 = true;
			a.expiration_date = "1000-01-01";
		}
		if (b.expiration_date == "") {
			flag2 = true;
			b.expiration_date = "1000-01-01";
		}
		var res = new Date(a.expiration_date) - new Date(b.expiration_date);
		if (flag1) {
			a.expiration_date = "";
		}
		if (flag2) {
			b.expiration_date = "";
		}
		return res;
	});

	return rows;
}

function validateRow(row, forwardPeriod) {
	var expiration_date = row.expiration_date;
	if (expiration_date == "" || expiration_date == null) {
		return true;
	} else {
		var now = new Date();
		var forwardTime = new Date();
		forwardTime.setDate(forwardTime.getDate() + Number(forwardPeriod));
		if (expiration_date < now) return true;
		if (expiration_date > now && expiration_date < forwardTime) return true;
	}
	return false;
}

module.exports = app;
