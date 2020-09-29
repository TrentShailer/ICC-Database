class user {
	constructor(object) {
		this.user_id = object.user_id;
		this.first_name = object.first_name;
		this.last_name = object.last_name;
		this.email = object.email;
		this.admin_access = object.admin_access;
		this.region_id = object.region_id;
		this.region = object.region;
		this.notes = object.notes;
	}
}

class region {
	constructor(id, name) {
		this.id = id;
		this.name = name;
	}
}

class template {
	constructor(id, name, duration, notes) {
		this.id = id;
		this.name = name;
		this.duration = duration;
		this.notes = notes;
	}
}

class template_health {
	constructor(id, name, duration, notes, unit_standard) {
		this.id = id;
		this.name = name;
		this.duration = duration;
		this.notes = notes;
		this.unit_standard = unit_standard;
	}
}

class template_qualification {
	constructor(id, name, notes) {
		this.id = id;
		this.name = name;
		this.notes = notes;
	}
}

class employee_icc {
	constructor(id, user_id, template_id, training_date, expiration_date) {
		this.id = id;
		this.user_id = user_id;
		this.template_id = template_id;
		this.training_date = training_date;
		this.expiration_date = expiration_date;
	}
}
class employee_icc_qualification {
	constructor(id, user_id, template_id) {
		this.id = id;
		this.user_id = user_id;
		this.template_id = template_id;
	}
}

module.exports.user = user;
module.exports.region = region;
module.exports.template = template;
module.exports.template_health = template_health;
module.exports.template_qualification = template_qualification;
module.exports.employee_icc = employee_icc;
module.exports.employee_icc_qualification = employee_icc_qualification;
