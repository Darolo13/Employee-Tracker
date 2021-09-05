const connection = require('./config/connection');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const consoleTable = require('console.table');

connection.connect((err) => {
    if (err) throw err;
    console.log(chalk.white.bold(`====================================================================================`));
    console.log(chalk.redBright.bold(figlet.textSync('Employee Tracker')));
    console.log(`                                                     ` + chalk.redBright.bold('Created By: David Romero'));
    console.log(chalk.white.bold(`====================================================================================`));
    questions();
})

const questions = () => {

};