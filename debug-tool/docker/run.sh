#!/bin/bash
REPO=docker-reg.emotibot.com.cn:55688
CONTAINER=faq_debugger
TAG=$(git rev-parse --short HEAD)
DOCKER_IMAGE=$REPO/$CONTAINER:$TAG

# Get env from env file for all envs
# Load the env file
source $1
if [ $? -ne 0 ]; then
  if [ "$#" -eq 0 ];then
    echo "Usage: $0 <envfile>"
    echo "e.g., $0 dev.env"
  else
    echo "Erorr, can't open envfile: $1"
  fi
  exit 1
else
  echo "# Using envfile: $1"
fi

docker rm -f -v $CONTAINER

cmd="docker run -d --name $CONTAINER \
 -p $FAQ_DEBUG_PORT:80 \
 -e FAQ_DEBUG_HOST=$FAQ_DEBUG_HOST \
 -e FAQ_DEBUG_DEBUG=$FAQ_DEBUG_DEBUG \
 -e FAQ_DEBUG_CONFIG=$FAQ_DEBUG_CONFIG \
 -v /etc/localtime:/etc/localtime \
   $DOCKER_IMAGE \
"

echo $cmd
eval $cmd
