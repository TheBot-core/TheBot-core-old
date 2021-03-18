const { log } = require("./logger");

const fs = require("fs");

function dump(error, what) {
	const dump = {
		stack: error.stack,
		dump: what
	};

	const crash_id = Math.floor(Math.random() * 10000000);

	const dump_str = JSON.stringify(dump, undefined, 4);

	log("Something terrible happens D: saving crash dump with id " + crash_id + ":\n" + dump.stack);

	if(!fs.existsSync("./crash")) {
		fs.mkdirSync("./crash");
	}

	fs.writeFileSync("./crash/" + crash_id + ".json", dump_str);


	return crash_id.toString();
}

exports.dump = dump;