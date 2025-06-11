type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = import.meta.env.DEV;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const formattedMessage = this.formatMessage(level, message, context);
    
    if (this.isDevelopment) {
      // In development, log to console with colors
      const colorize = (msg: string, color: string) => `\x1b[${color}m${msg}\x1b[0m`;
      const colors = {
        debug: '36', // cyan
        info: '32',  // green
        warn: '33',  // yellow
        error: '31'  // red
      };

      console.log(
        colorize(`[${formattedMessage.timestamp}] ${level.toUpperCase()}:`, colors[level]),
        message,
        context || ''
      );
    } else {
      // In production, log structured JSON
      console.log(JSON.stringify(formattedMessage));
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }
}

export const logger = Logger.getInstance(); 