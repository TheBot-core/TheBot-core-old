const { log } = require("./logger");

function big(what) {
	return "*" + what+ "*";
}

function italic(what) {
	return "_" + what+ "_";
}

function strikethrough(what) {
	return "~" + what+ "~";
}

function typewriter(what) {
	return "```" + what+ "```";
}

async function tag(who, whatsapp) {
	log("Tagging " + who + "!");
	await whatsapp.page.keyboard.type("@" + who + "");
	await whatsapp.page.keyboard.press("Tab");
	return "";
}

async function type(what, whatsapp) {
	log("Typing '" + what + "'!");
	await whatsapp.page.keyboard.type(what);
}

exports.big = big;
exports.italic = italic;
exports.strikethrough = strikethrough;
exports.typewriter = typewriter;
exports.tag = tag;
exports.type = type;