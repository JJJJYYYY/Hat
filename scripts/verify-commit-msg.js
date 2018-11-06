/**
 * Vue.js #https://github.com/vuejs/vue/blob/dev/scripts/verify-commit-msg.js
 * copy by Jesse<jessey9527@gmail.com>
 */

const chalk = require('chalk')
const msg = require('fs').readFileSync(process.env.HUSKY_GIT_PARAMS, 'utf-8').trim()

const commitRE = /^(revert: )?(feat|fix|docs|style|refactor|test|chore|types|ci|build)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.error(
    `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(`invalid commit message format.`)}\n\n` +
    chalk.red(`  Proper commit message format is required for automated changelog generation. Examples:\n\n`) +
    chalk.red(`  See .github/COMMIT_CONVENTION.md for more details.\n`) +
    chalk.red(`  You can also use ${chalk.cyan(`npm run commit`)} to interactively generate a commit message.\n`)
  )
  process.exit(1)
}
