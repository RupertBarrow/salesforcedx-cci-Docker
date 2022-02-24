const shell = require('shelljs');
const fs = require('fs-extra');

shell.set('-e');
shell.set('+v');

const getCliVersion = async () => {
  // If not in the env, read the package.json to get the version number we'll use for latest-rc
  const DOCKER_HUB_REPOSITORY_TAG = process.env['DOCKER_HUB_REPOSITORY_TAG'] ?? (await fs.readJson('package.json')).version;
  if (!DOCKER_HUB_REPOSITORY_TAG) {
    shell.echo('No DOCKER_HUB_REPOSITORY_TAG version was available.');
    shell.exit(-1);
  }
  shell.echo(`Using DOCKER_HUB_REPOSITORY_TAG Version ${DOCKER_HUB_REPOSITORY_TAG}`);
  return DOCKER_HUB_REPOSITORY_TAG;
};

const validateDockerEnv = () => {
  // Checks that you have the Docker CLI installed
  if (!shell.which('docker')) {
    shell.echo('You do not have the Docker CLI installed.');
    shell.exit(-1);
  }

  // Checks that you have logged into docker hub
  // Unfortunately I don't think there is a way to check what repositories you have access to
  const AUTH_REGEX = '"https://index.docker.io/v1/"';
  if (!new RegExp(AUTH_REGEX).test(shell.grep(AUTH_REGEX, '~/.docker/config.json').stdout)) {
    shell.echo('You are not logged into Docker Hub. Try `docker login`.');
    shell.exit(-1);
  }
};

module.exports.validateDockerEnv = validateDockerEnv;
module.exports.getCliVersion = getCliVersion;
