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
                'Delete Department',
                'Delete Role',
                'Delete Employee',
                'None'
            ]
        }
    ])
        .then((res) => {
            const { picks } = res;

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

            if (picks === 'Update Employee Manager') {
                updateEmployeeManager();
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
    connection.query(`SELECT * FROM department`, (err, res) => {
        let deptNamesArr = [];
        if (err) throw err;

        res.forEach((dept) => {
            deptNamesArr.push(dept.name);
        });

        inquirer
            .prompt([
                {
                    name: 'deptName',
                    type: 'list',
                    message: 'What department would you like to see?',
                    choices: deptNamesArr
                }
            ])
            .then((ans) => {
                let deptId;

                res.forEach((dept) => {
                    if (ans.deptName === dept.name) {
                        deptId = dept.id;
                    }
                });

                let query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary
                        FROM employee, role, department
                        WHERE ? = role.department_id
                        AND role.id = employee.role_id
                        GROUP BY employee.id`;

                connection.query(query, [deptId], (err, response) => {
                    if (err) throw err;

                    console.log(``);
                    console.log(`          ${ans.deptName} Department:`);
                    console.log(`-------------------------------------------`);
                    console.table(response);

                    questions();
                });
            });
    });
}

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
        .then((ans) => {
            let sql = `INSERT INTO department (name) VALUES (?)`;
            connection.query(sql, ans.addDepartment, (err, res) => {
                if (err) throw err;
                console.log(chalk.green.italic(`=========================================`));
                console.log(chalk.redBright.italic(res.addDepartment + ` Department successfully added!`));
                console.log(chalk.green.italic(`=========================================`));
                renderAllDepartments();
            });
        });
};


const addRole = () => {
    const sql = 'SELECT * FROM department'
    connection.query(sql, (err, response) => {
        if (err) throw err;
        let deptNamesArr = [];
        response.forEach((department) => { deptNamesArr.push(department.name); });
        deptNamesArr.push('Add Department');
        inquirer
            .prompt([
                {
                    name: 'depName',
                    type: 'list',
                    message: 'Which department is this new role in?',
                    choices: deptNamesArr
                }
            ])
            .then((ans) => {
                if (ans.depName === 'Add Department') {
                    addDepartment();
                } else {
                    addRoleData(ans);
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
                .then((ans) => {
                    let generatedRole = ans.newRole;
                    let departmentId;

                    response.forEach((department) => {
                        if (departmentInfo.depName === department.name) { departmentId = department.id; }
                    });

                    let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                    let info = [generatedRole, ans.salary, departmentId];

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
        .then(res => {
            const info = [res.firstName, res.lastName]
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
                                        console.log(chalk.green.italic(`=========================================`));
                                        console.log(chalk.redBright.italic("Employee has been added!"));
                                        console.log(chalk.green.italic(`=========================================`));
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

        // stores the first and last names into employeeNamesArr
        res.forEach((employee) => {
            employeeNamesArr.push(`${employee.first_name} ${employee.last_name}`);
        });

        let sql = `SELECT role.id, role.title FROM role`;
        connection.query(sql, (err, response) => {
            if (err) throw err;
            let rolesArray = [];

            response.forEach((role) => {
                rolesArray.push(role.title);
            });

            inquirer
                .prompt([
                    {
                        name: 'employeeSelection',
                        type: 'list',
                        message: 'Which employee has a new role?',
                        choices: employeeNamesArr
                    },
                    {
                        name: 'roleSelection',
                        type: 'list',
                        message: "What is this employee's new role?",
                        choices: rolesArray
                    }
                ])
                .then((ans) => {
                    let newTitleId, employeeId;

                    // runs SELECT to set new role id
                    response.forEach((role) => {
                        if (ans.roleSelection === role.title) {
                            newTitleId = role.id;
                        }
                    });

                    // runs select to set employee id
                    res.forEach((employee) => {
                        if (
                            ans.employeeSelection ===
                            `${employee.first_name} ${employee.last_name}`
                        ) {
                            employeeId = employee.id;
                        }
                    });

                    let sql = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;

                    connection.query(sql, [newTitleId, employeeId], (err, response) => {
                        if (err) throw err;

                        console.log(chalk.green.italic(`=========================================`));
                        console.log(chalk.redBright.italic(`Employee Role Updated!`));
                        console.log(chalk.green.italic(`=========================================`));

                        renderAllEmployees();
                    }
                    );
                });
        });
    });
};

const updateEmployeeManager = () => {
    let sql = `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id
                    FROM employee`;

    connection.query(sql, (err, res) => {
        let employeeNamesArr = [];

        res.forEach((employee) => {
            employeeNamesArr.push(`${employee.first_name} ${employee.last_name}`);
        });

        inquirer
            .prompt([
                {
                    name: 'employeeSelection',
                    type: 'list',
                    message: 'Which employee has a new manager?',
                    choices: employeeNamesArr
                },
                {
                    name: 'newManager',
                    type: 'list',
                    message: "Who is this employee's new manager?",
                    choices: employeeNamesArr
                }
            ])
            .then((ans) => {
                let employeeId, managerId;

                // updates relation between employee - manager
                res.forEach((employee) => {
                    if (ans.employeeSelection === `${employee.first_name} ${employee.last_name}`) {
                        employeeId = employee.id;
                    }

                    if (ans.newManager === `${employee.first_name} ${employee.last_name}`) {
                        managerId = employee.id;
                    }
                });

                // if new manager ==== old manager -> console.log('Invalid Manager Selection')
                if (validate.isSame(ans.employeeSelection, ans.newManager)) {
                    console.log(chalk.green.italic(`=========================================`));
                    console.log(chalk.redBright.italic(`Invalid Manager Selection`));
                    console.log(chalk.green.italic(`=========================================`));

                    questions();
                } else {
                    let sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;

                    connection.query(sql, [managerId, employeeId], (err, response) => {
                        if (err) throw err;

                        console.log(chalk.green.italic(`=========================================`));
                        console.log(chalk.redBright.italic(`Employee Manager Updated!`));
                        console.log(chalk.green.italic(`=========================================`));

                        questions();
                    }
                    );
                }
            });
    });
};


/* ======================================================== Delete Section ========================================================== */

const deleteDepartment = () => {
    let sql = `SELECT department.id, department.name FROM department`;

    connection.query(sql, (err, res) => {
        if (err) throw err;
        let deptNamesArr = [];

        res.forEach((department) => {
            deptNamesArr.push(department.name);
        });

        inquirer
            .prompt([
                {
                    name: 'chosenDept',
                    type: 'list',
                    message: 'Which department do you want to remove?',
                    choices: deptNamesArr
                }
            ])
            .then((ans) => {
                let deptId;

                // runs SELECT and stores departments and if the selection = delete department, the selected department will be dropped from the table
                res.forEach((department) => {
                    if (ans.chosenDept === department.name) {
                        deptId = department.id;
                    }
                });

                let sql = `DELETE FROM department WHERE department.id = ?`;
                connection.query(sql, [deptId], (err, response) => {
                    if (err) throw err;

                    console.log(chalk.green.italic(`=========================================`));
                    console.log(chalk.redBright.italic(`Department Successfully Removed`));
                    console.log(chalk.green.italic(`=========================================`));
                    questions();
                });
            });
    });
}

const deleteRole = () => {
    let sql = `SELECT role.id, role.title FROM role`;

    connection.query(sql, (err, res) => {
        if (err) throw err;
        let roleNamesArr = [];
        res.forEach((role) => { roleNamesArr.push(role.title); });

        inquirer
            .prompt([
                {
                    name: 'roleSelected',
                    type: 'list',
                    message: 'Which role do you want to delete?',
                    choices: roleNamesArr
                }
            ])
            .then((selection) => {
                let roleId;

                res.forEach((role) => {
                    if (selection.roleSelected === role.title) {
                        roleId = role.id;
                    }
                });

                let sql = `DELETE FROM role WHERE role.id = ?`;
                connection.query(sql, [roleId], (err) => {
                    if (err) throw err;
                    console.log(chalk.green.italic(`====================================================================================`));
                    console.log(chalk.redBright.italic(`Role Successfully Deleted!`));
                    console.log(chalk.green.italic(`====================================================================================`));
                    renderAllRoles();
                });
            });
    });
};

const deleteEmployee = () => {
    let sql = `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;

    connection.query(sql, (err, res) => {
        if (err) throw err;
        let employeeNamesArr = [];
        res.forEach((employee) => { employeeNamesArr.push(`${employee.first_name} ${employee.last_name}`); });

        inquirer
            .prompt([
                {
                    name: 'employeeSelection',
                    type: 'list',
                    message: 'Which employee do you want to remove?',
                    choices: employeeNamesArr
                }
            ])
            .then((ans) => {
                let employeeId;

                res.forEach((employee) => {
                    if (
                        ans.employeeSelection ===
                        `${employee.first_name} ${employee.last_name}`
                    ) {
                        employeeId = employee.id;
                    }
                });

                let sql = `DELETE FROM employee WHERE employee.id = ?`;
                connection.query(sql, [employeeId], (err) => {
                    if (err) throw err;
                    console.log(chalk.green.italic(`====================================================================================`));
                    console.log(chalk.redBright(`Employee Successfully Deleted!`));
                    console.log(chalk.green.italic(`====================================================================================`));
                    renderAllEmployees();
                });
            });
    });
};