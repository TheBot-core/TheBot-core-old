function log(what) {
	const date = new Date(Date.now()).toUTCString();
	console.log("[" + date + "] " + what);
}

exports.log = log;