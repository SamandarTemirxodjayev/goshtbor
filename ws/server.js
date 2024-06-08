const WebSocket = require("ws");
require("dotenv").config();

const wss = new WebSocket.Server({port: process.env.WSPORT});

let clients = [];

wss.on("connection", (ws) => {
	clients.push(ws);
	console.log("New client connected");

	ws.on("close", () => {
		clients = clients.filter((client) => client !== ws);
		console.log("Client disconnected");
	});
});

function broadcast(data) {
	clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(data));
		}
	});
}
function wsSendMessage(data) {
	broadcast(data);
}

module.exports = {
	wsSendMessage,
};
