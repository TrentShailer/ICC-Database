const path = require("path");
const fs = require("fs");
const view = path.join(__dirname, "../../client/views");

function ValidEmail(email) {
	if (email.length > 100 || email.length < 5 || !email.match("[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,64}")) {
		return false;
	}
	return true;
}

function RemoveOldReports() {
	var dir = path.join(process.cwd(), "client/public/tmp");
	fs.readdir(dir, function (err, files) {
		if (err) {
			console.log(err);
		}
		files.forEach(function (file) {
			handleFile(fs.statSync(path.join(dir, file)));
		});
	});
}
function handleFile(stats) {
	var now = new Date();
	var deletionCutOff = now.setDate(now.getDate() - 10);
	if (!stats) {
		return console.log("No stats returned");
	}
	if (stats.mtime < deletionCutOff) {
		console.log(stats.mtime);

		fs.unlink(path.join(dir, file), (err) => {
			if (err) {
				console.log(err);
			}
		});
	}
}
module.exports.view = view;
module.exports.ValidEmail = ValidEmail;
module.exports.RemoveOldReports = RemoveOldReports;
