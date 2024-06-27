require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const router = require("./routes/router.js");
const bodyParser = require("body-parser");
require("./bot/index.js");

const app = express();

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
});

cron.schedule("0 */1 * * *", async () => {
	const now = new Date();
	await Confirmations.deleteMany({expiredAt: {$lt: now}});
	console.log("Expired confirmations cleaned up");
});

app.use("/api", router);
