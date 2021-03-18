const { dump } = require("./crash");
const { log } = require("./logger");
const { big, italic, typewriter } = require("./style");
const { sleep } = require("./util");

class CommandEvent {

	get_arguments(array) {
		if(array.length < 2) {
			return [];
		}

		var arr_new = [];

		for (var i = 1; i < array.length; i++) {
			arr_new.push(array[i]);
		}

		return arr_new;
	}

	async send_message(message) {
		await this.event.whatsapp.send_message_current_chat(message);
	}

	async command_fail() {
		await this.send_message("Uh Oh something is wrong!");
	}

	async perm_fail() {
		await this.send_message("Uh Oh looks like you aren't allowed to do that!");
	}

	constructor(message, command, event) {
		this.message = message;
		this.command = command;
		this.event = event;

		this.args = this.get_arguments(message.split(" "));
	}
}

class CommandManager {

	constructor(prefix) {
		this.commands = [];
		this.prefix = prefix;
	}

	add_command_long(command, help, help_long, executor) {

		const command_obj = {
			command: this.prefix + command,
			help: help,
			help_long: help_long,
			executor: executor
		};

		this.commands.push(command_obj);

		log("New Command: " + JSON.stringify(command_obj) + "!");

	}

	add_command(command, help, executor) {
		this.add_command_long(command, help, "Not specified!", executor);
	}

	async on_command(message, command_event_info) {

		const command_event = new CommandEvent(message, message.split(" ")[0], command_event_info);

		if(command_event.command === this.prefix + "help") {

			switch (command_event.args.length) {
				case 0:
					var help_msg = italic("TheBot help!") + "\n\n";

					this.commands.forEach(function (element) {
						var tmp_msg = "";
		
						tmp_msg += ">> " + big(element.command) + "\n";
						tmp_msg += "     " + typewriter(element.help) + "\n\n";

						help_msg += tmp_msg;
					});

					await command_event.send_message(help_msg);
					break;
				
				case 1:
					var help_msg = italic(command_event.args[0] + " help!") + "\n\n";

					this.commands.forEach(function(element) {
						if(element.command === command_event.args[0]) {
							help_msg += typewriter(element.help_long);
						}
					});

					await command_event.send_message(help_msg);
					break;
					
				default:
					await command_event.command_fail();
					break;
			}

		} else {

			for(var cmd in this.commands) {

				if(this.commands[cmd].command === command_event.command) {
					log("Found command " + command_event.command + "!");
					try {
						await this.commands[cmd].executor(command_event);	
					} catch (error) {
						const crash_id = dump(error, this.commands);

						try {
							await command_event_info.whatsapp.send_message_current_chat(big("OMG something terrible happend D:") + "\n" + typewriter("The crash id is " + crash_id));
							await command_event_info.whatsapp.select_chat("Idle");
							await command_event_info.whatsapp.send_message_current_chat(big("OMG something terrible happend D:") + "\n" + typewriter("The crash id is " + crash_id));
						} catch (error) {
							dump(error, {
								followup_error: crash_id
							});
						}
					}
				}
			}
		}
	}
}

exports.CommandEvent = CommandEvent;
exports.CommandManager = CommandManager;