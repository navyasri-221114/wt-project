# Backend Tasks for Prathima

Hi Prathima,

NavyaSri has completed her half of the backend work (Database Models and Authentication Services) and has migrated the core user models (`User`, `StudentProfile`, `CompanyProfile`) to MongoDB Atlas using Mongoose.

As the Backend Lead, you are responsible for the remaining backend tasks (except replacing Auth logic & Special Features, which are handled). Since NavyaSri handled the models/services, your focus is on extracting the logic from `server.ts` into a clean architecture with **Routes** and **Controllers**.

Here are your specific next steps to complete the backend side:

### 1. Refactor Existing Logic into Clean Architecture
Right now, everything sits inside `server.ts`. You need to create separate folders and files:

- `backend/src/routes/` 
- `backend/src/controllers/`
- `backend/src/middleware/`

### 2. Extract and Build Controllers/Routes
You need to convert the remaining endpoints in `server.ts` into controller functions and route modules:

#### A. Jobs Endpoint (`/api/jobs`)
- Extract `GET /api/jobs`
- Extract `POST /api/jobs`
- Extract `GET /api/jobs/my`
*Note: Make sure to migrate these to use Mongoose since NavyaSri moved the database to MongoDB. You'll need to create the `Job` Mongoose schema!*

#### B. Applications Endpoint (`/api/applications`)
- Extract `POST /api/applications` 
- Extract `GET /api/applications/my`
- Extract `GET /api/applications/job/:jobId`
- Extract `PUT /api/applications/:id/status`
*Note: You will need to create the `Application` Mongoose schema!*

#### C. Interviews Endpoint (`/api/interviews`)
- Vivek handles the WebRTC special features, but the basic database logic (scheduling, recruiter notes, saving evaluations) lies with the backend.
- Extract `POST /api/interviews`
- Extract `GET /api/interviews/my`
- Extract `GET /api/interviews/:roomId`
- Extract `PUT /api/interviews/:id/evaluate`
*Note: You will need to create the `Interview` Mongoose schema!*

#### D. Notifications Endpoint
- Extract any notification-related logic into its own routes.
*Note: You will need to create the `Notification` Mongoose schema!*

### 3. Setup JWT / Auth Middleware
- Move the `authenticate` middleware from `server.ts` into `backend/src/middleware/auth.ts`.

### Immediate Actions
1. `git pull origin navyasri` to get the latest Mongoose configuration and Auth schemas.
2. Read through the new Mongoose schemas in `backend/src/models/` to see how the data is structured.
3. Start creating your remaining schemas (Job, Application, Interview, Notification).
4. Create your controllers (`jobController.ts`, `appController.ts`, etc.).
5. Create your routes (`jobRoutes.ts`, `appRoutes.ts`, etc.).
6. Import and `app.use()` those routes inside `server.ts` to clean up the main server file.

Let's get this finished!
