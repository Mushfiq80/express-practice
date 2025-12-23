import express, { NextFunction, Request, Response } from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express();
const port = 5000;

// parser
app.use(express.json());
// app.use(express.urlencoded());

// db
const pool = new Pool({
  connectionString: `${process.env.CONNECTION_STRING}`,
});

const initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        age INT,
        phone VARCHAR(15) UNIQUE,
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )          
        `);

  await pool.query(`
            CREATE TABLE IF NOT EXISTS todos(
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200),
            description TEXT,
            completed BOOLEAN DEFAULT FALSE,
            due_date DATE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )           
        `);
};

initDB();

// Logger Middleware 
const logger = (req: Request, res: Response, next: NextFunction) =>{
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}\n`);
  next();
}

app.get("/", logger, (req: Request, res: Response) => {
  res.send("Hello World! Next Dev");
});

app.post("/data", async (req: Request, res: Response) => {
  //   res.json({ message: 'Data received successfully' });
  // console.log(req.body);
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    // console.log("Inserted data:", result);
    // console.log("Inserted data:", result.rows[0]);

    // res.send({ message: "Data received successfully", data: result.rows[0] });
  } catch (error) {
    // console.error("Error inserting data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  res
    .status(200)
    .json({ message: "Data received successfully", data: req.body });
});

app.get("/data", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/data/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Update
app.put("/data/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *`,
      [name, email, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete
app.delete("/data/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    } else {
      console.log("Deleted user with id:", id);
      res
        .status(200)
        .json({ message: "User deleted successfully", user: null });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// TODO CRUD
app.post("/todos", async (req: Request, res: Response) => {
  const {} = req.body;
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found", path: req.path });

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
