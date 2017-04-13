#!/usr/bin/env bash

COMPOSE_CONFIG_PATH=/tmp/${CI_BUILD_REF}.docker-compose.yml

scp ./docker-compose.yml staging:${COMPOSE_CONFIG_PATH}
ssh -t staging /bin/bash << DEPLOYMENT
    sudo docker login -u gitlab-ci-token -p ${CI_BUILD_TOKEN} ${CI_REGISTRY}

    sudo CONTAINER_CURRENT_IMAGE=${CONTAINER_RELEASE_IMAGE} docker-compose -f ${COMPOSE_CONFIG_PATH} --project-name=comparison pull web
    echo CONTAINER_CURRENT_IMAGE=${CONTAINER_RELEASE_IMAGE} docker-compose -f ${COMPOSE_CONFIG_PATH} --project-name=comparison pull web

    sudo CONTAINER_CURRENT_IMAGE=${CONTAINER_RELEASE_IMAGE} docker-compose -f ${COMPOSE_CONFIG_PATH} --project-name=comparison stop
    echo CONTAINER_CURRENT_IMAGE=${CONTAINER_RELEASE_IMAGE} docker-compose -f ${COMPOSE_CONFIG_PATH} --project-name=comparison stop

    sudo CONTAINER_CURRENT_IMAGE=${CONTAINER_RELEASE_IMAGE} docker-compose -f ${COMPOSE_CONFIG_PATH} --project-name=comparison rm -f
    echo CONTAINER_CURRENT_IMAGE=${CONTAINER_RELEASE_IMAGE} docker-compose -f ${COMPOSE_CONFIG_PATH} --project-name=comparison rm -f

    sudo CONTAINER_CURRENT_IMAGE=${CONTAINER_RELEASE_IMAGE} docker-compose -f ${COMPOSE_CONFIG_PATH} --project-name=comparison up -d
    echo CONTAINER_CURRENT_IMAGE=${CONTAINER_RELEASE_IMAGE} docker-compose -f ${COMPOSE_CONFIG_PATH} --project-name=comparison up -d
DEPLOYMENT