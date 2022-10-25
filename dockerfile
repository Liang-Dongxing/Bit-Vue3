
# 基础镜像
FROM  nginx:1.23
# author
MAINTAINER dongxing

# 添加时区环境变量，亚洲，上海
ENV TIME_ZONE=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TIME_ZONE /etc/localtime && echo $TIME_ZONE > /etc/timezone

EXPOSE 80

# 指定路径
WORKDIR /home/bit
# 复制 conf 文件到路径
COPY bit-nginx.conf /etc/nginx/conf.d/default.conf
# 复制dist文件到路径
COPY ./dist /home/bit/projects/bit-ui
