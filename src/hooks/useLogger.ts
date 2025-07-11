interface LogEntry {
  timestamp: number;
  type: 'INFO' | 'WARN' | 'ERROR';
  event: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];

  private constructor() {
    // Load existing logs from localStorage
    const savedLogs = localStorage.getItem('app_logs');
    if (savedLogs) {
      this.logs = JSON.parse(savedLogs);
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private saveLogs() {
    localStorage.setItem('app_logs', JSON.stringify(this.logs));
  }

  log(type: 'INFO' | 'WARN' | 'ERROR', event: string, data?: any) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      type,
      event,
      data
    };
    
    this.logs.push(entry);
    this.saveLogs();
    
    // Keep only last 1000 logs to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
      this.saveLogs();
    }
  }

  info(event: string, data?: any) {
    this.log('INFO', event, data);
  }

  warn(event: string, data?: any) {
    this.log('WARN', event, data);
  }

  error(event: string, data?: any) {
    this.log('ERROR', event, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }
}

export const useLogger = () => {
  const logger = Logger.getInstance();
  
  return {
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    getLogs: logger.getLogs.bind(logger),
    clearLogs: logger.clearLogs.bind(logger)
  };
};