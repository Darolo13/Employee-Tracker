INSERT INTO department (name)
VALUES
  ('Engineering'),
  ('Sales'),
  ('Finance'),
  ('Legal');

  INSERT INTO role (title, salary, department_id)
  VALUES
    ('Sales Lead', 100000, 2),
    ('Salesperson', 80000, 2),
    ('Lead Engineer', 150000, 1),
    ('Software Engineer', 120000, 1),
    ('Accountant', 125000, 3),
    ('Legal Team Lead', 250000, 4),
    ('Lawyer', 190000, 4),
    ('Account Manager', 120000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('Ronald', 'Firbank', 1, null),
  ('Virginia', 'Woolf', 7, null),
  ('Piers', 'Gaveston', 2, null),
  ('Charles', 'LeRoi', 3, null),
  ('Katherine', 'Mansfield', 8, null),
  ('Dora', 'Carrington', 2, 1),
  ('Edward', 'Bellamy', 5, 6),
  ('Montague', 'Summers', 4, 4),
  ('Octavia', 'Butler', 6, null),
  ('Unica', 'Zurn', 4, 4);