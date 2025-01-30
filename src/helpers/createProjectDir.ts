import path from 'path'
import fs from 'fs-extra'
import type { ProjectType } from '~/cli';

interface CreateProjectDirOptions {
  projectName: string;
  dirPath: string;
  projectType: ProjectType;
}

export const createProjectDir = async ({
  projectName,
  dirPath,
  projectType
}: CreateProjectDirOptions): Promise<string> => {

  const projectDir = path.join(dirPath, projectName)

  return projectDir
}