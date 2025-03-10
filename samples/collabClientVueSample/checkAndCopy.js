import path from 'path';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_PATH = resolve(__dirname, '../../');
const publicDir = path.join(__dirname, 'public');
const foxitWebSdkDir = path.join(publicDir, 'foxitwebsdk');

const nodeModulesDir = path.join(PROJECT_PATH, "node_modules/@foxitsoftware/foxit-pdf-sdk-for-web-library");

fse.copySync(path.join(nodeModulesDir, 'lib'), path.join(foxitWebSdkDir, 'lib'));
fse.copySync(path.join(nodeModulesDir, 'server'), path.join(foxitWebSdkDir, 'server'));