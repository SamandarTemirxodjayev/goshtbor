require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const routerRegister = require("./routes/register.router");
const routerUser = require("./routes/user.router");
const swaggerUi = require("swagger-ui-express");
const YAML = require("js-yaml");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const app = express();

app.use(express.json());
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

app.use("/register", routerRegister);
app.use("/user", routerUser);
const swaggerDocument = YAML.load(
	fs.readFileSync(path.join(__dirname, "swagger.yaml"), "utf8"),
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
