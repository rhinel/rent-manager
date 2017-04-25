#! /bin/bash
# 删除原有容器
docker rm -f rentmanager

# 启动并自动重启
docker run \
 --name rentmanager \
 --link myredis:myredis \
 --link mymongo:mymongo \
 --expose 80 \
 --expose 443 \
 -v ~/gitcode/rent-manager:/webapp \
 -v ~/ssl-key:/ssl-key \
 -w /webapp/server-node \
 -d node node index
