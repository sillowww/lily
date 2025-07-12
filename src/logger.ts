import { getEnv } from "./environment";
import { ConsoleTransport } from "./transports/console-transport";
import {
	type LogEntry,
	type LoggerOptions,
	LogLevel,
	type Transport,
} from "./types";

/**
 * main `Logger` class.
 * provides hierarchical logging with customizable transports, formatters, and scopes.
 * supports child loggers for organized logging across application components.
 *
 * @example basic usage
 * ```ts
 * const logger = new Logger('myapp');
 * logger.info('hello world');
 * ```
 *
 * @example with child loggers
 * ```ts
 * const dbLogger = logger.child('database');
 * dbLogger.error('connection failed');
 * ```
 *
 * @example with custom transports
 * ```ts
 * const logger = new Logger('app');
 * logger.addTransport(new FileTransport({ filename: 'app.log' }));
 * logger.info('logged to both console and file');
 * ```
 */
export class Logger {
	/** global log level that applies to all logger instances by default */
	private static globalLevel: LogLevel = LogLevel.INFO;

	/** array of transports that will receive log entries */
	private transports: Transport[] = [];

	/** hierarchical scope path for this logger instance */
	private scope: string[];

	/** configuration options for this logger */
	private options: LoggerOptions;

	/**
	 * creates a new Logger instance.
	 *
	 * @param scope - the scope name(s) for this logger. can be a string or array of strings
	 * @param options - configuration options including level, timestamp, colourization, and metadata
	 *
	 * @example single scope
	 * ```ts
	 * const logger = new Logger('api');
	 * ```
	 *
	 * @example multiple scopes
	 * ```ts
	 * const logger = new Logger(['app', 'database', 'users']);
	 * ```
	 *
	 * @example with options
	 * ```ts
	 * const logger = new Logger('debug-logger', {
	 *   level: LogLevel.DEBUG,
	 *   colourize: false,
	 *   metadata: { version: '1.0.0' }
	 * });
	 * ```
	 */
	constructor(scope: string | string[] = [], options: LoggerOptions = {}) {
		this.scope = Array.isArray(scope) ? scope : [scope];
		this.options = {
			timestamp: true,
			colourize: true,
			level: Logger.globalLevel,
			...options,
		};

		// default console transport if none are provided
		if (this.transports.length === 0) this.addTransport(new ConsoleTransport());
		this.initializeFromEnvironment();
	}

	/**
	 * sets the global log level for all logger instances.
	 * affects all existing and future logger instances unless they have an explicit level set.
	 *
	 * @param level - the log level to set globally
	 *
	 * @example
	 * ```ts
	 * Logger.setGlobalLevel(LogLevel.DEBUG);
	 * // all loggers will now log debug messages and above
	 * ```
	 */
	static setGlobalLevel(level: LogLevel): void {
		Logger.globalLevel = level;
	}

	/**
	 * gets the current global log level.
	 *
	 * @returns the current global log level
	 */
	static getGlobalLevel(): LogLevel {
		return Logger.globalLevel;
	}

	/**
	 * adds a transport to this logger instance.
	 * transports determine where log entries are sent (console, file, network, etc.).
	 *
	 * @param transport - the transport to add
	 *
	 * @example
	 * ```ts
	 * logger.addTransport(new FileTransport({ filename: 'app.log' }));
	 * logger.addTransport(new HttpTransport({ url: 'https://api.example.com/logs' }));
	 * ```
	 */
	addTransport(transport: Transport): void {
		this.transports.push(transport);
	}

	/**
	 * removes a specific transport from this logger instance.
	 *
	 * @param transport - the transport instance to remove
	 */
	removeTransport(transport: Transport): void {
		const index = this.transports.indexOf(transport);
		if (index > -1) {
			this.transports.splice(index, 1);
		}
	}

	/**
	 * removes all transports from this logger instance.
	 * after calling this, log entries will not be output anywhere until new transports are added.
	 */
	clearTransports(): void {
		this.transports = [];
	}

	/**
	 * initializes logger configuration from environment variables.
	 * supports LOG_LEVEL, NO_COLOUR, and NODE_ENV environment variables.
	 *
	 * @private
	 */
	private initializeFromEnvironment(): void {
		const envLevel = getEnv("LOG_LEVEL")?.toUpperCase();
		if (envLevel && envLevel in LogLevel) {
			this.options.level = LogLevel[envLevel as keyof typeof LogLevel];
		}

		if (getEnv("NO_COLOUR") || getEnv("NODE_ENV") === "test") {
			this.options.colourize = false;
		}
	}

	/**
	 * determines if a log entry should be processed based on the current log level.
	 *
	 * @param level - the level of the log entry to check
	 * @returns true if the entry should be logged, false otherwise
	 *
	 * @private
	 */
	private shouldLog(level: LogLevel): boolean {
		const effectiveLevel = this.options.level ?? Logger.globalLevel;
		return level >= effectiveLevel;
	}

	/**
	 * internal logging method that creates log entries and sends them to all transports.
	 * handles level filtering and error handling for transport failures.
	 *
	 * @param level - the log level
	 * @param message - the log message
	 * @param args - additional arguments to include with the log entry
	 *
	 * @private
	 */
	private log(level: LogLevel, message: string, ...args: unknown[]): void {
		if (!this.shouldLog(level)) {
			return;
		}

		const entry: LogEntry = {
			level,
			message,
			timestamp: new Date(),
			scope: [...this.scope],
			args,
			metadata: this.options.metadata,
		};

		// Send to all transports
		for (const transport of this.transports) {
			try {
				const result = transport.log(entry);
				if (result instanceof Promise) {
					result.catch((error) => {
						console.error("Transport error:", error);
					});
				}
			} catch (error) {
				console.error("transport error:", error);
			}
		}
	}

	/**
	 * logs a trace message. used for very detailed debugging information.
	 *
	 * @param message - the message to log
	 * @param args - additional arguments to include
	 *
	 * @example
	 * ```ts
	 * logger.trace('entering function', { functionName: 'processUser' });
	 * ```
	 */
	trace(message: string, ...args: unknown[]): void {
		this.log(LogLevel.TRACE, message, ...args);
	}

	/**
	 * logs a debug message. used for debugging information during development.
	 *
	 * @param message - the message to log
	 * @param args - additional arguments to include
	 *
	 * @example
	 * ```ts
	 * logger.debug('user data received', userData);
	 * ```
	 */
	debug(message: string, ...args: unknown[]): void {
		this.log(LogLevel.DEBUG, message, ...args);
	}

	/**
	 * logs an info message. used for general informational messages.
	 *
	 * @param message - the message to log
	 * @param args - additional arguments to include
	 *
	 * @example
	 * ```ts
	 * logger.info('server started on port 3000');
	 * ```
	 */
	info(message: string, ...args: unknown[]): void {
		this.log(LogLevel.INFO, message, ...args);
	}

	/**
	 * logs a warning message. used for potentially harmful situations.
	 *
	 * @param message - the message to log
	 * @param args - additional arguments to include
	 *
	 * @example
	 * ```ts
	 * logger.warn('deprecated api endpoint used', { endpoint: '/old-api' });
	 * ```
	 */
	warn(message: string, ...args: unknown[]): void {
		this.log(LogLevel.WARN, message, ...args);
	}

	/**
	 * logs an error message. used for error conditions that don't require immediate attention.
	 *
	 * @param message - the message to log
	 * @param args - additional arguments to include
	 *
	 * @example
	 * ```ts
	 * logger.error('failed to process request', error);
	 * ```
	 */
	error(message: string, ...args: unknown[]): void {
		this.log(LogLevel.ERROR, message, ...args);
	}

	/**
	 * logs a fatal message. used for severe error events that may lead to application termination.
	 *
	 * @param message - the message to log
	 * @param args - additional arguments to include
	 *
	 * @example
	 * ```ts
	 * logger.fatal('database connection lost', { attempts: 3 });
	 * ```
	 */
	fatal(message: string, ...args: unknown[]): void {
		this.log(LogLevel.FATAL, message, ...args);
	}

	/**
	 * creates a child logger with additional scope.
	 * child loggers inherit all transports from their parent.
	 *
	 * @param scope - additional scope to append to the current scope
	 * @param options - options to override from parent logger
	 * @returns new `Logger` instance with extended scope
	 *
	 * @example single scope
	 * ```ts
	 * const apiLogger = logger.child('api');
	 * apiLogger.info('api request received'); // logs with scope ['app', 'api']
	 * ```
	 *
	 * @example multiple scopes
	 * ```ts
	 * const authLogger = apiLogger.child(['auth', 'login']);
	 * // results in scope: ['app', 'api', 'auth', 'login']
	 * ```
	 *
	 * @example with options override
	 * ```ts
	 * const debugLogger = logger.child('debug', { level: LogLevel.DEBUG });
	 * ```
	 */
	child(scope: string | string[], options: LoggerOptions = {}): Logger {
		const newScope = Array.isArray(scope)
			? [...this.scope, ...scope]
			: [...this.scope, scope];

		const childLogger = new Logger(newScope, {
			...this.options,
			...options,
		});

		// copy transports to child
		childLogger.clearTransports();
		for (const transport of this.transports) {
			childLogger.addTransport(transport);
		}

		return childLogger;
	}

	/**
	 * creates a new logger instance with additional metadata.
	 * useful for adding context information to all log entries from this logger.
	 *
	 * @param metadata - additional metadata to merge with existing metadata
	 * @returns new logger instance with combined metadata
	 *
	 * @example
	 * ```ts
	 * const requestLogger = logger.withMetadata({
	 *   requestId: 'req-123',
	 *   userId: 'user-456'
	 * });
	 *
	 * requestLogger.info('processing request');
	 * // all logs will include the requestId and userId metadata
	 * ```
	 */
	withMetadata(metadata: Record<string, unknown>): Logger {
		return new Logger(this.scope, {
			...this.options,
			metadata: { ...this.options.metadata, ...metadata },
		});
	}
}
