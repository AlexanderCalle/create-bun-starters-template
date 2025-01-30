import path from 'path'
import fs from 'fs-extra'
import type { ProjectInfo } from '~/cli';

interface CreateProjectDirOptions {
  projectName: string;
  dirPath: string;
  projectInfo: ProjectInfo;
}

export const createProjectDir = async ({
  projectName,
  dirPath,
  projectInfo
}: CreateProjectDirOptions): Promise<string> => {

  const projectDir = path.join(dirPath, projectName)

  return projectDir
}