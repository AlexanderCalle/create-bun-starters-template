import chalk from "chalk";
import { TITLE_TEXT } from "../consts";
import { getUserPkgManager } from "./getUserPkgManager";

export const renderTitle = () => {
  const pkgManager = getUserPkgManager();
  if (pkgManager === "yarn" || pkgManager === "pnpm") {
    console.log("");
  }
  console.log(chalk.magenta(TITLE_TEXT));
}