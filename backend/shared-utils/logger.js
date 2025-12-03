const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const LOG_LEVEL = process.env.LOG_LEVEL || "info";

class Logger {
  static timestamp() {
    return new Date().toISOString();
  }

  static formatMessage(level, color, message) {
    return `${colors[color]}[${level}]${colors.reset} ${
      colors.cyan
    }[${this.timestamp()}]${colors.reset} ${message}`;
  }

  static info(message, ...args) {
    console.log(this.formatMessage("INFO", "green", message), ...args);
  }

  static error(message, ...args) {
    console.error(this.formatMessage("ERROR", "red", message), ...args);
  }

  static warn(message, ...args) {
    console.warn(this.formatMessage("WARN", "yellow", message), ...args);
  }

  static debug(message, ...args) {
    if (LOG_LEVEL === "debug") {
      console.log(this.formatMessage("DEBUG", "magenta", message), ...args);
    }
  }
}

module.exports = Logger;
