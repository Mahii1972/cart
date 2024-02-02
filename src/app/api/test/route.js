import { Pool } from "pg";
import config from "@/cdb";
const pool = new Pool(config);

async function getAllBuyers() {
  // Get a client from the connection pool
  const client = await pool.connect();
  try {
    // Execute the query using the client
    const results = await client.query(`SELECT * FROM randomTable`);
    return results.rows;
  } catch (err) {
    console.error("error executing query:", err);
    throw err; // Rethrow the error so it can be caught by the route handler
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

// Route handler
export async function GET(request) {
  try {
    const buyers = await getAllBuyers();
    // Return response with status 200 and data
    return new Response(JSON.stringify(buyers), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(`Fetching data from the database failed: ${error.message}`, { status: 500 });
  }
}