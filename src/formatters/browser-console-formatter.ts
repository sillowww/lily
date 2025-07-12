import { type FormatterOptions, type LogEntry, LogLevel } from "../types";

/**
 * bowser-specific console formatter that uses css styling instead of ansi
 * codes.
 */
export class BrowserConsoleFormatter {
	private static scopeColourMap = new Map<string, string>();
	options: FormatterOptions = {};

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
	 * formats a log entry for browser console with css styling.
	 * returns an array suitable for console.log with css styles.
	 */
	formatForBrowser(entry: LogEntry): [string, ...string[]] {
		const parts: string[] = [];
		const styles: string[] = [];

		if (this.options.timestamp) {
			const timestamp = this.formatTimestamp(entry.timestamp);
			parts.push(`%c${timestamp}`);
			styles.push("color: #888; font-weight: normal;");
		}

		const levelInfo = this.getLevelInfo(entry.level);
		parts.push(`%c[${levelInfo.name.padEnd(5)}]`);
		styles.push(levelInfo.style);

		if (this.options.showScope && entry.scope.length > 0) {
			const scopeString = `[${entry.scope.join("/")}]`;
			parts.push(`%c${scopeString}`);
			styles.push(this.getScopeStyle(entry.scope.join("/")));
		}

		parts.push(`%c${entry.message}`);
		styles.push("color: inherit; font-weight: normal;");

		return [parts.join(" "), ...styles];
	}

	/**
	 * fallback format method for compatibility.
	 */
	format(entry: LogEntry): string {
		const parts: string[] = [];

		if (this.options.timestamp) {
			parts.push(this.formatTimestamp(entry.timestamp));
		}

		const levelName = LogLevel[entry.level].padEnd(5);
		parts.push(`[${levelName}]`);

		if (this.options.showScope && entry.scope.length > 0) {
			parts.push(`[${entry.scope.join("/")}]`);
		}

		parts.push(entry.message);
		return parts.join(" ");
	}

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

	private getLevelInfo(level: LogLevel): { name: string; style: string } {
		const name = LogLevel[level];

		if (!this.options.colourize) {
			return { name, style: "color: inherit; font-weight: normal;" };
		}

		switch (level) {
			case LogLevel.TRACE:
				return { name, style: "color: #888; font-weight: normal;" };
			case LogLevel.DEBUG:
				return { name, style: "color: #333; font-weight: normal;" };
			case LogLevel.INFO:
				return { name, style: "color: #22c55e; font-weight: bold;" };
			case LogLevel.WARN:
				return { name, style: "color: #f59e0b; font-weight: bold;" };
			case LogLevel.ERROR:
				return { name, style: "color: #ef4444; font-weight: bold;" };
			case LogLevel.FATAL:
				return {
					name,
					style:
						"background: #ef4444; color: white; font-weight: bold; padding: 2px 4px; border-radius: 2px;",
				};
			default:
				return { name, style: "color: inherit; font-weight: normal;" };
		}
	}

	private getScopeStyle(scopeName: string): string {
		if (!this.options.colourize) {
			return "color: inherit; font-weight: normal;";
		}

		const existingColour =
			BrowserConsoleFormatter.scopeColourMap.get(scopeName);
		if (existingColour) {
			return existingColour;
		}

		const colors = [
			"#ef4444",
			"#f59e0b",
			"#22c55e",
			"#3b82f6",
			"#8b5cf6",
			"#ec4899",
			"#06b6d4",
			"#10b981",
		];

		const colorIndex =
			BrowserConsoleFormatter.scopeColourMap.size % colors.length;
		const color = colors[colorIndex] || "#666";
		const style = `color: ${color}; font-weight: bold;`;

		BrowserConsoleFormatter.scopeColourMap.set(scopeName, style);
		return style;
	}
}
