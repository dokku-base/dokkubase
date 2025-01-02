# Dokkubase - Plan Działania

## Etap 1: Prototype & UI (CURRENT) 

### 1.1 Mock API 
- [x] Basic CRUD endpoints
- [x] Deployment simulation
- [x] Real-time logs (SSE)
- [x] Error scenarios
- [ ] Domains mock
- [ ] SSL mock

### 1.2 Auth & Setup Flow 
- [x] Basic auth system
- [x] Setup token validation
- [x] Admin account creation
- [ ] Security improvements (~170 lines):
  - [ ] Setup token w bazie zamiast .env (~70 linii)
    - [ ] Nowa tabela w schema
    - [ ] Service do zarządzania tokenami
    - [ ] Update verify-token.ts
    - [ ] Migracja DB
  - [ ] Lepsza walidacja haseł (~30 linii)
    - [ ] Zod schema (min 12 chars, uppercase, number, special)
    - [ ] Client-side validation
    - [ ] Feedback w UI
  - [ ] Lepsze error handling (~70 linii)
    - [ ] Nowe typy errorów
    - [ ] Proper logging
    - [ ] Metryki błędów
  - [ ] Audit trail
    - [ ] Logowanie setupu
    - [ ] IP/User Agent
    - [ ] Historia zmian

### 1.3 Basic UI
- [ ] Layout & Navigation
  - [ ] Preline components (bez Pro na razie)
  - [ ] Sidebar z sekcjami
  - [ ] Top bar
  - [ ] Dark mode

- [ ] Apps Management
  - [ ] Lista aplikacji (grid/list)
  - [ ] App details
  - [ ] Deployment controls
  - [ ] Log viewer

- [ ] Real-time Features
  - [ ] Log streaming component
  - [ ] Status updates
  - [ ] Error handling
  - [ ] Loading states

### 1.4 Testing
- [ ] Basic E2E tests
  - [ ] Critical paths
  - [ ] Error scenarios
- [ ] Component tests
  - [ ] UI components
  - [ ] Mock API

## Etap 2: Core Backend (NEXT)

### 2.1 Infrastructure
- [ ] SQLite setup
  - [ ] WAL mode
  - [ ] Drizzle ORM
  - [ ] Basic schema
- [ ] BullMQ standalone
  - [ ] Job queue
  - [ ] Status tracking
- [ ] Real Dokku client
  - [ ] API integration
  - [ ] Error handling

### 2.2 Database Schema
- [ ] Apps table
- [ ] Deployments table
- [ ] Domains table
- [ ] SSL certificates table

### 2.3 Job System
- [ ] Deployment jobs
- [ ] SSL renewal
- [ ] Health checks
- [ ] Cleanup tasks

## Etap 3: Advanced Features (LATER)

### 3.1 Domains & SSL
- [ ] Custom domains
- [ ] Auto SSL
- [ ] DNS validation
- [ ] SSL renewal

### 3.2 Monitoring
- [ ] Resource metrics
- [ ] Health checks
- [ ] Alert system
- [ ] Stats dashboard

### 3.3 Advanced Deployment
- [ ] Build cache
- [ ] Zero-downtime deploy
- [ ] Auto-scaling
- [ ] Rollback system

## Current Focus (Next 2 Weeks)
1. Basic UI components
2. App list view
3. Deployment flow
4. Log viewer
5. Error handling

## Dependencies
- Astro 5.0 
- TypeScript 
- Preline (basic) 
- Mock API 

## Nice to Have (Not Priority)
- Preline Pro
- Advanced animations
- Metrics graphs
- Custom themes
