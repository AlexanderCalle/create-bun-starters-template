import path from 'path'
import fs from 'fs-extra'

import type { ProjectInfo } from "~/cli";
import type { DatabaseProvider, PkgInstallerMap } from "~/installers";
import { getUserPkgManager } from "~/utils/getUserPkgManager";
import { scaffoldProject } from '~/helpers/scaffoldProject';

interface CreateProjectOptions {
  projectName: string;
  packages: PkgInstallerMap;
  projectDest: string;
  noInstall: boolean;
  databaseProvider: DatabaseProvider;
  projectInfo: ProjectInfo;
}

export const createProject = async ({
  projectName,
  packages,
  projectDest,
  noInstall,
  databaseProvider,
  projectInfo
}: CreateProjectOptions) => {

  const pkgManager = getUserPkgManager();
  const projectDir = path.resolve(process.cwd(), projectDest);

  scaffoldProject({
    projectName,
    projectDir,
    pkgManager,
    databaseProvider,
    noInstall,
    projectInfo
  });

}