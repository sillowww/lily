import { isBrowser } from "../environment";
import { BrowserConsoleFormatter } from "../formatters/browser-console-formatter";
import { ConsoleFormatter } from "../formatters/console-formatter";
import { type LogEntry, LogLevel, type Transport } from "../types";

/**
 * transport that outputs log entries to the console.
 * uses the console formatter by default but can accept custom formatters.
 *
 * @example basic usage
 * ```ts
 * const transport = new ConsoleTransport();
 * logger.addTransport(transport);
 * ```
 *
 * @example with custom formatter
 * ```ts
 * const formatter = new ConsoleFormatter({ colourize: false });
 * const transport = new ConsoleTransport(formatter);
 * ```
 */
export class ConsoleTransport implements Transport {
	private formatter: ConsoleFormatter;
	private browserFormatter?: BrowserConsoleFormatter;
	/**
	 * creates a new console transport.
	 *
	 * @param formatter - the formatter to use for log entries. defaults to ConsoleFormatter
	 */
	constructor(formatter?: ConsoleFormatter) {
		this.formatter = formatter || new ConsoleFormatter();

		if (isBrowser) {
			this.browserFormatter = new BrowserConsoleFormatter({
				timestamp: this.formatter.options.timestamp,
				colourize: this.formatter.options.colourize,
				showScope: this.formatter.options.showScope,
				timeFormat: this.formatter.options.timeFormat,
			});
		}
	}

	/**
	 * outputs a log entry to the console.
	 * if the entry has additional arguments, they are passed to console.log separately
	 * to maintain proper formatting and object inspection.
	 *
	 * @param entry - the log entry to output
	 *
	 * @example entry with args
	 * ```ts
	 * // entry: { message: "user data", args: [{ id: 123, name: "john" }] }
	 * // outputs: "[timestamp] [INFO] user data { id: 123, name: "john" }"
	 * ```
	 */
	log(entry: LogEntry): void {
		const consoleMethod = this.getConsoleMethod(entry.level);

		if (isBrowser && this.browserFormatter) {
			const [format, ...styles] = this.browserFormatter.formatForBrowser(entry);

			if (entry.args.length > 0) {
				consoleMethod(format, ...styles, ...entry.args);
			} else {
				consoleMethod(format, ...styles);
			}
		} else {
			const formatted = this.formatter.format(entry);

			if (entry.args.length > 0) {
				consoleMethod(formatted, ...entry.args);
			} else {
				consoleMethod(formatted);
			}
		}
	}

	/**
	 * maps log levels to appropriate console methods.
	 */
	private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
		switch (level) {
			case LogLevel.TRACE:
				return console.trace?.bind(console) || console.log.bind(console);
			case LogLevel.DEBUG:
				return console.debug?.bind(console) || console.log.bind(console);
			case LogLevel.INFO:
				return console.info?.bind(console) || console.log.bind(console);
			case LogLevel.WARN:
				return console.warn?.bind(console) || console.log.bind(console);
			case LogLevel.ERROR:
			case LogLevel.FATAL:
				return console.error?.bind(console) || console.log.bind(console);
			default:
				return console.log.bind(console);
		}
	}
}
