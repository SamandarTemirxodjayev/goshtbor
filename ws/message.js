const http = require("http");
const WebSocket = require("ws");
require("dotenv").config();

const server = http.createServer((req, res) => {
	// Handle CORS headers
	res.setHeader("Access-Control-Allow-Origin", "*"); // Allow your frontend origin

	if (req.method === "OPTIONS") {
		res.writeHead(204);
		res.end();
		return;
	}

	// Your server logic can go here
	res.writeHead(404);
	res.end();
});

const wss = new WebSocket.Server({noServer: true});

let clients = [];

wss.on("connection", (ws) => {
	clients.push(ws);
	console.log("New client connected");

	ws.on("close", () => {
		clients = clients.filter((client) => client !== ws);
		console.log("Client disconnected");
	});
	ws.on("error", (error) => {
		console.error("WebSocket error:", error);
	});
});

wss.on("error", (error) => {
	console.error("WebSocket Server error:", error);
});

server.on("upgrade", (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, (ws) => {
		wss.emit("connection", ws, request);
	});
});

server.listen(process.env.WSMESSAGERPORT, () => {
	console.log(
		`WebSocket Message server is running on port ${process.env.WSMESSAGERPORT}`,
	);
});

function broadcast(data) {
	clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(data));
		}
	});
}

function wsMessager(data) {
	broadcast(data);
}

module.exports = {
	wsMessager,
};
