const { CommandEvent, CommandManager } = require("./command");
const { RemoteManager } = require("./remote");
const { tag, type } = require("./style");

var command_manager = new CommandManager("#");

command_manager.add_command("test", "test123", async (event) => {
	await event.send_message("Hello");
});

command_manager.add_command("uwu", "Get a big UwU", async (event) => {
	if(event.args.length != 0) {
		await event.command_fail();
	} else {
		await event.send_message("Heres your big UwU!");
	}
});

command_manager.add_command("crash", "Crash the bot!", async (event) => {
	if(event.args.length != 0) {
		await event.command_fail();
	} else {
		crash();
	}
});

command_manager.add_command("tag", "Testing tagging", async (event) => {
	if(event.args.length != 0) {
		await event.command_fail();
	} else {
		await type("Hello ", event.event.whatsapp);
		await tag(event.event.user, event.event.whatsapp);
		await event.send_message("!");
	}
});

new RemoteManager(8080, command_manager);