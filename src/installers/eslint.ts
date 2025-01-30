import path from 'path'
import fs from 'fs-extra'

import { _initialConfig } from '~/../templates/extras/config/_eslint';
import { _initialConfigNest } from '~/../templates/extras/config/_eslintrc_nest'
import { type Installer } from '~/installers/index';

export const dynamicEslintInstaller: Installer = ({ projectDir, projectType }) => {
  
  switch(projectType) {
    case "Backend": 
      eslintInstaller({
        projectDir,
        initialConfig: _initialConfigNest
      })
      break;
    case "Frontend": 
      eslintInstaller({
        projectDir,
        initialConfig: _initialConfig
      })
      break;
    case "Fullstack":
      eslintInstaller({
        projectDir: path.join(projectDir, "packages/client"),
        initialConfig: _initialConfig
      })
      eslintInstaller({
        projectDir: path.join(projectDir, "packages/server"),
        initialConfig: _initialConfigNest
      })
      break;
  }

}

interface EslintInstallerOptions {
  projectDir: string;
  initialConfig: JSON;
}

const eslintInstaller = ({
  projectDir,
  initialConfig
}: EslintInstallerOptions) => {
  const eslintConfig = initialConfig;
 
  // Convert config from _eslint.config.json to .eslintrc.cj
  const eslintrcFileContents = [
    '/** @type {import("eslint").Linter.Config} */',
    `const config = ${JSON.stringify(eslintConfig, null, 2)}`,
    "module.exports = config;"
  ].join("\n");

  const eslintConfigDest = path.join(projectDir, ".eslintrc.cjs");
  fs.writeFileSync(eslintConfigDest, eslintrcFileContents, "utf-8");
}