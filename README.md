# rent-manager

| Master|Test |
|:-----:|:-----:|
| [![Build Status](https://travis-ci.org/rhinel/rent-manager.svg?branch=master)](https://travis-ci.org/rhinel/rent-manager)|[![Build Status](https://travis-ci.org/rhinel/rent-manager.svg?branch=test)](https://travis-ci.org/rhinel/rent-manager) |

> rent-manager for ying
>
> 项目后端：nodejs express ws log4js mongodb4 redis
>
> 项目前端：webpack4 vue2.0 ElementUI superagent

## 架构

项目前端

1. vue vuex vue-router 结合
2. router懒加载，并在before中鉴权
3. vuex存储用户config信息

项目后端

1. route - controller - service - model 架构
2. express 结合 websocket
3. 具备接口权限校验，控制器处理、错误处理、日志打印、code管理

## Build Setup

``` bash
# install dependencies
yarn

# serve with hot reload at localhost:8080
yarn dev

# start server path at localhost:80
yarn serve

# build for production with minification
yarn git-init

yarn build

```

## 待解决问题

时区问题，前端添加为+0800时区，服务器时间为0时区，要注意修改服务器时区为+0800

mongodb没有事务的问题，目前解决方式是判断可能出错的读取后执行，但高并发可能会有问题
