/**
 * log severity levels in ascending order.
 * higher numbers indicate more severe issues.
 *
 * @example checking log levels
 * ```ts
 * if (LogLevel.ERROR >= LogLevel.WARN) {
 *   // error level includes warnings and above
 * }
 * ```
 */
export enum LogLevel {
	/**
	 * detailed debugging information, typically only of interest when diagnosing
	 * problems
	 */
	TRACE = 0,
	/** debug information for development and troubleshooting */
	DEBUG = 1,
	/** general informational messages that highlight application progress */
	INFO = 2,
	/** warning messages for potentially harmful situations */
	WARN = 3,
	/**
	 * error messages for error conditions that allow the application to continue
	 */
	ERROR = 4,
	/** critical errors that may cause the application to terminate */
	FATAL = 5,
	/** disable all logging output */
	OFF = 6,
}

/**
 * represents a single log entry with all associated metadata.
 * this is the core data structure passed between loggers, transports, and
 * formatters.
 */
export interface LogEntry {
	/** the severity level of this log entry */
	level: LogLevel;
	/** the primary log message */
	message: string;
	/** when this log entry was created */
	timestamp: Date;
	/** hierarchical scope path (e.g., ['app', 'auth', 'login']) */
	scope: string[];
	/** additional arguments passed to the logging method */
	args: unknown[];
	/** structured metadata attached to the logger or entry */
	metadata?: Record<string, unknown>;
}

/**
 * configuration options for logger instances.
 */
export interface LoggerOptions {
	/** whether to include timestamps in log output */
	timestamp?: boolean;
	/** whether to apply ansi colour codes to output */
	colourize?: boolean;
	/** minimum log level for this logger instance */
	level?: LogLevel;
	/** structured metadata to include with all log entries */
	metadata?: Record<string, unknown>;
}

/**
 * configuration options for log formatters.
 */
export interface FormatterOptions {
	/** whether to include timestamps in formatted output */
	timestamp?: boolean;
	/** whether to apply ansi colour codes to output */
	colourize?: boolean;
	/** whether to display the scope in formatted output */
	showScope?: boolean;
	/** format for timestamp display */
	timeFormat?: "iso" | "locale" | "time" | ((date: Date) => string);
}

/**
 * a transport defines where log entries are sent.
 * implement this interface to create custom log destinations.
 *
 * @example custom http transport
 * ```ts
 * class HttpTransport implements Transport {
 *   constructor(private url: string) {}
 *
 *   async log(entry: LogEntry): Promise<void> {
 *     await fetch(this.url, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(entry)
 *     });
 *   }
 * }
 * ```
 *
 * @example custom database transport
 * ```ts
 * class DatabaseTransport implements Transport {
 *   async log(entry: LogEntry): Promise<void> {
 *     await db.logs.insert({
 *       level: entry.level,
 *       message: entry.message,
 *       timestamp: entry.timestamp,
 *       scope: entry.scope.join('/'),
 *       metadata: entry.metadata
 *     });
 *   }
 * }
 * ```
 */
export interface Transport {
	/**
	 * process a log entry. can be synchronous or asynchronous.
	 * if this method throws an error or returns a rejected promise,
	 * the error will be caught and logged to console.error.
	 *
	 * @param entry - the log entry to process
	 */
	log(entry: LogEntry): void | Promise<void>;
}
