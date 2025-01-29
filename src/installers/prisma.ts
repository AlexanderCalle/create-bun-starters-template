import path from 'path'
import fs from 'fs-extra'
import { type PackageJson } from "type-fest"

import { PKG_ROOT } from '~/consts'
import { addPackageDependency } from '~/utils/addPackageDependency'
import type { Installer } from '~/installers'

export const prismaInstaller: Installer = ({
  projectDir,
  packages,
  databaseProvider
}) => {
  addPackageDependency({
    projectDir,
    dependencies: ["prisma"],
    devMode: true
  })

  addPackageDependency({
    projectDir, 
    dependencies: ["@prisma/client"],
    devMode: false
  })

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  const schemaSrc = path.join(extrasDir, "prisma/schema", "base.prisma");
  let schemaText = fs.readFileSync(schemaSrc, "utf-8")
  if(databaseProvider !== "sqlite") {
    schemaText = schemaText.replace(
      'provider = "sqlite"',
      `provider = ${
        {
          mysql: "mysql",
          postgres: "postgresql",
        }[databaseProvider]
      }`
    );

    if(["mysql"].includes(databaseProvider)) {
      schemaText = schemaText.replace("// @db.Text", "@db.Text");
    }
  }

  const schemaDest = path.join(projectDir, "prisma/schema.prisma")
  fs.mkdirSync(path.dirname(schemaDest), { recursive: true });
  fs.writeFileSync(schemaDest, schemaText);

  //BUG: needs checking first Wich type of project (if there is a frontend) 

  const clientSrc = path.join(
    extrasDir,
    "src/server/db/db-prisma.ts"
  );
  const clientDest = path.join(projectDir, 'src/server/db.ts');

  const packageJsonPath = path.join(projectDir, "package.json");

  const packageJsonContent = fs.readJSONSync(packageJsonPath) as PackageJson;
  packageJsonContent.scripts = {
    ...packageJsonContent.scripts,
    postinstall: "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma migrate dev",
    "db:migrate": "prisma migrate deploy",
  };

  fs.copySync(clientSrc, clientDest);
  fs.writeJSONSync(packageJsonPath, packageJsonContent, { spaces: 2 });
};