#!/bin/bash

echo "--> 开始本地处理"

cd ~/gitcode/rent-manager/

echo "--> fetch当前分支"
echo "--> $1"

git status

echo "--> git checkout $1"
git checkout $1

echo "--> git pull --all"

git pull --all
git fetch -p

echo "--> 更新生产版本依赖"

yarn install --production=true

echo "--> 删除旧版本"

rm -rf ./dist

echo "--> 解压新版本"

tar -jxf dist.tar.bz2 -C ./

echo "--> cache clear"

rm -rf dist.tar.bz2

echo "--> docker restart"

sh ./rentmanager.sh

echo "--> 全部完成"
