const connection = require('./config/connection');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const consoleTable = require('console.table');

// connection to database
connection.connect((err) => {
    if (err) throw err;
    console.log(chalk.white.bold(`====================================================================================`));
    console.log(chalk.redBright.bold(figlet.textSync('Employee Tracker')));
    console.log(`                                                     ` + chalk.redBright.bold('Created By: David Romero'));
    console.log(chalk.white.bold(`====================================================================================`));
    questions();
})

const questions = () => {
    inquirer.prompt([
        {
            name: 'picks',
            type: 'list',
            message: 'Please select an option:',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'View All Employees By Manager',
                'View All Employees By Department',
                'View Total Department Budgets',
                'Add A Department',
                'Add A Role',
                'Add An Employee',
                'Update Employee Role',
                'Update Employee Manager',
                'Delete department',
                'Delete Role',
                'Delete Employee',
                'None'
            ]
        }
    ])
        .then((response) => {
            const { picks } = response;

            if (picks === 'View All Departments') {
                renderAllDepartments();
            }

            if (picks === 'View All Roles') {
                renderAllRoles();
            }

            if (picks === 'View All Employees') {
                renderAllEmployees();
            }

            if (picks === 'View All Employees By Manager') {
                renderEmployeesByManager();
            }

            if (picks === 'View Employees By Department') {
                renderEmployeesByDepartment();
            }

            if (picks === 'View Total Department Budgets') {
                renderTotalDepartmentBudgets();
            }

            if (picks === 'Add A Department') {
                addDepartment();
            }

            if (picks === 'Add A Role') {
                addRole();
            }

            if (picks === 'Add An Employee') {
                addEmployee();
            }

            if (picks === 'Update Employee Role') {
                updateEmployeeRole();
            }

            if (picks === 'Delete Department') {
                deleteDepartment();
            }

            if (picks === 'Delete Role') {
                deleteRole();
            }

            if (picks === 'Delete Employee') {
                deleteEmployee();
            }

            if (picks === 'None') {
                connection.end();
            }
        })
};