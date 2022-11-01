import { DEFAULT_PORT } from './consts';
import packageConfig from '../package.json';

// App general
export const applicationName: string = packageConfig.name;
export const port: number = parseInt(process.env.DEFAULT_PORT, 10) || DEFAULT_PORT;
export const version: string = packageConfig.version;

const requiredParameters = {
  applicationName,
  port,
  version,
};

const validateUndefinedConfig = (config: object) => {
  Object.entries(config).forEach(entry => {
    const [key, value] = entry;
    if (value === undefined || value === null) {
      throw new Error(`the required config parameter ${key} is undefined/null`);
    }
    if (typeof value === 'object') {
      validateUndefinedConfig(value);
    }
  });
};

validateUndefinedConfig(requiredParameters);
