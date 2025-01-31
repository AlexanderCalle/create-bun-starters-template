import path from 'path'
import fs from 'fs-extra'

import type { DatabaseProvider, PkgInstallerMap } from "~/installers";
import { getUserPkgManager } from "~/utils/getUserPkgManager";
import { scaffoldProject } from '~/helpers/scaffoldProject';
import type { ProjectType } from '~/cli';
import { installPackages } from './installPackages';

interface CreateProjectOptions {
  projectName: string;
  packages: PkgInstallerMap;
  projectDest: string;
  noInstall: boolean;
  databaseProvider: DatabaseProvider;
  projectType: ProjectType;
}

export const createProject = async ({
  projectName,
  packages,
  projectDest,
  noInstall,
  databaseProvider,
  projectType
}: CreateProjectOptions) => {

  const pkgManager = getUserPkgManager();
  const projectDir = path.resolve(process.cwd(), projectDest);

  await scaffoldProject({
    projectName,
    projectDir,
    pkgManager,
    databaseProvider,
    noInstall,
    projectType
  });

  await installPackages({
    projectName,
    projectDir,
    pkgManager,
    packages,
    noInstall,
    databaseProvider,
    projectType
  })

  return projectDir
}