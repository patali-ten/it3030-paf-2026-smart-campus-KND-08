# Smart Campus Operations Hub - SilverWood University

## 📖 Overview
The Smart Campus Operations Hub is a web-based application developed to manage university resources, bookings, and maintenance activities in a centralized system.

This system allows users to:
- Browse and book campus facilities (rooms, labs, equipment)
- Report incidents and maintenance issues
- Receive notifications on updates
- Manage workflows with role-based access

The application is built using:
- **Backend:** Spring Boot (REST API)
- **Frontend:** React.js
- **Database:** (MySQL Workbench)

---

## 🚀 Features

### 🏢 Facilities & Assets
- View and manage campus resources
- Filter by type, capacity, and location

### 📅 Booking Management
- Request bookings for resources
- Approval workflow (Pending → Approved/Rejected)
- Conflict prevention for overlapping bookings

### 🛠 Maintenance & Incident Management
- Report issues with resources
- Upload images as evidence
- Track ticket status (Open → In Progress → Resolved → Closed)

### 🔔 Notifications
- Get updates on bookings and tickets
- Notification panel in the UI

### 🔐 Authentication & Authorization
- Secure login (OAuth / JWT)
- Role-based access (User / Admin)

---

## ⚙️ Setup Instructions

### 🔧 Prerequisites

Install the following:

* Node.js (v18+)
* Java JDK (v17+)
* MySQL
* VS Code / IntelliJ IDEA
* Git

---

## 📦 Backend Setup (Spring Boot)

### 1. Open Project

Open the `smart-campus-api` folder in **IntelliJ** or **VS Code**

---

### 2. Configure Database

Go to this file:

src/main/resources/application.properties

Add or edit the following:

```
spring.datasource.url=jdbc:mysql://localhost:3306/smart_campus
spring.datasource.username=root
spring.datasource.password=yourpassword

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

👉 Replace:

* `yourpassword` with your MySQL password

---

### 3. Create Database

Run this in MySQL:

```
CREATE DATABASE smart_campus;
```

---

### 4. Run Backend

In IntelliJ:

* Click **Run**

OR in VS Code terminal:

```
mvn spring-boot:run
```

Server runs on:
http://localhost:8080

---

## 💻 Frontend Setup (React)

### 1. Open Folder

Open `smart-campus-client` in VS Code

---

### 2. Install Dependencies

```
npm install
```

---

### 3. Run Frontend

```
npm run dev
```

Open:
http://localhost:5173/

---

## 🔗 API Connection

Make sure backend is running before frontend.

If needed, update API URL inside React:

Example (in your API file):

```
const BASE_URL = "http://localhost:8080";
```

---

## 👥 Team Contributions

| Member   | Responsibility           |
| -------- | ------------------------ |
| Member 1 | Facilities & Assets      |
| Member 2 | Booking System           |
| Member 3 | Incident Management      |
| Member 4 | Notifications & Security |

---

## 🧪 Testing

* Tested using Postman
* Input validation and error handling implemented

---

## 📌 Notes

* Start MySQL before backend

---

## 📄 License

Academic project for IT3030 – PAF Assignment 2026
