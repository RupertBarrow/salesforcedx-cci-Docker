# salesforcedx-cci Docker image with SFDX CLI and Cumulus CI

Docker file which includes Salesforce DX and plugins, jq, and Cumulus CI, used to simplify Github Actions.
This was inspired by the Salesforce DX salesforce/salesforcedx Docker files at https://github.com/salesforcecli/sfdx-cli/tree/main/dockerfiles.

## Docker hub

The docker image is published in the Docker hub at https://hub.docker.com/r/rupertbarrow/salesforcedx-cci

## Contents

### Tooling :

- git v2.35.0
- jq v1.6
- prettier

### SF CLI :

- sf v2.28.6

### SFDX plugins :

- mshanemc/shane-sfdx-plugins v4.43.0

### Cumulus CI :

- CumulusCI cci v3.84.2

## Usage

Example of a Github Action to execute tests on every commit on a feature branch, with the Cumulus CI ci_feature flow :

```
# ./github/workflows/cci-feature.yml

name: Feature Test (with Docker)

on:
  push:
    branches:
      - feature/**
      - main

jobs:
  unit_tests:
    name: "Run Apex tests"
    runs-on: ubuntu-latest
    container: rupertbarrow/salesforcedx-cci:latest
    steps:
      - name: Run Cumulus ci_feature
        env:
          CUMULUSCI_SERVICE_github: '{"username": "<username>", "email": "<email>", "token": "<token>"}'
        shell: bash
        run: |
          cci flow run ci_feature --org dev --delete-org
      - name: Delete Scratch Org
        if: always()
        shell: bash
        run: |
          cci org scratch_delete dev
```

## Dockerfile details

```
FROM salesforce/cli:2.28.6-full

ENV SHELL /bin/bash
ENV DEBIAN_FRONTEND=noninteractive

ARG SF_CLI_VERSION=2.28.6
ARG CUMULUSCI_VERSION=3.84.2

# Basic
RUN apt update
RUN echo y | apt install software-properties-common

# Get Git >= 2.18 : actions/checkout@v2 says "To create a local Git repository instead, add Git 2.18 or higher to the PATH"
RUN add-apt-repository -y ppa:git-core/ppa
RUN apt-get update
RUN apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*

# Install Python 3.10
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt update
RUN echo y | apt install python3.10

# Install Pip
RUN echo y | apt install python3.10-distutils
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10

# Install Cumulus CI
RUN pip3 install --no-cache-dir cumulusci==${CUMULUSCI_VERSION}

# Install SFDX plugins
RUN echo y | sfdx plugins:install shane-sfdx-plugins@4.43.0

# Install prettier
RUN set -x && \
  (curl -sL https://deb.nodesource.com/setup_20.x | bash) && \
  apt-get install --no-install-recommends nodejs && \
  rm -rf /var/lib/apt/lists/* && \
  npm install -g prettier@${PRETTIER_VERSION} && \
  npm cache clean --force

# Installed versions
RUN set -x && \
  node -v && \
  npm -v && \
  git --version && \
  python3 --version && \
  pip3 --version && \
  cci version && \
  sfdx --version && \
  sf version && \
  sfdx plugins --core && \
  prettier -v

ENV SFDX_CONTAINER_MODE true
ENV DEBIAN_FRONTEND=dialog
```

## Note on versioning

I'm careful about avoiding tooling regression, so there are no implicit versions mentioned here. All version numbers are hardcoded so that tooling behaves in a reproduceable manner.

## Extending this Docker image to add your own SFDX plugins

People might want to have this same Docker file with other plugins.
This is how to proceed :

Create your own Docxker file based on this image, and add your plugins, update SFDX CLI or Cumulus CI :

```
# My new Docker file
FROM rupertbarrow/salesforcedx-cci:latest

ENV SHELL /bin/bash
ENV DEBIAN_FRONTEND=noninteractive

# Update SFDX CLI to the latest version
RUN sfdx update

# Update Cumulus CI to the latest version
RUN pip3 upgrade cumulusci

# Add SFDX plugins here
RUN echo y | sfdx plugins:install sfdmu

ENV SFDX_CONTAINER_MODE true
ENV DEBIAN_FRONTEND=dialog
```

Then you can publish and use this Docker image yourself.
