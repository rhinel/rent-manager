#!/bin/bash

echo '--> 开始本地处理'

cd ~/gitcode/rent-manager/

echo '--> fetch当前分支'

git fetch -p
git status

if [ "$TRAVIS_BRANCH" != "test" ]; then
  git checkout dev-0.1.0
fi

if [ "$TRAVIS_BRANCH" == "test" ]; then
  git checkout test
fi

git pull --all

echo '--> 更新依赖'

yarn

echo '--> 删除旧版本'

rm -rf ./dist

echo '--> 解压新版本'

tar -jxf dist.tar.bz2 -C ./

echo '--> cache clear'

rm -rf dist.tar.bz2

echo '--> docker restart'

sh ./rentmanager.sh

echo '--> 全部完成'

