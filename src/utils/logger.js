// Production console logger - only logs errors in production
export const Logger = {
  log: (...args) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  
  debug: (...args) => {
    if (__DEV__) {
      console.debug(...args);
    }
  },
  
  warn: (...args) => {
    console.warn(...args);
  },
  
  error: (...args) => {
    console.error(...args);
  },
  
  info: (...args) => {
    if (__DEV__) {
      console.info(...args);
    }
  }
};
