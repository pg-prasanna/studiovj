# Photography Portfolio - Spring Boot Backend

A production-ready Spring Boot 3 backend API for photography portfolio management with Cloudinary integration.

## Features

- **Event Management**: Create, update, and manage photography events
- **Album Management**: Organize photos into albums within events
- **Photo Management**: Upload, organize, and delete photos with Cloudinary integration
- **RESTful API**: Complete REST API for all operations
- **Global Exception Handling**: Centralized error handling with detailed error responses
- **Validation**: Input validation with descriptive error messages
- **DTO Pattern**: Request/Response DTOs for clean API contracts
- **MapStruct Mapping**: Type-safe object mapping
- **Database Migrations**: Flyway for version control of database schema
- **CORS Support**: Configured for multiple frontend domains
- **Logging**: Comprehensive logging with SLF4J
- **Production Ready**: Security, performance, and scalability best practices

## Tech Stack

- **Java**: 21 LTS
- **Spring Boot**: 3.2.0
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA / Hibernate
- **Mapping**: MapStruct
- **Image Storage**: Cloudinary
- **Build Tool**: Maven
- **Database Migration**: Flyway
- **Logging**: SLF4J with Logback

## Project Structure

```
backend/
├── src/main/java/com/photography/portfolio/
│   ├── config/              # Spring configuration classes
│   ├── controller/          # REST API endpoints
│   ├── dto/                 # Request/Response DTOs
│   ├── entity/              # JPA entities
│   ├── repository/          # Data access layer
│   ├── service/             # Business logic layer
│   ├── mapper/              # MapStruct mappers
│   ├── exception/           # Custom exceptions
│   ├── util/                # Utility classes
│   ├── cloudinary/          # Cloudinary integration
│   └── PortfolioApplication.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/        # Flyway migration scripts
├── pom.xml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Java 21 JDK
- Maven 3.6+
- MySQL 8.0+
- Cloudinary Account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your actual values:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   DATABASE_USER=root
   DATABASE_PASSWORD=your_password
   ```

3. **Create database**
   ```bash
   mysql -u root -p
   CREATE DATABASE photography_portfolio;
   exit;
   ```

4. **Build the project**
   ```bash
   mvn clean build
   ```

5. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

   Or run with specific profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
   ```

The API will be available at: `http://localhost:8080/api`

## API Endpoints

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events` | Create a new event |
| GET | `/api/events` | Get all events |
| GET | `/api/events/{id}` | Get event by ID |
| GET | `/api/events/published` | Get all published events |
| GET | `/api/events/featured` | Get all featured events |
| PUT | `/api/events/{id}` | Update event |
| DELETE | `/api/events/{id}` | Delete event |
| POST | `/api/events/{id}/publish` | Publish event |
| POST | `/api/events/{id}/unpublish` | Unpublish event |

### Albums

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/albums` | Create album |
| GET | `/api/albums/event/{eventId}` | Get albums by event |
| GET | `/api/albums/{id}` | Get album by ID |
| PUT | `/api/albums/{id}` | Update album |
| DELETE | `/api/albums/{id}` | Delete album |

### Photos

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/photos/upload` | Upload single photo |
| POST | `/api/photos/batch-upload` | Upload multiple photos |
| GET | `/api/photos/album/{albumId}` | Get photos by album |
| GET | `/api/photos/{id}` | Get photo by ID |
| DELETE | `/api/photos/{id}` | Delete photo |

## Request Examples

### Create Event
```bash
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: multipart/form-data" \
  -F 'event={"title":"Wedding","eventDate":"2024-12-25T18:00:00","location":"New York"}' \
  -F 'coverImage=@/path/to/image.jpg'
```

### Create Album
```bash
curl -X POST http://localhost:8080/api/albums \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "albumName": "Reception",
    "displayOrder": 1
  }'
```

### Upload Photos
```bash
curl -X POST http://localhost:8080/api/photos/batch-upload \
  -F 'albumId=1' \
  -F 'files=@photo1.jpg' \
  -F 'files=@photo2.jpg' \
  -F 'files=@photo3.jpg'
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": 1,
    "title": "Wedding"
  },
  "timestamp": 1630703200000,
  "statusCode": 200
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "details": "Additional error details",
  "timestamp": 1630703200000,
  "path": "/api/events/1",
  "statusCode": 404
}
```

## Database Schema

### Events Table
- id (PK)
- title (UNIQUE)
- description
- location
- eventDate
- coverImageUrl
- cloudinaryCoverPublicId
- featured (BOOLEAN)
- status (DRAFT, PUBLISHED, ARCHIVED)
- createdAt
- updatedAt

### Albums Table
- id (PK)
- eventId (FK)
- albumName
- displayOrder
- createdAt
- updatedAt

### Photos Table
- id (PK)
- albumId (FK)
- imageUrl
- cloudinaryPublicId (UNIQUE)
- displayOrder
- createdAt
- updatedAt

## Configuration

### Cloudinary Setup

1. Create account at https://cloudinary.com
2. Get your credentials from Dashboard
3. Set environment variables with your credentials

### Database Configuration

For development (uses application-dev.yml):
```yaml
datasource:
  url: jdbc:mysql://localhost:3306/photography_portfolio_dev
  username: root
  password: root
```

For production (uses application-prod.yml with environment variables):
```yaml
datasource:
  url: jdbc:mysql://${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}
  username: ${DATABASE_USER}
  password: ${DATABASE_PASSWORD}
```

## Error Handling

The application provides detailed error responses with appropriate HTTP status codes:

- `400 Bad Request`: Validation errors
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

All errors include:
- Error code for programmatic handling
- Human-readable error message
- Additional details where applicable
- Request path and timestamp

## Development

### Run Tests
```bash
mvn test
```

### Build JAR
```bash
mvn clean package
```

### Run JAR
```bash
java -jar target/portfolio-backend-1.0.0.jar
```

### Code Quality
Ensure code follows enterprise standards:
- Use constructor injection (no field injection)
- Return DTOs instead of entities
- Use @Transactional for transaction management
- Implement proper logging
- Handle exceptions gracefully
- Write unit and integration tests

## Deployment

### Docker

Build Docker image:
```bash
docker build -t photography-portfolio-backend:1.0.0 .
```

Run container:
```bash
docker run -p 8080:8080 \
  -e CLOUDINARY_CLOUD_NAME=xxx \
  -e CLOUDINARY_API_KEY=xxx \
  -e CLOUDINARY_API_SECRET=xxx \
  -e DATABASE_HOST=mysql \
  -e DATABASE_USER=root \
  -e DATABASE_PASSWORD=password \
  photography-portfolio-backend:1.0.0
```

### Kubernetes

Deployment manifests are available in `deploy/kubernetes/` directory.

## Performance Optimization

- Database indexes on frequently queried columns
- Lazy loading for relationships
- Connection pooling with HikariCP
- Query optimization with proper JPA annotations
- CORS configuration for efficient requests

## Security Considerations

- Input validation on all endpoints
- SQL injection protection via prepared statements (JPA)
- CORS properly configured
- Environment variables for sensitive data
- Proper error handling (no stack traces in production)
- Logging without sensitive information

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in .env
- Ensure database exists and is accessible

### Cloudinary Upload Issues
- Verify Cloudinary credentials
- Check file size limits (max 50MB)
- Ensure file type is supported (JPEG, PNG, GIF, WebP, BMP, SVG)

### Port Already in Use
```bash
# Change port in application.yml
server:
  port: 8081
```

## Contributing

1. Follow the code structure and patterns
2. Use constructor injection
3. Write DTOs for all endpoints
4. Add comprehensive logging
5. Handle exceptions with proper error codes
6. Write unit tests for services

## License

Private - All rights reserved

## Support

For issues and questions, contact the development team.
