#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const Paperboy = require('@neoskop/paperboy').Paperboy;
const program = require('commander');
const PaperboyMagnoliaSource = require('@neoskop/paperboy-source-magnolia');

program.version('0.10.7').description('Paperboy CLI');

program
  .command('start')
  .description('')
  .usage('[options]')
  .option('-c --config [config]', 'Path to config file')
  .action(program => {
    let config, paperboy;
    let configPath = program.config || 'paperboy.config.json';

    console.log(chalk.bold.cyan('[Paperboy] Starting …'));

    try {
      config = JSON.parse(fs.readFileSync(configPath));
    } catch (e) {
      throw e;
    }

    paperboy = new Paperboy({
      readinessHook: config.readinessHook,
      source: Object.assign(config.sourceOptions, { sourceFactory: PaperboyMagnoliaSource }),
      sink: config.sinkOptions
    });

    paperboy.start();
  });

program.parse(process.argv);
