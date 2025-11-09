# Blog Backend Server

This is a simple Express.js server that acts as a backend for the blog application, using a PostgreSQL database for persistence.

## Local Development Setup

1.  **Install Dependencies:**
    Navigate into this directory (`cd server`) and run:
    ```bash
    npm install
    ```

2.  **Database:**
    - This server requires a PostgreSQL database. You can run one locally using Docker or use a free cloud instance from a provider like Render.com.
    - Get your database's connection string.

3.  **Environment Variables:**
    - Create a `.env` file in this `/server` directory.
    - Add your database connection string to it:
      ```
      DATABASE_URL="postgresql://user:password@host:port/database"
      ```

4.  **Run Locally:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3001`. You will need to update the `API_BASE_URL` in the frontend's `services/blogService.ts` to this address for local testing.

## Database Table Initialization

The first time you run the server against a new database, you need to create the `posts` table. After starting the server, visit this URL in your browser or with a tool like Postman/cURL:

`http://localhost:3001/api/setup`

This will create the necessary table. You only need to do this once per database.

## Deployment on Render.com

1.  **Create a Web Service:** On your Render dashboard, click **New +** -> **Web Service**.
2.  **Connect Repository:** Connect the Git repository containing your project.
3.  **Settings:**
    -   **Name:** Give your service a name (e.g., `my-blog-backend`).
    -   **Root Directory:** `server` (This tells Render to run commands from within the `/server` folder).
    -   **Build Command:** `npm install && npm run build`
    -   **Start Command:** `npm start`
4.  **Add Environment Variable:**
    -   Go to the **Environment** tab for your new Web Service.
    -   Add an environment variable with the **Key** `DATABASE_URL`.
    -   For the **Value**, paste the **Internal Connection String** from your Render PostgreSQL instance.
5.  **Deploy:** Click **Create Web Service**.
6.  **Initialize Database:** Once deployed, visit `YOUR_SERVICE_URL/api/setup` (e.g., `https://my-blog-backend.onrender.com/api/setup`) one time to create the database table.
7.  **Update Frontend:** Copy your new service's URL and paste it into the `API_BASE_URL` constant in `src/services/blogService.ts` in your frontend code.
