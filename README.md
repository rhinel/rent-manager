# rent-manager

| Master|Test |
|:-----:|:-----:|
| [![Build Status](https://travis-ci.org/rhinel/rent-manager.svg?branch=master)](https://travis-ci.org/rhinel/rent-manager)|[![Build Status](https://travis-ci.org/rhinel/rent-manager.svg?branch=test)](https://travis-ci.org/rhinel/rent-manager) |

> rent-manager for ying
>
> 项目后端：nodejs mongodb redis
>
> 项目前端：webpack vue2.0 ElementUI superagent

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
