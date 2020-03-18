#!/bin/bash

if [ $# = 2 ];
then
    echo "Setting environment variables.."
    eval `docker-machine env --shell bash`
    working=`docker info | grep Containers`
    # echo $working
    if [ "$working" != "" ];
    then
        echo "Checking if image exists.."
        images=`docker image ls | grep $2`
        # echo $images
        if [ "${images}" != "" ];
        then
            echo "Image already exists."
        else
            echo "Image doesn't exist. Creating Image.."
            docker build -t $2 - < ./$1/Dockerfile
        fi
    fi
else
    echo "Argument count should be 2"
fi