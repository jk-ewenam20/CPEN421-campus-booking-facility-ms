# API Quick Reference Guide

## Base URL
```
https://cpen421-campus-booking-facility-ms.onrender.com
```

## Authentication
All endpoints except **Register** and **Get Facilities** require a valid session cookie (`JSESSIONID`).

---

## Quick Endpoint Summary

### Authentication
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/login` | ❌ | - | Login user |
| POST | `/auth/logout` | ✅ | Any | Logout user |

### Users
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/users` | ❌ | - | Register new user |
| GET | `/users` | ✅ | Admin | Get all users |
| GET | `/users/{id}` | ✅ | Admin/Self | Get user by ID |
| PUT | `/users/{id}` | ✅ | Admin/Self | Update user |
| DELETE | `/users/{id}` | ✅ | Admin | Delete user |

### Facilities
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/facilities` | ✅ | Admin | Create facility |
| GET | `/facilities` | ❌ | - | Get all facilities |
| GET | `/facilities/{id}` | ❌ | - | Get facility by ID |
| PUT | `/facilities/{id}` | ✅ | Admin | Update facility |
| DELETE | `/facilities/{id}` | ✅ | Admin | Delete facility |

### Bookings
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/bookings` | ✅ | Any | Get all bookings |
| POST | `/bookings` | ✅ | Any | Create booking |
| PUT | `/bookings/{id}` | ✅ | Admin/Owner | Update booking |
| DELETE | `/bookings/{id}` | ✅ | Admin/Owner | Cancel booking |
| GET | `/bookings/availability` | ✅ | Any | Check availability |

---

## Common Request/Response Examples

### 1. Register & Login

**Register:**
```bash
curl -X POST https://cpen421-campus-booking-facility-ms.onrender.com/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response (201):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Login:**
```bash
curl -X POST https://cpen421-campus-booking-facility-ms.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

**Response (200):**
```json
{
  "id": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "role": "USER",
  "message": "Login successful"
}
```

---

### 2. Create a Facility (Admin)

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

**Response (201):**
```json
{
  "id": 1,
  "name": "Meeting Room A",
  "location": "Building 1, Floor 2",
  "capacity": 20
}
```

---

### 3. Create a Booking

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

**Response (201):**
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

### 4. Check Availability

```bash
curl "https://cpen421-campus-booking-facility-ms.onrender.com/bookings/availability?facilityId=1&date=2026-03-20&startTime=10:00:00&endTime=11:30:00" \
  -b cookies.txt
```

**Response (200):**
```json
true
```

---

## Status Codes Cheat Sheet

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Use the response |
| 201 | Created | Resource created, use response |
| 400 | Bad Request | Check input format/validation |
| 401 | Unauthorized | Login required or session expired |
| 403 | Forbidden | Check user role/permissions |
| 404 | Not Found | Resource ID doesn't exist |
| 409 | Conflict | Duplicate or availability conflict |
| 500 | Server Error | Contact support |

---

## Common Issues

### 401 Unauthorized on Every Request
- ✅ Use `credentials: 'include'` in fetch calls
- ✅ Make sure you're sending the `JSESSIONID` cookie from login

### 403 Forbidden
- ✅ Check user role (Admin only endpoints require `role: "ADMIN"`)
- ✅ For user/booking endpoints, verify you own the resource or are Admin

### 404 Not Found
- ✅ Double-check the ID exists
- ✅ Verify the resource was created successfully

### 409 Facility Not Available
- ✅ Check existing bookings with `GET /bookings`
- ✅ Adjust your start/end times to avoid conflicts
- ✅ Use `/bookings/availability` to find free slots

---

## Date/Time Format

**Date:** ISO-8601 format
```
YYYY-MM-DD
Example: 2026-03-20
```

**Time:** ISO-8601 format
```
HH:mm:ss (24-hour)
Example: 10:00:00 (10 AM)
         14:30:00 (2:30 PM)
         23:59:00 (11:59 PM)
```

---

## Interactive API Explorer

Try endpoints interactively at:
```
https://cpen421-campus-booking-facility-ms.onrender.com/swagger-ui.html
```

---

**Version:** 1.0.0 | **Last Updated:** Feb 28, 2026
