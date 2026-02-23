# Getting Started with Swagger UI - Step-by-Step Guide

## ✅ Prerequisites

- Java 21 or higher installed
- Maven installed (or use the Maven wrapper included)
- PostgreSQL running with `campus_booking_db` database
- An IDE (IntelliJ IDEA, VS Code, Eclipse, etc.)

## 🚀 Step 1: Build the Project

Open your terminal/command prompt and navigate to the project directory:

### Windows (Command Prompt)
```cmd
cd "C:\Users\Jonathan Ewenam\Documents\mobile&web software design &architecture\facility-booking-ms"
mvnw.cmd clean install
```

### Windows (PowerShell)
```powershell
cd "C:\Users\Jonathan Ewenam\Documents\mobile&web software design &architecture\facility-booking-ms"
.\mvnw.cmd clean install
```

### macOS/Linux
```bash
cd "path/to/facility-booking-ms"
./mvnw clean install
```

✨ **What happens**: Maven downloads all dependencies (including SpringDoc OpenAPI) and compiles your project.

---

## 🏃 Step 2: Run the Application

Keep using the same terminal window and run:

### Windows (Command Prompt)
```cmd
mvnw.cmd spring-boot:run
```

### Windows (PowerShell)
```powershell
.\mvnw.cmd spring-boot:run
```

### macOS/Linux
```bash
./mvnw spring-boot:run
```

✨ **What happens**: Your Spring Boot application starts and listens on `http://localhost:8080`

You should see output similar to:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_|\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::               (v3.5.10)

[main] o.s.b.a.w.s.WelcomeLoggerConfiguration : Starting WelcomeLoggerConfiguration
[main] o.s.b.a.w.s.WelcomeLoggerConfiguration : The following 1 profiles are active: "default"
...
[main] o.s.b.w.e.t.TomcatWebServer : Tomcat started on port(s): 8080 (http)
[main] c.m.f.FacilityBookingMsApplication : Started FacilityBookingMsApplication in X seconds
```

---

## 🌐 Step 3: Open Swagger UI in Your Browser

Once you see "Tomcat started on port(s): 8080", open your web browser and go to:

```
http://localhost:8080/swagger-ui.html
```

You should see the Swagger UI interface with:
- ✅ Title: "Facility Booking Microservice API"
- ✅ Version: "1.0.0"
- ✅ Three API groups: Bookings, Facilities, Users
- ✅ All endpoints listed and documented

---

## 📖 Step 4: Explore the API Documentation

### View Endpoint Details
1. Click on any endpoint (e.g., "GET /users")
2. You'll see:
   - **Summary**: What the endpoint does
   - **Description**: Detailed explanation
   - **Parameters**: Required/optional inputs
   - **Responses**: Expected outputs and status codes
   - **Schema**: Data structure of request/response

### Example: Exploring GET /users
```
GET /users
├── Summary: Get all users
├── Description: Retrieves a list of all users in the system
├── Parameters: None
├── Responses:
│   └── 200 OK: Successfully retrieved all users
│       └── Response Body: List<UserResponseDTO>
└── Models: UserResponseDTO schema shown at bottom
```

---

## 🧪 Step 5: Test an API Endpoint

### Test Create User Endpoint

Follow these steps to create a test user:

#### 1. Find the Endpoint
   - Scroll to the "Users" section
   - Look for "POST /users"

#### 2. Click "Try it out"
   - The endpoint section expands
   - A text area for request body appears

#### 3. Enter Sample Data
   In the request body text area, enter:
   ```json
   {
     "name": "John Doe",
     "email": "john.doe@example.com",
     "phone": "123-456-7890"
   }
   ```

#### 4. Click "Execute"
   - The request is sent to your application
   - You'll see the response

#### 5. Review the Response
   - **Status**: 201 Created (green = success)
   - **Response body**: The created user with ID
   ```json
   {
     "id": 1,
     "name": "John Doe",
     "email": "john.doe@example.com",
     "phone": "123-456-7890",
     "createdAt": "2026-02-17T10:30:00"
   }
   ```

---

## 📋 Step 6: Test More Endpoints

### Test Get All Users
1. Find "GET /users"
2. Click "Try it out"
3. Click "Execute"
4. See all users in the response (including the one you just created!)

### Test Get Facility By ID
1. Find "GET /facilities/{id}"
2. Click "Try it out"
3. Enter `1` in the `id` field
4. Click "Execute"
5. See details for facility with ID 1

### Test Create a Facility
1. Find "POST /facilities"
2. Click "Try it out"
3. Enter sample data:
   ```json
   {
     "name": "Conference Room A",
     "capacity": 20,
     "location": "Building 1, Floor 2"
   }
   ```
4. Click "Execute"
5. See the created facility with ID

---

## 🎯 Step 7: Test Booking Endpoints

### Check Facility Availability
1. Find "GET /bookings/availability"
2. Click "Try it out"
3. Enter parameters:
   - `facilityId`: 1
   - `date`: 2026-02-20
   - `startTime`: 09:00:00
   - `endTime`: 11:00:00
4. Click "Execute"
5. Response: `true` or `false` indicating availability

### Create a Booking
1. Find "POST /bookings"
2. Click "Try it out"
3. Enter sample data:
   ```json
   {
     "userId": 1,
     "facilityId": 1,
     "bookingDate": "2026-02-20",
     "startTime": "09:00:00",
     "endTime": "11:00:00"
   }
   ```
4. Click "Execute"
5. See the created booking with confirmation status

---

## 📊 Understanding Swagger UI Interface

### Color Legend
- 🟢 **Green (200 OK)**: Successful request
- 🔵 **Blue (201 Created)**: Resource created
- 🟠 **Orange (400 Bad Request)**: Invalid request
- 🔴 **Red (404 Not Found)**: Resource doesn't exist
- 🔴 **Red (409 Conflict)**: Conflict (e.g., facility not available)

### Common Buttons
| Button | Function |
|--------|----------|
| Try it out | Prepare the endpoint for testing |
| Execute | Send the request to the server |
| Cancel | Stop the request |
| Clear | Reset the endpoint form |

### Response Details
When you execute a request, you'll see:
- **Response Code**: HTTP status (200, 201, 400, etc.)
- **Response Headers**: HTTP headers returned by server
- **Response Body**: The actual data returned (JSON/XML)

---

## 🛠️ Customizing Requests

### Add Headers
1. Look for "Headers" section
2. Click to expand
3. Add custom headers if needed (usually not required for these endpoints)

### Change Content Type
1. Look for "Content-Type" header
2. Default is `application/json`
3. Most endpoints use JSON, so leave as is

### Add Query Parameters
For endpoints like "GET /bookings/availability":
1. Parameters appear as individual input fields
2. Fill in each required parameter
3. Optional parameters can be left blank

---

## ⚠️ Troubleshooting

### Problem: "Cannot GET /swagger-ui.html"
**Cause**: Application not running
**Solution**: 
1. Check your terminal for the "Tomcat started" message
2. If not started, run `mvnw spring-boot:run` again
3. Wait for application to fully start (usually 5-10 seconds)

### Problem: "Connection refused" error
**Cause**: Application crashed or not on port 8080
**Solution**:
1. Check terminal for error messages
2. Verify database connection details in `application.properties`
3. Ensure PostgreSQL is running
4. Restart the application

### Problem: Database errors
**Cause**: PostgreSQL not configured correctly
**Solution**:
1. Check `application.properties` database credentials
2. Ensure `campus_booking_db` database exists
3. Verify PostgreSQL is running
4. Check database user permissions

### Problem: Endpoint returns 400 Bad Request
**Cause**: Invalid request data
**Solution**:
1. Check the error message in response body
2. Verify all required fields are included
3. Check data types (dates should be YYYY-MM-DD format)
4. Refer to the schema definition in Swagger UI

### Problem: Endpoint returns 404 Not Found
**Cause**: Resource doesn't exist
**Solution**:
1. Create the resource first (e.g., create a user before creating a booking)
2. Verify the ID exists in the database
3. Use GET endpoints to find valid IDs

---

## 📚 Additional Swagger UI Features

### Download API Specification
1. Click the "Download" icon (if visible)
2. Or access directly at `http://localhost:8080/v3/api-docs`

### Search Endpoints
1. Use the search box at the top
2. Type partial endpoint name or method
3. Results filter in real-time

### View Data Models
1. Scroll to the bottom of Swagger UI
2. Under "Schemas" section
3. View all DTOs and their properties

### Filter by Tag
1. Look for tag filters at the top
2. Click a tag to show only those endpoints
3. Click again to deselect

---

## 🎓 Learning Path

### Beginner
1. ✅ Start here: Run the application
2. ✅ View Swagger UI interface
3. ✅ Test GET endpoints (read-only)
4. ✅ Test POST endpoints (create data)

### Intermediate
1. ✅ Test DELETE endpoints
2. ✅ Understand response codes
3. ✅ Learn request body structure
4. ✅ Check availability before booking

### Advanced
1. ✅ Export API specification
2. ✅ Generate client code
3. ✅ Integrate with frontend
4. ✅ Monitor API usage

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| Swagger UI | http://localhost:8080/swagger-ui.html |
| API Docs (JSON) | http://localhost:8080/v3/api-docs |
| API Docs (YAML) | http://localhost:8080/v3/api-docs.yaml |
| Application Health | http://localhost:8080/ |

---

## ✅ Checklist

- [ ] Java 21 installed
- [ ] PostgreSQL running with database created
- [ ] Project cloned/opened
- [ ] Maven dependencies installed (`mvnw clean install`)
- [ ] Application running (`mvnw spring-boot:run`)
- [ ] Swagger UI accessible (`http://localhost:8080/swagger-ui.html`)
- [ ] Can view endpoint documentation
- [ ] Can execute test requests
- [ ] Can see responses
- [ ] Ready to integrate with frontend!

---

## 🎉 You're All Set!

Your Swagger UI is now ready for:
- ✅ API documentation
- ✅ Interactive testing
- ✅ Team collaboration
- ✅ Frontend integration

### Next Steps:
1. Share Swagger UI URL with your frontend team
2. Create booking workflows
3. Test all endpoints
4. Deploy to production

---

## 📞 Need Help?

Refer to these documentation files:
- **QUICK_REFERENCE.md** - Quick commands and examples
- **SWAGGER_UI_GUIDE.md** - Comprehensive guide
- **VISUAL_OVERVIEW.md** - Architecture and flow diagrams
- **IMPLEMENTATION_SUMMARY.md** - Technical details

Happy coding! 🚀
