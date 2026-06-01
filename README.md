# Team Workspace & Task Collaboration System

A full-stack workspace collaboration app with a Django REST Framework backend and a React + TypeScript frontend.

## Features

- Email/password authentication with JWT.
- Create one workspace and manage workspace members.
- Admin/member role permissions.
- Jira-style task board with Todo, In Progress, and Done columns.
- Task create, edit, assign, status update, due date, priority, and comments.
- Members can view workspace tasks, but edit permissions are role-based.
- Removing a member makes their assigned tasks unassigned.
- Activity log for task creation, status updates, comments, and member changes.
- Filtering, searching, sorting, pagination, and scroll loading for tasks.

## Project Structure

```text
team-workspace/
├── Django task/   # Django REST API
└── Frontend/      # React + TypeScript UI
```

## Backend Setup

Requirements:

- Python 3.13+ or 3.14+
- PostgreSQL

Open a terminal from the project root:

```bash
cd "Django task"
```

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
python -m pip install Django==6.0.5 djangorestframework django-filter djangorestframework-simplejwt python-decouple psycopg2-binary
```

Create a `.env` file inside `Django task/`:

```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=workspace_demo
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432
```

Create the PostgreSQL database:

```bash
createdb workspace_demo
```

Run migrations:

```bash
python manage.py migrate
```

Optional: create admin user:

```bash
python manage.py createsuperuser
```

Run backend server:

```bash
python manage.py runserver
```

Backend runs at:

```text
http://127.0.0.1:8000/
```

Main API routes:

```text
/api/auth/
/api/workspaces/
/api/tasks/
/api/comments/
/api/activity-logs/
```

## Frontend Setup

Requirements:

- Node.js
- npm

Open another terminal from the project root:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173/
```

The Vite dev server proxies `/api` requests to:

```text
http://127.0.0.1:8000
```

So keep the Django backend running while using the frontend.

## Build Frontend

```bash
cd Frontend
npm run build
```

## Common Notes

- Login uses email and password.
- Use different browser tabs/windows after the session-storage change if testing admin and member accounts.
- If `python3 -m venv` fails on Ubuntu, install the venv package first:

```bash
sudo apt install python3.14-venv
```

- If `vite: Permission denied` happens, reinstall frontend dependencies:

```bash
cd Frontend
rm -rf node_modules
npm install
```
