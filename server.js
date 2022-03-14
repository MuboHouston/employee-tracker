//npm module
const inquirer = require('inquirer');
const db = require("./config/connection");

//connection
db.connect((err) => {
    if(err) throw err;
    init()
})

function questions () {
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
                "delete an employee",
                "total utilized budget",
                "exit"
            ]
        }
    ])
}

function searchDept() {
    return db.promise().query('SELECT * FROM department');
}

function searchRoles() {
    return db.promise().query(`SELECT id, title, salary, name AS department, dept_id
    FROM role
    LEFT JOIN department
    ON department_id = department.dept_id`)
}

function searchEmployee() {
    return db.promise().query(`SELECT employee_id AS id, role_id, title, CONCAT(first_name, " ", last_name) AS name FROM employee LEFT JOIN role ON role_id = role.id`);
}

//view section
function viewDepts() {
    const sqlString = `SELECT d.name, d.dept_id FROM department d`

    db.query(sqlString, (err, result) => {
        if(err) throw err;
        //creates new line
        console.log('\n')
        console.log("All Departments:")
        console.table(result)
        console.log('\n')

        init()
    })
}

function viewRoles() {
    const sqlString = `SELECT d.title, d.id AS role_id, name AS department, salary FROM role d 
    LEFT JOIN department 
    ON department_id = department.dept_id`

    db.query(sqlString, (err, result) => {
        if(err) throw err;
        console.log('\n')
        console.log("All Roles:")
        console.table(result)
        console.log('\n')

        init();
    })
}

function viewEmployees() {
    const sqlString = `
    SELECT e1.employee_id, e1.first_name, e1.last_name, title, name AS department, salary, CONCAT(e2.first_name, " ", e2.last_name) AS manager
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
    console.log("All Employees:")
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
            console.log("Employee(s) by Manager:")
            console.table(result);
            console.log('\n')
            init();
        })
    })
}

async function viewEmployeesByDept() {
    const [rows] = await searchDept()
    // console.log(rows);

    const chooseDept = rows.map((findDept) =>({
        name: findDept.name,
        value: findDept.dept_id
    }))
    // console.log("choose Dept:",chooseDept);

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
            console.log("Employee(s) by Department:")
            console.table(result);
            console.log('\n')
            init();
        })
    })
}

//add section
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
            console.log('\n')
            console.log(`Added`, newDept.deptName,`to the database`)
            console.log('\n')
            init();
        })
    })
}

async function addRole() {
    const [rows] = await searchDept()
    // console.log('rows:', rows);

    const deptArr = rows.map((department) => ({
        name: department.name,
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
            console.log('\n')
            console.log("Added", roleData.name, "to the database");
            console.log('\n')
            init();
        })
    })
}

async function addEmployee() {
    const [employeeRows] = await searchEmployee()
    // console.log("rows:", rows)

    const [rolesRows] = await searchRoles()

    const employeeArr = employeeRows.map((findManager) => ({
        name: findManager.name,
        id: findManager.id
    }))
    // console.log('rows:', employeeArr);

    const rolesArr = rolesRows.map((findRole) => ({
        name: findRole.title,
        value: findRole.id
    }))
    
    const numOfEmployees = employeeArr.length.toString()

    console.log('\n')
    console.log('Current Employee Table:')
    console.table(employeeArr)
    console.log('\n')

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
            type: 'input',
            name: 'manager',
            message: "Which manager does this employee report to? Please enter the manager's ID number or leave blank if no manager. (Refer to employee table above)",
            validate: managerInput => {
                if(managerInput == "" || parseInt(managerInput) > 0 && parseInt(managerInput) <= numOfEmployees) {
                return true
            } else {
                console.log("Please enter the manager's id number")
            }
        }
        }
    ]).then(employeeData => {
        if(employeeData.manager == "") {
            employeeData.manager = null
        } 

        let sqlString = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`
        const newEmployee = [employeeData.firstName, employeeData.lastName, employeeData.role, employeeData.manager]
        // console.log("newEmployee", newEmployee)
        db.query(sqlString, newEmployee, (err, result) => {
            if(err) throw err;
            console.log('\n')
            console.log("Added", employeeData.firstName, employeeData.lastName, "to the database");
            console.log('\n')
            init();
        })
    }) 
}

//delete section
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
            console.log('\n')
            console.log('Role deleted!')
            console.log('\n')
            init();
        })
    })
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
            console.log('\n')
            console.log('Department deleted!')
            console.log('\n')
            init();
        })
    })
}

async function deleteEmployee() {
    const [rows] = await searchEmployee()

    const findEmployee = rows.map((findEmploy) => ({
        name: findEmploy.name,
        value: findEmploy.id
    }))

    inquirer.prompt([
        {
            type: 'list',
            name: 'employeeList',
            message: 'Which employee do you want to delete?',
            choices: findEmployee
        }
    ]).then(deletedEmployee => {
        let sqlString = `DELETE FROM employee WHERE employee_id = ?`
        const employeeID = deletedEmployee.employeeList

        db.query(sqlString, employeeID, (err, result) => {
            if(err) throw err;
            console.log('\n')
            console.log("Employee Deleted!")
            console.log('\n')
            init();
        })
    })
}

//update section
async function updateRole() {
    const [employeeRows] = await searchEmployee();
    // console.log(employeeRows);

    const [roleRows] = await searchRoles();

    const findEmployee = employeeRows.map((findEmploy) =>({
        name: findEmploy.name,
        value: findEmploy.id
    }))

    const findRole = roleRows.map((findRole) => ({
        name: findRole.title,
        value: findRole.id
    }))

    inquirer.prompt([
        {
            type: 'list',
            name: 'employeeList',
            message: "Which employee's role do you want to update?",
            choices: findEmployee
        },
        {
            type: 'list',
            name: 'roleList',
            message: "What is the employee's new role?",
            choices: findRole
        }
    ]).then(newRoleAnswers => {
        let sqlString = `UPDATE employee SET role_id =?
        WHERE employee_id =?`
        const answers = [newRoleAnswers.roleList, newRoleAnswers.employeeList]
        // console.log("newEmployeeRole", answers)
        db.query(sqlString, answers, (err, result) => {
            if(err) throw err;
            console.log('\n')
            console.log("Update successful!");
            console.log('\n')
            init();
        })
    })
}

async function updateManager() {
    [rows] = await searchEmployee()
    // console.log("new row", rows)

    const findEmployee = rows.map((findEmploy) => ({
        name: findEmploy.name,
        value: findEmploy.id
    }))

    inquirer.prompt([
        {
            type: 'list',
            name: 'employeeList',
            message: "Which employee manager do you want to update?",
            choices: findEmployee
        },
        {
            type: 'list',
            name: 'managerList',
            message: "Who is the employee's new manager?",
            choices: findEmployee
        }
    ]).then(newManagerAnswers => {
        let sqlString = `UPDATE employee SET manager_id =?
        WHERE employee_id =?`
        const answers = [newManagerAnswers.managerList, newManagerAnswers.employeeList]
        // console.log("newEmployeeRole", answers)
        db.query(sqlString, answers, (err, result) => {
            if(err) throw err;
            console.log('\n')
            console.log("Update successful!");
            console.log('\n')
            init();
        })
    })
}

//total budget section
async function totalBudget() {
    [rows] = await searchDept()

    const findDept = rows.map((findDepartment) => ({
        name: findDepartment.name,
        value: findDepartment.dept_id
    }))

    inquirer.prompt([
        {
            type: 'list',
            name: 'deptBudget',
            message: "Please choose a department",
            choices: findDept
        }
    ]).then(deptBudgetAnswer => {
        let sqlString = `SELECT SUM(salary) AS total FROM role LEFT JOIN department ON department_id = department.dept_id WHERE dept_id = ?`
        const answer = deptBudgetAnswer.deptBudget
    
        db.query(sqlString, answer, (err, result) => {
        if(err) throw err;
        console.log('\n')
        console.log("Total Department Budget:")
        console.table(result)
        console.log('\n')

        init();
        })
    })
}

//
function exit() {
    console.log('\n')
    console.log("Press Control + C")
    console.log("Goodbye")
}

//first function after connection
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
        } else if (answer.choice == "total utilized budget") {
            totalBudget();
        } else if (answer.choice == "exit") {
            exit();
        } else (console.log(answer))
    })
}