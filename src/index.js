const { CommandManager } = require("./command");
const { RemoteManager } = require("./remote");
const fs = require("fs");
const { tag, type, typewriter } = require("./style");
const fetch = require('node-fetch');
const { has_perm } = require("./role_manager");

var command_manager = new CommandManager("#");

command_manager.add_command("ping", "Ping the bot!", async (event) => {
	if(event.args.length != 0) {
		await event.command_fail();
	} else {
		await event.send_message("Pong!");
	}
});

command_manager.add_command("wikipedia", "Search Wikipedia!", async (event) => {
	if(event.args.length < 1) {
		await event.command_fail();
	} else {
		const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + event.args.join("_"));
		const json = await res.json();
		await event.send_message(json.extract);
	}
});

command_manager.add_command("hello", "Get a greeting from the bot!", async (event) => {
	if(event.args.length != 0) {
		await event.command_fail();
	} else {
		await type("Hello ", event.event.whatsapp);
		await tag(event.event.user, event.event.whatsapp);
		await event.send_message("!");
	}
});

command_manager.add_command("say", "Say something!", async (event) => {
	if(event.args.length < 1) {
		await event.command_fail();
	} else {
		await event.send_message(event.args.join(" "));
	}
});


command_manager.add_command("crash", "Crash the bot!", async (event) => {
	if(event.args.length != 0) {
		await event.command_fail();
	} else {

		if(!has_perm("crash", event.event.user)) {
			await event.perm_fail();
		} else {

			throw new Error("D:");
		}
	}
});


command_manager.add_command("crash->info", "Get information's from a crash!", async (event) => {
	if(event.args.length != 1) {
		await event.command_fail();
	} else {

		if(!has_perm("crash", event.event.user)) {
			await event.perm_fail();
		} else {
			const crash = JSON.parse(fs.readFileSync("./crash/" + event.args[0] + ".json"));

			await event.send_message(typewriter(crash.stack));
		}
	}
});

new RemoteManager(8080, command_manager);