import { COLOURS, colourize, SCOPE_COLOURS } from "../colours";
import { type FormatterOptions, type LogEntry, LogLevel } from "../types";

/**
 * formatter for console output with colour support and customizable formatting.
 * handles timestamps, log levels, scopes, and applies appropriate colours.
 *
 * @example basic usage
 * ```ts
 * const formatter = new ConsoleFormatter();
 * const formatted = formatter.format(logEntry);
 * console.log(formatted);
 * ```
 *
 * @example with custom options
 * ```ts
 * const formatter = new ConsoleFormatter({
 *   timestamp: false,
 *   colourize: false,
 *   timeFormat: 'iso'
 * });
 * ```
 */
export class ConsoleFormatter {
	/**
	 * static map to maintain consistent colours for each scope across formatter
	 * instances
	 */
	private static scopeColourMap = new Map<string, string>();
	options: FormatterOptions;

	/**
	 * creates a new console formatter with the specified options.
	 *
	 * @param options - formatting configuration options
	 */
	constructor(options: FormatterOptions = {}) {
		this.options = {
			timestamp: true,
			colourize: true,
			showScope: true,
			timeFormat: "locale",
			...options,
		};
	}

	/**
	 * formats a log entry into a human-readable string for console output.
	 *
	 * @param entry - the log entry to format
	 * @returns formatted string ready for console display
	 *
	 * @example
	 * ```ts
	 * const entry = {
	 *   level: LogLevel.INFO,
	 *   message: 'user logged in',
	 *   timestamp: new Date(),
	 *   scope: ['auth'],
	 *   args: [],
	 * };
	 *
	 * const formatted = formatter.format(entry);
	 * // "[2024-01-01 12:00:00] [INFO ] [auth] user logged in"
	 * ```
	 */
	format(entry: LogEntry): string {
		const parts: string[] = [];

		if (this.options.timestamp) {
			const timestamp = this.formatTimestamp(entry.timestamp);
			parts.push(
				this.options.colourize ? colourize(timestamp, COLOURS.DIM) : timestamp,
			);
		}

		const level = this.formatLevel(entry.level);
		parts.push(level);

		if (this.options.showScope && entry.scope.length > 0) {
			const scope = this.formatScope(entry.scope);
			parts.push(scope);
		}

		parts.push(entry.message);
		return parts.join(" ");
	}

	/**
	 * formats a timestamp according to the configured time format.
	 *
	 * @param date - the date to format
	 * @returns formatted timestamp string wrapped in brackets
	 */
	private formatTimestamp(date: Date): string {
		const { timeFormat } = this.options;

		if (typeof timeFormat === "function") {
			return `[${timeFormat(date)}]`;
		}

		switch (timeFormat) {
			case "iso":
				return `[${date.toISOString()}]`;
			case "time":
				return `[${date.toLocaleTimeString()}]`;
			default:
				return `[${date.toLocaleString()}]`;
		}
	}

	/**
	 * formats a log level with appropriate padding and colourization.
	 *
	 * @param level - the log level to format
	 * @returns formatted level string with colour if enabled
	 */
	private formatLevel(level: LogLevel): string {
		const levelName = LogLevel[level].padEnd(5);

		if (!this.options.colourize) {
			return `[${levelName}]`;
		}

		const colour = this.getLevelColour(level);
		return colourize(`[${levelName}]`, colour);
	}

	/**
	 * formats a scope array into a hierarchical string representation.
	 *
	 * @param scope - array of scope strings
	 * @returns formatted scope string with colour if enabled
	 */
	private formatScope(scope: string[]): string {
		const scopeString = `[${scope.join("/")}]`;

		if (!this.options.colourize) {
			return scopeString;
		}

		const colour = this.getScopeColour(scope.join("/"));
		return colourize(scopeString, colour);
	}

	/**
	 * gets the appropriate colour for a log level.
	 *
	 * @param level - the log level
	 * @returns ansi colour code for the level
	 */
	private getLevelColour(level: LogLevel): string {
		switch (level) {
			case LogLevel.TRACE:
				return COLOURS.FG_GRAY;
			case LogLevel.DEBUG:
				return COLOURS.FG_WHITE;
			case LogLevel.INFO:
				return COLOURS.FG_GREEN;
			case LogLevel.WARN:
				return COLOURS.FG_YELLOW;
			case LogLevel.ERROR:
				return COLOURS.FG_RED;
			case LogLevel.FATAL:
				return COLOURS.BG_RED + COLOURS.FG_WHITE;
			default:
				return COLOURS.RESET;
		}
	}

	/**
	 * gets or assigns a consistent colour for a scope name.
	 * colours are assigned cyclically from the SCOPE_COLOURS array.
	 *
	 * @param scopeName - the full scope name (e.g., "app/auth/login")
	 * @returns ansi colour code for the scope
	 * @throws error if no colour is available (should never happen)
	 */
	private getScopeColour(scopeName: string): string {
		const existingColour = ConsoleFormatter.scopeColourMap.get(scopeName);
		if (existingColour) {
			return existingColour;
		}

		const colourIndex =
			ConsoleFormatter.scopeColourMap.size % SCOPE_COLOURS.length;
		const colour = SCOPE_COLOURS[colourIndex];

		if (!colour) throw new Error(`no colour available for scope: ${scopeName}`);

		ConsoleFormatter.scopeColourMap.set(scopeName, colour);
		return colour;
	}
}
