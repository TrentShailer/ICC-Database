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

app.post("/generate/type3/report", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access) {
		var icc_type = req.body.icc_type;
		var icc_id = req.body.icc;
		var start = process.hrtime();
		var now = new Date();

		var outputPath = path.join(__dirname, "../../../", "client", "public", "tmp");
		var outputName = `ICC Report ${format(now, "yyyy-MM-dd hh-mm a")}.pdf`;
		console.log(icc_type);
		console.log(icc_id);
		switch (icc_type) {
			case "Site Induction":
				var icc_name_query = await database.query("SELECT name FROM site_templates WHERE id = $1", [icc_id]);
				if (!(icc_name_query < 0)) {
					var icc_name = icc_name_query.rows[0].name;
				} else {
					req.session.error = "Failed to find icc";
					return res.send({ redirect: "/admin" });
				}
				break;
			case "Product Certification":
				var icc_name_query = await database.query("SELECT name FROM product_templates WHERE id = $1", [icc_id]);
				if (!(icc_name_query < 0)) {
					var icc_name = icc_name_query.rows[0].name;
				} else {
					req.session.error = "Failed to find icc";
					return res.send({ redirect: "/admin" });
				}
				break;
			case "Health and Safety Qualification":
				var icc_name_query = await database.query("SELECT name FROM health_templates WHERE id = $1", [icc_id]);
				if (!(icc_name_query < 0)) {
					var icc_name = icc_name_query.rows[0].name;
				} else {
					req.session.error = "Failed to find icc";
					return res.send({ redirect: "/admin" });
				}
				break;
			case "General Certification":
				var icc_name_query = await database.query("SELECT name FROM certification_templates WHERE id = $1", [icc_id]);
				if (!(icc_name_query < 0)) {
					var icc_name = icc_name_query.rows[0].name;
				} else {
					req.session.error = "Failed to find icc";
					return res.send({ redirect: "/admin" });
				}
				break;
			default:
				req.session.error = "Failed to find icc type";
				return res.send({ redirect: "/admin" });
		}
		var buffer = await GenerateBuffer(req, icc_type, icc_id);

		pdf
			.create(buffer, {
				format: "A4",
				header: {
					height: "37mm",
					contents: `<div class="center">
					<p class="header" id="title">${icc_name} Report</p>
				</div>
				<div style="margin-top: -15px">
					<div style="float: left; text-align: left;">
						<p class="info">Report Generated on ${format(utcToZonedTime(new Date(), timeZone), "dd/MM/yyyy hh:mm a")}</p>
					</div>
					<div style="float: right; text-align: right;">
						<p class="info">Report Type: ICC</p>
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
async function GenerateBuffer(req, type, icc_id) {
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
		var result = await GenerateRegion(regionQuery.rows[0].id, req.body.regions[i], type, icc_id);
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

async function GenerateRegion(region_id, region_name, type, icc_id) {
	var flag = false;
	var userQuery = await database.query("SELECT user_id, first_name, last_name FROM users WHERE region_id = $1 ORDER BY first_name ASC", [region_id]);
	var html = `
	<div>
		<hr class="divider" />
		<div>
			<p class="sub-header">Region - ${region_name}</p>
		</div>
		<div>
			`;
	var has = [];
	var hasnt = [];
	for (var i = 0; i < userQuery.rows.length; i++) {
		var user_id = userQuery.rows[i].user_id;
		var name = `${userQuery.rows[i].first_name} ${userQuery.rows[i].last_name}`;
		if (type == "Site Induction") {
			var result = await GetSite(user_id, icc_id, name);
			result.has == false ? hasnt.push(result) : has.push(result);
		} else if (type == "Product Certification") {
			var result = await GetProduct(user_id, icc_id, name);
			result.has == false ? hasnt.push(result) : has.push(result);
		} else if (type == "Health and Safety Qualification") {
			var result = await GetHealth(user_id, icc_id, name);
			result.has == false ? hasnt.push(result) : has.push(result);
		} else if (type == "General Certification") {
			var result = await GetCertification(user_id, icc_id, name);
			result.has == false ? hasnt.push(result) : has.push(result);
		}
	}
	if (has.length != 0) {
		html += `
	<div class="center">
		<p class="sub-header">The following employees HAVE been assigned the ICC</p>
	</div>
	<table style="width: 100%">
				<thead>
					<tr>
						<th align="left" class="sub-header">Name</th>
						<th align="left" class="sub-header">Expiration Date</th>
					</tr>
				</thead>
				<tbody>`;
		for (var i = 0; i < has.length; i++) {
			flag = true;
			html += `<tr>
		<td>${has[i].name}</td>
		<td>${has[i].expiration_date}</td>
		</tr>`;
		}
		html += `
				</tbody>
			</table>`;
	}
	if (hasnt.length != 0) {
		html += `
	<div class="center">
		<p class="sub-header">The following employees HAVE NOT been assigned the ICC</p>
	</div><table style="width: 100%">
				<thead>
					<tr>
						<th align="left" class="sub-header">Name</th>
					</tr>
				</thead>
				<tbody>`;
		for (var i = 0; i < hasnt.length; i++) {
			flag = true;
			html += `<tr>
		<td>${hasnt[i].name}</td>
		</tr>`;
		}
		html += `
				</tbody>
			</table>`;
	}

	html += `
		</div>
	</div>`;
	if (flag) {
		return html;
	} else {
		return "";
	}
}

async function GetSite(user_id, icc_id, name) {
	var query = await database.query(
		"SELECT site_templates.name AS name, expiration_date FROM employee_site_inductions INNER JOIN site_templates ON site_templates.id = template_id WHERE user_id = $1 AND template_id = $2 ORDER BY expiration_date ASC",
		[user_id, icc_id]
	);
	if (query < 0) {
		return { has: false, name: name };
	} else {
		var date = query.rows[0].expiration_date;
		if (date != "" && date != null) date = format(query.rows[0].expiration_date, "dd/MM/yyyy");
		else date = "";
		return { has: true, name: name, expiration_date: date };
	}
}

async function GetProduct(user_id, icc_id, name) {
	var query = await database.query(
		"SELECT product_templates.name AS name, expiration_date FROM employee_product_certifications INNER JOIN product_templates ON product_templates.id = template_id WHERE user_id = $1 AND template_id = $2 ORDER BY expiration_date ASC",
		[user_id, icc_id]
	);
	if (query < 0) {
		return { has: false, name: name };
	} else {
		var date = query.rows[0].expiration_date;
		if (date != "" && date != null) date = format(query.rows[0].expiration_date, "dd/MM/yyyy");
		else date = "";

		return { has: true, name: name, expiration_date: date };
	}
}

async function GetHealth(user_id, icc_id, name) {
	var query = await database.query(
		"SELECT health_templates.name AS name, expiration_date FROM employee_health_qualifications INNER JOIN health_templates ON health_templates.id = template_id WHERE user_id = $1 AND template_id = $2 ORDER BY expiration_date ASC",
		[user_id, icc_id]
	);
	if (query < 0) {
		return { has: false, name: name };
	} else {
		var date = query.rows[0].expiration_date;
		if (date != "" && date != null) date = format(query.rows[0].expiration_date, "dd/MM/yyyy");
		else date = "";

		return { has: true, name: name, expiration_date: date };
	}
}

async function GetCertification(user_id, icc_id, name) {
	var query = await database.query(
		"SELECT certification_templates.name AS name, expiration_date FROM employee_certifications INNER JOIN certification_templates ON certification_templates.id = template_id WHERE user_id = $1 AND template_id = $2 ORDER BY expiration_date ASC",
		[user_id, icc_id]
	);
	if (query < 0) {
		return { has: false, name: name };
	} else {
		var date = query.rows[0].expiration_date;
		if (date != "" && date != null) date = format(query.rows[0].expiration_date, "dd/MM/yyyy");
		else date = "";

		return { has: true, name: name, expiration_date: date };
	}
}

module.exports = app;
