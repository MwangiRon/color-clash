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

  static info(message, ...args) {
    console.log(
      `${colors.green}[INFO]${colors.reset} ${
        colors.cyan
      }[${this.timestamp()}]${colors.reset} ${message}`,
      ...args
    );
  }

  static error(message, ...args) {
    console.error(
      `${colors.red}[ERROR]${colors.reset} ${colors.cyan}[${this.timestamp()}]${
        colors.reset
      } ${message}`,
      ...args
    );
  }

  static warn(message, ...args) {
    console.warn(
      `${colors.yellow}[WARN]${colors.reset} ${
        colors.cyan
      }[${this.timestamp()}]${colors.reset} ${message}`,
      ...args
    );
  }

  static debug(message, ...args) {
    if (LOG_LEVEL === "debug") {
      console.log(
        `${colors.magenta}[DEBUG]${colors.reset} ${
          colors.cyan
        }[${this.timestamp()}]${colors.reset} ${message}`,
        ...args
      );
    }
  }
}

module.exports = Logger;
