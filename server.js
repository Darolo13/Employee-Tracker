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

                    res.forEach((department) => {
                        if (departmentInfo.depName === department.name) { departmentId = department.id; }
                    });

                    let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                    let info = [generatedRole, res.salary, departmentId];

                    connection.query(sql, info, (err) => {
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

const addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "Enter the first name of the employee",
            validate: inputFirstName => {
                if (inputFirstName) {
                    return true;
                } else {
                    console.log('Please enter the first name of the employee...');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: "Enter the last name of the employee.",
            validate: inputLastName => {
                if (inputLastName) {
                    return true;
                } else {
                    console.log('Please enter the last name of the employee...');
                    return false;
                }
            }
        }
    ])
        .then(response => {
            const info = [response.firstName, response.lastName]
            const roleSql = `SELECT role.id, role.title FROM role`;
            connection.query(roleSql, (err, data) => {
                if (err) throw err;
                const roles = data.map(({ id, title }) => ({ name: title, value: id }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: "What is the role of this employee?",
                        choices: roles
                    }
                ])
                    .then(roleChoice => {
                        const role = roleChoice.role;
                        info.push(role);
                        const managerSql = `SELECT * FROM employee`;
                        connection.query(managerSql, (err, data) => {
                            if (err) throw err;
                            const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
                            inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'manager',
                                    message: "Who's this employee's manager?",
                                    choices: managers
                                }
                            ])
                                .then(managerChoice => {
                                    const manager = managerChoice.manager;
                                    info.push(manager);
                                    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`;
                                    connection.query(sql, info, (err) => {
                                        if (err) throw err;
                                        console.log("Employee has been added!")
                                        renderAllEmployees();
                                    });
                                });
                        });
                    });
            });
        });
};

/* ======================================================== Update Section ========================================================== */

const updateEmployeeRole = () => {
    let sql = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                    FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
    connection.query(sql, (err, res) => {
        if (err) throw err;
        let employeeNamesArr = [];
        res.forEach((employee) => { employeeNamesArr.push(`${employee.first_name} ${employee.last_name}`); });

        let sql = `SELECT role.id, role.title FROM role`;
        connection.query(sql, (err, res) => {
            if (err) throw err;
            let rolesArr = [];
            res.forEach((role) => { rolesArr.push(role.title); });

            inquirer
                .prompt([
                    {
                        name: 'employeeOption',
                        type: 'list',
                        message: 'Which employee has a new role?',
                        choices: employeeNamesArr
                    },
                    {
                        name: 'roleSelection',
                        type: 'list',
                        message: 'What is the role of the employee?',
                        choices: rolesArr
                    }
                ])
                .then((selection) => {
                    let newTitleId, employeeId;

                    res.forEach((role) => {
                        if (selection.roleSelection === role.title) {
                            newTitleId = role.id;
                        }
                    });

                    res.forEach((employee) => {
                        if (
                            selection.employeeOption ===
                            `${employee.first_name} ${employee.last_name}`
                        ) {
                            employeeId = employee.id;
                        }
                    });

                    let sqls = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
                    connection.query(
                        sqls,
                        [newTitleId, employeeId],
                        (err) => {
                            if (err) throw err;
                            console.log(chalk.green.italic(`====================================================================================`));
                            console.log(chalk.redBright.italic(`Employee Role Updated!`));
                            console.log(chalk.green.italic(`====================================================================================`));
                            questions();
                        }
                    );
                });
        });
    });
};