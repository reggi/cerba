#!/usr/bin/env node
import {Cerba} from './cerba';
import * as yargs from 'yargs';

yargs
  .scriptName('cerba')
  .option('cwd', {
    alias: 'C',
    type: 'string',
    description: 'Provide path to take action',
  })
  .option('main', {
    type: 'string',
    description: 'Target a file directly',
  })
  .option('name', {
    type: 'string',
    description: 'Pick a package from config',
  })
  .option('scope', {
    type: 'string',
    description: 'Set the scope of all packages',
  })
  .command(
    'build',
    'builds all the packages',
    () => {},
    async argv => {
      const c = new Cerba(argv);
      return c.build();
    }
  )
  .command(
    'build-package',
    'builds a single package',
    () => {},
    async argv => {
      const c = new Cerba(argv);
      return c.buildPackage();
    }
  )
  .demandCommand(1).argv;
