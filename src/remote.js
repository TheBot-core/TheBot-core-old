const express = require('express');
const { TheBotCore } = require("./core");
const { log } = require('./logger');

class RemoteManager {
	constructor(port, command_manager) {
		this.app = express();

		this.port = port;

		this.whatsapp = new TheBotCore(command_manager);;

		this.app.get('/', (req, res) => {
			res.sendFile(__dirname + "/index.html");
		});

		this.app.get("/api/screen.png", async (req, res) => {
			try {
				await this.whatsapp.page.screenshot({ path: __dirname + "/tmp.png" });
				res.sendFile(__dirname + "/tmp.png");
			} catch (error) {
				res.send(error.stack);
			}
		});

		this.app.get("/api/exit", async (req, res) => {
			process.exit(0);
		});

		this.app.get("/api/new-message", async (req, res) => {
			try {
				if(req.param("chat") != undefined && req.param("message") != undefined) {
					await this.whatsapp.send_message(req.param("chat"), req.param("message"));
					await this.whatsapp.select_chat("Idle");
					res.send("OK");
				} else {
					throw new Error("OMG D: not like this!");
				}
			} catch (error) {
				res.send(error.stack);
			}
		});

		this.app.listen(port, () => {
			log("Example app listening at http://localhost:" + port);
		});
	}
}

exports.RemoteManager = RemoteManager;