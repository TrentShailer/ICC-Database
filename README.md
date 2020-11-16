# ICC Database

---

### TL;DR

##### This is a real-world MVC web-server running of NodeJS and PostgreSQL

## Features:

- Login capabilities
- Tracking of assigned ICCs
- Alerts on expiring/incomplete ICCs
- Creation of ICC Templates by Admins
- Creation of accounts and assigning ICC templates by admins to their employees per region
- Report generation

## In Depth

The database is made up of a few catagories, users, ICC templates, and assigned ICCs.
Each user has their own user id (UUID) generated by the web-server along with a generated password that is stored in the database after being hashed via PBKDF 2.
Users are all assigned a region to allow admins to easily find the employees they are looking for.
The templates are seperated per type (Site Induction, Product Certifiction, Healh and Safety Qualifiction, General Certificationm, Qualification), these mainly hold a unique ID, a name, and a duration among other information.
The assigning tables link a template to a user and hold information about that specific induction for that user, e.g. training date, expiration date.

After logging in the employee's profile page is displayed where they have access to main site navigation, a list of their qualifications, and an area that displays alerts on, expiring, expired, and ICCs that require completion.

From there the user can view their specific ICCs via the nav bar.

Admins have access to an admin page, in this page they are able to add regions, add new templates, add new employees, manage employees, or generate reports.

When an employee is added, their login details are emailed to the supplied email address via a SMTP server.

Reports give the admin the ability to get a generated PDF document containing information about the ICCs that the employees in a region have which are especially useful in team meetings or finding which of their employee's do/do not have a specific ICC.

To manage employees, the admin must select a region to get a list of the employees, from there they can assign ICCs to those employees, view their ICCs, recover passwords, edit or delete the employee.

All of this comes together to form a well structured web-application that allows for easy management of employee ICCs.
