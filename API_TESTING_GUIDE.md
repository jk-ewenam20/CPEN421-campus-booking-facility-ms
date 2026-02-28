# API Testing & Integration Guide

## Overview

This guide helps you test the Facility Booking API and integrate it into your applications.

---

## Table of Contents

1. [Testing Locally](#testing-locally)
2. [Testing in Production](#testing-in-production)
3. [Testing Tools](#testing-tools)
4. [Frontend Integration Examples](#frontend-integration-examples)
5. [Common Workflows](#common-workflows)

---

## Testing Locally

### Prerequisites

- Java 21 or later
- Maven
- PostgreSQL running locally

### Start the Backend

```bash
cd facility-booking-ms
./mvnw spring-boot:run
```

The API runs at: `http://localhost:8080`

### Access Swagger UI

Open your browser to:
```
http://localhost:8080/swagger-ui.html
```

You can test all endpoints interactively here.

---

## Testing in Production

### Base URL
```
https://cpen421-campus-booking-facility-ms.onrender.com
```

### Swagger UI
```
https://cpen421-campus-booking-facility-ms.onrender.com/swagger-ui.html
```

---

## Testing Tools

### 1. Using cURL

**Save cookies for authenticated requests:**

```bash
# Login and save cookie
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Use cookie in subsequent requests
curl -X GET http://localhost:8080/bookings \
  -b cookies.txt
```

### 2. Using Postman

1. **Import API:**
   - Open Postman
   - Click `Import` → `Link`
   - Paste: `http://localhost:8080/v3/api-docs`
   - Click `Import`

2. **Setup Authentication:**
   - Create a Login request: `POST /auth/login`
   - In the test script, save the response:
     ```javascript
     if (pm.response.code === 200) {
       // Cookie is auto-managed by Postman
       pm.environment.set("user_id", pm.response.json().id);
     }
     ```

3. **Test Endpoints:**
   - All endpoints now work with the saved session

### 3. Using HTTPie

```bash
# Login
http -S POST localhost:8080/auth/login \
  email=user@example.com password=password

# The session cookie is saved automatically
# Use subsequent requests
http GET localhost:8080/bookings
```

### 4. Using JavaScript/Fetch

```javascript
// Configure fetch for production
const API_BASE = 'https://cpen421-campus-booking-facility-ms.onrender.com';

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // IMPORTANT: Include cookies
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

async function getBookings() {
  const res = await fetch(`${API_BASE}/bookings`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'  // IMPORTANT: Include cookies
  });
  return res.json();
}

// Usage
await login('user@example.com', 'password');
const bookings = await getBookings();
console.log(bookings);
```

---

## Frontend Integration Examples

### React Example

```jsx
import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 
  'https://cpen421-campus-booking-facility-ms.onrender.com';

export function BookingApp() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Login
  async function handleLogin(email, password) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  }

  // Get bookings
  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  // Create booking
  async function createBooking(facilityId, date, startTime, endTime) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          facilityId,
          userId: user.id,
          date,
          startTime,
          endTime
        })
      });
      if (res.ok) {
        const newBooking = await res.json();
        setBookings([...bookings, newBooking]);
        return { success: true, booking: newBooking };
      }
      const error = await res.json();
      return { success: false, error: error.message };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <BookingDashboard 
          user={user}
          bookings={bookings}
          onFetchBookings={fetchBookings}
          onCreateBooking={createBooking}
        />
      )}
    </div>
  );
}
```

### Vue.js Example

```vue
<template>
  <div>
    <div v-if="!user">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login" :disabled="loading">Login</button>
    </div>
    <div v-else>
      <h1>Welcome, {{ user.name }}</h1>
      <button @click="fetchBookings" :disabled="loading">Refresh Bookings</button>
      <div v-for="booking in bookings" :key="booking.id">
        {{ booking.facilityName }} on {{ booking.date }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

const API_BASE = process.env.VUE_APP_API_BASE || 
  'https://cpen421-campus-booking-facility-ms.onrender.com';

export default {
  setup() {
    const user = ref(null);
    const bookings = ref([]);
    const email = ref('');
    const password = ref('');
    const loading = ref(false);

    async function login() {
      loading.value = true;
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: email.value, password: password.value })
        });
        if (res.ok) {
          user.value = await res.json();
          localStorage.setItem('user', JSON.stringify(user.value));
        }
      } finally {
        loading.value = false;
      }
    }

    async function fetchBookings() {
      loading.value = true;
      try {
        const res = await fetch(`${API_BASE}/bookings`, {
          credentials: 'include'
        });
        if (res.ok) {
          bookings.value = await res.json();
        }
      } finally {
        loading.value = false;
      }
    }

    return { user, bookings, email, password, loading, login, fetchBookings };
  }
};
</script>
```

---

## Common Workflows

### Workflow 1: User Registration and First Booking

```bash
# 1. Register user
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "secure123"
  }' -c cookies.txt

# Response:
# {"id":1,"name":"Alice Smith","email":"alice@example.com","role":"USER"}

# 2. Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secure123"}' \
  -b cookies.txt

# 3. Get all facilities
curl -X GET http://localhost:8080/facilities \
  -b cookies.txt

# 4. Check availability
curl -X GET "http://localhost:8080/bookings/availability?facilityId=1&date=2026-03-20&startTime=10:00:00&endTime=11:00:00" \
  -b cookies.txt

# Response: true (available)

# 5. Create booking
curl -X POST http://localhost:8080/bookings \
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

### Workflow 2: Admin Creates Facility and Views All Bookings

```bash
# 1. Login as admin
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  -c cookies.txt

# 2. Create new facility
curl -X POST http://localhost:8080/facilities \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Conference Room B",
    "location": "Building 2, Floor 3",
    "capacity": 30
  }'

# 3. View all bookings
curl -X GET http://localhost:8080/bookings \
  -b cookies.txt

# 4. View all users
curl -X GET http://localhost:8080/users \
  -b cookies.txt
```

### Workflow 3: Handle Booking Conflict

```bash
# 1. Try to book facility at conflicting time
curl -X POST http://localhost:8080/bookings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "facilityId": 1,
    "userId": 1,
    "date": "2026-03-20",
    "startTime": "10:00:00",
    "endTime": "11:00:00"
  }'

# Response: 409 Conflict
# "Facility not available for the requested time slot"

# 2. Check availability first
curl -X GET "http://localhost:8080/bookings/availability?facilityId=1&date=2026-03-20&startTime=10:00:00&endTime=11:00:00" \
  -b cookies.txt

# Response: false (not available)

# 3. Try different time
curl -X POST http://localhost:8080/bookings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "facilityId": 1,
    "userId": 1,
    "date": "2026-03-20",
    "startTime": "11:00:00",
    "endTime": "12:00:00"
  }'

# Success: 201 Created
```

---

## Testing Checklist

- [ ] **Register** a new user (POST /users)
- [ ] **Login** with valid credentials (POST /auth/login)
- [ ] **Get all facilities** (GET /facilities)
- [ ] **Create a facility** as admin (POST /facilities)
- [ ] **Check availability** before booking (GET /bookings/availability)
- [ ] **Create a booking** (POST /bookings)
- [ ] **Update a booking** (PUT /bookings/{id})
- [ ] **Cancel a booking** (DELETE /bookings/{id})
- [ ] **Get all bookings** (GET /bookings)
- [ ] **Logout** (POST /auth/logout)
- [ ] **Verify session expires** after logout (should return 401)

---

## Environment Variables for Frontend

Create a `.env` file in your frontend:

```env
# Local development
REACT_APP_API_BASE=http://localhost:8080

# Production (Render)
REACT_APP_API_BASE=https://cpen421-campus-booking-facility-ms.onrender.com

# Or leave empty to use relative paths
REACT_APP_API_BASE=
```

---

## Debugging Tips

### Session Cookie Issues

Check browser DevTools → Application → Cookies:
- Look for `JSESSIONID` cookie
- Verify it has `HttpOnly`, `Secure`, `SameSite=None` flags
- Check expiration time

### CORS Issues

If you see CORS errors in browser console:
- Ensure frontend URL matches `CORS_ALLOWED_ORIGINS` on Render
- Use `credentials: 'include'` in all fetch calls
- Check that both frontend and backend use HTTPS in production

### JSON Parse Errors

If you get JSON parse errors:
- Check that `Content-Type: application/json` header is set
- Verify response is valid JSON (not HTML error page)
- Log the response text to debug

### 401 After Login

If you get 401 after successful login:
- Ensure cookies are being sent: `credentials: 'include'`
- Check that session hasn't expired
- Try logging in again

---

## Performance Tips

1. **Cache facility list** — it rarely changes
2. **Debounce availability checks** — avoid hammering the API
3. **Batch updates** — update multiple bookings in a single transaction if possible
4. **Use response caching** — set appropriate Cache-Control headers on GET requests

---

## Support

- **Swagger UI:** [Production](https://cpen421-campus-booking-facility-ms.onrender.com/swagger-ui.html)
- **Full API Docs:** See `API_DOCUMENTATION.md`
- **Quick Reference:** See `API_QUICK_REFERENCE.md`

---

**Version:** 1.0.0 | **Last Updated:** Feb 28, 2026
