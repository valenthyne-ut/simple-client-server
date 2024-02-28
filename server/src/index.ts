import "dotenv/config";
import express from "express";
import cors from "cors";
import config from "./config";
import { createServer } from "https";
import { join } from "path";

(async () => {
	const app = express();

	app.use(express.static(join(__dirname, "htdocs")));

	app.use(cors({
		origin: `https://localhost:${config.PORT}`
	}));

	const httpsServer = createServer(config.CREDENTIALS, app);
	httpsServer.listen(config.PORT);

	httpsServer.on("listening", () => {
		console.log("Server listening on port", config.PORT);
	});
})();