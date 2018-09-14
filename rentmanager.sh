#! /bin/bash
# 删除原有容器
docker rm -f rentmanager

# 启动并自动重启
docker run \
 --restart always \
 --name rentmanager \
 --link myredis:myredis \
 --link mymongo:mymongo \
 --expose 80 \
 --expose 443 \
 # 添加服务器不能解析的IP
 --add-host 95598.sz.csg.cn:202.104.143.21 \
 -v /etc/localtime:/etc/localtime \
 -v ~/gitcode/rent-manager:/webapp \
 -w /webapp/server \
 -d node node index server
