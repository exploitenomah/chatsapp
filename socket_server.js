const { Server } = require("socket.io");

module.exports = function startSocketServer(server) {
	const io = new Server(server);
	return io
}