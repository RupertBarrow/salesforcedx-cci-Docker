FROM salesforce/salesforcedx:7.139.0-full

ENV SHELL /bin/bash
ENV DEBIAN_FRONTEND=noninteractive
ARG SALESFORCE_CLI_VERSION=7.139.0
ARG SF_CLI_VERSION=1.15.0

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

# Install Cumulus CI 3.53.0
RUN pip3 install --no-cache-dir cumulusci==3.53.0

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
