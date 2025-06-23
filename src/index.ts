import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { COLOURS } from "./colours";
import { ConsoleFormatter } from "./formatters/console-formatter";
import { JsonFormatter } from "./formatters/json-formatter";
import { Logger } from "./logger";
import { ConsoleTransport } from "./transports/console-transport";
import { FileTransport } from "./transports/file-transport";
import { LogLevel } from "./types";

/**
 * attempts to read the package name from package.json for default logger naming.
 * falls back to "app" if package.json cannot be read.
 *
 * @returns the package name or "app" as fallback
 */
const getPackageName = (): string => {
	try {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);
		const packagePath = join(__dirname, "..", "package.json");
		const packageContent = readFileSync(packagePath, "utf-8");
		const packageJson = JSON.parse(packageContent) as { name?: string };
		return packageJson.name || "app";
	} catch (_error) {
		return "app";
	}
};

/**
 * default logger instance configured with package name and standard options.
 * ready to use out of the box for simple logging needs.
 *
 * @example
 * ```ts
 * import logger from 'viol';
 * logger.info('application started');
 * ```
 */
const defaultLogger = new Logger(getPackageName(), {
	timestamp: true,
	colourize: true,
});

export {
	Logger,
	LogLevel,
	COLOURS,
	ConsoleTransport,
	FileTransport,
	ConsoleFormatter,
	JsonFormatter,
};

export default defaultLogger;

export type {
	FormatterOptions,
	LogEntry,
	LoggerOptions,
	Transport,
} from "./types";
