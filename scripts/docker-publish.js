#!/usr/bin/env node

// I picked this up from https://github.com/salesforcecli/sfdx-cli/scripts/docker-publish.js and adapted it

/**
 * This should normally be run without any environment changes and will build, tag, and push 2 docker images for latest-rc
 * Should you ever need to manually run this script, then
 * 1. make sure you've logged into docker from its CLI `docker login`
 * 3. provide the version, example: SALESFORCE_CLI_VERSION=7.100.0 ./scripts/docker-publish
 * 4. you can add NO_PUBLISH=true if you want to only do local builds from the script
 */
const shell = require('shelljs');
const fs = require('fs-extra');
const dockerShared = require('./docker-shared');

shell.set('-e');
shell.set('+v');

const DOCKER_HUB_REPOSITORY = 'rupertbarrow/salesforcedx-cci';

(async () => {
  dockerShared.validateDockerEnv();
  const DOCKER_HUB_REPOSITORY_TAG = await dockerShared.getCliVersion();
  const SALESFORCE_CLI_VERSION = process.env.SALESFORCE_CLI_VERSION ?? 'latest';
  const SF_CLI_VERSION         = process.env.SF_CLI_VERSION         ?? 'latest';

  shell.exec(
    `docker build \
      --file ./Dockerfile \
      --build-arg SALESFORCE_CLI_VERSION=${SALESFORCE_CLI_VERSION} \
      --build-arg SF_CLI_VERSION=${SF_CLI_VERSION} \
      --tag ${DOCKER_HUB_REPOSITORY}:${DOCKER_HUB_REPOSITORY_TAG} \
      --no-cache .`
  );

  if (process.env.NO_PUBLISH) return;

  // Push to the Docker Hub Registry
  shell.exec(`docker push ${DOCKER_HUB_REPOSITORY}:${DOCKER_HUB_REPOSITORY_TAG}`);

  // This normally defaults to latest.  If you've supplied it in the environment, we're not tagging latest.
  //if (process.env['DOCKER_HUB_REPOSITORY_TAG']) return;

  // tag the newly created version as latest-rc
  shell.exec(`docker tag  ${DOCKER_HUB_REPOSITORY}:${DOCKER_HUB_REPOSITORY_TAG} ${DOCKER_HUB_REPOSITORY}:latest`);
  shell.exec(`docker push ${DOCKER_HUB_REPOSITORY}:latest`);
})();
