FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy compiled jar
COPY target/planora-0.0.1-SNAPSHOT.jar app.jar

# JVM optimization for low memory usage (suitable for 1-2GB VPS)
ENV JAVA_OPTS="-Xms128m -Xmx512m -XX:+UseSerialGC -XX:TieredStopAtLevel=1"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
