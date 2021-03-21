const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
	host: process.env.SMTPHOST,
	port: 465,
	secure: true,
	auth: {
		user: process.env.STMPUSER,,
		pass: process.env.SMTPPASS,
	},
});

async function SendMail(to, subject, html) {
	let info = await transporter.sendMail({
		from: "ASGL ICC Database Admin <trent_smtp@xtra.co.nz>",
		to: to,
		subject: subject,
		html: html,
	});
}

async function SendReport(to, subject, path) {
	let info = await transporter.sendMail({
		from: "ASGL ICC Database Admin <trent_smtp@xtra.co.nz>",
		to: to,
		subject: subject,
		attachments: [
			{
				path: path,
			},
		],
	});
}

module.exports.SendReport = SendReport;
module.exports.SendMail = SendMail;
