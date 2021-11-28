'use strict'
const chalk = require('chalk');
const fs = require('fs');
const packageConfig = require('../package.json');

const gitFolder = './.git/hooks';
const husky = packageConfig.husky;

const noHooks = function() {
  console.log('there is no hooks. ');
  console.log('');
}

module.exports = function() {
  // 查询有没有husky
  if (!husky) {
    noHooks();
    return;
  };
  // 查询有没有hooks
  const hooks = husky.hooks;
  if (!hooks) {
    noHooks();
    return;
  };

  // 查询是否是CI
  const gitHEAD = fs.readFileSync('./.git/HEAD', 'utf-8').trim();
  let ref = gitHEAD.split(': ')[1];
  const isSkip = !!process.env.npm_config_skipcheck;

  if (!ref || isSkip) {
    console.log('CI detected, skipping Git hooks check. ');
    console.log('');
    return;
  }

  // 检查每个hooks
  let exitFlag = false;
  console.log();

  Object.keys(hooks).forEach(hook => {
    try {
      fs.accessSync(`${gitFolder}/${hook}`);
    } catch (e) {
      console.log(chalk.yellow(
        `${gitFolder}/${hook}`,
        'doesn\'t exist. '
      ));
      exitFlag = true;
    }
  });

  console.log();
  if (exitFlag) {
    console.log(chalk.yellow('You can reinstall it using \'npm install\'. '));
    console.log();
    process.exit(1);
  };
};
