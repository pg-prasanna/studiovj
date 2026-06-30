# ==========================================
# Stage 1: Build
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Cache Maven dependencies separately from source
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src src
RUN mvn clean package -DskipTests -q

# ==========================================
# Stage 2: Runtime
# ==========================================
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

COPY --from=builder /build/target/*.jar app.jar

RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# Configurable JVM options (e.g. -Xmx512m)
ENV JAVA_OPTS=""

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
