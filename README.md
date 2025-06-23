# lily

a small logging library for javascript.

## installation

your local package manager's method of installation.

## why lily?

it has a pretty name.

lily is simple, designed for my very simple mind and has, i think? everything
a simpler project would need.

all the other logging libs seemed very old and complex to me (i just didn't want
to read the docs actually but same thing).

## quick start

```ts
import logger from "lily";

logger.info("hello world");
logger.error("something went wrong", { userId: 123 });

// create child loggers with scope
const dbLogger = logger.child("database");
dbLogger.info("connected to postgres");

const userLogger = dbLogger.child("users");
userLogger.debug("user query executed", { query: "SELECT * FROM users" });
```

## core concepts

### transports

transports are where your logs go. console, files, http endpoints, databases -
anywhere you want, lily supports a `ConsoleTransport` and `FileTransport` out of
the box, but you can create your own.

```ts
import { Logger, ConsoleTransport, FileTransport } from "lily";

const logger = new Logger("myapp");
logger.addTransport(new ConsoleTransport());
logger.addTransport(new FileTransport({ filename: "app.log" }));

// this goes to both console and file
logger.info("user logged in");
```

### formatters

formatters control how your logs look. pretty colours for dev, & structured
json for prod.

```ts
import { ConsoleFormatter, JsonFormatter } from "lily";

// pretty colours for humans
const prettyFormatter = new ConsoleFormatter({
  colourize: true,
  timeFormat: "locale",
});

// structured data for machines
const jsonFormatter = new JsonFormatter();
```

### scopes

scopes give your logs context, they're like breadcrumbs through your
application.

```ts
const apiLogger = logger.child("api");
const authLogger = apiLogger.child("auth");

// scope: [app/api/auth]
authLogger.info("login attempt", { email: "user@example.com" });
```

## log levels

```ts
logger.trace("detailed debugging info");
logger.debug("debug information");
logger.info("general information");
logger.warn("warning messages");
logger.error("error messages");
logger.fatal("critical errors");
```

set log level globally:

```ts
import { Logger, LogLevel } from "lily";
Logger.setGlobalLevel(LogLevel.WARN); // only warnings and above
```

or via environment:

```bash
LOG_LEVEL=DEBUG node app.js
```

## custom transports

creating a custom transport is simple - just impl the `Transport` interface and
wow your logs are going to space or idk wherever you want them to go.

```ts
import { Transport, LogEntry } from "lily";

class DiscordTransport implements Transport {
  constructor(private webhookUrl: string) {}

  async log(entry: LogEntry): Promise<void> {
    if (entry.level < LogLevel.ERROR) return; // errors only

    await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `(${entry.scope.join("/")}) ${entry.message}`,
      }),
    });
  }
}
class DiscordTransport implements Transport {
  constructor(private webhookUrl: string) {}

  async log(entry: LogEntry): Promise<void> {
    if (entry.level < LogLevel.ERROR) return; // errors only

    await fetch(this.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `[${entry.scope.join("/")}] ${entry.message}`,
      }),
    });
  }
}

logger.addTransport(
  new DiscordTransport("https://discord.com/api/webhooks/..."),
);
```

## custom formatters

formatters convert `LogEntry` objects to strings:

```ts
import { LogEntry, LogLevel } from "lily";

class SimpleFormatter {
  format(entry: LogEntry): string {
    const level = LogLevel[entry.level];
    const scope = entry.scope.length > 0 ? `[${entry.scope.join("/")}] ` : "";
    return `${level}: ${scope}${entry.message}`;
  }
}

// use it
const transport = new ConsoleTransport(new SimpleFormatter());
logger.addTransport(transport);
```

## custom logger setup

build your perfect logger:

```ts
import {
  Logger,
  LogLevel,
  ConsoleTransport,
  FileTransport,
  ConsoleFormatter,
  JsonFormatter,
} from "lily";

const logger = new Logger("myapp", {
  level: LogLevel.DEBUG,
  colourize: process.env.NODE_ENV !== "production",
});

// development: pretty console output
if (process.env.NODE_ENV === "development") {
  logger.addTransport(
    new ConsoleTransport(
      new ConsoleFormatter({
        colourize: true,
        timeFormat: "time",
      }),
    ),
  );
}

// production: structured file logs
if (process.env.NODE_ENV === "production") {
  logger.addTransport(
    new FileTransport({
      filename: "app.log",
      formatter: new JsonFormatter(),
    }),
  );
}

export default logger;
```

## environment variables

- `LOG_LEVEL` - set log level (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
- `NO_COLOUR` - disable colours in output
- `NODE_ENV=test` - automatically disables colours

## metadata and context

add structured data to your logs:

```ts
// add metadata to individual logs
logger.info("user action", {
  userId: 123,
  action: "login",
  ip: "192.168.1.1",
});

// create logger with persistent metadata
const requestLogger = logger.withMetadata({
  requestId: "req-abc123",
  userId: 456,
});

requestLogger.info("processing request"); // includes metadata
requestLogger.error("request failed"); // includes metadata
```

## api reference

### logger methods

```ts
logger.trace(message: string, ...args: unknown[])
logger.debug(message: string, ...args: unknown[])
logger.info(message: string, ...args: unknown[])
logger.warn(message: string, ...args: unknown[])
logger.error(message: string, ...args: unknown[])
logger.fatal(message: string, ...args: unknown[])

logger.child(scope: string | string[], options?: LoggerOptions): Logger
logger.withMetadata(metadata: Record<string, unknown>): Logger

logger.addTransport(transport: Transport): void
logger.removeTransport(transport: Transport): void
logger.clearTransports(): void
```

### static methods

```ts
Logger.setGlobalLevel(level: LogLevel): void
Logger.getGlobalLevel(): LogLevel
```

## examples

### basic file logging

```ts
import { Logger, FileTransport, JsonFormatter } from "lily";

const logger = new Logger("app");
logger.addTransport(
  new FileTransport({
    filename: "application.log",
    formatter: new JsonFormatter(),
  }),
);

logger.info("application started");
```

### multiple transports

```ts
import {
  Logger,
  ConsoleTransport,
  FileTransport,
  ConsoleFormatter,
  JsonFormatter,
} from "lily";

const logger = new Logger("api");

// pretty console output
logger.addTransport(
  new ConsoleTransport(new ConsoleFormatter({ colourize: true })),
);

// structured file output
logger.addTransport(
  new FileTransport({
    filename: "api.log",
    formatter: new JsonFormatter(),
  }),
);

logger.info("server starting on port 3000");
```

### request logging middleware

```ts
import { logger } from "./logger";

app.use((req, res, next) => {
  const requestLogger = logger.child("http").withMetadata({
    requestId: crypto.randomUUID(),
    method: req.method,
    url: req.url,
  });

  requestLogger.info("request started");

  res.on("finish", () => {
    requestLogger.info("request completed", {
      statusCode: res.statusCode,
    });
  });

  req.logger = requestLogger;
  next();
});
```

## license

gpl-3.0 - see [LICENSE.GPL-3.0] for details.
