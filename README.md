# LostFound+

> A centralized, secure and intelligent Lost & Found Management Platform that uses MongoDB-powered search, aggregation, smart matching, authentication, file uploads, ownership verification and administrative moderation to streamline the complete recovery lifecycle.

## Problem Statement
Every year, countless personal items are lost on campuses, in public transit, and across cities. Traditional lost and found systems rely on fragmented spreadsheets, manual moderation, and disconnected communication, leading to painfully low recovery rates and a frustrating experience for both finders and losers.

## Proposed Solution
LostFound+ digitizes the entire recovery lifecycle. By centralizing reports into a unified platform, utilizing an algorithmic matching engine, and enforcing strict ownership verification through a moderated claim system, LostFound+ drastically increases recovery rates while preventing fraud and duplicate reports.

## Key Features
- **Smart Matching Engine**: Automatically compares newly reported lost items against the found database (evaluating category, location, title, and dates) to surface high-confidence matches instantly.
- **Explainable AI UI**: Displays detailed NLP-driven reasoning for matched items directly on the user's dashboard.
- **AI Fraud Detection**: A rule-based NLP Trust Score assigned to every incoming claim to help moderators instantly identify suspicious behavior.
- **Real-time WebSockets**: Live, instant bidirectional communication alerts powered by Socket.io.
- **Client-Side Scalability**: Implements Web Worker image compression in the browser before network transmission to drastically reduce backend bandwidth load.
- **Robust Search & Filtering**: Leveraging MongoDB `$text` indexing and compound queries to search across descriptions, colors, and brands.
- **Secure Claim Workflow**: A moderated claim system where potential owners submit proof of ownership, preventing malicious claims.
- **Chain of Custody (Audit Logs)**: Every status change (from *Lost* to *Claimed* to *Recovered*) is permanently logged to ensure accountability.
- **Real-time Analytics Dashboards**: Live data visualizations powered by complex MongoDB Aggregation pipelines that provide insights into recovery trends and hotspots.

## Architecture & Technology Stack
Built strictly on the **MERN Stack**:
- **Frontend**: React (Vite), Tailwind CSS, Recharts, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Image Hosting**: Cloudinary (via Multer for multipart form parsing)
- **Security**: JWT (JSON Web Tokens), bcryptjs

## Database Collections (Mongoose Schemas)
1. **Users**: Role-based (user, moderator, admin) with hashed passwords.
2. **LostItems**: Tracks missing items with a `$text` index.
3. **FoundItems**: Tracks recovered items awaiting owners.
4. **Claims**: Handles the dispute and proof-of-ownership workflow.
5. **Notifications**: Tracks system alerts for users.
6. **AuditLogs**: Immutable chain of custody for all item status transitions.

## Key MongoDB Features Used
- **Aggregation Pipelines**: `$match`, `$group`, `$sort`, and `$project` are heavily utilized to generate the live Admin Analytics dashboard without pulling excessive data into Node.js.
- **Full-Text Search**: `$text` indexes applied to `title`, `description`, `brand`, and `color` fields for blazing-fast unified search across both Lost and Found collections.
- **Geospatial / Filtering**: Compound indexing on `category` and `location` to power the Smart Matching Engine.

## Setup Instructions
1. Clone the repository: `git clone <repo-url>`
2. Navigate to the backend: `cd server`
3. Install backend dependencies: `npm install`
4. Navigate to the frontend: `cd ../client`
5. Install frontend dependencies: `npm install`

## Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5001
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Cloudinary Setup
1. Create a free account at [Cloudinary](https://cloudinary.com).
2. Copy your Cloud Name, API Key, and API Secret from the dashboard.
3. Paste them into the `.env` file above.

### MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Add `0.0.0.0/0` to your Network Access IP Whitelist.
3. Copy the Connection String, replacing `<password>` with your database user password, and paste it into the `MONGODB_URI` variable.

## Postman Testing Steps
1. Open Postman and click **Import**.
2. Select the `LostFound_Plus_Postman_Collection.json` file located in the root of this project.
3. Execute the **Register User** or **Login User** request to receive a JWT token.
4. Copy the token and paste it into the Collection's `Variables` tab under `token`.
5. You can now test the protected CRUD routes, Claims, and Admin Aggregation endpoints.

## Demo Credentials
(For hackathon evaluation purposes)
- **Admin**: admin@lostfound.com / password123
- **Moderator**: mod@lostfound.com / password123
- **Standard User**: user@lostfound.com / password123

## Deployment Instructions
1. **Backend**: Deploy the `server/` folder to a service like Render or Heroku. Ensure all `.env` variables are configured in the dashboard.
2. **Frontend**: Deploy the `client/` folder to Vercel or Netlify. Set the Vite proxy or base URL to point to the deployed backend URL.

## Future Enhancements
- Integrating geospatial tracking for precise map-based visual searches.
- Adding a WebSocket layer for instantaneous real-time messaging between claimants and moderators.
- Implementing an automated AI image classifier to pre-fill categories upon image upload.
