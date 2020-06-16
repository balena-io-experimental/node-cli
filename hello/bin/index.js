#!/usr/bin/env node

const chalk = require("chalk");
const boxen = require("boxen");

const greeting = chalk.white.bold("Hello, world!");

const boxenOptions = {
  padding: 1,
  margin: 1,
  borderStyle: "round",
  borderColor: "green",
  backgroundColor: "#444444"
};

const msgBox = boxen(greeting, boxenOptions);
console.log(msgBox);
