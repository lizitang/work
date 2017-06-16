#!/bin/bash
REPO=docker-reg.emotibot.com.cn:55688
CONTAINER=cloud-tag

#TAG=$(git rev-parse --short HEAD)
TAG=20170404
DOCKER_IMAGE=$REPO/$CONTAINER:$TAG
#DOCKER_IMAGE=$CONTAINER

cp ../package.json .

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILDROOT=$DIR/..

# Build docker
cmd="docker build --no-cache -t $DOCKER_IMAGE -f $DIR/Dockerfile $BUILDROOT"
echo $cmd
eval $cmd
