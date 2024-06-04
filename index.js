require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const router = require("./routes/router.js");
const bodyParser = require("body-parser");
const WebSocket = require("ws");

const app = express();
const wss = new WebSocket.Server({port: process.env.WSPORT});

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
const corsOptions = {
	origin: "*",
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("Could not connect to MongoDB:", err));

app.listen(process.env.PORT || 3000, () => {
	console.log("Server is running on port 3000");
	// require("./cdn/index.js");
});

cron.schedule("0 */1 * * *", async () => {
	const now = new Date();
	await Confirmations.deleteMany({expiredAt: {$lt: now}});
	console.log("Expired confirmations cleaned up");
});

app.use("/api", router);

wss.on("connection", (ws) => {
	clients.add(ws);
	console.log("A new client connected");

	ws.on("message", (message) => {
		let data = JSON.parse(message.toString());

		console.log("ChatId: " + data.chatId);
		console.log("Message: " + data.message);
	});

	ws.on("close", () => {
		clients.delete(ws);
		console.log("A client disconnected");
	});
	process.stdin.on("data", (data) => {
		ws.send(
			JSON.stringify({
				chatId: data.toString().trim().split(" ")[0],
				message: data.toString().trim().split(" ")[1],
			}),
		);
	});
});

console.log(`Websocket server is run on PORT ${process.env.WSPORT}`);
