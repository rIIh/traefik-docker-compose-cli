import { exec } from 'child_process';
import chalk from 'chalk';

export async function asyncExec(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = exec(cmd);
    command.stdout?.pipe(process.stdout);
    // command.stderr?.on('data', chunk => {
    //   console.error(chalk.red(chunk.toString()))
    // })
    command.stderr?.pipe(process.stderr);
    command.on('exit', code => {
      if (code != 0) { 
        reject(code);
      }
      else {
        resolve();
      }
    });
  });
}