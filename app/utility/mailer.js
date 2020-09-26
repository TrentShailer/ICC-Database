const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
	host: "send.xtra.co.nz",
	port: 465,
	secure: true,
	auth: {
		user: "trent_smtp@xtra.co.nz",
		pass: "73Kenz1e",
	},
});

async function SendMail(to, subject, html) {
	let info = await transporter.sendMail({
		from: "Login Example <trent_smtp@xtra.co.nz>",
		to: to,
		subject: subject,
		html: html,
	});
}

module.exports.SendMail = SendMail;
