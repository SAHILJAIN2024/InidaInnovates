import express from "express";
import { runQuery } from "../db.js";

const router = express.Router();

/* ---------------- HELPERS ---------------- */

const extractId = (node) => {
  const p = cleanProperties(node.properties);

  return (
    p.citizen_id ||
    p.complaint_id ||
    p.official_id ||
    p.policy_id ||
    p.region_id ||
    p.booth_id ||
    p.tx_hash ||
    p.name ||
    node.identity.toString()
  );
};

const cleanValue = (value) => {
  // ✅ Convert Neo4j Integer
  if (value && typeof value === "object" && "low" in value && "high" in value) {
    return value.low;
  }

  return value;
};

const cleanProperties = (props) => {
  const cleaned = {};

  Object.entries(props).forEach(([key, value]) => {
    cleaned[key] = cleanValue(value);
  });

  return cleaned;
};

const formatNode = (node) => {
  return {
    id: extractId(node),
    type: node.labels[0],
    ...cleanProperties(node.properties), // ✅ FIXED HERE
  };
};

/* ---------------- INITIAL GRAPH ---------------- */

router.get("/", async (req, res) => {
  try {
    const query = `
      MATCH (a)-[r]->(b)
      RETURN a, r, b LIMIT 300
    `;

    const result = await runQuery(query);

    const nodesMap = new Map();
    const links = [];

    result.forEach((row) => {
      const a = row.a;
      const b = row.b;
      const r = row.r;

      const source = extractId(a);
      const target = extractId(b);

      // ✅ STORE FULL NODE DATA
      if (!nodesMap.has(source)) {
        nodesMap.set(source, formatNode(a));
      }

      if (!nodesMap.has(target)) {
        nodesMap.set(target, formatNode(b));
      }

      links.push({
        source,
        target,
        type: r.type,
      });
    });

    res.json({
      nodes: Array.from(nodesMap.values()),
      links,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- EXPAND NODE ---------------- */

router.get("/expand/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      MATCH (n)-[r]-(m)
      WHERE 
        n.citizen_id = $id OR
        n.complaint_id = $id OR
        n.official_id = $id OR
        n.policy_id = $id OR
        n.region_id = $id OR
        n.booth_id = $id OR
        n.tx_hash = $id OR
        n.name = $id
      RETURN n, r, m LIMIT 100
    `;

    const result = await runQuery(query, { id });

    const nodesMap = new Map();
    const links = [];

    result.forEach((row) => {
      const n = row.n;
      const m = row.m;
      const r = row.r;

      const source = extractId(n);
      const target = extractId(m);

      if (!nodesMap.has(source)) {
        nodesMap.set(source, formatNode(n));
      }

      if (!nodesMap.has(target)) {
        nodesMap.set(target, formatNode(m));
      }

      links.push({
        source,
        target,
        type: r.type,
      });
    });

    res.json({
      nodes: Array.from(nodesMap.values()),
      links,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;