CREATE TABLE IF NOT EXISTS regions (
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name VARCHAR UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
	user_id UUID PRIMARY KEY NOT NULL,
	first_name VARCHAR(25) NOT NULL,
	last_name VARCHAR(25) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR NOT NULL,
	region_id INT REFERENCES regions(id) NOT NULL,
	admin_access BOOLEAN DEFAULT false,
	notes VARCHAR
);
CREATE TABLE IF NOT EXISTS site_templates (
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name VARCHAR NOT NULL,
	duration INT,
	notes VARCHAR
);
CREATE TABLE IF NOT EXISTS product_templates (
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name VARCHAR NOT NULL,
	duration INT,
	notes VARCHAR
);
CREATE TABLE IF NOT EXISTS health_templates (
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name VARCHAR NOT NULL,
	duration INT,
	notes VARCHAR,
	unit_standard VARCHAR
);
CREATE TABLE IF NOT EXISTS certification_templates (
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name VARCHAR NOT NULL,
	duration INT,
	notes VARCHAR
);
CREATE TABLE IF NOT EXISTS qualification_templates (
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name VARCHAR NOT NULL,
	notes VARCHAR
);
CREATE TABLE IF NOT EXISTS employee_site_inductions (
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	user_id UUID REFERENCES users(user_id) NOT NULL,
	template_id INT REFERENCES site_templates(id) NOT NULL,
	training_date DATE,
	expiration_date DATE
);
CREATE TABLE IF NOT EXISTS employee_product_certifications (
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	user_id UUID REFERENCES users(user_id) NOT NULL,
	template_id INT REFERENCES product_templates(id) NOT NULL,
	training_date DATE,
	expiration_date DATE
);
CREATE TABLE IF NOT EXISTS employee_health_qualifications (
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	user_id UUID REFERENCES users(user_id) NOT NULL,
	template_id INT REFERENCES health_templates(id) NOT NULL,
	training_date DATE,
	expiration_date DATE
);
CREATE TABLE IF NOT EXISTS employee_certifications (
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	user_id UUID REFERENCES users(user_id) NOT NULL,
	template_id INT REFERENCES certification_templates(id) NOT NULL,
	training_date DATE,
	expiration_date DATE
);
CREATE TABLE IF NOT EXISTS employee_qualifications (
	id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	user_id UUID REFERENCES users(user_id) NOT NULL,
	template_id INT REFERENCES qualification_templates(id) NOT NULL
);