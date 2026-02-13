# Google Integrations Setup Guide

This document explains how to configure Google Chat notifications and Google Sheets export for the Appearance Evaluation System.

## Table of Contents
- [Google Chat Notifications](#google-chat-notifications)
- [Google Sheets Export](#google-sheets-export)
- [Configuration Properties](#configuration-properties)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Google Chat Notifications

The system can send real-time notifications to a Google Chat space when appearance evaluations are created.

### Features
- Instant notifications when evaluations are submitted
- Option to notify only on failures (`passed = false`)
- Displays: evaluation ID, employee details, pass/fail status, score, violations, and evaluator username
- Asynchronous execution (non-blocking)
- Best-effort delivery (failures are logged but don't break evaluation creation)

### Setup Instructions

#### 1. Create a Google Chat Space
- Open Google Chat
- Create a new space or use an existing one

#### 2. Add an Incoming Webhook
- In the Chat space, click the space name → **Apps & integrations**
- Click **Add webhooks**
- Name your webhook (e.g., "Appearance Evaluations")
- Click **Save**
- **Copy the webhook URL** (starts with `https://chat.googleapis.com/v1/spaces/...`)

#### 3. Configure Application Properties

Add to `application-dev.properties` or `application-prod.properties`:

```properties
# Google Chat Notifications
google.chat.enabled=true
google.chat.webhook-url=https://chat.googleapis.com/v1/spaces/AAAAA/messages?key=XXXXX&token=YYYYY
google.chat.only-on-fail=false
```

**Configuration Options:**
- `google.chat.enabled`: Set to `true` to enable notifications
- `google.chat.webhook-url`: Paste the webhook URL from step 2
- `google.chat.only-on-fail`: If `true`, only send notifications when `passed = false`

#### 4. Test the Integration

Send a test evaluation via:
```bash
POST /api/evaluations
```

You should see a formatted message in your Google Chat space.

### Example Notification Message

```
*Appearance Evaluation Result*

*Status:* ❌ FAILED
*Evaluation ID:* 123
*Employee:* Nguyễn Văn A (IT01)
*Employee ID:* Nguyen01
*Department:* Information Technology
*Position:* Developer
*Score:* 70
*Violations:* Không mặc áo đúng quy định, Không đeo cà vạt đúng quy định
*Evaluated At:* 2026-01-22 10:30:15
*Evaluator:* admin
```

---

## Google Sheets Export

The system can automatically append evaluation results to a Google Spreadsheet for tracking and reporting.

### Features
- Automatic row append to configured spreadsheet
- Auto-creates sheet tab if missing
- Auto-writes header row if needed
- Includes all evaluation data: employee info, criteria, violations, evaluator
- Asynchronous execution (non-blocking)
- Best-effort delivery (failures are logged)

### Setup Instructions

#### 1. Enable Google Sheets API

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing one
- Navigate to **APIs & Services** → **Library**
- Search for **Google Sheets API**
- Click **Enable**

#### 2. Create a Service Account

- In Google Cloud Console, go to **APIs & Services** → **Credentials**
- Click **Create Credentials** → **Service Account**
- Name: `appearance-evaluations-export`
- Click **Create and Continue**
- Skip role assignment (click **Continue** → **Done**)

#### 3. Generate Service Account Key

- Click on the created service account
- Go to **Keys** tab → **Add Key** → **Create new key**
- Select **JSON** format
- Click **Create**
- **Download the JSON file** (keep it secure!)

#### 4. Share Spreadsheet with Service Account

- Create a new Google Sheet or use existing one
- Click **Share** button
- Add the service account email (from JSON file: `"client_email"`)
  - Example: `appearance-evaluations-export@project-id.iam.gserviceaccount.com`
- Give **Editor** permission
- Click **Send**

#### 5. Get Spreadsheet ID

From the spreadsheet URL:
```
https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit
                                      ^^^^^^^^^^^
                                      This is the ID
```

#### 6. Configure Application Properties

**Option A: Using Credentials File**

1. Save the JSON file to a secure location:
   ```
   /opt/app/credentials/google-service-account.json
   ```
   Or in project (will be gitignored):
   ```
   src/main/resources/credentials/google-service-account.json
   ```

2. Configure properties:
```properties
# Google Sheets Export
google.sheets.enabled=true
google.sheets.spreadsheet-id=1ABC...XYZ
google.sheets.sheet-name=Evaluations
google.sheets.credentials-file=/opt/app/credentials/google-service-account.json
# For classpath resource:
# google.sheets.credentials-file=classpath:credentials/google-service-account.json
```

**Option B: Using Base64-Encoded Credentials** (recommended for cloud deployment)

1. Encode the JSON file to Base64:
```bash
# Linux/Mac
base64 -w 0 google-service-account.json

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("google-service-account.json"))
```

2. Configure properties:
```properties
# Google Sheets Export
google.sheets.enabled=true
google.sheets.spreadsheet-id=1ABC...XYZ
google.sheets.sheet-name=Evaluations
google.sheets.credentials-json-base64=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 7. Test the Integration

Send a test evaluation via:
```bash
POST /api/evaluations
```

Check your Google Sheet - a new row should be appended.

### Sheet Structure

The system automatically creates the following columns:

| Column | Description |
|--------|-------------|
| evaluatedAt | ISO timestamp |
| evaluationId | Database ID |
| employeeId | Employee ID |
| employeeName | Full name |
| employeeCode | Employee code (e.g., IT01) |
| department | Department name |
| position | Job position |
| passed | TRUE/FALSE |
| score | Numeric score |
| violations | Semicolon-separated list |
| criteria_hat | TRUE/FALSE |
| criteria_hair | TRUE/FALSE |
| criteria_tie | TRUE/FALSE |
| criteria_shirt | TRUE/FALSE |
| criteria_pants | TRUE/FALSE |
| criteria_shoes | TRUE/FALSE |
| evaluatorUsername | Username from SecurityContext |
| note | Optional note |

---

## Configuration Properties

### Full Configuration Reference

```properties
# =====================
# Google Integrations
# =====================

# Google Chat Notifications
google.chat.enabled=false
google.chat.webhook-url=
google.chat.only-on-fail=false

# Google Sheets Export
google.sheets.enabled=false
google.sheets.spreadsheet-id=
google.sheets.sheet-name=Evaluations
google.sheets.credentials-file=
google.sheets.credentials-json-base64=
```

### Default Behavior

**Both integrations are disabled by default.** The system works normally without Google credentials:
- ✅ Evaluation API continues to work
- ✅ Database saves normally
- ✅ Response returns as usual
- ℹ️ Integration features are simply skipped

This is safe for:
- Local development
- Testing environments
- Deployments without Google credentials

---

## Testing

### Manual Testing

1. **Test with integrations disabled** (default):
```bash
curl -X POST http://localhost:8080/api/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "employeeId": "Phu01",
    "criteria": {
      "hat": true,
      "hair": true,
      "tie": false,
      "shirt": true,
      "pants": true,
      "shoes": true
    }
  }'
```

2. **Enable Google Chat only**:
```properties
google.chat.enabled=true
google.chat.webhook-url=https://chat.googleapis.com/v1/spaces/...
```

3. **Enable Google Sheets only**:
```properties
google.sheets.enabled=true
google.sheets.spreadsheet-id=1ABC...XYZ
google.sheets.credentials-file=classpath:credentials/google-service-account.json
```

4. **Enable both**:
```properties
google.chat.enabled=true
google.chat.webhook-url=https://chat.googleapis.com/v1/spaces/...
google.sheets.enabled=true
google.sheets.spreadsheet-id=1ABC...XYZ
google.sheets.credentials-file=classpath:credentials/google-service-account.json
```

### Automated Tests

Run unit tests:
```bash
cd appearance
mvn test
```

Tests verify:
- ✅ Integrations disabled by default
- ✅ Message formatting
- ✅ Sheet row mapping
- ✅ Error handling (best-effort)

---

## Troubleshooting

### Google Chat Issues

**Problem**: No messages appearing in Chat

**Solutions**:
1. Check webhook URL is correct
2. Verify `google.chat.enabled=true`
3. Check application logs for errors
4. Test webhook with curl:
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message"}'
```

**Problem**: Only some evaluations trigger notifications

**Check**: `google.chat.only-on-fail` setting
- If `true`, only `passed=false` evaluations notify
- Set to `false` to notify on all evaluations

### Google Sheets Issues

**Problem**: "403 Forbidden" errors

**Solutions**:
1. Verify service account email has Editor access to the spreadsheet
2. Ensure Google Sheets API is enabled in Cloud Console
3. Check credentials file path is correct

**Problem**: "404 Spreadsheet not found"

**Solutions**:
1. Verify spreadsheet ID is correct
2. Ensure service account has access (shared with editor permission)

**Problem**: Rows not appearing

**Solutions**:
1. Check application logs for errors
2. Verify `google.sheets.enabled=true`
3. Test service account credentials:
```bash
# Use Google's API Explorer or test with curl
```

**Problem**: "Invalid credentials" error

**Solutions**:
1. Verify JSON file is valid (not corrupted during copy/paste)
2. For base64: ensure no line breaks in encoded string
3. Check file path points to correct location

### Performance Issues

**Problem**: Evaluation API feels slow

**Note**: Integration calls are async and should not block responses.

**If issues persist**:
1. Check logs for synchronous errors
2. Verify @Async is enabled (AsyncConfiguration)
3. Consider increasing thread pool size

---

## Security Best Practices

1. **Never commit credentials to Git**
   - Use `.gitignore` (already configured)
   - Store files outside project directory in production

2. **Use environment variables** for sensitive data:
```bash
export GOOGLE_CHAT_WEBHOOK_URL="https://chat.googleapis.com/..."
export GOOGLE_SHEETS_CREDENTIALS_BASE64="eyJhbGciOi..."
```

3. **Restrict service account permissions**
   - Only grant Sheets API scope
   - Only share specific spreadsheets

4. **Rotate credentials periodically**
   - Generate new service account keys
   - Delete old webhook URLs when changing

5. **Monitor logs** for unauthorized access attempts

---

## Support

For issues or questions:
1. Check application logs: `logs/application.log`
2. Review this documentation
3. Contact system administrator

---

**Last Updated**: January 22, 2026
