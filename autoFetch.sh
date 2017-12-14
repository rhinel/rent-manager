#!/bin/bash

cd ~/gitcode/rent-manager/
git checkout test
git push --all
yarn
tar -jxf dist.tar.bz2 -C dist2


echo 'done'
