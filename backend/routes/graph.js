import express from "express";
import { runQuery } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = `
      MATCH (c:Citizen)-[r]->(n)
      RETURN c, r, n LIMIT 300
    `;

    const result = await runQuery(query);

    const nodes = {};
    const links = [];

    result.forEach(row => {
      const c = row.c.properties;
      const n = row.n.properties;

      const sourceId = c.citizen_id;

      const targetId =
        n.citizen_id ||
        n.booth_id ||
        n.region_id ||
        n.complaint_id ||
        n.name;

      nodes[sourceId] = { id: sourceId, label: "Citizen" };
      nodes[targetId] = { id: targetId, label: "Node" };

      links.push({
        source: sourceId,
        target: targetId
      });
    });

    res.json({
      nodes: Object.values(nodes),
      links
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/expand/:id", async (req, res) => {
  const { id } = req.params;

  const result = await runQuery(`
    MATCH (c {citizen_id: $id})-[r]-(n)
    RETURN c, r, n LIMIT 50
  `, { id });

  const nodes = {};
  const links = [];

  result.forEach((row) => {
    const c = row.c.properties;
    const n = row.n.properties;

    nodes[c.citizen_id] = { id: c.citizen_id, type: "Citizen" };

    const target =
      n.citizen_id || n.complaint_id || n.name;

    nodes[target] = { id: target, type: row.n.labels[0] };

    links.push({ source: c.citizen_id, target });
  });

  res.json({
    nodes: Object.values(nodes),
    links,
  });
});

export default router;