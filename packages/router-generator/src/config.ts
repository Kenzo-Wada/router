import path from 'path'
import { existsSync, readFileSync } from 'fs'
import {
  array,
  boolean,
  object,
  optional,
  parse,
  picklist,
  string,
} from 'valibot'
import type { InferOutput } from 'valibot'

export const configSchema = object({
  routeFilePrefix: optional(string()),
  routeFileIgnorePrefix: optional(string(), '-'),
  routeFileIgnorePattern: optional(string()),
  routesDirectory: optional(string(), './src/routes'),
  generatedRouteTree: optional(string(), './src/routeTree.gen.ts'),
  quoteStyle: optional(picklist(['single', 'double']), 'single'),
  semicolons: optional(boolean(), false),
  disableTypes: optional(boolean(), false),
  addExtensions: optional(boolean(), false),
  disableLogging: optional(boolean(), false),
  routeTreeFileHeader: optional(array(string()), [
    '/* prettier-ignore-start */',
    '/* eslint-disable */',
    '// @ts-nocheck',
    '// noinspection JSUnusedGlobalSymbols',
  ]),
  routeTreeFileFooter: optional(array(string()), ['/* prettier-ignore-end */']),
})
export type Config = InferOutput<typeof configSchema>

export async function getConfig(
  inlineConfig: Partial<Config> = {},
  configDirectory?: string,
): Promise<Config> {
  if (configDirectory === undefined) {
    configDirectory = process.cwd()
  }
  const configFilePathJson = path.resolve(configDirectory, 'tsr.config.json')
  const exists = existsSync(configFilePathJson)

  let config: Config

  if (exists) {
    config = parse(configSchema, {
      ...JSON.parse(readFileSync(configFilePathJson, 'utf-8')),
      ...inlineConfig,
    })
  } else {
    config = parse(configSchema, inlineConfig)
  }

  // If typescript is disabled, make sure the generated route tree is a .js file
  if (config.disableTypes) {
    config.generatedRouteTree = config.generatedRouteTree.replace(
      /\.(ts|tsx)$/,
      '.js',
    )
  }

  return config
}
