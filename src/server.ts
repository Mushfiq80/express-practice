import express, { Request, Response } from "express";
import { Pool } from "pg";

const app = express();
const port = 5000;

// parser
app.use(express.json());
// app.use(express.urlencoded());

// db
const pool = new Pool({
  connectionString: `postgresql://neondb_owner:npg_4Es7XxqYRdZH@ep-weathered-term-adkwhzo3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`,
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
            title VARCHAR(200) 
        )`);
};

initDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! Next Dev");
});

app.post("/data", (req: Request, res: Response) => {
  //   res.json({ message: 'Data received successfully' });
  console.log(req.body);
  res
    .status(200)
    .json({ message: "Data received successfully", data: req.body });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
