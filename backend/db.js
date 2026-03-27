import neo4j from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

export const runQuery = async (query, params = {}) => {
  const session = driver.session();
  try {
    const result = await session.run(query, params);

    return result.records.map(record => {
      const obj = {};
      record.keys.forEach((key, i) => {
        obj[key] = record.get(key);
      });
      return obj;
    });

  } finally {
    await session.close();
  }
};