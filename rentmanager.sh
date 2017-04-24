#! /bin/bash
# 删除原有容器
docker rm -f rentmanager

# 启动并自动重启
docker run \
 --name rentmanager \
 --expose 80 \
 --expose 443 \
 -v $PWD:/webapp \
 -w /webapp \
 -d node npm start
