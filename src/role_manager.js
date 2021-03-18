const fs = require("fs");

function has_perm(perm, user) {
	const roles = JSON.parse(fs.readFileSync("roles.json"));
	const users = JSON.parse(fs.readFileSync("users.json"));

	if(users[user] != undefined) {
		const user_role = users[user];

		if(roles[user_role] != undefined) {
			const role = roles[user_role];
			return role[perm] != undefined ? role[perm] : false;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

function get_role(user) {
	const users = JSON.parse(fs.readFileSync("users.json"));

	if(users[user] != undefined) {
		return users[user];
	} else {
		return "undefined";
	}
}

function set_role(user, role) {
	const users = JSON.parse(fs.readFileSync("users.json"));
	
	users[user] = role;

	fs.writeFileSync("users.json", JSON.stringify(users, undefined, 4));
}


exports.has_perm = has_perm;
exports.get_role = get_role;
exports.set_role = set_role;