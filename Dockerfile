# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper first (lets Docker cache the wrapper download separately)
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Download all dependencies — this layer is cached unless pom.xml changes
RUN ./mvnw dependency:go-offline -B -q

# Copy source and package (skipping tests — run them in CI, not the image build)
COPY src src
RUN ./mvnw package -DskipTests -B -q

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

# Non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

WORKDIR /app

# Copy the fat jar from the builder stage
COPY --from=builder /build/target/facility-booking-ms-*.jar app.jar

# Document the default port (Render overrides this with $PORT at runtime)
EXPOSE 8080

# Activate the prod profile and bind to Render's $PORT (falls back to 8080 locally)
ENTRYPOINT ["sh", "-c", "java \
  -Dspring.profiles.active=prod \
  -Dserver.port=${PORT:-8080} \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -jar app.jar"]
