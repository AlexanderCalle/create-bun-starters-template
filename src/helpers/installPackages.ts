import chalk from "chalk";
import ora from "ora";

import { 
  type InstallerOptions,
  type PkgInstallerMap
} from "~/installers";
import { logger } from "~/utils/logger";

type InstallPackagesOptions = InstallerOptions & {
  packages: PkgInstallerMap
};

export const installPackages= (options: InstallPackagesOptions) => {
  const { packages } = options;
  logger.info("Adding boilerplate...");

  for(const [name, pkgOpts] of Object.entries(packages)) {
    if(pkgOpts.inUse) {
      const spinner = ora(`Boilerplating ${name}...`).start()
      pkgOpts.installer(options);
      spinner.succeed(
        chalk.green(
          `Successfully setup boilerplate for ${chalk.green.bold(name)}`
        )
      )
    }
  }
  
  logger.info('')
}