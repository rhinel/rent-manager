#!/bin/bash

cd ~/gitcode/rent-manager/

if [ "$TRAVIS_BRANCH" == "dev-0.1.0" ]; then
  git checkout dev-0.1.0
fi

if [ "$TRAVIS_BRANCH" == "test" ]; then
  git checkout test
fi

git pull --all
yarn
mkdir dist2
tar -jxf dist.tar.bz2 -C dist2


echo 'done'
