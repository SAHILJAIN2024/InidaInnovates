"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchGraph } from "../lib/api";

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d"),
  { ssr: false }
);



export default function GraphView() {
  const [data, setData] = useState<any>({
    nodes: [],
    links: [],
  });

  const [mounted, setMounted] = useState(false);
  const handleNodeClick = async (node: any) => {
  const res = await fetch(`http://localhost:5000/graph/expand/${node.id}`);
  const newData = await res.json();

  setData((prev: any) => ({
    nodes: [...prev.nodes, ...newData.nodes],
    links: [...prev.links, ...newData.links],
  }));
};

  useEffect(() => {
    setMounted(true);

    fetchGraph().then((res) => {
      console.log("GRAPH DATA:", res); // 👈 DEBUG

      // ✅ SAFETY CHECK
      if (res && res.nodes && res.links) {
        setData(res);
      } else {
        console.error("Invalid graph format", res);
      }
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-[600px] bg-black">
      <ForceGraph2D
        graphData={{
          nodes: data.nodes || [],
          links: data.links || [],
        }}
        nodeLabel="id"
        nodeAutoColorBy="id"
        onNodeClick={handleNodeClick}
      />
    </div>
  );
}