# rent-manager

[![Build Status](https://travis-ci.org/rhinel/rent-manager.svg?branch=test)](https://travis-ci.org/rhinel/rent-manager)<br>

> rent-manager for ying<br>
> 项目后端：nodejs mongodb redis<br>
> 项目前端：webpack vue2.0 ElementUI superagent

## Build Setup

``` bash
# install dependencies
yarn

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

```

## 待解决问题

时区问题，elementUI组件提供的为0时区，服务器时间为0时区<br>
mongodb没有事务的问题，目前解决方式是判断可能出错的读取后执行，但高并发可能会有问题
