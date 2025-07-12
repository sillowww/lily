/**
 * environment detection and compatibility utilities.
 */

export const isBrowser =
	typeof window !== "undefined" && typeof window.document !== "undefined";
export const isNode = typeof process !== "undefined" && process.versions?.node;

/**
 * get environment variable in a cross-platform way.
 */
export function getEnv(key: string): string | undefined {
	if (isNode) return process.env[key];
	if (isBrowser) {
		const lilyOpts = localStorage.getItem("__LILY_OPTS");
		if (!lilyOpts) return undefined;
		try {
			const opts = JSON.parse(lilyOpts);
			return opts[key];
		} catch {
			console.warn(`failed to parse __LILY_OPTS: ${lilyOpts}`);
			return undefined;
		}
	}
}

/**
 * cross-platform package name detection.
 */
export function getPackageName(): string {
	if (isNode) {
		try {
			const fs = require("node:fs");
			const path = require("node:path");
			const url = require("node:url");

			const __filename = url.fileURLToPath(import.meta.url);
			const __dirname = path.dirname(__filename);
			const packagePath = path.join(__dirname, "..", "package.json");
			const packageContent = fs.readFileSync(packagePath, "utf-8");
			const packageJson = JSON.parse(packageContent) as { name?: string };
			return packageJson.name || "app";
		} catch {
			return "app";
		}
	}

	if (isBrowser) {
		const metaTag = document.querySelector('meta[name="app-name"]');
		if (metaTag) {
			return metaTag.getAttribute("content") || "app";
		}

		return document.title || "app";
	}

	return "app";
}
