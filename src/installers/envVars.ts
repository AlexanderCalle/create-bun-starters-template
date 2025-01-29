import crypto from 'node:crypto'
import path from 'path'
import fs from 'fs-extra'

import { PKG_ROOT } from '~/consts'
import { type DatabaseProvider, type Installer } from '~/installers/index'

export const envVariablesInstaller: Installer = ({
  projectDir,
  packages,
  databaseProvider,
  projectName
}) => {
  const usingPrisma = packages?.prisma.inUse;

  const envContent = getEnvContent(
    !!usingPrisma,
    databaseProvider,
    projectName
  );

  // BUG: this is only the env file for the frontend part
  // FIXME: make env file for the db as well
  let envFile = "";
  // TODO: extra check if backend or frontend needed...
  if (usingPrisma) {
    // INFO: file for frontend env variables
    envFile = "with-db.js"
  }

  if(envFile !== "") {
    const envSchemaSrc = path.join(
      PKG_ROOT,
      "template/extras/src/env",
      envFile
    );
    const envSchemaDest = path.join(projectDir, "src/env.js");
    fs.copyFileSync(envSchemaSrc, envSchemaDest);
  }

  const envDest = path.join(projectDir, ".env");
  const envExampleDest = path.join(projectDir, ".env.example");

  const _exampleEnvContent = exampleEnvContent + envContent;

  fs.writeFileSync(envDest, envContent, "utf-8");
  fs.writeFileSync(envExampleDest, _exampleEnvContent, "utf-8");
};

const getEnvContent = (
  usingPrisma: boolean,
  databaseProvider: DatabaseProvider,
  appName: string
) => {
  let content = `
# When adding additional environment variables, the schema in "/src/env.js"
# should be updated accordingly.
  `
  .trim()
  .concat("\n")

  if(usingPrisma) {
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
