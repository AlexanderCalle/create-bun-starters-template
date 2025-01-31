/*
 * This maps the necessary packages to a version.
 * This improves performance significantly over fetching it from the npm registry.
 */
export const dependencyVersionMap = {
  // Prisma
  prisma: "^5.14.0",
  "@prisma/client": "^5.14.0",
  
  // TailwindCSS
  tailwindcss: "^3.4.3",
  postcss: "^8.4.39",
  prettier: "^3.3.2",
  "prettier-plugin-tailwindcss": "^0.6.5",
  "@t3-oss/env-nextjs": "^0.12.0",
} as const;
export type AvailableDependencies = keyof typeof dependencyVersionMap;
