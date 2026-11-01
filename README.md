# ImpactLink – AI-Powered Community Campaign Platform

ImpactLink is an AI-assisted community campaign platform designed to connect volunteers with organizations and coordinate meaningful social and environmental activities.

The platform helps organizations manage campaigns, match volunteers based on their skills and availability, track campaign progress, and review community issue reports.

## Key Features

### Volunteer
- Register and manage volunteer profiles.
- Add skills, location, and availability.
- Get AI-assisted campaign recommendations.
- Apply for campaigns and track application status.
- View assigned groups and tasks.
- Submit task completion evidence.
- Report community issues.

### Organization
- Register an organization and undergo admin verification.
- Create and manage community campaigns.
- Find suitable volunteers using AI-assisted matching.
- Review volunteer applications.
- Create groups and assign group leaders.
- Assign tasks and verify completion evidence.
- Review community issue reports in their city.
- View campaign statistics.

### Admin
- Review and approve or reject organizations.
- Monitor volunteers, organizations, campaigns, and issue reports.
- Access platform statistics through the admin dashboard.

### AI Capabilities
- Skill-, location-, availability-, and performance-based volunteer matching.
- AI-generated explanations for campaign recommendations.
- Role-based AI chatbot that answers questions using platform data.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Database Connection | pg |
| Authentication | JWT |
| Password Security | bcryptjs |
| AI Integration | Groq API |
| API Testing | Postman |
| Version Control | Git and GitHub |

## Project Structure

```text
ImpactLink/
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── frontend/
└── README.md
```

## Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/Pavan-2005-K/impact.git
cd impact
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `backend` folder.

Add your local PostgreSQL configuration and required application settings:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=impactlink
DB_USER=postgres
DB_PASSWORD=your_postgresql_password

JWT_SECRET=your_secret_key

ADMIN_NAME=Platform Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

Replace the example values with your own configuration. Never upload your actual `.env` file or API keys to GitHub.

### 4. Set up the database

Create a PostgreSQL database and execute the SQL schema provided in:

`backend/database/schema.sql`

### 5. Start the backend server

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

Health check:

`http://localhost:5000/health`

## Backend API Modules

| Module | Base Route |
|---|---|
| Authentication | `/api/auth` |
| Admin | `/api/admin` |
| Campaigns | `/api/campaigns` |
| Matching | `/api/matching` |
| Applications | `/api/applications` |
| Groups | `/api/groups` |
| Tasks | `/api/tasks` |
| Issue Reports | `/api/issues` |
| Dashboards | `/api/dashboard` |
| AI Chatbot | `/api/chatbot` |

All protected endpoints require a valid JWT access token.

## Volunteer Matching Approach

The matching system uses four factors:

- Skills – 40%
- Location – 30%
- Availability – 20%
- Past Performance – 10%

The AI integration generates explanations based on the matching results. It does not independently change the calculated matching score.

## Project Status

**Backend:** Core modules implemented and tested.

**Frontend:** Development pending.

**Future Enhancements:**
- Complete role-based frontend dashboards.
- Integrate image uploads using Cloudinary.
- Improve multi-day availability matching.
- Add duplicate community issue report detection.
- Enhance campaign analytics and reporting.

## Contributors

Developed as a team project.

## License

This project is developed for educational and academic purposes.