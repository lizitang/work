#!/bin/bash

#docker run -d haproxy-datadog -v
REPO=docker-reg.emotibot.com.cn:55688
CONTAINER=cloud-tag

#TAG=$(git rev-parse --short HEAD)
TAG=20170404
DOCKER_IMAGE=$REPO/$CONTAINER:$TAG

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker rm -f -v $CONTAINER
docker run -d --name $CONTAINER \
 -p 11207:8080 \
 $DOCKER_IMAGE

#docker rm -fv cloud-tag-service
#docker run -d --name cloud-tag-service \
#  -p 11207:8080 \
#  $DOCKER_IMAGE
