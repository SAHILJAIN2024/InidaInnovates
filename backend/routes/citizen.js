import express from "express";
import { runQuery } from "../db.js";

const router = express.Router();

// GET all citizens
router.get("/", async (req, res) => {
  try {
    const query = `
      MATCH (c:Citizen)
      RETURN c LIMIT 100
    `;

    const data = await runQuery(query);
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;