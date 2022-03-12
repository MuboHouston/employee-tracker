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
                "add a roles", 
                "add an employee", 
                "update an employee role"
            ]
        }
    ])
}

function viewDepts() {
    const sqlString = `SELECT dept_id, name FROM department`

    db.promise().query(sqlString, (err, result) => {
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

    db.promise().query(sqlString, (err, result) => {
        if(err) throw err;
        console.log('\n')
        console.table(result)
        console.log('\n')

        init();
    })
}

function viewEmplys() {
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

    db.promise().query(sqlString, (err, result) => {
    if(err) throw err;
    console.log('\n')
    console.table(result)
    console.log('\n')

    init();
    })
}

function addDept()  {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Please enter the name of the department'
        }
    ]).then (newDept => {
        let sqlString = `INSERT INTO department (name) VALUES (?)`
        db.query(sqlString, newDept.name, (err, result) => {   
            if(err) throw err;
            console.log(`Added`, newDept.name,`to the database`)
            init();
        })
    })
}

function init() {
    questions()
    .then(answer => {
        if(answer.choice == "view all departments"){
            viewDepts()
        } else if (answer.choice == "view all roles") {
            // console.log(answer)
            viewRoles();
        } else if(answer.choice == "view all employees") {
            // console.log(answer)
            viewEmplys();
        } else if(answer.choice == "add a department") {
            addDept();
        } else (console.log(answer))
    })
}