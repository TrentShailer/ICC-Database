const uuid = require("uuid");
const CryptoJS = require("crypto-js");
const salt = "a337f34b-1b8a-407a-9c03-e8ea4b1b8b2c";

function GetUUID() {
	return uuid.v1();
}

function Encrypt(string) {
	return CryptoJS.PBKDF2(string, salt, {
		keySize: 8,
	}).toString();
}

function GeneratePassword(encrypt) {
	var regex = "^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z]).*$";

	var password = MakePassword();
	var attempts = 0;
	while (!password.match(regex) && attempts < 10) {
		attempts++;
		password = MakePassword();
	}

	if (encrypt) password = Encrypt(password);
	return password;
}

function MakePassword() {
	var password = "";
	var charset = ["abcdefghijkmnopqrstuvwxyz", "ABCDEFGHJKLMNPQRSTUVWXYZ", "123456789"];
	for (var i = 0; i < 8; i++) {
		var type = Math.floor(Math.random() * 100);
		if (type < 15) {
			password += charset[2].charAt(Math.floor(Math.random() * charset[2].length));
		} else if (type < 30) {
			password += charset[1].charAt(Math.floor(Math.random() * charset[1].length));
		} else {
			password += charset[0].charAt(Math.floor(Math.random() * charset[0].length));
		}
	}
	return password;
}

module.exports.salt = salt;
module.exports.GetUUID = GetUUID;
module.exports.Encrypt = Encrypt;
module.exports.GeneratePassword = GeneratePassword;
