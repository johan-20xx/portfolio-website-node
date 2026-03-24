# StudyPortal - Academic Resource Site

A full-stack web application designed to help students access study materials.

## Tech Stack
- **Frontend:** HTML5, CSS3, JS (Responsive Grid Layout)
- **Backend:** Node.js, Express.js
- **Database:** SQLite3 (File-based relational DB)

## Workflow
1. User requests a specific subject note via the form.
2. Node.js backend receives the JSON data.
3. Data is persisted in the `database.db` file.
4. Admins can view requests via the `/api/messages` endpoint.