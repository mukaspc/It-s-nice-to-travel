# REST API Plan

## 1. Resources

| Resource | Database Table | Description |
|----------|----------------|-------------|
| Users | auth.users | Managed by Supabase Auth, contains user information |
| Plans | generated_user_plans | Travel plans created by users |
| Places | places | Locations included in travel plans |
| GeneratedPlans | generated_ai_plans | AI-generated detailed travel plans |
| TravelPreferences | travel_preferences | Predefined travel preference tags |

## 2. Endpoints

### Authentication Endpoints

The application will utilize Supabase's built-in authentication system. The frontend will interact directly with Supabase's auth client SDK.

### Plans Endpoints

#### List Plans

- **Method:** GET
- **URL:** `/api/plans`
- **Description:** Retrieve all travel plans for the authenticated user
- **Query Parameters:**
  - `sort`: Sort order (`created_at.desc` by default, `created_at.asc`, `name.asc`, `name.desc`)
  - `limit`: Number of results per page (default: 10)
  - `offset`: Pagination offset
  - `search`: Search by plan name
- **Response Body:**
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "start_date": "date",
        "end_date": "date",
        "people_count": "integer",
        "note": "string",
        "travel_preferences": "string",
        "status": "draft|generated",
        "created_at": "timestamp",
        "updated_at": "timestamp",
        "places_count": "integer"
      }
    ],
    "meta": {
      "total_count": "integer",
      "page_count": "integer"
    }
  }
  ```
- **Success Codes:**
  - 200 OK: Plans retrieved successfully
- **Error Codes:**
  - 401 Unauthorized: User not authenticated

#### Get Plan

- **Method:** GET
- **URL:** `/api/plans/{id}`
- **Description:** Retrieve a specific travel plan with its places
- **Response Body:**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "start_date": "date",
    "end_date": "date",
    "people_count": "integer",
    "note": "string",
    "travel_preferences": "string",
    "status": "draft|generated",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "places": [
      {
        "id": "uuid",
        "name": "string",
        "start_date": "date",
        "end_date": "date",
        "note": "string"
      }
    ],
    "has_generated_plan": "boolean"
  }
  ```
- **Success Codes:**
  - 200 OK: Plan retrieved successfully
- **Error Codes:**
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User doesn't have access to this plan
  - 404 Not Found: Plan not found

#### Create Plan

- **Method:** POST
- **URL:** `/api/plans`
- **Description:** Create a new travel plan
- **Request Body:**
  ```json
  {
    "name": "string",
    "start_date": "date",
    "end_date": "date",
    "people_count": "integer",
    "note": "string",
    "travel_preferences": "string",
  }
  ```
- **Response Body:**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "start_date": "date",
    "end_date": "date",
    "people_count": "integer",
    "note": "string",
    "travel_preferences": "string",
    "status": "draft",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes:**
  - 201 Created: Plan created successfully
- **Error Codes:**
  - 400 Bad Request: Invalid data provided
  - 401 Unauthorized: User not authenticated
  - 422 Unprocessable Entity: Validation errors

#### Update Plan

- **Method:** PUT
- **URL:** `/api/plans/{id}`
- **Description:** Update an existing travel plan
- **Request Body:**
  ```json
  {
    "name": "string",
    "start_date": "date",
    "end_date": "date",
    "people_count": "integer",
    "note": "string",
    "travel_preferences": "string"
  }
  ```
- **Response Body:**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "start_date": "date",
    "end_date": "date",
    "people_count": "integer",
    "note": "string",
    "travel_preferences": "string",
    "status": "draft|generated",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes:**
  - 200 OK: Plan updated successfully
- **Error Codes:**
  - 400 Bad Request: Invalid data provided
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User doesn't have access to this plan
  - 404 Not Found: Plan not found
  - 422 Unprocessable Entity: Validation errors

#### Delete Plan

- **Method:** DELETE
- **URL:** `/api/plans/{id}`
- **Description:** Soft delete a travel plan (set deleted_at timestamp)
- **Success Codes:**
  - 204 No Content: Plan deleted successfully
- **Error Codes:**
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User doesn't have access to this plan
  - 404 Not Found: Plan not found

### Places Endpoints

#### List Places for Plan

- **Method:** GET
- **URL:** `/api/plans/{planId}/places`
- **Description:** Retrieve all places for a specific plan
- **Response Body:**
  ```json
  [
    {
      "id": "uuid",
      "name": "string",
      "start_date": "date",
      "end_date": "date",
      "note": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
  ```
- **Success Codes:**
  - 200 OK: Places retrieved successfully
- **Error Codes:**
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User doesn't have access to this plan
  - 404 Not Found: Plan not found

#### Create Place

- **Method:** POST
- **URL:** `/api/plans/{planId}/places`
- **Description:** Add a new place to a plan
- **Request Body:**
  ```json
  {
    "name": "string",
    "start_date": "date",
    "end_date": "date",
    "note": "string"
  }
  ```
- **Response Body:**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "start_date": "date",
    "end_date": "date",
    "note": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes:**
  - 201 Created: Place created successfully
- **Error Codes:**
  - 400 Bad Request: Invalid data provided
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User doesn't have access to this plan
  - 404 Not Found: Plan not found
  - 422 Unprocessable Entity: Validation errors (e.g., dates outside plan range, exceeding 10 places limit)

#### Update Place

- **Method:** PUT
- **URL:** `/api/plans/{planId}/places/{placeId}`
- **Description:** Update an existing place
- **Request Body:**
  ```json
  {
    "name": "string",
    "start_date": "date",
    "end_date": "date",
    "note": "string"
  }
  ```
- **Response Body:**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "start_date": "date",
    "end_date": "date",
    "note": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes:**
  - 200 OK: Place updated successfully
- **Error Codes:**
  - 400 Bad Request: Invalid data provided
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User doesn't have access to this plan/place
  - 404 Not Found: Plan or place not found
  - 422 Unprocessable Entity: Validation errors

#### Delete Place

- **Method:** DELETE
- **URL:** `/api/plans/{planId}/places/{placeId}`
- **Description:** Delete a place from a plan
- **Success Codes:**
  - 204 No Content: Place deleted successfully
- **Error Codes:**
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User doesn't have access to this plan/place
  - 404 Not Found: Plan or place not found

### Generated Plans Endpoints

#### Generate Plan

- **Method:** POST
- **URL:** `/api/plans/{planId}/generate`
- **Description:** Generate a detailed AI plan for a travel plan
- **Response Body:**
  ```json
  {
    "id": "uuid",
    "status": "processing",
    "estimated_time": "integer" // seconds
  }
  ```
- **Success Codes:**
  - 202 Accepted: Generation process started
- **Error Codes:**
  - 400 Bad Request: Missing required details (places, dates, etc.)
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User doesn't have access to this plan
  - 404 Not Found: Plan not found
  - 409 Conflict: Generation already in progress

#### Get Generated Plan Status

- **Method:** GET
- **URL:** `/api/plans/{planId}/generate/status`
- **Description:** Check the status of an ongoing plan generation
- **Response Body:**
  ```json
  {
    "status": "processing|completed|failed",
    "progress": "integer", // 0-100 percentage
    "estimated_time_remaining": "integer" // seconds
  }
  ```
- **Success Codes:**
  - 200 OK: Status retrieved successfully
- **Error Codes:**
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User doesn't have access to this plan
  - 404 Not Found: No generation process found for this plan

#### Get Generated Plan

- **Method:** GET
- **URL:** `/api/plans/{planId}/generated`
- **Description:** Retrieve the AI-generated plan
- **Response Body:**
  ```json
  {
    "id": "uuid",
    "content": {
      "version": "string",
      "places": [
        {
          "name": "string",
          "days": [
            {
              "date": "date",
              "schedule": [
                {
                  "time": "string",
                  "activity": "string",
                  "address": "string",
                  "description": "string",
                  "image_url": "string"
                }
              ],
              "dining_recommendations": [
                {
                  "type": "breakfast|lunch|dinner",
                  "name": "string",
                  "address": "string",
                  "description": "string",
                  "image_url": "string"
                }
              ]
            }
          ]
        }
      ]
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Codes:**
  - 200 OK: Generated plan retrieved successfully
- **Error Codes:**
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User doesn't have access to this plan
  - 404 Not Found: Plan or generated plan not found

#### Export Generated Plan

- **Method:** GET
- **URL:** `/api/plans/{planId}/export`
- **Description:** Export the generated plan as PDF
- **Query Parameters:**
  - `format`: Export format (default: "pdf")
- **Response:**
  - Binary file stream with appropriate Content-Type
- **Success Codes:**
  - 200 OK: Plan exported successfully
- **Error Codes:**
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User doesn't have access to this plan
  - 404 Not Found: Plan or generated plan not found
  - 422 Unprocessable Entity: Cannot generate export (missing data)

### Travel Preferences Endpoints

#### List Travel Preferences

- **Method:** GET
- **URL:** `/api/travel-preferences`
- **Description:** Retrieve all predefined travel preference tags
- **Response Body:**
  ```json
  [
    {
      "id": "uuid",
      "name": "string",
      "created_at": "timestamp"
    }
  ]
  ```
- **Success Codes:**
  - 200 OK: Preferences retrieved successfully

## 3. Authentication and Authorization

The application will use Supabase Authentication which provides:

1. **JWT-based Authentication**
   - JWT tokens issued upon successful login
   - Tokens include user ID and role information
   - Frontend stores token securely and includes it in API requests

2. **Authorization using Row Level Security (RLS)**
   - Supabase RLS policies ensure users can only access their own data
   - All API endpoints that interact with the database will respect RLS policies
   - Examples of RLS policies:
     - Users can only view their own plans
     - Users can only modify their own plans
     - Users can only access generated plans for their own plans

3. **API Security**
   - All endpoints require valid JWT token except public ones
   - CORS configuration to prevent unauthorized cross-origin requests
   - Rate limiting to prevent abuse (recommended: 100 requests per minute per user)

## 4. Validation and Business Logic

### Validation Rules

#### Plans
- `name`: Required, max 100 characters
- `people_count`: Required, between 1-99
- `start_date`: Required, valid date
- `end_date`: Required, valid date, must be >= start_date
- `note`: Optional, max 2500 characters

#### Places
- `name`: Required, max 100 characters
- `start_date`: Required, must be within plan date range
- `end_date`: Required, must be >= start_date and within plan date range
- `note`: Optional, max 500 characters
- Maximum 10 places per plan

### Business Logic Implementation

1. **Soft Delete**
   - Plans are soft-deleted by setting deleted_at timestamp
   - GET requests filter out plans with deleted_at not null

2. **Plan Status Management**
   - When a plan is created or updated, status is set to 'draft'
   - After successful AI generation, status is updated to 'generated'
   - When a plan with generated content is modified, status returns to 'draft'

3. **AI Plan Generation**
   - Generation process is asynchronous due to potentially long processing time
   - Status endpoint allows frontend to poll for completion
   - Maximum generation time is limited to 90 seconds
   - Generation fails if plan doesn't have required data

4. **Date Validation**
   - Places' date ranges must be within the plan's date range
   - End date must always be equal to or after start date

5. **PDF Export**
   - PDF is generated on-demand, not stored in the database
   - Export fails if no generated plan exists for the specified plan 