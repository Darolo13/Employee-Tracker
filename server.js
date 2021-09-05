const connection = require('./config/connection');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const cT = require('console.table');
const validate = require('./js/validate');

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

            if (picks === 'View All Employees By Department') {
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

const renderAllEmployees = () => {
    let sql = `SELECT employee.id,
              employee.first_name,
              employee.last_name,
              role.title,
              department.name AS 'department',
              role.salary
              FROM employee, role, department
              WHERE department.id = role.department_id
              AND role.id = employee.role_id
              ORDER BY employee.id ASC`;

    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.log(chalk.green.italic(`============================================================================================`));
        console.log(`               ` + chalk.redBright.italic(`Current Employees:`));
        console.log(chalk.green.italic(`============================================================================================`));
        console.table(res);
        console.log(chalk.green.italic(`============================================================================================`));
        questions();
    });
};

const renderEmployeesByDepartment = () => {
    const sql = `SELECT employee.first_name,
                employee.last_name,
                department.name AS department
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id`;

    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.log(chalk.green.italic(`====================================================================================`));
        console.log(`                              ` + chalk.redBright.italic(`Employees by Department:`));
        console.log(chalk.green.italic(`====================================================================================`));
        console.table(res);
        console.log(chalk.green.italic(`====================================================================================`));
        questions();
    });
};

const renderTotalDepartmentBudgets = () => {
    console.log(chalk.green.italic(`====================================================================================`));
    console.log(`                              ` + chalk.redBright.italic(`Total Budget By Department:`));
    console.log(chalk.green.italic(`====================================================================================`));
    const sql = `SELECT department_id AS id, 
                    department.name AS department,
                    SUM(salary) AS budget
                    FROM  role  
                    INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
    connection.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        console.log(chalk.green.italic(`====================================================================================`));
        questions();
    });
};

/* ======================================================== Add Section ========================================================== */

const addDepartment = () => {
    inquirer
        .prompt([
            {
                name: 'addDepartment',
                type: 'input',
                message: 'Type the name of the new Department.',
                validate: validate.validateString
            }
        ])
        .then((response) => {
            let sql = `INSERT INTO department (name) VALUES (?)`;
            connection.query(sql, response.addDepartment, (err, res) => {
                if (err) throw err;
                console.log(``);
                console.log(chalk.redBright(response.addDepartment + ` Department successfully added!`));
                console.log(``);
                renderAllDepartments();
            });
        });
};


const addRole = () => {
    const sql = 'SELECT * FROM department'
    connection.query(sql, (err, res) => {
        if (err) throw err;
        let deptArr = [];
        res.forEach((department) => { deptArr.push(department.name); });
        deptArr.push('Add Department');
        inquirer
            .prompt([
                {
                    name: 'depName',
                    type: 'list',
                    message: 'Which department is this new role in?',
                    choices: deptArr
                }
            ])
            .then((res) => {
                if (res.depName === 'Add Department') {
                    addDepartment();
                } else {
                    addRoleData(res);
                }
            });

        const addRoleData = (departmentInfo) => {
            inquirer
                .prompt([
                    {
                        name: 'newRole',
                        type: 'input',
                        message: 'What is the name of the new role?',
                        validate: validate.validateString
                    },
                    {
                        name: 'salary',
                        type: 'input',
                        message: 'What is the salary of this role?',
                        validate: validate.validateSalary
                    }
                ])
                .then((res) => {
                    let generatedRole = res.newRole;
                    let departmentId;

                    response.forEach((department) => {
                        if (departmentInfo.depName === department.name) { departmentId = department.id; }
                    });

                    let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                    let Info = [generatedRole, res.salary, departmentId];

                    connection.query(sql, Info, (err) => {
                        if (err) throw err;
                        console.log(chalk.green.italic(`====================================================================================`));
                        console.log(chalk.redBright(`Role Successfully Added!`));
                        console.log(chalk.green.italic(`====================================================================================`));
                        renderAllRoles();
                    });
                });
        };
    });
};