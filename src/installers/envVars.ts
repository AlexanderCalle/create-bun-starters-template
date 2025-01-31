import path from 'path'
import fs from 'fs-extra'

import { PKG_ROOT } from '~/consts'
import { type DatabaseProvider, type Installer } from '~/installers/index'
import type { ProjectType } from '~/cli'
import { addPackageDependency } from '~/utils/addPackageDependency'

export const envVariablesInstaller: Installer = ({
  projectDir,
  packages,
  databaseProvider,
  projectName,
  projectType
}) => {
  const usingPrisma = packages?.prisma.inUse;

  const envContent = projectType === "Fullstack"
  ? getFullEnvContent(
      !!usingPrisma,
      databaseProvider,
      projectName,
    )
  : getEnvContent(
    !!usingPrisma,
    databaseProvider,
    projectName,
    projectType
  );

  let envFile = "";
  if (usingPrisma) {
    // INFO: file for frontend env variables
    envFile = "with-db.js"
  }

  if(envFile !== "" && (projectType !== "Backend")) {
    const envSchemaSrc = path.join(
      PKG_ROOT,
      "templates/extras/src/env",
      envFile
    );

    addPackageDependency({
    projectDir,
    dependencies: ["@t3-oss/env-nextjs"],
    devMode: true
  })

    const _projectPath = projectType === "Fullstack"
      ? path.join(projectDir, "packages/client")
      : projectDir
    const envSchemaDest = path.join(_projectPath, "env.js");
    fs.copyFileSync(envSchemaSrc, envSchemaDest);
  }

  if(projectType !== 'Fullstack' && typeof envContent === "string") {
    const envDest = path.join(projectDir, ".env");
    const envExampleDest = path.join(projectDir, ".env.example");
  
    const _exampleEnvContent = exampleEnvContent + envContent;
  
    fs.writeFileSync(envDest, envContent, "utf-8");
    fs.writeFileSync(envExampleDest, _exampleEnvContent, "utf-8");
  } else if(Array.isArray(envContent)) {
    let i = 0;
    ["packages/client", "packages/server"].forEach((dir) => {
      const _projectPath = path.join(projectDir, dir)
      const envDest = path.join(_projectPath, ".env");
      const envExampleDest = path.join(_projectPath, ".env.example");
    
      const _exampleEnvContent = exampleEnvContent + envContent[0];
    
      fs.writeFileSync(envDest, envContent[i], "utf-8");
      fs.writeFileSync(envExampleDest, _exampleEnvContent, "utf-8");
      i++;
    })
  }
};

const getFullEnvContent = (
  usingPrisma: boolean,
  databaseProvider: DatabaseProvider,
  appName: string,
): [string, string] => {
  const contentFront = getEnvContent(usingPrisma, databaseProvider, appName, "Frontend", true)
  const contentBack = getEnvContent(usingPrisma, databaseProvider, appName, "Backend", true)

  return [contentFront, contentBack]
}

const getEnvContent = (
  usingPrisma: boolean,
  databaseProvider: DatabaseProvider,
  appName: string,
  projectType: ProjectType,
  isFullstack: boolean = false
) => {


  let content = projectType !== "Backend" ? `
# When adding additional environment variables, the schema in "/src/env.js"
# should be updated accordingly.
  ` : "";

  content
    .trim()
    .concat("\n")

  if(usingPrisma && (!isFullstack || (isFullstack && projectType  === "Backend"))) {
    content += `
# Prisma
# https://www.prisma.io/docs/reference/database-reference/connection-urls#env
    `
    if(databaseProvider === "mysql") {
      content += `DATABASE_URL="mysql://root:password@localhost:3306/${appName}"`;
    } else if(databaseProvider === "postgres") {
      content += `DATABASE_URL="postgresql://postgres:password@localhost:5432/${appName}"`;
    } else if(databaseProvider === 'sqlite') {
      content += 'DATABASE_URL="file:./db.sqlite"';
    }
    content += "\n"
  }

  if(projectType === "Frontend") {
    content += `
# Backend Api url
NEXT_CLIENT_API_URL = http://localhost:${isFullstack ? "3030" : "3000"}
    `
    content += "\n"
  } else {
    content += `
# Api port
PORT = ${isFullstack ? "3030" : "3000"}
    `
  }

  return content;
}

const exampleEnvContent = `
# Since the ".env" file is gitignored, you can use the ".env.example" file to
# build a new ".env" file when you clone the repo. Keep this file up-to-date
# when you add new variables to \`.env\`.

# This file will be committed to version control, so make sure not to have any
# secrets in it. If you are cloning this repo, create a copy of this file named
# ".env" and populate it with your secrets.
`
  .trim()
  .concat("\n\n");
