import { COLOURS } from "./colours";
import { getPackageName, isBrowser } from "./environment";
import { ConsoleFormatter } from "./formatters/console-formatter";
import { JsonFormatter } from "./formatters/json-formatter";
import { Logger } from "./logger";
import { ConsoleTransport } from "./transports/console-transport";
import { LogLevel } from "./types";

type FileTransportType =
	typeof import("./transports/file-transport").FileTransport;
type BrowserStorageTransportType =
	typeof import("./transports/browser-storage-transport").BrowserStorageTransport;
type BrowserFileTransportType =
	typeof import("./transports/file-transport-browser").BrowserFileTransport;

let FileTransport: FileTransportType | undefined;
let BrowserStorageTransport: BrowserStorageTransportType | undefined;
let BrowserFileTransport: BrowserFileTransportType | undefined;

if (!isBrowser) {
	import("./transports/file-transport").then((module) => {
		FileTransport = module.FileTransport;
	});
} else {
	import("./transports/browser-storage-transport").then((module) => {
		BrowserStorageTransport = module.BrowserStorageTransport;
	});
	import("./transports/file-transport-browser").then((module) => {
		BrowserFileTransport = module.BrowserFileTransport;
	});
}

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

export default defaultLogger;
export {
	FileTransport,
	BrowserStorageTransport,
	BrowserFileTransport,
	Logger,
	LogLevel,
	COLOURS,
	ConsoleTransport,
	ConsoleFormatter,
	JsonFormatter,
};
export type {
	FormatterOptions,
	LogEntry,
	LoggerOptions,
	Transport,
} from "./types";
