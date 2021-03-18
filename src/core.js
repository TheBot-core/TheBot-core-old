const puppeteer = require('puppeteer');
const { log } = require("./logger");
const { sleep } = require('./util');

class TheBotCore {
	constructor(start_screen, command_manager) {

		this.command_manager = command_manager;

		const inner = async () => {

			this.browser = await puppeteer.launch({
				headless: true,
				args: [
					"--user-data-dir=chrome/",
					"--no-sandbox"
				]
			});

			log("Chrome started!");

			this.page = await this.browser.newPage();

			await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3641.0 Safari/537.36');
			await this.page.goto("https://web.whatsapp.com");

			log("WhatsApp web loaded!");

			process.on("exit", async () => {
				await this.browser.close();
				process.exit(0);
			});

			if(start_screen) {
				setInterval(async () => {
					await this.page.screenshot({ path: "out.png" });
				}, 100);
			}

			while(!(await this.select_chat("Idle"))) {
				log("Wait for idle!");
				await sleep(1000);
			}

			await sleep(10000);

			log("WhatsApp web login successful!");

		};

		inner().then(async () => {
			await this.main_loop();
		});
	}

	async main_loop() {
		while(true) {
			const msg = await this.wait_for_message();
			if(msg.startsWith(this.command_manager.prefix)) {
				const command_event_info = {
					user: await this.get_user(),
					whatsapp: this
				};
				log("[" + command_event_info.user + "] Executing command: " + msg);

				await this.command_manager.on_command(msg, command_event_info);
			}

			await sleep(100);

			await this.select_chat("Idle");
		}
	}

	async select_chat(where) {
		try {
			const chat = await this.page.$x("//span[@title='" + where + "']");
			await chat[0].click();
			return true;
		} catch (error) {
			return false;
		}
	}

	async send_message(where, what) {

		log("Sending message '" + what + "' to " + where + "!");

		var timeout = 100;

		while(!(await this.select_chat(where)) && timeout > 0) {
			log("Message send fail! (" + timeout + " retry's left!)");
			timeout--;
		}

		await sleep(100);
		const box = await this.page.$x("//*[@id='main']/footer/div[1]/div[2]/div/div[2]");
		
		var msg_arr = what.split("\n");

		for(var msg in what.split("\n")) {
			await box[0].type(msg_arr[msg]);
			await this.page.keyboard.down("Shift");
			await this.page.keyboard.press("Enter");
			await this.page.keyboard.up("Shift");
		}

		await (await this.page.$x("//*[@id='main']/footer/div[1]/div[3]/button"))[0].click();
	}

	async send_message_current_chat(what) {
		log("Sending message '" + what + "'!");

		const box = await this.page.$x("//*[@id='main']/footer/div[1]/div[2]/div/div[2]");

		var msg_arr = what.split("\n");

		for(var msg in what.split("\n")) {
			await box[0].type(msg_arr[msg]);
			await this.page.keyboard.down("Shift");
			await this.page.keyboard.press("Enter");
			await this.page.keyboard.up("Shift");
		}

		await (await this.page.$x("//*[@id='main']/footer/div[1]/div[3]/button"))[0].click();
	}

	async get_last_message() {
		try {
			const msg = await this.page.$x("//span[@dir='ltr']/span");
			return await (await msg[msg.length - 1].getProperty("innerText")).toString().replace("JSHandle:", "");
		} catch (error) {
			return "Oh no";
		}
	}

	async wait_for_message() {
		while(true) {
			try {
				var msg = await this.page.$x("//span[@aria-label='1 ungelesene Nachricht']");
				await msg[0].click();
				await sleep(100);

				return await this.get_last_message();
			} catch (error) {
				for(var i = 2; i < 99; i++) {
					try {
						var msg = await this.page.$x("//span[@aria-label='" + i + " ungelesene Nachrichten']");
						await msg[0].click();
						await sleep(100);

						return await this.get_last_message();
					} catch (error) {
						
					}
				}
			}
		}
	}

	async get_user() {
		const msg = await this.page.$x("//span[@dir='ltr']");

		const parent = await msg[msg.length - 1].getProperty("parentNode");
		const parent2 = await parent.getProperty("parentNode");

		return (await parent2.evaluate(node => {
			return node.getAttribute("data-pre-plain-text");
		}, parent2.asElement())).split("] ")[1].replace(": ", "");
	}
}

exports.TheBotCore = TheBotCore;