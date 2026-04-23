# AGENTS.md — KGwiki

## Project Stack (fixed, do not substitute alternatives)
This project uses:

- Frontend: Next.js (App Router, TypeScript)
- Backend: Next.js API Routes
- Database: PostgreSQL
- ORM: Prisma
- Authentication: NextAuth
- Media Storage: MinIO (S3-compatible object storage)
- Deployment: Docker Compose
- Reverse Proxy: Nginx

Do not replace these technologies with alternatives unless explicitly requested.

Forbidden substitutions:
- Do not switch to NestJS
- Do not replace Prisma with TypeORM or Sequelize
- Do not replace NextAuth with custom auth
- Do not replace MinIO with direct filesystem storage unless explicitly requested
- Do not introduce Kubernetes
- Do not introduce Redis unless explicitly requested


--------------------------------------------------
ARCHITECTURE PRINCIPLES
--------------------------------------------------

Prefer:
- Simple maintainable MVP architecture
- Monolithic modular structure
- Clear separation of concerns
- Small reviewable changes

Avoid:
- Overengineering
- Microservices
- Premature abstraction
- Event-driven architecture unless explicitly requested


--------------------------------------------------
NEXT.JS RULES
--------------------------------------------------

Use:
- App Router only
- TypeScript only
- Server Components by default
- Client Components only when required
- Route Handlers for backend logic

Prefer structure:

app/
components/
lib/
services/
prisma/
types/

Rules:
- Keep business logic out of UI components
- Put reusable domain logic in services/
- Put shared utilities in lib/
- Keep route handlers thin
- Prefer server actions only when simpler than API routes


--------------------------------------------------
API DESIGN RULES
--------------------------------------------------

API routes should:
- Validate input
- Return explicit errors
- Use consistent response shapes
- Keep controllers thin
- Move business logic into services

Prefer pattern:

Route
→ validation
→ service
→ Prisma access

Do not place Prisma queries directly inside UI components.


--------------------------------------------------
DATABASE / PRISMA RULES
--------------------------------------------------

Use Prisma schema as source of truth.

When changing models:
- Include migrations
- Preserve backward compatibility when possible
- Do not drop columns or tables unless requested

Use:
- Relations explicitly
- Proper indexes when needed
- Soft-delete over destructive delete unless task says otherwise

Avoid:
- Raw SQL unless necessary
- N+1 query patterns
- Unreviewed schema rewrites


--------------------------------------------------
AUTH RULES
--------------------------------------------------

Use NextAuth.

Prefer:
- Role-based access
- Session-based auth
- Secure defaults

Roles:

User:
- Manage own schedules
- Manage own activities
- Copy shared activities for modification
- Edit only own data

Admin:
- Full access to all entities
- Can manage users
- Can edit any content

Do not invent additional roles unless explicitly requested.


--------------------------------------------------
FILE UPLOADS / MEDIA
--------------------------------------------------

All uploads go through backend.

Use:
Client
→ backend endpoint
→ MinIO

Do not:
- Upload directly from client to arbitrary storage
- Store uploaded files inside application container
- Put media inside git repository

Media rules:
- Store object paths in PostgreSQL
- Keep metadata separate from binary files
- Preserve compatibility with 40TB storage assumption


--------------------------------------------------
DOCKER / DEPLOYMENT
--------------------------------------------------

Use Docker Compose.

Expected services:
- nextjs app
- postgres
- minio
- nginx

Prefer adding to existing compose over redesigning infrastructure.

Do not introduce:
- Kubernetes
- Terraform
- Service mesh


--------------------------------------------------
NGINX RULES
--------------------------------------------------

Use Nginx for:
- Reverse proxy
- Static/media routing
- TLS termination when relevant

Keep configs simple.
Avoid advanced optimization unless requested.


--------------------------------------------------
SECURITY RULES
--------------------------------------------------

Never:
- Hardcode secrets
- Commit credentials
- Expose keys in examples

Use env vars for:
DATABASE_URL
NEXTAUTH_SECRET
MINIO_ACCESS_KEY
MINIO_SECRET_KEY

Validate uploads:
- file size
- mime type
- allowed extensions


--------------------------------------------------
DEPENDENCIES
--------------------------------------------------

Before adding package:
1. Check if stack already supports it.
2. Prefer existing libraries.
3. Justify new dependency briefly.

Avoid dependency bloat.


--------------------------------------------------
TESTING
--------------------------------------------------

After changes:
- run minimal verification
- run lint if relevant
- run build if relevant

Do not claim code works unless checked.

Final response must include:
- what changed
- files modified
- verification performed
- follow-up risks


--------------------------------------------------
WORKING STYLE FOR CODEX
--------------------------------------------------

Before coding:
1. Read relevant files
2. Follow existing patterns
3. Make smallest effective change

Do not:
- Modify unrelated files
- Rewrite architecture without request
- Rename files without clear benefit


--------------------------------------------------
MVP PRIORITY
--------------------------------------------------

Always prefer:

1. Working solution
2. Maintainable solution
3. Simple solution

over elegant complexity.
