import { ConsoleFormatter } from "../formatters/console-formatter";
import type { LogEntry, Transport } from "../types";

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
	/**
	 * creates a new console transport.
	 *
	 * @param formatter - the formatter to use for log entries. defaults to ConsoleFormatter
	 */
	constructor(private formatter = new ConsoleFormatter()) {}

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
		const formatted = this.formatter.format(entry);

		if (entry.args.length > 0) {
			console.log(formatted, ...entry.args);
		} else {
			console.log(formatted);
		}
	}
}
