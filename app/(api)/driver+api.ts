import { getDatabaseConnection } from "../../lib/database";

export async function GET(request: Request) {
  try {
    const db = getDatabaseConnection();
    const response = await db.query`SELECT * FROM drivers`;
    
    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
