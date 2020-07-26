#!/usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import { asyncExec } from './exec';
import { exec } from 'child_process';

let remote: string;

program
  .version('0.0.1')
  .description("Deploy compose file to remote host")
  .option('-f, --file <compose>', 'compose file', 'docker-compose.yml')
  .option('-r, --registry <registry>', 'registry address')
  .option('-s, --skip-build', 'skip building phase')
  .arguments('<host>')
  .action((host: string) => {
    remote = host;
  })
  // .requiredOption('-R, --remote <remote>', 'remote address')
  .parse(process.argv);

const { file: compose, registry, skipBuild } = program.opts();

function header(message: string) {
  console.log(chalk.bgWhite.black(message))
}

const main = async () => {
  try {
    process.env['REMOTE'] = remote;
    process.env['REGISTRY'] = registry ?? 'registry.' + remote + '/';

    header('Building docker images');
    skipBuild || await asyncExec(`docker-compose -f $PWD/${compose} build`);
    header('Pushing images to host registry');
    await asyncExec(`docker-compose -f $PWD/${compose} push`);
    header('Pull on remote');
    await asyncExec(`docker-compose -f $PWD/${compose} -H "ssh://root@${remote}" pull`);
    header(`Starting container on remote "${remote}"`);
    await asyncExec(`docker-compose -f $PWD/${compose} -H "ssh://root@${remote}" up -d --force-recreate --no-build`);
  } catch (e) {
    console.error(chalk.red('Something goes wrong. Terminating.'))
  }
}

main();
