# Facility Booking Microservice — API Documentation

## Overview

The **Facility Booking Microservice** is a Spring Boot REST API for managing facility bookings across a campus. It provides endpoints for user authentication, facility management, and booking operations with role-based access control.

**Base URL:** `https://cpen421-campus-booking-facility-ms.onrender.com` (Production)  
**Local Dev URL:** `http://localhost:8080`
**API Documentation:** `https://cpen421-campus-booking-facility-ms.onrender.com/swagger-ui.html`

**API Version:** 1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
   - [Authentication](#1-authentication-endpoints)
   - [Users](#2-user-endpoints)
   - [Facilities](#3-facility-endpoints)
   - [Bookings](#4-booking-endpoints)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Status Codes](#status-codes)
6. [Rate Limiting & Timeouts](#rate-limiting--timeouts)

---

## Authentication

The API uses **HTTP Session-based Authentication** with cookies.

### Login Flow

1. **POST** `/auth/login` with credentials
2. Backend returns a `JSESSIONID` cookie (HTTP-only, Secure, SameSite=None)
3. All subsequent requests must include the cookie (automatically sent by browsers with `credentials: 'include'`)

### Session Details

- **Cookie Name:** `JSESSIONID`
- **Duration:** 30 minutes (configurable)
- **Storage:** Server-side HTTP session
- **Security:** `HttpOnly` (no JS access), `Secure` (HTTPS only), `SameSite=None` (cross-origin support)

### Logout

Call **POST** `/auth/logout` to invalidate the session. The cookie is deleted.

---

## Endpoints

### 1. Authentication Endpoints

#### 1.1 Login

```
POST /auth/login
```

**Description:** Authenticates a user and creates a session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Yes | User email (valid email format) |
| `password` | String | Yes | User password |

**Response Body (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "message": "Login successful"
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | User ID |
| `email` | String | User email |
| `name` | String | User full name |
| `role` | String | User role (`ADMIN` or `USER`) |
| `message` | String | Success message |

**Response Headers:**
- `Set-Cookie: JSESSIONID=<session-id>; HttpOnly; Secure; SameSite=None; Path=/`

**Status Codes:**
- `200 OK` — Login successful, session created
- `401 Unauthorized` — Invalid email or password
- `400 Bad Request` — Missing or invalid fields

**Example (cURL):**
```bash
curl -X POST https://cpen421-campus-booking-facility-ms.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

---

#### 1.2 Logout

```
POST /auth/logout
```

**Description:** Invalidates the user session and deletes the `JSESSIONID` cookie.

**Authentication Required:** Yes (session cookie)

**Response Body (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Status Codes:**
- `200 OK` — Logout successful
- `401 Unauthorized` — No active session

**Example (cURL):**
```bash
curl -X POST https://cpen421-campus-booking-facility-ms.onrender.com/auth/logout \
  -b cookies.txt
```

---

### 2. User Endpoints

#### 2.1 Register a New User

```
POST /users
```

**Description:** Creates a new user account. No authentication required.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword123",
  "role": "USER"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | User full name (non-blank) |
| `email` | String | Yes | User email (valid email format) |
| `password` | String | Yes | User password (non-blank) |
| `role` | String | No | User role (`ADMIN` or `USER`). Defaults to `USER` if omitted |

**Response Body (201 Created):**
```json
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "USER"
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Auto-generated user ID |
| `name` | String | User full name |
| `email` | String | User email |
| `role` | String | User role |

**Status Codes:**
- `201 Created` — User registered successfully
- `400 Bad Request` — Invalid input or email already exists
- `409 Conflict` — Email already in use

**Example (cURL):**
```bash
curl -X POST https://cpen421-campus-booking-facility-ms.onrender.com/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securepassword123"
  }'
```

---

#### 2.2 Get All Users

```
GET /users
```

**Description:** Retrieves a list of all users (Admin only).

**Authentication Required:** Yes (Admin role)

**Response Body (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ADMIN"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "USER"
  }
]
```

**Status Codes:**
- `200 OK` — Users retrieved successfully
- `401 Unauthorized` — No active session
- `403 Forbidden` — User does not have Admin role

**Example (cURL):**
```bash
curl -X GET https://cpen421-campus-booking-facility-ms.onrender.com/users \
  -b cookies.txt
```

---

#### 2.3 Get a User by ID

```
GET /users/{id}
```

**Description:** Retrieves a specific user. Admins can fetch any user; Users can only fetch their own profile.

**Authentication Required:** Yes

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Number | User ID |

**Response Body (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ADMIN"
}
```

**Status Codes:**
- `200 OK` — User found
- `401 Unauthorized` — No active session
- `403 Forbidden` — Access denied (not your profile and not Admin)
- `404 Not Found` — User does not exist

**Example (cURL):**
```bash
curl -X GET https://cpen421-campus-booking-facility-ms.onrender.com/users/1 \
  -b cookies.txt
```

---

#### 2.4 Update a User

```
PUT /users/{id}
```

**Description:** Updates user information. Admins can update any user; Users can only update their own profile.

**Authentication Required:** Yes

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Number | User ID |

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "password": "newpassword123",
  "role": "USER"
}
```

**Request Fields:** Same as Register endpoint (all optional but recommended to include all)

**Response Body (200 OK):**
```json
{
  "id": 1,
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "USER"
}
```

**Status Codes:**
- `200 OK` — User updated successfully
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — No active session
- `403 Forbidden` — Access denied
- `404 Not Found` — User does not exist

**Example (cURL):**
```bash
curl -X PUT https://cpen421-campus-booking-facility-ms.onrender.com/users/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com",
    "password": "newpassword123"
  }'
```

---

#### 2.5 Delete a User

```
DELETE /users/{id}
```

**Description:** Deletes a user (Admin only).

**Authentication Required:** Yes (Admin role)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Number | User ID to delete |

**Response Body (200 OK):**
```json
"User deleted"
```

**Status Codes:**
- `200 OK` — User deleted successfully
- `401 Unauthorized` — No active session
- `403 Forbidden` — User does not have Admin role
- `404 Not Found` — User does not exist

**Example (cURL):**
```bash
curl -X DELETE https://cpen421-campus-booking-facility-ms.onrender.com/users/2 \
  -b cookies.txt
```

---

### 3. Facility Endpoints

#### 3.1 Create a Facility

```
POST /facilities
```

**Description:** Creates a new facility (Admin only).

**Authentication Required:** Yes (Admin role)

**Request Body:**
```json
{
  "name": "Meeting Room A",
  "location": "Building 1, Floor 2",
  "capacity": 20
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Facility name |
| `location` | String | Yes | Facility location |
| `capacity` | Number | Yes | Max number of people |

**Response Body (201 Created):**
```json
{
  "id": 1,
  "name": "Meeting Room A",
  "location": "Building 1, Floor 2",
  "capacity": 20
}
```

**Status Codes:**
- `201 Created` — Facility created successfully
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — No active session
- `403 Forbidden` — User does not have Admin role

**Example (cURL):**
```bash
curl -X POST https://cpen421-campus-booking-facility-ms.onrender.com/facilities \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Meeting Room A",
    "location": "Building 1, Floor 2",
    "capacity": 20
  }'
```

---

#### 3.2 Get All Facilities

```
GET /facilities
```

**Description:** Retrieves a list of all available facilities (public endpoint).

**Authentication Required:** No

**Response Body (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Meeting Room A",
    "location": "Building 1, Floor 2",
    "capacity": 20
  },
  {
    "id": 2,
    "name": "Auditorium",
    "location": "Building 2, Ground Floor",
    "capacity": 100
  }
]
```

**Status Codes:**
- `200 OK` — Facilities retrieved successfully

**Example (cURL):**
```bash
curl -X GET https://cpen421-campus-booking-facility-ms.onrender.com/facilities
```

---

#### 3.3 Get a Facility by ID

```
GET /facilities/{id}
```

**Description:** Retrieves details of a specific facility (public endpoint).

**Authentication Required:** No

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Number | Facility ID |

**Response Body (200 OK):**
```json
{
  "id": 1,
  "name": "Meeting Room A",
  "location": "Building 1, Floor 2",
  "capacity": 20
}
```

**Status Codes:**
- `200 OK` — Facility found
- `404 Not Found` — Facility does not exist

**Example (cURL):**
```bash
curl -X GET https://cpen421-campus-booking-facility-ms.onrender.com/facilities/1
```

---

#### 3.4 Update a Facility

```
PUT /facilities/{id}
```

**Description:** Updates facility details (Admin only).

**Authentication Required:** Yes (Admin role)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Number | Facility ID |

**Request Body:**
```json
{
  "name": "Meeting Room A (Updated)",
  "location": "Building 1, Floor 3",
  "capacity": 25
}
```

**Response Body (200 OK):**
```json
{
  "id": 1,
  "name": "Meeting Room A (Updated)",
  "location": "Building 1, Floor 3",
  "capacity": 25
}
```

**Status Codes:**
- `200 OK` — Facility updated successfully
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — No active session
- `403 Forbidden` — User does not have Admin role
- `404 Not Found` — Facility does not exist

**Example (cURL):**
```bash
curl -X PUT https://cpen421-campus-booking-facility-ms.onrender.com/facilities/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Meeting Room A (Updated)",
    "location": "Building 1, Floor 3",
    "capacity": 25
  }'
```

---

#### 3.5 Delete a Facility

```
DELETE /facilities/{id}
```

**Description:** Deletes a facility (Admin only).

**Authentication Required:** Yes (Admin role)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Number | Facility ID |

**Response Body (200 OK):**
```json
"Facility deleted"
```

**Status Codes:**
- `200 OK` — Facility deleted successfully
- `401 Unauthorized` — No active session
- `403 Forbidden` — User does not have Admin role
- `404 Not Found` — Facility does not exist

**Example (cURL):**
```bash
curl -X DELETE https://cpen421-campus-booking-facility-ms.onrender.com/facilities/1 \
  -b cookies.txt
```

---

### 4. Booking Endpoints

#### 4.1 Get All Bookings

```
GET /bookings
```

**Description:** Retrieves a list of all facility bookings.

**Authentication Required:** Yes

**Response Body (200 OK):**
```json
[
  {
    "id": 1,
    "facilityId": 1,
    "facilityName": "Meeting Room A",
    "userId": 1,
    "userName": "John Doe",
    "date": "2026-03-15",
    "startTime": "09:00:00",
    "endTime": "10:30:00"
  },
  {
    "id": 2,
    "facilityId": 2,
    "facilityName": "Auditorium",
    "userId": 2,
    "userName": "Jane Smith",
    "date": "2026-03-16",
    "startTime": "14:00:00",
    "endTime": "16:00:00"
  }
]
```

**Status Codes:**
- `200 OK` — Bookings retrieved successfully
- `401 Unauthorized` — No active session

**Example (cURL):**
```bash
curl -X GET https://cpen421-campus-booking-facility-ms.onrender.com/bookings \
  -b cookies.txt
```

---

#### 4.2 Create a Booking

```
POST /bookings
```

**Description:** Creates a new facility booking. Regular users are automatically assigned to their own user ID; Admins can specify any user.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "facilityId": 1,
  "userId": 1,
  "date": "2026-03-20",
  "startTime": "10:00:00",
  "endTime": "11:30:00"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `facilityId` | Number | Yes | ID of the facility to book |
| `userId` | Number | Yes | ID of the user booking (overridden for non-Admins) |
| `date` | String | Yes | Date of booking (ISO-8601: `YYYY-MM-DD`) |
| `startTime` | String | Yes | Start time (ISO-8601: `HH:mm:ss`) |
| `endTime` | String | Yes | End time (ISO-8601: `HH:mm:ss`) |

**Response Body (201 Created):**
```json
{
  "id": 3,
  "facilityId": 1,
  "facilityName": "Meeting Room A",
  "userId": 1,
  "userName": "John Doe",
  "date": "2026-03-20",
  "startTime": "10:00:00",
  "endTime": "11:30:00"
}
```

**Status Codes:**
- `201 Created` — Booking created successfully
- `400 Bad Request` — Invalid input or invalid time range
- `401 Unauthorized` — No active session
- `404 Not Found` — Facility or user does not exist
- `409 Conflict` — Facility not available for the requested time slot

**Example (cURL):**
```bash
curl -X POST https://cpen421-campus-booking-facility-ms.onrender.com/bookings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "facilityId": 1,
    "userId": 1,
    "date": "2026-03-20",
    "startTime": "10:00:00",
    "endTime": "11:30:00"
  }'
```

---

#### 4.3 Update a Booking

```
PUT /bookings/{id}
```

**Description:** Updates a booking. Admins can update any booking; Users can only update their own.

**Authentication Required:** Yes

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Number | Booking ID |

**Request Body:**
```json
{
  "facilityId": 1,
  "userId": 1,
  "date": "2026-03-20",
  "startTime": "11:00:00",
  "endTime": "12:00:00"
}
```

**Response Body (200 OK):**
```json
{
  "id": 3,
  "facilityId": 1,
  "facilityName": "Meeting Room A",
  "userId": 1,
  "userName": "John Doe",
  "date": "2026-03-20",
  "startTime": "11:00:00",
  "endTime": "12:00:00"
}
```

**Status Codes:**
- `200 OK` — Booking updated successfully
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — No active session
- `403 Forbidden` — Access denied (not your booking and not Admin)
- `404 Not Found` — Booking does not exist

**Example (cURL):**
```bash
curl -X PUT https://cpen421-campus-booking-facility-ms.onrender.com/bookings/3 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "facilityId": 1,
    "userId": 1,
    "date": "2026-03-20",
    "startTime": "11:00:00",
    "endTime": "12:00:00"
  }'
```

---

#### 4.4 Cancel a Booking

```
DELETE /bookings/{id}
```

**Description:** Cancels a booking. Admins can cancel any booking; Users can only cancel their own.

**Authentication Required:** Yes

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Number | Booking ID |

**Response Body (200 OK):**
```json
"Booking cancelled"
```

**Status Codes:**
- `200 OK` — Booking cancelled successfully
- `401 Unauthorized` — No active session
- `403 Forbidden` — Access denied (not your booking and not Admin)
- `404 Not Found` — Booking does not exist

**Example (cURL):**
```bash
curl -X DELETE https://cpen421-campus-booking-facility-ms.onrender.com/bookings/3 \
  -b cookies.txt
```

---

#### 4.5 Check Facility Availability

```
GET /bookings/availability
```

**Description:** Checks if a facility is available for the requested date and time range.

**Authentication Required:** Yes

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `facilityId` | Number | Yes | ID of the facility |
| `date` | String | Yes | Date to check (ISO-8601: `YYYY-MM-DD`) |
| `startTime` | String | Yes | Start time (ISO-8601: `HH:mm:ss`) |
| `endTime` | String | Yes | End time (ISO-8601: `HH:mm:ss`) |

**Response Body (200 OK):**
```json
true
```

The response is a boolean:
- `true` — Facility is available for the requested time slot
- `false` — Facility is already booked

**Status Codes:**
- `200 OK` — Availability check completed
- `401 Unauthorized` — No active session
- `404 Not Found` — Facility does not exist

**Example (cURL):**
```bash
curl -X GET "https://cpen421-campus-booking-facility-ms.onrender.com/bookings/availability?facilityId=1&date=2026-03-20&startTime=10:00:00&endTime=11:30:00" \
  -b cookies.txt
```

---

## Data Models

### User

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ADMIN"
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique identifier (auto-generated) |
| `name` | String | User full name |
| `email` | String | User email (unique) |
| `role` | String | Role: `ADMIN` or `USER` |

### Facility

```json
{
  "id": 1,
  "name": "Meeting Room A",
  "location": "Building 1, Floor 2",
  "capacity": 20
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique identifier (auto-generated) |
| `name` | String | Facility name |
| `location` | String | Physical location |
| `capacity` | Number | Maximum capacity |

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

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique identifier (auto-generated) |
| `facilityId` | Number | ID of the booked facility |
| `facilityName` | String | Name of the facility |
| `userId` | Number | ID of the user who booked |
| `userName` | String | Name of the user |
| `date` | String | Booking date (ISO-8601: `YYYY-MM-DD`) |
| `startTime` | String | Start time (ISO-8601: `HH:mm:ss`) |
| `endTime` | String | End time (ISO-8601: `HH:mm:ss`) |

---

## Error Handling

All errors return a JSON response with error details:

### Standard Error Response

```json
{
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

or

```json
{
  "message": "User not found"
}
```

### Common Error Scenarios

| Scenario | Status | Error Message |
|----------|--------|---------------|
| Missing authentication cookie | 401 | `Unauthorized` |
| Invalid credentials | 401 | `Invalid credentials` |
| Insufficient permissions | 403 | `Forbidden` — `You do not have permission to access this resource` |
| Resource not found | 404 | `<Resource> not found` |
| Duplicate email | 409 | `Email already exists` |
| Invalid time range | 400 | `Invalid time range` |
| Facility unavailable | 409 | `Facility not available for the requested time slot` |

---

## Status Codes

| Code | Meaning |
|------|---------|
| **200** | OK — Request successful |
| **201** | Created — Resource created successfully |
| **400** | Bad Request — Invalid input or malformed request |
| **401** | Unauthorized — Authentication required or failed |
| **403** | Forbidden — Access denied (insufficient permissions) |
| **404** | Not Found — Resource does not exist |
| **409** | Conflict — Resource conflict (e.g., duplicate email, facility unavailable) |
| **500** | Internal Server Error — Server-side error |

---

## Rate Limiting & Timeouts

### Session Timeout

- **Duration:** 30 minutes of inactivity
- **Action:** Session expires; user must re-login

### Request Timeout

- **Duration:** 30 seconds per request
- **Action:** Request fails with 504 Gateway Timeout

### No Hard Rate Limiting

Currently, no API-wide rate limiting is enforced. Use responsibly in production.

---

## Integration Examples

### Frontend (JavaScript/React)

```javascript
// Login
const response = await fetch('https://cpen421-campus-booking-facility-ms.onrender.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // Include cookies
  body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
});

const user = await response.json();
console.log('User:', user);

// Create Booking
const bookingRes = await fetch('https://cpen421-campus-booking-facility-ms.onrender.com/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    facilityId: 1,
    userId: 1,
    date: '2026-03-20',
    startTime: '10:00:00',
    endTime: '11:30:00'
  })
});

const booking = await bookingRes.json();
console.log('Booking created:', booking);
```

### Using Swagger UI

The API provides an interactive Swagger UI at:
- **Production:** `https://cpen421-campus-booking-facility-ms.onrender.com/swagger-ui.html`
- **Local Dev:** `http://localhost:8080/swagger-ui.html`

---

## Support & Troubleshooting

### Session Cookie Not Working

**Problem:** Login works, but subsequent requests return 401.

**Solution:**
- Ensure frontend uses `credentials: 'include'` on all fetch calls
- Verify that both frontend and backend use HTTPS in production
- Check CORS settings: `CORS_ALLOWED_ORIGINS` env var must match your frontend URL

### Facility Availability Shows Unavailable

**Problem:** Facility appears booked even though you're not aware of a conflicting booking.

**Solution:**
- Check all bookings: `GET /bookings`
- Verify exact times (start/end): times must not overlap with existing bookings
- Remember times are in UTC/server timezone

### Email Already Exists on Register

**Problem:** Registration fails with email already in use.

**Solution:**
- Use a different email address
- If you forgot your password, ask an Admin to delete your old account

---

**Last Updated:** February 28, 2026  
**API Version:** 1.0.0  
**Spring Boot Version:** 3.5.10
