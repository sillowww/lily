import {
	appendFileSync,
	existsSync,
	renameSync,
	statSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { JsonFormatter } from "../formatters/json-formatter";
import type { LogEntry, Transport } from "../types";

/**
 * configuration options for file transport.
 */
export interface FileTransportOptions {
	/** path to the log file */
	filename: string;
	/** max file size in bytes before rotation */
	maxSize?: number;
	/** max number of rotated files to keep */
	maxFiles?: number;
	/** formatter to use for log entries */
	formatter?: { format(entry: LogEntry): string };
}

/**
 * transport that writes log entries to a file with optional log rotation.
 * supports automatic file rotation based on size and maintains a configurable number of backup files.
 *
 * @example basic usage
 * ```ts
 * const transport = new FileTransport({ filename: 'app.log' });
 * logger.addTransport(transport);
 * ```
 *
 * @example with rotation
 * ```ts
 * const transport = new FileTransport({
 *   filename: 'app.log',
 *   maxSize: 10 * 1024 * 1024, // 10mb
 *   maxFiles: 5 // keep 5 backup files
 * });
 * ```
 *
 * @example with custom formatter
 * ```ts
 * const transport = new FileTransport({
 *   filename: 'app.log',
 *   formatter: new ConsoleFormatter({ colourize: false })
 * });
 * ```
 */
export class FileTransport implements Transport {
	/** formatter used to convert log entries to strings */
	private formatter: { format(entry: LogEntry): string };

	/**
	 * creates a new file transport.
	 * automatically creates the log file if it doesn't exist.
	 *
	 * @param options - configuration options for the file transport
	 */
	constructor(private options: FileTransportOptions) {
		this.formatter = options.formatter || new JsonFormatter();
		this.options.maxFiles = options.maxFiles || 5;
		if (!existsSync(options.filename)) writeFileSync(options.filename, "");
	}

	/**
	 * writes a log entry to the file.
	 * automatically handles file rotation if maxSize is configured.
	 *
	 * @param entry - the log entry to write
	 *
	 * @example
	 * ```ts
	 * const entry = {
	 *   level: LogLevel.INFO,
	 *   message: 'app started',
	 *   timestamp: new Date(),
	 *   scope: ['app'],
	 *   args: []
	 * };
	 * transport.log(entry);
	 * ```
	 */
	log(entry: LogEntry): void {
		const formatted = `${this.formatter.format(entry)}\n`;

		try {
			if (this.options.maxSize) {
				this.rotateIfNeeded();
			}

			appendFileSync(this.options.filename, formatted);
		} catch (error) {
			console.error("failed to write to log file:", error);
		}
	}

	/**
	 * checks if log rotation is needed and performs rotation if the file exceeds maxSize.
	 * rotation scheme: app.log -> app.log.1 -> app.log.2 -> ... -> app.log.N
	 *
	 * @private
	 */
	private rotateIfNeeded(): void {
		if (!existsSync(this.options.filename) || !this.options.maxSize) return;

		const stats = statSync(this.options.filename);
		if (stats.size < this.options.maxSize) return;

		if (!this.options.maxFiles) return;
		for (let i = this.options.maxFiles - 1; i >= 1; i--) {
			const oldFile = `${this.options.filename}.${i}`;
			const newFile = `${this.options.filename}.${i + 1}`;

			if (existsSync(oldFile)) {
				if (i === this.options.maxFiles - 1) {
					try {
						unlinkSync(oldFile);
					} catch {}
				} else {
					renameSync(oldFile, newFile);
				}
			}
		}

		renameSync(this.options.filename, `${this.options.filename}.1`);
		writeFileSync(this.options.filename, "");
	}
}
