import type { LogEntry, Transport } from "../types";

/**
 * browser-compatible "file" transport that downloads logs as files.
 * this is a fallback for browser environments where file system access is
 * limited.
 */
export class BrowserFileTransport implements Transport {
	private logs: string[] = [];
	private filename: string;
	private autoDownload: boolean;
	private maxLogs: number;

	constructor(
		options: {
			filename?: string;
			autoDownload?: boolean;
			maxLogs?: number;
		} = {},
	) {
		if (typeof window === "undefined") {
			throw new Error(
				"BrowserFileTransport can only be used in browser environments",
			);
		}

		this.filename = options.filename || "app.log";
		this.autoDownload = options.autoDownload || false;
		this.maxLogs = options.maxLogs || 1000;
	}

	log(entry: LogEntry): void {
		const formatted = JSON.stringify({
			timestamp: entry.timestamp.toISOString(),
			level: entry.level,
			scope: entry.scope,
			message: entry.message,
			...(entry.metadata &&
				Object.keys(entry.metadata).length > 0 && { metadata: entry.metadata }),
			...(entry.args.length > 0 && { args: entry.args }),
		});

		this.logs.push(formatted);
		if (this.logs.length > this.maxLogs) this.logs.shift();
		if (this.autoDownload && this.logs.length % 100 === 0) this.downloadLogs();
	}

	/**
	 * manually trigger download of collected logs.
	 */
	downloadLogs(): void {
		const content = this.logs.join("\n");
		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = this.filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		URL.revokeObjectURL(url);
	}

	/**
	 * clear collected logs.
	 */
	clearLogs(): void {
		this.logs = [];
	}

	/**
	 * get current log count.
	 */
	getLogCount(): number {
		return this.logs.length;
	}
}
