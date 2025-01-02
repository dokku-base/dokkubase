# 🚀 Dokkubase - User Flows

## Installation Scenarios

### Scenario A: Fresh Server
Użytkownik instaluje Dokku + Dokkubase na świeżym serwerze.

```mermaid
graph TD
    A[Fresh Server] -->|curl install.dokkubase.com| B[Install Script]
    B -->|1. Install Dokku| C[Dokku Setup]
    B -->|2. Install Dokkubase| D[Dokkubase Setup]
    D -->|Generate| E[Admin Token]
    E -->|Show| F[Access URL + Token]
    F -->|First Visit| G[Token Screen]
    G -->|Valid Token| H[Setup Account]
    H -->|Success| I[Empty Dashboard]
    I -->|Add First App| J[Create App Flow]
```

### Scenario B: Existing Dokku
Użytkownik dodaje Dokkubase do istniejącego serwera z Dokku.

```mermaid
graph TD
    A[Existing Dokku] -->|curl install.dokkubase.com| B[Install Script]
    B -->|1. Verify Dokku| C[Version Check]
    B -->|2. Install Dokkubase| D[Dokkubase Setup]
    D -->|Generate| E[Admin Token]
    D -->|Scan Dokku| F[Import Apps]
    E -->|Show| G[Access URL + Token]
    G -->|First Visit| H[Token Screen]
    H -->|Valid Token| I[Setup Account]
    I -->|Success| J[Dashboard with Apps]
```

## Core Flows

### 1. First Access Flow
```mermaid
sequenceDiagram
    User->>+Browser: Visit URL
    Browser->>+Dokkubase: GET /
    Dokkubase-->>-Browser: Token Screen
    User->>+Browser: Enter Token
    Browser->>+Dokkubase: POST /verify-token
    Dokkubase-->>-Browser: Success + Setup Form
    User->>+Browser: Create Account
    Browser->>+Dokkubase: POST /setup-account
    Dokkubase-->>-Browser: Redirect to Dashboard
```

### 2. App Management Flow
```mermaid
sequenceDiagram
    User->>+Dashboard: View Apps
    alt No Apps
        Dashboard-->>User: Show Empty State
        User->>Dashboard: Click "Add App"
    else Has Apps
        Dashboard-->>User: Show App List
        User->>Dashboard: Click App Actions
    end
    Dashboard->>+Dokku: Execute Command
    Dokku-->>-Dashboard: Real-time Updates
```

### 3. Deployment Flow
```mermaid
sequenceDiagram
    User->>+Dashboard: Deploy App
    Dashboard->>+BullMQ: Create Job
    BullMQ->>+Dokku: Git Clone
    Dokku-->>Dashboard: Build Progress
    Dokku->>Dashboard: Real-time Logs
    Dokku-->>-Dashboard: Deploy Status
    Dashboard-->>-User: Success/Error
```

## Key Differences

### Fresh Server (Scenario A)
- Empty state with guided setup
- First app creation wizard
- Basic Dokku configuration
- Default settings

### Existing Server (Scenario B)
- Import existing apps
- Preserve configurations
- Show current status
- Respect custom settings

## Implementation Priority

1. **Phase 1 (Current)**
   - Basic auth flow ✅
   - Token validation
   - Account setup
   - Simple dashboard

2. **Phase 2**
   - App import logic
   - Existing apps detection
   - Configuration preservation
   - Status scanning

3. **Phase 3**
   - Advanced features
   - Custom domains
   - SSL management
   - Advanced monitoring
