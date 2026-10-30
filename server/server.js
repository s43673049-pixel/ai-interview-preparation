import "dotenv/config";
import app from "./src/app.js";
import { pool } from "./src/config/db.js";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in .env");
  process.exit(1);
}

try {
  await pool.query("SELECT 1");
  console.log("MySQL connected");
} catch (err) {
  console.error("MySQL connection failed:", err.message);
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));