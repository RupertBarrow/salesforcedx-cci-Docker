FROM salesforce/salesforcedx:7.172.0-full

ENV SHELL /bin/bash
ENV DEBIAN_FRONTEND=noninteractive

ARG SALESFORCE_CLI_VERSION=7.172.0
ARG SF_CLI_VERSION=1.49.0
ARG CUMULUSCI_VERSION=3.66.0

# Basic
RUN apt update
RUN echo y | apt install software-properties-common

# Get Git >= 2.18 : actions/checkout@v2 says "To create a local Git repository instead, add Git 2.18 or higher to the PATH"
RUN add-apt-repository -y ppa:git-core/ppa
RUN apt-get update
RUN apt-get install git -y

# Install Python 3.10
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt update
RUN echo y | apt install python3.10

# Install Pip
RUN echo y | apt install python3.10-distutils
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10

# Install Cumulus CI 3.66.0
RUN pip3 install --no-cache-dir cumulusci==${CUMULUSCI_VERSION}

# Install SFDX plugins
RUN echo y | sfdx plugins:install shane-sfdx-plugins@4.43.0

# Install prettier
#ARG NODEJS_VERSION=12.15.0-r1
#ARG PRETTIER_VERSION
#RUN set -x && \
#  apk add --no-cache nodejs=${NODEJS_VERSION} nodejs-npm=${NODEJS_VERSION} && \
#  npm install -g prettier@${PRETTIER_VERSION} && \
#  npm cache clean --force && \
#  apk del nodejs-npm
RUN set -x && \
  (curl -sL https://deb.nodesource.com/setup_16.x | bash) && \
  apt-get install nodejs && \
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
