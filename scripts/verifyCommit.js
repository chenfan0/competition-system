import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import picocolors from 'picocolors'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const msgFilePath = path.resolve(dirname, '../.git/COMMIT_EDITMSG')
const msg = readFileSync(msgFilePath, 'utf-8').trim()

const commitRE =
  /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.log()
  console.error(
    `  ${picocolors.bgRed(' ERROR ')} ${picocolors.red(
      `invalid commit message format.`
    )}\n\n` +
      picocolors.red(
        `  Proper commit message format is required for automated changelog generation. Examples:\n\n`
      ) +
      `    ${picocolors.green(`feat: add xxx`)}\n` +
      `    ${picocolors.green(
        `fix: xxx`
      )}\n`
  )
  process.exit(1)
}
