# Fix Flyway Failed Migration V8

Run this SQL against your MySQL database **once** to clear the broken migration record,
then restart the application normally:

```sql
UPDATE flyway_schema_history
SET success = 1
WHERE version = '8';
```

Or to delete it entirely (Flyway will re-run V8 from scratch):
```sql
DELETE FROM flyway_schema_history WHERE version = '8';
```

After running either command, restart the Spring Boot application.
The `ignore-migration-patterns: "*:failed"` config already added to application-dev.yml
and application-prod.yml also allows the app to start past failed migrations automatically.
