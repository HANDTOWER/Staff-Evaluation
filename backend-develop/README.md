# Staff Evaluation Backend

Spring Boot backend for managing staff appearance evaluations.

## Features

- Employee management (CRUD)
- Appearance evaluation for employees
- RESTful API endpoints
- Unit tests with JUnit & Mockito
- Configurable scoring and database settings

## Project Structure

```
appearance/
├── mvnw, mvnw.cmd           # Maven wrapper scripts
├── pom.xml                  # Maven project descriptor
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/company/appearance/
│   │   │       ├── AppearanceApplication.java   # Main Spring Boot class
│   │   │       ├── controller/                 # REST controllers
│   │   │       ├── dto/                        # Data Transfer Objects
│   │   │       ├── model/                      # Entity models
│   │   │       ├── repository/                 # JPA repositories
│   │   │       └── service/                    # Business logic
│   │   └── resources/
│   │       └── application.properties          # App configuration
│   └── test/
│       └── java/
│           └── com/company/appearance/
│               ├── controller/                 # Controller unit tests
│               ├── dto/                        # DTO unit tests
│               ├── model/                      # Model unit tests
│               └── service/                    # Service unit tests
```

## Requirements

- Java 17 or higher
- Maven 3.8 or higher

## Getting Started

1. **Clone repository:**
   ```bash
   git clone <repo-url>
   cd backend/appearance
   ```
2. **Build project:**
   ```bash
   ./mvnw clean install
   ```
3. **Run application:**
   ```bash
   ./mvnw spring-boot:run
   ```
4. **API available at:** `http://localhost:8080/api/*`

## Configuration

Edit `src/main/resources/application.properties` for database and scoring settings.

### MySQL Example

```
spring.datasource.url=jdbc:mysql://localhost:3306/appearance_db
spring.datasource.username=root
spring.datasource.password=123456
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
# Appearance evaluation score configuration
appearance.score.pass=90
appearance.score.fail=70
```

### PostgreSQL Example

```
spring.datasource.url=jdbc:postgresql://localhost:5432/appearance_db
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
# Appearance evaluation score configuration
appearance.score.pass=90
appearance.score.fail=70
```

### SQL Server Example

```
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=appearance_db
spring.datasource.username=sa
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
# Appearance evaluation score configuration
appearance.score.pass=90
appearance.score.fail=70
```

## API Endpoints

- `GET /api/employees` - List all employees
- `POST /api/employees` - Create new employee
- `POST /api/evaluations` - Evaluate employee appearance

## Integration: Appearance Evaluation Request

You can send **either** the simplified `angles + clothing` format **or** the full `pose + criteria` format.
Only one format is required in a request.

### Preferred (angles + clothing)

```json
{
  "employeeId": "E001",
  "angles": {
    "head_deviation": 8.0,
    "shoulder_tilt": 2.5,
    "forward_head_z": 2.1,
    "back_deviation": 15.0,
    "stability_norm": 0.85
  },
  "clothing": {
    "top": "outerwear",
    "bottom": "long trousers",
    "foot": "shoes",
    "head": "hat"
  }
}
```

**Mapping rules (angles → pose):**

- `head_deviation` → `pose.headTilt`
- `shoulder_tilt` → `pose.shoulderTilt`
- `back_deviation` → `pose.spineAngle`
- `forward_head_z` → `pose.forwardHeadZ`
- `stability_norm` (0–1) is converted to `stabilityScore` (0–100)

**Mapping rules (clothing → criteria):**

- `top` → `criteria.shirt`
- `bottom` → `criteria.pants`
- `foot` → `criteria.shoes`
- `head` → `criteria.hat`

### Alternate (pose + criteria)

```json
{
  "employeeId": "E001",
  "pose": {
    "headTilt": 8.0,
    "shoulderTilt": 2.5,
    "spineAngle": 15.0,
    "stabilityScore": 85.0,
    "forwardHeadZ": 2.1,
    "maxArmAngle": 12.0,
    "maxLegAngle": 8.0
  },
  "criteria": {
    "hat": true,
    "hair": true,
    "tie": true,
    "shirt": true,
    "pants": true,
    "shoes": true
  }
}
```

### Pose thresholds

All pose thresholds are configured in:

- [appearance/src/main/resources/rule-config.json](appearance/src/main/resources/rule-config.json)
- [appearance/src/main/resources/rule-config.README.md](appearance/src/main/resources/rule-config.README.md)

## Testing

Run unit tests:

```bash
./mvnw test
```

## License

MIT

## Support

For help, open an issue or contact the project maintainer.
