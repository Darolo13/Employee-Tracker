const connection = require('./config/connection');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const cT = require('console.table');

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

/* ======================================================== View Section ========================================================== */

const renderAllDepartments = () => {
    const sql = `SELECT department.id AS id, department.name AS department FROM department`;

    connection.query(sql, (err, res) => {
        if (err) throw err;

        console.log(chalk.greenBright.italic(`============================================================================================`));
        console.log(`                                   ` + chalk.whiteBright.italic(`All Departments:`));
        console.log(chalk.green.italic(`============================================================================================`));
        console.table(res);
        console.log(chalk.green.italic(`============================================================================================ `));
        questions();
    });
};

const renderAllRoles = () => {
    console.log(chalk.green.italic(`============================================================================================`));
    console.log(`                                       ` + chalk.redBright.italic(`Actual Employee Roles:`));
    console.log(chalk.green.italic(`============================================================================================`));
    
    const sql = `SELECT role.id, role.title, department.name AS department
                FROM role
                INNER JOIN department ON role.department_id = department.id`;
                connection.query(sql, (err, res) => {
                    if (err) throw err;
                    res.forEach((role) => {
                        console.table(role.title);
                    });
                    console.log(chalk.green.italic(`============================================================================================`));
                    questions();
                });
};