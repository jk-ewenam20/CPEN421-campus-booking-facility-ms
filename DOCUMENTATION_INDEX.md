# Documentation Index

This directory contains comprehensive documentation for the **Facility Booking Microservice API**.

## 📚 Documentation Files

### 1. **API_DOCUMENTATION.md** ⭐ START HERE
Complete API reference covering:
- All endpoints with detailed descriptions
- Request/response examples with JSON schemas
- Authentication and session management
- Data models (User, Facility, Booking)
- Error handling and status codes
- Rate limiting and timeouts
- Frontend integration examples

**Use this for:** Understanding what each API endpoint does and how to use it.

---

### 2. **API_QUICK_REFERENCE.md** 🚀 QUICK START
At-a-glance reference guide with:
- Endpoint table (methods, URLs, auth requirements, roles)
- Common cURL examples
- Status codes cheat sheet
- Common issues and solutions
- Date/time format reference

**Use this for:** Quick lookups and testing endpoints quickly.

---

### 3. **API_TESTING_GUIDE.md** 🧪 TESTING
Comprehensive testing guide covering:
- Local setup and testing
- Testing in production
- Testing with cURL, Postman, HTTPie
- Frontend integration examples (React, Vue.js)
- Common workflows (registration, booking, conflict handling)
- Debugging tips
- Performance tips

**Use this for:** Setting up tests, integrating with your frontend, or debugging issues.

---

### 4. **README.md** 📖 PROJECT OVERVIEW
General project documentation with:
- Architecture overview
- Running locally
- Deployment instructions
- Environment variables
- Technologies used

**Use this for:** Understanding the project structure and deployment.

---

## 🌐 Live API & Swagger UI

### Production
- **API Base URL:** `https://cpen421-campus-booking-facility-ms.onrender.com`
- **Swagger UI:** `https://cpen421-campus-booking-facility-ms.onrender.com/swagger-ui.html`
- **OpenAPI Schema:** `https://cpen421-campus-booking-facility-ms.onrender.com/v3/api-docs`

### Local Development
- **API Base URL:** `http://localhost:8080`
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI Schema:** `http://localhost:8080/v3/api-docs`

---

## 🎯 Quick Navigation

### For Different User Types

**I'm a Frontend Developer**
1. Read: API_DOCUMENTATION.md (overview and authentication section)
2. Reference: API_QUICK_REFERENCE.md (endpoints table)
3. Follow: API_TESTING_GUIDE.md (frontend integration examples)
4. Explore: Swagger UI at `/swagger-ui.html`

**I'm a Backend Developer**
1. Read: README.md (architecture and setup)
2. Review: API_DOCUMENTATION.md (all endpoints and models)
3. Test: API_TESTING_GUIDE.md (testing workflows)
4. Modify: Source code in `src/main/java/com/mvc/facilitybookingms/`

**I'm a DevOps/Deployment Engineer**
1. Read: README.md (deployment section)
2. Check: GETTING_STARTED.md (if exists)
3. Configure: Environment variables for production
4. Deploy: Using Dockerfile and docker-entrypoint.sh

**I'm a QA/Tester**
1. Read: API_QUICK_REFERENCE.md (endpoint summary)
2. Follow: API_TESTING_GUIDE.md (testing workflows and checklist)
3. Use: Postman or Swagger UI for manual testing
4. Report: Issues with endpoint, status code, and error message

---

## 📋 API Endpoint Categories

### Authentication (2 endpoints)
- `POST /auth/login` — Login and create session
- `POST /auth/logout` — Logout and invalidate session

### Users (5 endpoints)
- `POST /users` — Register new user
- `GET /users` — Get all users (Admin)
- `GET /users/{id}` — Get user by ID
- `PUT /users/{id}` — Update user
- `DELETE /users/{id}` — Delete user (Admin)

### Facilities (5 endpoints)
- `POST /facilities` — Create facility (Admin)
- `GET /facilities` — Get all facilities
- `GET /facilities/{id}` — Get facility by ID
- `PUT /facilities/{id}` — Update facility (Admin)
- `DELETE /facilities/{id}` — Delete facility (Admin)

### Bookings (5 endpoints)
- `GET /bookings` — Get all bookings
- `POST /bookings` — Create booking
- `PUT /bookings/{id}` — Update booking
- `DELETE /bookings/{id}` — Cancel booking
- `GET /bookings/availability` — Check facility availability

**Total: 17 REST endpoints**

---

## 🔐 Authentication & Authorization

### Session-Based Authentication
- **Method:** HTTP Session with JSESSIONID cookie
- **Duration:** 30 minutes of inactivity
- **Security:** HttpOnly, Secure (HTTPS), SameSite=None (cross-origin)

### Authorization Levels
- **Public** (no auth): `/auth/login`, `/users` (register), `/facilities` (GET)
- **Authenticated** (any user): Most endpoints require login
- **Admin** (role-based): User/Facility management, booking approval

---

## 📊 Data Models

### User
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ADMIN" | "USER"
}
```

### Facility
```json
{
  "id": 1,
  "name": "Meeting Room A",
  "location": "Building 1, Floor 2",
  "capacity": 20
}
```

### Booking
```json
{
  "id": 1,
  "facilityId": 1,
  "facilityName": "Meeting Room A",
  "userId": 1,
  "userName": "John Doe",
  "date": "2026-03-20",
  "startTime": "10:00:00",
  "endTime": "11:30:00"
}
```

---

## 🚀 Getting Started in 5 Minutes

### 1. Access the API
```bash
# Local (if running locally)
curl http://localhost:8080/facilities

# Production
curl https://cpen421-campus-booking-facility-ms.onrender.com/facilities
```

### 2. Register a User
```bash
curl -X POST https://cpen421-campus-booking-facility-ms.onrender.com/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "you@example.com",
    "password": "password123"
  }'
```

### 3. Login
```bash
curl -X POST https://cpen421-campus-booking-facility-ms.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "you@example.com",
    "password": "password123"
  }'
```

### 4. Create a Booking
```bash
curl -X POST https://cpen421-campus-booking-facility-ms.onrender.com/bookings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "facilityId": 1,
    "userId": 1,
    "date": "2026-03-20",
    "startTime": "10:00:00",
    "endTime": "11:00:00"
  }'
```

### 5. View Interactive API
Open browser to:
```
https://cpen421-campus-booking-facility-ms.onrender.com/swagger-ui.html
```

---

## ❓ Common Questions

**Q: Where do I find endpoint documentation?**
A: See `API_DOCUMENTATION.md` for complete endpoint details.

**Q: How do I test the API?**
A: See `API_TESTING_GUIDE.md` for testing instructions and examples.

**Q: What's the base URL?**
A: Production: `https://cpen421-campus-booking-facility-ms.onrender.com`
   Local: `http://localhost:8080`

**Q: How do I authenticate?**
A: Login with `POST /auth/login`, then include the JSESSIONID cookie in subsequent requests.

**Q: Can I use Swagger UI?**
A: Yes! Open `/swagger-ui.html` on the API base URL.

**Q: What's the rate limit?**
A: No hard rate limits currently. Use responsibly in production.

**Q: How long is the session valid?**
A: 30 minutes of inactivity. Call `POST /auth/logout` to end the session.

---

## 📞 Support & Troubleshooting

### Session Issues
- See: API_TESTING_GUIDE.md → Debugging Tips → Session Cookie Issues

### CORS Issues
- See: API_TESTING_GUIDE.md → Debugging Tips → CORS Issues

### Booking Conflicts
- See: API_TESTING_GUIDE.md → Common Workflows → Workflow 3

### API Errors
- See: API_DOCUMENTATION.md → Error Handling

---

## 📝 Document Maintenance

| Document | Last Updated | Version |
|----------|--------------|---------|
| API_DOCUMENTATION.md | Feb 28, 2026 | 1.0.0 |
| API_QUICK_REFERENCE.md | Feb 28, 2026 | 1.0.0 |
| API_TESTING_GUIDE.md | Feb 28, 2026 | 1.0.0 |
| Documentation Index | Feb 28, 2026 | 1.0.0 |

---

## 🔗 Related Documentation

- **Deployment Guide:** See `GETTING_STARTED.md` and `README.md`
- **Fixes & Updates:** See `FINAL_REAL_FIX.md` and `SWAGGER_UI_RENDERING_FIX.md`
- **Frontend Repo:** See `campus-booking-react-frontend/` directory

---

## 📦 Technology Stack

- **Backend:** Spring Boot 3.5.10, Java 21
- **Database:** PostgreSQL 16.4 (Render Managed)
- **API:** REST with OpenAPI 3.0 (Swagger)
- **Authentication:** HTTP Session with Cookies
- **Frontend:** React 18+ (Vite)
- **Deployment:** Docker, Render

---

**Last Updated:** February 28, 2026  
**API Version:** 1.0.0  
**Maintained By:** Development Team
