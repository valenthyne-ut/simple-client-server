// THIS SCRIPT SHOULD BE RUN USING THE ROOT PROJECT'S YARN
import { $ as _ } from "execa";
import { cpSync, existsSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

// #region CONSTANTS
const BASE_DIR = process.cwd();


const CLIENT_BASE_DIR = join(BASE_DIR, "/client");

const CLIENT_DIST_DIR = join(CLIENT_BASE_DIR, "/dist");


const SERVER_BASE_DIR = join(BASE_DIR, "/server");

const SERVER_CREDENTIALS_DIR = join(SERVER_BASE_DIR, "/credentials");
const SERVER_DIST_DIR = join(SERVER_BASE_DIR, "/dist");

const SERVER_ENV_FILE = join(SERVER_BASE_DIR, "/.env");
const SERVER_PACKAGE_FILE = join(SERVER_BASE_DIR, "/package.json");


const BUILD_DIR = join(BASE_DIR, "/build");

const BUILD_CREDENTIALS_DIR = join(BUILD_DIR, "/credentials");
const BUILD_HTDOCS_DIR = join(BUILD_DIR, "/htdocs");
const BUILD_YARN_DIR = join(BUILD_DIR, "/.yarn");

const BUILD_YARNLOCK_FILE = join(BUILD_DIR, "/yarn.lock");
const BUILD_YARNRC_FILE = join(BUILD_DIR, "/.yarnrc.yml");
const BUILD_PACKAGE_FILE = join(BUILD_DIR, "/package.json");
const BUILD_ENV_FILE = join(BUILD_DIR, "/.env");
// #endregion

(async () => {
	if(!existsSync(SERVER_CREDENTIALS_DIR)) {
		console.log("SSL credentials not found in server folder. Please provide SSL credentials before proceeding.");
		process.exit();
	}

	try {
		const $ = _({ stdio: "inherit" });

		console.log("BUILD # Building client and server.");
		await $`yarn workspaces foreach -Rpt --from {client,server} run build`;

		console.log("BUILD # Packaging build.");
		if(existsSync(BUILD_DIR)) { rmSync(BUILD_DIR, { recursive: true }); }

		cpSync(SERVER_DIST_DIR, BUILD_DIR, { recursive: true });
		cpSync(SERVER_CREDENTIALS_DIR, BUILD_CREDENTIALS_DIR, { recursive: true });
		cpSync(CLIENT_DIST_DIR, BUILD_HTDOCS_DIR, { recursive: true });

		if(existsSync(SERVER_ENV_FILE)) { cpSync(SERVER_ENV_FILE, BUILD_ENV_FILE); }

		console.log("BUILD # Installing build dependencies.");
		writeFileSync(BUILD_YARNRC_FILE, "nodeLinker: node-modules", { encoding: "utf-8" });
		writeFileSync(BUILD_YARNLOCK_FILE, "", { encoding: "utf-8" });
		cpSync(SERVER_PACKAGE_FILE, BUILD_PACKAGE_FILE);
		await $`yarn --cwd ${BUILD_DIR} workspaces focus -A --production`;

		rmSync(BUILD_YARNRC_FILE);
		rmSync(BUILD_YARNLOCK_FILE);
		rmSync(BUILD_PACKAGE_FILE);
		rmSync(BUILD_YARN_DIR, { recursive: true });

		console.log("BUILD # Cleaning up.");
		rmSync(CLIENT_DIST_DIR, { recursive: true });
		rmSync(SERVER_DIST_DIR, { recursive: true });
	} catch(error) {
		console.log(error);
		process.exit(1);
	}
})();