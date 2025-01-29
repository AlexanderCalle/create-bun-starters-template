import path from 'path'
import fs from 'fs-extra'

import { _initialConfig } from '~/../templates/extras/config/_eslint';
import { type Installer } from '~/installers/index';

export const dynamicEslintInstaller: Installer = ({ projectDir }) => {
  const eslintConfig = _initialConfig;

  // Convert config from _eslint.config.json to .eslintrc.cj
  const eslintrcFileContents = [
    '/** @type {import("eslint").Linter.Config} */',
    `const config = ${JSON.stringify(eslintConfig, null, 2)}`,
    "module.exports = config;"
  ].join("\n");

  const eslintConfigDest = path.join(projectDir, ".eslintrc.cjs");
  fs.writeFileSync(eslintConfigDest, eslintrcFileContents, "utf-8");
}