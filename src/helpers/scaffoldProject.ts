import path from 'path'
import * as p from '@inquirer/prompts'
import chalk from 'chalk'
import fs from 'fs-extra'
import ora from 'ora'

import { PKG_ROOT } from '~/consts'
import { type InstallerOptions } from '~/installers';
import { logger } from '~/utils/logger';

// This bootstraps the base Fullstack | Backend | Frontend application
export const scaffoldProject = async ({
  projectName,
  projectDir,
  pkgManager,
  noInstall,
  projectInfo
}: InstallerOptions) => {
  const srcDir = path.join(PKG_ROOT, "templates/bases", projectInfo.type.toLowerCase());
  
  if(!noInstall) {
    logger.info(`Using: ${chalk.cyan.bold(pkgManager)}\n`);
  } else {
    logger.info("")
  }

  const spinner = ora(`Scaffolding in: ${projectDir}...\n`).start();

  if(fs.existsSync(projectDir)) {
    if(fs.readdirSync(projectDir).length === 0) {
      spinner.info(
        `${chalk.cyan.bold(projectDir)} exists but is empty, continuing...\n`
      )
    } else {
      spinner.stopAndPersist();

      const overwriteDir = await p.select({
        message: `${chalk.redBright.bold("Warning:")} ${chalk.cyan.bold(projectDir)} already exists and isn't empty. How would you like to proceed?`,
        choices: [
          {
            name: "Abort installation (recommended)",
            value: "abort",
          },
          {
            name: "Clear the directory and continue installation",
            value: "clear"
          },
          {
            name: "Continue installation and overwrite conflicting files",
            value: "overwrite"
          }
        ],
        default: "abort"
      }).catch((error) => {
        if(error.name === 'AbortPromptError') {
          return "abort"
        }
      })

      if(overwriteDir === 'abort') {
        spinner.fail("Aborting installation...");
        process.exit(1)
      }

      const confirmOverwriteDir = await p.confirm({
        message: `Are you sure you want to ${
          overwriteDir === "clear" 
            ? "clear the directory"
            : "overwrite conflicting files"
        }`,
        default: false
      }).catch((err) => {
        if(err.name === "AbortPromptError") {
          return false
        }
      })

      if(!confirmOverwriteDir) {
        spinner.fail("Aborting installation...");
        process.exit(1)
      }

      if(overwriteDir === "clear") {
        spinner.info(
          `Emptying ${chalk.cyan.bold(projectDir)} and creating bun app..\n`
        );
        fs.emptyDirSync(projectDir)
      }
    }
  }

  spinner.start();

  // FIXME: Needs updating to select specific framework
  // Do we need the frameworks tho?? we can just select one (Nestjs and Nextjs)
  fs.copySync(srcDir, projectDir);
  fs.renameSync(
    path.join(projectDir, '_gitignore'),
    path.join(projectDir, '.gitignore')
  );

  spinner.succeed(
    `${chalk.cyan.bold(projectName)} ${chalk.green("scaffolded successfully!")}\n`
  )
}