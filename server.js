const inquirer = require('inquirer');
const db = require("./config/connection");

db.connect((err) => {
    if(err) throw err;
    init()
})

const questions = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: "What would you like to do?",
            choices: [
                "view all departments", 
                "view all roles", 
                "view all employees",
                "add a department", 
                "add a role", 
                "add an employee", 
                "update an employee role",
                "update an employee's manager",
                "view employees by manager",
                "view employees by department",
                "delete a department",
                "delete a role",
                "delete an employee"
            ]
        }
    ])
}

function viewDepts() {
    const sqlString = `SELECT dept_id, name FROM department`

    db.query(sqlString, (err, result) => {
        if(err) throw err;
        //creates new line
        console.log('\n')
        console.table(result)
        console.log('\n')

        init()
    })
}

function viewRoles() {
    const sqlString = `SELECT title, id AS role_id, name AS department_name, salary FROM role 
    LEFT JOIN department 
    ON department_id = department.dept_id`

    db.query(sqlString, (err, result) => {
        if(err) throw err;
        console.log('\n')
        console.table(result)
        console.log('\n')

        init();
    })
}

function viewEmployees() {
    const sqlString = `
    SELECT e1.first_name, e1.last_name, title, name AS department, salary, CONCAT(e2.first_name, " ", e2.last_name) AS manager
    FROM employee e1
    LEFT JOIN role
    ON role_id = role.id
    LEFT JOIN department
    ON department_id = department.dept_id
    LEFT JOIN employee e2
    ON e1.manager_id = e2.employee_id
    `

    db.query(sqlString, (err, result) => {
    if(err) throw err;
    console.log('\n')
    console.table(result)
    console.log('\n')

    init();
    })
}

async function viewEmployeesByManager() {
    const [rows] = await searchEmployee()
    // console.log(rows);

    const chooseManager = rows.map((findManager) =>({
        name: findManager.name,
        value: findManager.id
    }))

    inquirer.prompt([
        {
            type: 'list',
            name: 'managerList',
            message:'Please select a manager',
            choices: chooseManager
        }
    ]).then(viewEmployees=> {
        const sqlString = `SELECT e1.employee_id AS id, CONCAT(e1.first_name, " ", e1.last_name) AS employee, CONCAT(e2.first_name, " ", e2.last_name) AS manager
        FROM employee e1
        LEFT JOIN employee e2
        ON e1.manager_id = e2.employee_id
        WHERE e1.manager_id = ?
        `
        const answers = [viewEmployees.managerList]
        db.query(sqlString, answers, (err, result) => {
            if(err) throw err;
            console.log('\n')
            console.table(result);
            console.log('\n')
            init();
        })
    })
}

async function viewEmployeesByDept() {
    const [deptRows] = await searchDept()
    // console.log(rows);

    const chooseDept = deptRows.map((findDept) =>({
        name: findDept.name,
        value: findDept.dept_id
    }))
    console.log("choose Dept:",chooseDept);

    inquirer.prompt([
        {
            type: 'list',
            name: 'deptList',
            message:'Please select a department',
            choices: chooseDept
        }
    ]).then(viewEmployees=> {
        const sqlString = `SELECT CONCAT(first_name, " ", last_name) AS employee_names, title, name AS department
        FROM employee
        LEFT JOIN role
        ON role_id = role.id
        LEFT JOIN department
        ON department_id = department.dept_id
        WHERE department_id = ?
        `
        const answers = [viewEmployees.deptList]
        db.query(sqlString, answers, (err, result) => {
            if(err) throw err;
            console.log('\n')
            console.table(result);
            console.log('\n')
            init();
        })
    })
}

function addDept()  {
    inquirer.prompt([
        {
            type: 'input',
            name: 'deptName',
            message: 'What is the name of the department?'
        }
    ]).then (newDept => {
        let sqlString = `INSERT INTO department (name) VALUES (?)`
        db.query(sqlString, newDept.deptName, (err, result) => {   
            if(err) throw err;
            console.log(`Added`, newDept.name,`to the database`)
            init();
        })
    })
}

function searchDept() {
    return db.promise().query('SELECT * FROM department');
}

async function deleteDept() {
    const [rows] = await searchDept()

    const deptArr = rows.map((department) => ({
        name: department.name,
        value: department.dept_id
    }))

    inquirer.prompt([
        {
            type: 'list',
            name: 'deptList',
            message: 'Which department do you want to delete?',
            choices: deptArr
        }
    ]).then(deleteAnswer =>{
        let sqlString = `DELETE FROM department WHERE dept_id = ?`;
        const deletedDept = deleteAnswer.deptList
        db.query(sqlString, deletedDept, (err, response) => {
            // if(err) throw err;
            console.log('Deleted', deletedDept, 'from the database!')
            init();
        })
    })
}

async function addRole() {
    const [rows] = await searchRoles()
    // console.log('rows:', rows);

    const deptArr = rows.map((department) => ({
        name: department.department,
        value: department.dept_id
    }))
    // console.log(deptArr);

    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the role?'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary of the role?'
        },
        {
            type: 'list',
            name: 'department',
            message: 'Which department does the role belong to?',
            choices: deptArr
        }
    ]).then (roleData => {
        let sqlString = `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`
        const newRole = [roleData.name, roleData.salary, roleData.department]
        db.query(sqlString, newRole, (err, result) => {
            if(err) throw err;
            console.log('Added', roleData.name, "to the database");
            init();
        })
    })
}

function searchManager() {
    return db.promise().query(`SELECT r.employee_id AS id, CONCAT(r.first_name, " ", r.last_name) AS manager FROM employee r`);
}

function searchRoles() {
    return db.promise().query(`SELECT id, title, salary, name AS department, dept_id
    FROM role
    LEFT JOIN department
    ON department_id = department.dept_id`)
}

async function deleteRole() {
    const [rows] = await searchRoles()

    const rolesArr = rows.map((findRole) => ({
        name: findRole.title,
        value: findRole.id
    }))

    inquirer.prompt([
        {
            type: 'list',
            name: 'roleList',
            message: 'Which role do you want to delete?',
            choices: rolesArr
        }
    ]).then(deletedRole => {
        let sqlString = `DELETE FROM role WHERE id = ?`
        const roleId = deletedRole.roleList
        
        db.query(sqlString, roleId, (err, result) => {
            if(err) throw err;
            console.log('Deleted', roleId, 'from role table')
            init();
        })
    })
}

async function addEmployee() {
    const [rows] = await searchManager()
    // console.log("rows:", rows)

    const [rolesRows] = await searchRoles()

    const employeeArr = rows.map((findManager) => ({
        name: findManager.manager,
        value: findManager.id
    }))
    // console.log('rows:', employeeArr);

    const rolesArr = rolesRows.map((findRole) => ({
        name: findRole.title,
        value: findRole.id
    }))

    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "What is the employee's first name"
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?"
        },
        {
            type: 'list',
            name: 'role',
            message: "What is the employee's role?",
            choices: rolesArr
        },
        {
            type: 'list',
            name: 'manager',
            message: "Who is the employee's manager?",
            choices: employeeArr
        }
    ]).then(employeeData => {
        let sqlString = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`
        const newEmployee = [employeeData.firstName, employeeData.lastName, employeeData.role, employeeData.manager]
        console.log("newEmployee", newEmployee)
        db.query(sqlString, newEmployee, (err, result) => {
            if(err) throw err;
            console.log("Added", employeeData.firstName, employeeData.lastName, "to the database");
            init();
        })
    }) 
}

function searchEmployee() {
    return db.promise().query(`SELECT employee_id AS id, role_id, title, CONCAT(first_name, " ", last_name) AS name FROM employee LEFT JOIN role ON role_id = role.id`);
}

async function deleteEmployee() {
    const [rows] = await searchEmployee()

    const chooseEmploy = rows.map((findEmploy) => ({
        name: findEmploy.name,
        value: findEmploy.id
    }))

    inquirer.prompt([
        {
            type: 'list',
            name: 'employeeList',
            message: 'Which employee do you want to delete?',
            choices: chooseEmploy
        }
    ]).then(deletedEmployee => {
        let sqlString = `DELETE FROM employee WHERE employee_id = ?`
        const employeeID = deletedEmployee.employeeList

        db.query(sqlString, employeeID, (err, result) => {
            if(err) throw err;
            console.log("Employee Deleted!")
            init();
        })
    })
}

async function updateRole() {
    const [rows] = await searchEmployee()
    // console.log(rows);

    const chooseEmploy = rows.map((findEmploy) =>({
        name: findEmploy.name,
        value: findEmploy.id
    }))

    const chooseRole = rows.map((findRole) => ({
        name: findRole.title,
        value: findRole.role_id
    }))

    inquirer.prompt([
        {
            type: 'list',
            name: 'employeeList',
            message: "Which employee's role do you want to update?",
            choices: chooseEmploy
        },
        {
            type: 'list',
            name: 'roleList',
            message: "What is the employee's new role?",
            choices: chooseRole
        }
    ]).then(newRoleAnswers => {
        let sqlString = `UPDATE employee SET role_id =?
        WHERE employee_id =?`
        const answers = [newRoleAnswers.roleList, newRoleAnswers.employeeList]
        // console.log("newEmployeeRole", answers)
        db.query(sqlString, answers, (err, result) => {
            if(err) throw err;
            console.log("Updated successful!");
            init();
        })
    })
}

async function updateManager() {
    [rows] = await searchEmployee()
    // console.log("new row", rows)

    const chooseEmployee = rows.map((findEmployee) => ({
        name: findEmployee.name,
        value: findEmployee.id
    }))

    inquirer.prompt([
        {
            type: 'list',
            name: 'employeeList',
            message: "Which employee manager do you want to update?",
            choices: chooseEmployee
        },
        {
            type: 'list',
            name: 'managerList',
            message: "Who is the employee's new manager?",
            choices: chooseEmployee
        }
    ]).then(newManagerAnswers => {
        let sqlString = `UPDATE employee SET manager_id =?
        WHERE employee_id =?`
        const answers = [newManagerAnswers.managerList, newManagerAnswers.employeeList]
        // console.log("newEmployeeRole", answers)
        db.query(sqlString, answers, (err, result) => {
            if(err) throw err;
            console.log("Updated successful!");
            init();
        })
    })
}

function init() {
    questions()
    .then(answer => {
        if(answer.choice == "view all departments"){
            viewDepts();
        } else if(answer.choice == "view all roles") {
            // console.log(answer)
            viewRoles();
        } else if(answer.choice == "view all employees") {
            // console.log(answer)
            viewEmployees();
        } else if(answer.choice == "add a department") {
            addDept();
        } else if(answer.choice == "add a role") {
            addRole();
        } else if(answer.choice == "add an employee") {
            addEmployee();
        } else if(answer.choice == "update an employee role") {
            updateRole();
        }else if(answer.choice == "update an employee's manager"){
            updateManager();
        } else if(answer.choice == "view employees by manager") {
            viewEmployeesByManager();
        } else if(answer.choice == "view employees by department") {
            viewEmployeesByDept();
        } else if(answer.choice == "delete a department") {
            deleteDept();
        } else if(answer.choice == "delete a role") {
            deleteRole();
        } else if (answer.choice == "delete an employee") {
            deleteEmployee();
        } else (console.log(answer))
    })
}