INSERT INTO departments(name)
VALUES
('Sales'),
('Marketing'),
('Finance'),
('IT'),
('Human Resources'),
('Operations');

INSERT INTO roles(title, salary, department_id)
VALUES
('Manager', 80000, 1),
('Salesperson', 60000, 1),
('Marketing Manager', 80000, 2),
('Content Creater', 60000, 2),
('Accountant', 100000, 3),
('Software Engineer', 120000, 4),
('Director', 100000, 5),
('Lead Operations', 100000, 6);
