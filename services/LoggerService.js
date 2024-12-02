class LoggerService {
  constructor() {
    this.debugMode = true;  // Toggle this for production
  }

  info(component, message, data = null) {
    if (this.debugMode) {
      const logMessage = this._formatMessage('INFO', component, message, data);
      console.log(logMessage);
    }
  }

  error(component, message, error = null) {
    const logMessage = this._formatMessage('ERROR', component, message, error);
    console.error(logMessage);
  }

  warn(component, message, data = null) {
    if (this.debugMode) {
      const logMessage = this._formatMessage('WARN', component, message, data);
      console.warn(logMessage);
    }
  }

  debug(component, message, data = null) {
    if (this.debugMode) {
      const logMessage = this._formatMessage('DEBUG', component, message, data);
      console.debug(logMessage);
    }
  }

  _formatMessage(level, component, message, data) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${level}][${timestamp}][${component}] ${message}`;
    
    if (data) {
      if (data instanceof Error) {
        return `${formattedMessage}\nError: ${data.message}\nStack: ${data.stack}`;
      }
      return `${formattedMessage}\nData: ${JSON.stringify(data, null, 2)}`;
    }
    
    return formattedMessage;
  }
}

export const logger = new LoggerService(); 