import "dotenv/config";
import express from "express";
import cors from "cors";
import config from "./config";
import { createServer } from "https";

(async () => {
	const app = express();

	app.use(cors({
		origin: `https://localhost:${config.PORT}`
	}));

	const httpsServer = createServer(config.CREDENTIALS, app);
	httpsServer.listen(config.PORT);

	httpsServer.on("listening", () => {
		console.log("Server listening on port", config.PORT);
	});
})();