#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs");
const Paperboy = require("@neoskop/paperboy").Paperboy;
const program = require("commander");
const PaperboyMagnoliaSource = require("@neoskop/paperboy-source-magnolia");

program.version("1.1.9").description("Paperboy CLI");

program
  .description(
    "Continuously watches a queue and rebuilds the frontend when a message is received"
  )
  .option("-c --config [config]", "Path to config file")
  .action(program => {
    const paperboy = setupPaperboy(program);
    paperboy.start();
  });

program.parse(process.argv);

function setupPaperboy(program, configModifier) {
  let config;
  let configPath = program.config || "paperboy.config.json";
  console.log(chalk.bold.cyan("[Paperboy] Starting …"));
  try {
    config = JSON.parse(fs.readFileSync(configPath));
  } catch (e) {
    throw e;
  }

  if (configModifier) {
    configModifier(config);
  }

  const paperboy = new Paperboy({
    readinessHook: config.readinessHook,
    source: Object.assign(config.sourceOptions, {
      sourceFactory: PaperboyMagnoliaSource
    }),
    sink: config.sinkOptions
  });
  return paperboy;
}
