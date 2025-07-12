import { JsonFormatter } from "../formatters/json-formatter";
import type { LogEntry, Transport } from "../types";

export interface BrowserStorageTransportOptions {
	/** storage key prefix */
	keyPrefix?: string;
	/** maximum number of log entries to store */
	maxEntries?: number;
	/** storage type to use */
	storage?: "localStorage" | "sessionStorage";
	/** formatter to use for log entries */
	formatter?: { format(entry: LogEntry): string };
}

/**
 * transport that stores log entries in browser storage.
 */
export class BrowserStorageTransport implements Transport {
	private keyPrefix: string;
	private maxEntries: number;
	private storage: Storage;
	private formatter: { format(entry: LogEntry): string };

	constructor(options: BrowserStorageTransportOptions = {}) {
		if (typeof window === "undefined") {
			throw new Error(
				"BrowserStorageTransport can only be used in browser environments",
			);
		}

		this.keyPrefix = options.keyPrefix || "viol-logs";
		this.maxEntries = options.maxEntries || 1000;
		this.storage =
			options.storage === "sessionStorage" ? sessionStorage : localStorage;
		this.formatter = options.formatter || new JsonFormatter();
	}

	log(entry: LogEntry): void {
		try {
			const formatted = this.formatter.format(entry);
			const timestamp = entry.timestamp.getTime();
			const key = `${this.keyPrefix}-${timestamp}-${Math.random().toString(36).substring(2, 9)}`;

			this.storage.setItem(key, formatted);
			this.cleanupOldEntries();
		} catch (error) {
			console.warn("failed to write to browser storage:", error);
		}
	}

	/**
	 * removes old log entries if maxEntries is exceeded.
	 */
	private cleanupOldEntries(): void {
		const keys = Object.keys(this.storage)
			.filter((key) => key.startsWith(this.keyPrefix))
			.sort();

		while (keys.length > this.maxEntries) {
			const oldestKey = keys.shift();
			if (oldestKey) {
				this.storage.removeItem(oldestKey);
			}
		}
	}

	/**
	 * retrieves all stored log entries.
	 */
	getLogs(): string[] {
		return Object.keys(this.storage)
			.filter((key) => key.startsWith(this.keyPrefix))
			.sort()
			.map((key) => this.storage.getItem(key))
			.filter((log): log is string => log !== null);
	}

	/**
	 * clears all stored log entries.
	 */
	clearLogs(): void {
		const keys = Object.keys(this.storage).filter((key) =>
			key.startsWith(this.keyPrefix),
		);

		keys.forEach((key) => this.storage.removeItem(key));
	}
}
