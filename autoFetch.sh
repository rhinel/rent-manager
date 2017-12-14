#!/bin/bash

echo '--> 开始本地处理'

cd ~/gitcode/rent-manager/

echo '--> fetch当前分支'
echo '--> $0'

git status

if [ "$0" != "test" ]; then
  echo "--> git branch $0"
  git checkout $0
fi

if [ "$0" == "test" ]; then
  echo "--> git branch test"
  git checkout test
fi

git pull --all
git fetch -p

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

