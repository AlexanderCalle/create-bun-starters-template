import type { PackageManager } from "../utils/getUserPkgManager";
import { prismaInstaller } from "./prisma";
import { tailwindInstaller } from "./tailwind";
import { envVariablesInstaller } from "./envVars";
import { dynamicEslintInstaller } from "./eslint";
import type { ProjectType } from "~/cli";

export const availablePackages = [
  "prisma",
  "tailwind",
  "eslint",
  "envVariables"
] as const;
export type AvailablePackages = (typeof availablePackages)[number];


export const databaseProviders = [
  "mysql",
  "postgres",
  "sqlite",
] as const;
export type DatabaseProvider = (typeof databaseProviders)[number];

export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages?: PkgInstallerMap;
  projectName: string;
  databaseProvider: DatabaseProvider;
  projectType: ProjectType;
}

export type Installer = (opts: InstallerOptions) => void;

export type PkgInstallerMap = {
  [pkg in AvailablePackages]: {
    inUse: boolean;
    installer: Installer;
  }
}

export const buildPkgInstallerMap = (
  packages: AvailablePackages[],
  databaseProvider: DatabaseProvider
): PkgInstallerMap => ({
  prisma: {
    inUse: packages.includes("prisma"),
    installer: prismaInstaller
  },
  tailwind: {
    inUse: packages.includes("tailwind"),
    installer: tailwindInstaller,
  },
  envVariables: {
    inUse: true,
    installer: envVariablesInstaller,
  },
  eslint: {
    inUse: true,
    installer: dynamicEslintInstaller
  }
})