#!/bin/bash

if [ $# = 2 ];
then
    echo "Setting environment variables.."
    eval `docker-machine env --shell bash`
    working=`docker info | grep Containers`
    # echo $working
    if [ "$working" != "" ];
    then
        echo "Updating image.."
        docker build -t $2 - < ./$1/Dockerfile
    fi
else
    echo "Argument count should be 2"
fi