const express = require("express");
const cors = require("cors");
const router = require("./router.js");

const app = express();

app.use(express.json());
app.use(express.static("cdn/public"));

app.use("/api", router);
const corsOptions = {
	origin: "*",
};

app.use(cors(corsOptions));
app.listen(process.env.CDNPORT || 3001, () => {
	console.log("Server is running on port 3001");
});
