import express from "express";
import { runQuery } from "../db.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { citizen_id, complaint_id, title } = req.body;

    const query = `
      MATCH (c:Citizen {citizen_id: $citizen_id})
      CREATE (cmp:Complaint {
        complaint_id: $complaint_id,
        title: $title,
        status: "Open"
      })
      CREATE (c)-[:FILES]->(cmp)
      RETURN cmp
    `;

    const data = await runQuery(query, {
      citizen_id,
      complaint_id,
      title
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const query = `
      MATCH (c:Complaint {complaint_id: $id})
      SET c.status = $status
      RETURN c
    `;

    const data = await runQuery(query, {
      id: req.params.id,
      status
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const query = `
      MATCH (c:Complaint {complaint_id: $id})
      DETACH DELETE c
    `;

    await runQuery(query, { id: req.params.id });

    res.json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;