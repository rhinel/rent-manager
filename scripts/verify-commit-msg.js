const chalk = require('chalk')

const msgPath = process.env.HUSKY_GIT_PARAMS

console.log(msgPath)

const msg = require('fs').readFileSync(msgPath, 'utf-8').trim()

const commitRE = /^(revert: )?(feat|fix|polish|docs|style|refactor|perf|test|workflow|ci|chore|types|build)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.log()
  console.error(
    `  ${chalk.bgRed.white(' 错误 ')} ${chalk.red('无效的提交消息格式。')}\n\n${
    chalk.red('  自动更改日志生成需要正确的提交消息格式。例如：\n\n')
    }    ${chalk.green('feat(编译器): 新增 \'评论\' 选项')}\n`
    + `    ${chalk.green('fix(v-model): 处理模糊事件 (close #28)')}\n\n${
    chalk.red('  查看文档 https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md 获取更多信息。\n\n')
    }${chalk.red(`  或者你可以使用命令 ${chalk.cyan('npm run commit')} 以交互方式生成提交消息。\n`)}`
  )
  process.exit(1)
}
