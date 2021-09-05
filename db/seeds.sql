INSERT INTO department (name)
VALUES
  ('Engineering'),
  ('Sales'),
  ('Finance'),
  ('Legal');

  INSERT INTO role (title, salary, department_id)
  VALUES
    ('Software Engineer', 120000, 1),
    ('Salesperson', 80000, 2),
    ('Accountant', 125000, 3),
    ('Lawyer', 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('Piers', 'Gaveston', 1, 2),
  ('Charles', 'LeRoi', 1, null),
  ('Virginia', 'Woolf', 2, 2),
  ('Ronald', 'Firbank', 1, null),
  ('Katherine', 'Mansfield', 3, null),
  ('Dora', 'Carrington', 1, 2),
  ('Edward', 'Bellamy', 1, 2),
  ('Montague', 'Summers', 2, 4),
  ('Octavia', 'Butler', 2, 4),
  ('Unica', 'Zurn', 4, null);