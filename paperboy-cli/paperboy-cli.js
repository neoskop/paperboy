#!/usr/bin/env node

import chalk from "chalk";
import { readFileSync } from "fs";
import { Paperboy } from "@neoskop/paperboy";
import { program } from "commander";

program.version("2.9.0").description("Paperboy CLI");

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
    config = JSON.parse(readFileSync(configPath));
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
