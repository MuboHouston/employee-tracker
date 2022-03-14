INSERT INTO department(name)
VALUES
('Sales'),
('Marketing'),
('Finance'),
('IT'),
('Human Resources'),
('Operations');

INSERT INTO role(title, salary, department_id)
VALUES
('Sales Manager', 90000, 1),
('Salesperson', 60000, 1),
('Marketing Manager', 80000, 2),
('Content Creater', 60000, 2),
('Account Manager', 100000, 3),
('Accountant', 80000, 3),
('Lead Engineer', 130000, 4),
('Jr Software Engineer', 90000, 4),
('HR Director', 100000, 5),
('Jr HR Specialist', 60000, 5),
('Sr Operations Manager', 110000, 6),
('Operations Analyst', 60000, 6);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES
('Ashley', 'Smith', 1, NULL),
('Garrett', 'Houston', 2, 1),
('Tobi', 'Wright', 3, NULL),
('Ayo', 'Thompson', 4, 3),
('Lacey', 'Cobble', 5, NULL),
('Lisa', 'Profitt', 6, 5),
('Regina', 'Greenleaf', 7, NULL),
('Mayra', 'Gonzalez', 8, 7),
('Rob', 'Thomas', 9, NULL),
('Mihai', 'Seeds', 10, 9),
('Kemba', 'Lee', 11, NULL),
('Kevin', 'Smith', 12, 11)