import configuration from './configuration';
import { validateEnv } from './env.validation';

export default () => ({
  isGlobal: true,
  load: [configuration],
  envFilePath: ['.env', '.env.local', '.env.production'],
  validate: validateEnv,
});
