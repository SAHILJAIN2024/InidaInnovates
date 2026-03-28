import express from "express";
import { runQuery } from "../db.js";

const router = express.Router();

// GET all citizens

router.get("/graph/expand/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      MATCH (n {id: $id})-[r]-(m)
      RETURN 
        n {.*, id: n.id, label: labels(n)[0]} AS source,
        m {.*, id: m.id, label: labels(m)[0]} AS target,
        type(r) AS relation
    `;

    const result = await runQuery(query, { id });

    const nodesMap = new Map();
    const links = [];

    result.forEach((row) => {
      const s = row.source;
      const t = row.target;

      nodesMap.set(s.id, s);
      nodesMap.set(t.id, t);

      links.push({
        source: s.id,
        target: t.id,
        type: row.relation,
      });
    });

    res.json({
      nodes: Array.from(nodesMap.values()),
      links,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;