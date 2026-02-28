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

WORKDIR /app

# Copy the fat jar and entrypoint script
COPY --from=builder /build/target/facility-booking-ms-*.jar app.jar
COPY docker-entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh && chown spring:spring entrypoint.sh app.jar

USER spring

# Document the default port (Render overrides this with $PORT at runtime)
EXPOSE 8080

ENTRYPOINT ["/app/entrypoint.sh"]
