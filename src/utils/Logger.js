const chalk = require("chalk");

const log_levels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

class Logger {
  constructor(options) {
    this.options = options;
  }

  log(message, level) {
    if (!level) level = "info";
    console.log(`[${chalk.blueBright(new Date().toLocaleString())}] [${chalk.greenBright(level.toUpperCase())}] ${message}`);
  }

  logCustom(message, level, color) {
    if (!level) level = "info";
    if (!color) throw new Error("No color provided");
    console.log(`[${chalk.blueBright(new Date().toLocaleString())}] [${chalk[color](level.toUpperCase())}] ${message}`);
  }

  warn(message, level) {
    if (!message) throw new Error("No message provided");
    console.log(`[${chalk.blueBright(new Date().toLocaleString())}] [${chalk.yellowBright(level.toUpperCase())}] ${message}`);
  }


}

module.exports = Logger;