import { Command, program } from 'commander'
import chalk from 'chalk';
import * as p from '@inquirer/prompts';
import { databaseProviders, type AvailablePackages,type DatabaseProvider } from '../installers';
import { CREATE_BUN_APP, DEFAULT_APP_NAME } from '../consts';
import { getVersion } from '../utils/getCliVersion';
import { logger } from '../utils/logger';
import { IsTTYError } from '../utils/isTTYError';
import { getUserPkgManager } from '../utils/getUserPkgManager';

const types = ["Fullstack", "Backend", "Frontend"] as const
export type ProjectType = typeof types[number]

const backendFrameworks = ["Nestjs", "Express"] as const
export type BackendFramework = typeof backendFrameworks[number]

const frontendFrameworks = ["Nextjs", "Vite"] as const
export type FrontendFramework = typeof frontendFrameworks[number];

export interface ProjectInfo {
  type: ProjectType;
  frontend?: FrontendFramework;
  backend?: BackendFramework;
}

// TODO: add support to add ShadCn

interface ProjectPrompts {
  type: ProjectType;
  backendFramework?: BackendFramework;
  frontendFramework?: FrontendFramework
  styling: boolean;
  prisma: boolean;
  dbProvider: DatabaseProvider;
  install: boolean;
}

interface CliFlags {
  type: ProjectType;
  default: boolean;
  noInstall: boolean;
  dbProvider: DatabaseProvider;
  backendFramework?: BackendFramework;
  frontendFramework?: FrontendFramework;
}

interface CliResults {
  appName: string;
  dirPath: string;
  packages: AvailablePackages[]
  flags: CliFlags;
  databaseProvider: DatabaseProvider;
}

const defaultOptions: CliResults = {
  appName: DEFAULT_APP_NAME,
  dirPath: '.',
  packages: ["prisma", "tailwind"],
  flags: {
    type: 'Fullstack',
    default: false,
    noInstall: false,
    dbProvider: 'postgres',
    backendFramework: 'Nestjs',
    frontendFramework: 'Nextjs'
  },
  databaseProvider: 'postgres'
}

export const runCli = async (): Promise<CliResults> => {
  const cliResults = defaultOptions;

  const program = new Command()
    .name(CREATE_BUN_APP)
    .description("A CLI for creating web applications with predefined templates.")
    .argument("<name>", "The name of the application (also the folder name).")
    .argument("[path]", "The path where the applocation folder will be created.", ".")
    .option("-y, --default", "Bypass the CLI and use all default options to bootstrap a new bun-app.", false)
    .option("--noInstall", "Explicitly tell the CLI to not run the package manager's install command.", false)
    .version(getVersion(), "-v, --version", "Display the version number")
    .addHelpText("afterAll", 
      `\n The bun-cli was inspired by ${chalk
        .hex("#E8DCFF")
        .bold(
          "@t3dotgg"
        )} and has been used to build awesome fullstack applications like ${chalk
        .hex("#E24A8D")
        .underline("https://despieghel.be")} \n`
    )
    .parse(process.argv);

  cliResults.appName = program.args[0]
  cliResults.dirPath = program.args[1] ?? '.'


  cliResults.flags = {
    ...cliResults.flags,
    default: program.opts().default,
    noInstall: program.opts().noInstall,
  }

  if(cliResults.flags.default) {
    return cliResults
  }

  try {
    if (process.env.TERM_PROGRAM?.toLowerCase().includes("mintty")) {
      logger.warn(` WARNING: It looks like you are using MinTTY, which is non-interactive. This is most likely because you are
  using Git Bash. If that's that case, please use Git Bash from another terminal, such as Windows Terminal.`);

      throw new IsTTYError("Non-interactive environment");
    }

    const pkgManager = getUserPkgManager();

    let project: ProjectPrompts = {
      type: defaultOptions.flags.type,
      backendFramework: undefined,
      frontendFramework: undefined,
      styling: true,
      prisma: true,
      install: !defaultOptions.flags.noInstall,
      dbProvider: defaultOptions.flags.dbProvider
    }

    project.type = await p.select({
      message: "What type of project do you want? ",
      choices: types
    })

    if(project.type === 'Fullstack' || project.type === 'Backend') {
      project.backendFramework = await p.select<BackendFramework>({
        message: "Which backend framework do you want to use?",
        choices: backendFrameworks,
      })
    }

    if(project.type === 'Frontend' || project.type === 'Fullstack') {
      project.frontendFramework = await p.select({
        message: "Wich frontend framework do you want to use?",
        choices: frontendFrameworks
      })
    }

    project.styling = await p.confirm({
      message: "Do you want to use tailwind?",
    })

    project.prisma = await p.confirm({
      message: "Do you want to use Prisma?"
    });

    project.dbProvider = await p.select({
      message: "Which database provider do you want to use?",
      choices: databaseProviders
    })

    if(!cliResults.flags.noInstall) {
      project.install = await p.confirm({
        message:
          `Should we run '${pkgManager}` +
          (pkgManager === "yarn" ? `'?` : ` install' for you?`),
        default: !defaultOptions.flags.noInstall,
      })
    }

    const packages: AvailablePackages[] = [];
    if(project.styling) packages.push("tailwind")
    if(project.prisma) packages.push("prisma")
    
    return {
      appName: cliResults.appName,
      dirPath: cliResults.dirPath,
      packages,
      databaseProvider: (project.dbProvider as DatabaseProvider) || 'sqlite',
      flags: {
        ...cliResults.flags,
        type: project.type,
        backendFramework: project.backendFramework,
        frontendFramework: project.frontendFramework,
        dbProvider: project.dbProvider,
        noInstall: !project.install || cliResults.flags.noInstall
      } 
    }
  } catch(err) {
    // If the user is not calling create-bun-cli from an interactive terminal, inquirer will throw an IsTTYError
    // If this happens, we catch the error, tell the user what has happened, and then continue to run the program with a default bun app
    if (err instanceof IsTTYError) {
      logger.warn(`${CREATE_BUN_APP} needs an interactive terminal to provide options`);

      const shouldContinue = await p.confirm({
        message: `Continue scaffolding a default bun app?`,
      });

      if (!shouldContinue) {
        logger.info("Exiting...");
        process.exit(0);
      }

      logger.info(`Bootstrapping a default T3 app in ./${cliResults.appName}`);
    } else {
      throw err;
    }
  }

  // Add return statement with default options
  return cliResults;
}