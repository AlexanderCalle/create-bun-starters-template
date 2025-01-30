#! /usr/bin/env bun
import { runCli } from "~/cli"
import { buildPkgInstallerMap } from "~/installers"
import { getUserPkgManager } from "~/utils/getUserPkgManager"
import { logger } from "~/utils/logger"
import { renderTitle } from "~/utils/renderTitle"
import { createProject } from "./helpers/createProject"
import path from "path"

const main = async () => {
  const pkgManager = getUserPkgManager()
  renderTitle()

  const {
    appName,
    dirPath,
    packages,
    flags: { noInstall, dbProvider, type, backendFramework, frontendFramework },
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
    projectInfo: {
      type,
      backend: backendFramework,
      frontend: frontendFramework
    }
  })

  logger.success("CLI completed:")
  logger.success(`
    name = ${appName}
    directory path = ${dirPath}
    packages = [${packages.join(', ')}]
    flags: 
    \t noInstall = ${noInstall ? "yes" : "no"}
    \t database provider = ${dbProvider}
    \t project type = ${type}
    \t backend framework = ${backendFramework ?? "no framework"}
    \t frontend framework = ${frontendFramework ?? "no framework"}
    database provider = ${databaseProvider}
    `)
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