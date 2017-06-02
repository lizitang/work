#!/bin/bash
#REPO=docker-reg.emotibot.com.cn:55688
CONTAINER=faq_debugger
# FIXME: should use some tag other than latest
#TAG=$(git rev-parse --short HEAD)
TAG=latest
#DOCKER_IMAGE=$REPO/$CONTAINER:$TAG
DOCKER_IMAGE=$CONTAINER:$TAG

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILDROOT=$DIR/..

cd $BUILDROOT

# Build docker
cmd="docker build \
  -t $DOCKER_IMAGE \
  -f $DIR/DockerfileLocal $BUILDROOT"
echo $cmd
eval $cmd
