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

### SFDX CLI :

- sfdx v7.172.0
- sf v1.49.0

### SFDX plugins :

- mshanemc/shane-sfdx-plugins v4.43.0

### Cumulus CI :

- CumulusCI cci v3.66.0

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
    container: rupertbarrow/salesforcedx-cci:3.66.0
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
FROM salesforce/salesforcedx:7.172.0-full

ENV SHELL /bin/bash
ENV DEBIAN_FRONTEND=noninteractive
ARG SALESFORCE_CLI_VERSION=7.172.0
ARG SF_CLI_VERSION=1.27.0

# Basic
RUN apt update
RUN echo y | apt install software-properties-common

# Get Git >= 2.18 : actions/checkout@v2 says "To create a local Git repository instead, add Git 2.18 or higher to the PATH"
RUN add-apt-repository -y ppa:git-core/ppa
RUN apt-get update
RUN apt-get install git -y

# Install Python
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt update
RUN echo y | apt install python3.10

# Install Pip
RUN echo y | apt install python3.10-distutils
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10

# Install Cumulus CI
RUN pip3 install cumulusci

# Install SFDX plugins
RUN echo y | sfdx plugins:install shane-sfdx-plugins@4.43.0

# Installed versions
RUN git --version
RUN python3 --version
RUN pip3 --version
RUN cci version
RUN sfdx --version
RUN sf version
RUN sfdx plugins --core

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
FROM rupertbarrow/salesforcedx-cci:1.172.0_3.66.0

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
