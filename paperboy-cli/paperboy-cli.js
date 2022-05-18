#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs");
const Paperboy = require("@neoskop/paperboy").Paperboy;
const program = require("commander");

program.version("2.6.5").description("Paperboy CLI");

program
  .description(
    "Continuously watches a queue and rebuilds the frontend when a message is received"
  )
  .option("-c --config [config]", "Path to config file")
  .action((program) => {
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
    console.error(`Config file ${configPath} not found!`);
    process.exit(1);
  }

  if (configModifier) {
    configModifier(config);
  }

  return new Paperboy({
    readinessHook: config.readinessHook,
    initialCommand: config.initialCommand,
    command: config.command,
    queue: config.queue,
  });
}
