const path = require("path");
const view = path.join(__dirname, "../../client/views");

function ValidEmail(email) {
	if (email.length > 100 || email.length < 5 || !email.match("[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,64}")) {
		return false;
	}
	return true;
}

module.exports.view = view;
module.exports.ValidEmail = ValidEmail;
