require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const router = require("./routes/router.js");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
if (process.env.BOT_RUN == "true") {
	require("./bot/index.js");
}
const app = express();

app.use(helmet());

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

const logFolder = path.join(__dirname, "log");
const logFileName = () => {
	const now = new Date();
	const formattedDate = `${String(now.getDate()).padStart(2, "0")}-${String(
		now.getMonth() + 1,
	).padStart(2, "0")}-${now.getFullYear()}`;
	return path.join(logFolder, `${formattedDate}.mongodb.log`);
};
fs.mkdirSync(logFolder, {recursive: true});
let logStream = fs.createWriteStream(logFileName(), {flags: "a"});
mongoose.set("debug", (collectionName, method, query, doc) => {
	const logMessage = `[${new Date().toISOString()}] ${collectionName}.${method} ${JSON.stringify(
		query,
	)} ${JSON.stringify(doc)}\n`;

	if (logStream.path !== logFileName()) {
		logStream.end();
		logStream = fs.createWriteStream(logFileName(), {flags: "a"});
	}

	logStream.write(logMessage);
});

app.listen(process.env.PORT || 3000, () => {
	console.log("Server is running on port 3000");
});

cron.schedule("0 */1 * * *", async () => {
	const now = new Date();
	await Confirmations.deleteMany({expiredAt: {$lt: now}});
	console.log("Expired confirmations cleaned up");
});

app.use("/api", router);
