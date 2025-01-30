#! /usr/bin/env bun
import path from "path"
import { execa } from "execa"
import fs from 'fs-extra'
import {type PackageJson } from 'type-fest' 

import { runCli } from "~/cli"
import { buildPkgInstallerMap } from "~/installers"
import { getUserPkgManager } from "~/utils/getUserPkgManager"
import { logger } from "~/utils/logger"
import { renderTitle } from "~/utils/renderTitle"
import { createProject } from "~/helpers/createProject"
import { installDependencies } from "./helpers/installDependencies"

const main = async () => {
  const pkgManager = getUserPkgManager()
  renderTitle()

  const {
    appName,
    dirPath,
    packages,
    flags: { noInstall, dbProvider, type },
    databaseProvider,
  } = await runCli();

  const usePackages = buildPkgInstallerMap(packages, databaseProvider);
  const projectDir = path.join(dirPath, appName)

  await createProject({
    projectName: appName,
    projectDest: projectDir,
    noInstall,
    databaseProvider,
    packages: usePackages,
    projectType: type,
  });

  // write name to package.json
  const pkgJson = fs.readJSONSync(path.join(projectDir, "package.json")) as PackageJson;
  pkgJson.name = appName;
  
  fs.writeJSONSync(path.join(projectDir, "package.json"), pkgJson, { spaces: 2 });

  // install dependecies with package manager
  if(!noInstall) {
    if(type !== "Fullstack")  
      await installDependencies({ projectDir })
    else {
      await installDependencies({ 
        projectDir: path.join(projectDir, "packages/client") 
      })
      await installDependencies({ 
        projectDir: path.join(projectDir, "packages/server") 
      })
    }
  }

  process.exit(0)
}

main().catch((err) => {
  logger.error("Aborting installation...")

  if (err instanceof Error) {
    logger.error(err);
  } else {
    logger.error(
      "An unknown error has occurred. Please open an issue on github with the below:"
    );
    console.log(err);
  }
  process.exit(1);
})