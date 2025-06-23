import type { LogEntry } from "../types";

/**
 * formatter that outputs log entries as json strings.
 * useful for structured logging and machine-readable output.
 *
 * @example basic usage
 * ```ts
 * const formatter = new JsonFormatter();
 * const json = formatter.format(logEntry);
 * console.log(json);
 * // {"timestamp":"2024-01-01T12:00:00.000Z","level":2,"scope":["app"],"message":"hello"}
 * ```
 */
export class JsonFormatter {
	/**
	 * formats a log entry as a json string.
	 * includes all entry properties and conditionally adds metadata and args if present.
	 *
	 * @param entry - the log entry to format
	 * @returns json string representation of the log entry
	 *
	 * @example
	 * ```ts
	 * const entry = {
	 *   level: LogLevel.INFO,
	 *   message: 'user action',
	 *   timestamp: new Date(),
	 *   scope: ['auth', 'login'],
	 *   args: ['user123'],
	 *   metadata: { userId: 123 }
	 * };
	 *
	 * const json = formatter.format(entry);
	 * // {"timestamp":"2024-01-01T12:00:00.000Z","level":2,"scope":["auth","login"],"message":"user action","metadata":{"userId":123},"args":["user123"]}
	 * ```
	 */
	format(entry: LogEntry): string {
		const logObject = {
			timestamp: entry.timestamp.toISOString(),
			level: entry.level,
			scope: entry.scope,
			message: entry.message,
			...(entry.metadata &&
				Object.keys(entry.metadata).length > 0 && { metadata: entry.metadata }),
			...(entry.args.length > 0 && { args: entry.args }),
		};

		return JSON.stringify(logObject);
	}
}
