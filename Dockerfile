# Use Java 21
FROM eclipse-temurin:21-jdk

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Make the Maven wrapper executable and build the project using it
RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

# Expose port 8080
EXPOSE 8080

# Copy the built jar to a known name (artifact produced by this project)
RUN cp target/facility-booking-ms-0.0.1-SNAPSHOT.jar app.jar

# Run the application
CMD ["java", "-jar", "app.jar"]