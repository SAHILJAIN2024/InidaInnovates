"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchGraph } from "../../lib/api";

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
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [view, setView] = useState<"graph" | "data">("graph");

  /* ---------------- 🎨 NODE COLORS ---------------- */

  const getNodeColor = (node: any) => {
    switch (node.type) {
      case "Citizen":
        return "#10b981";
      case "Complaint":
        return "#ef4444";
      case "Official":
        return "#3b82f6";
      case "Policy":
        return "#8b5cf6";
      case "Region":
        return "#f59e0b";
      case "Booth":
        return "#14b8a6";
      case "Service":
        return "#eab308";
      case "BlockRecord":
        return "#64748b";
      default:
        return "#a1a1aa";
    }
  };

  /* ---------------- 🧠 SMART LABEL ---------------- */

  const getNodeLabel = (node: any) => {
    switch (node.type) {
      case "Citizen":
        return node.name || node.citizen_id;

      case "Complaint":
        return node.title || node.complaint_id;

      case "Official":
        return node.name || node.official_id;

      case "Policy":
        return node.name || node.policy_id;

      case "Region":
        return node.name || node.region_id;

      case "Booth":
        return node.booth_id;

      case "Service":
        return node.type || "Service";

      case "BlockRecord":
        return node.tx_hash?.slice(0, 8) || "Block";

      default:
        return node.id;
    }
  };

  /* ---------------- 📊 STRUCTURED DETAILS ---------------- */

  const renderNodeDetails = (node: any) => {
    switch (node.type) {
      case "Citizen":
        return (
          <>
            <p>Name: {node.name}</p>
            <p>Citizen ID: {node.citizen_id}</p>
            <p>Phone: {node.phone}</p>
            <p>Age: {node.age}</p>
          </>
        );

      case "Complaint":
        return (
          <>
            <p>Title: {node.title}</p>
            <p>Complaint ID: {node.complaint_id}</p>
            <p>Status: {node.status}</p>
            <p>Priority: {node.priority}</p>
          </>
        );

      case "Official":
        return (
          <>
            <p>Name: {node.name}</p>
            <p>Official ID: {node.official_id}</p>
            <p>Role: {node.role}</p>
          </>
        );

      case "Policy":
        return (
          <>
            <p>Name: {node.name}</p>
            <p>Policy ID: {node.policy_id}</p>
            <p>Budget: {node.budget}</p>
          </>
        );

      case "Region":
        return (
          <>
            <p>Name: {node.name}</p>
            <p>Region ID: {node.region_id}</p>
          </>
        );

      case "Booth":
        return (
          <>
            <p>Booth ID: {node.booth_id}</p>
            <p>Ward: {node.ward}</p>
          </>
        );

      case "Service":
        return <p>Service Type: {node.type}</p>;

      case "BlockRecord":
        return (
          <>
            <p>TX Hash: {node.tx_hash}</p>
            <p>Type: {node.type}</p>
          </>
        );

      default:
        return (
          <pre className="text-xs">
            {JSON.stringify(node, null, 2)}
          </pre>
        );
    }
  };

  /* ---------------- 🚀 EXPAND GRAPH ---------------- */

  const handleNodeClick = async (node: any) => {
    setSelectedNode(node);

    try {
      const res = await fetch(
        `http://localhost:5000/graph/expand/${node.id}`
      );
      const newData = await res.json();

      const formattedNodes = newData.nodes.map((n: any) => ({
        id: n.id,
        type: n.label || "Unknown",
        ...n,
      }));

      const formattedLinks = newData.links.map((l: any) => ({
        source: l.source,
        target: l.target,
        type: l.type,
      }));

      const existingIds = new Set(data.nodes.map((n: any) => n.id));

      const filteredNodes = formattedNodes.filter(
        (n: any) => !existingIds.has(n.id)
      );

      setData((prev: any) => ({
        nodes: [...prev.nodes, ...filteredNodes],
        links: [...prev.links, ...formattedLinks],
      }));
    } catch (err) {
      console.error("Expand error:", err);
    }
  };

  /* ---------------- 🔄 INITIAL LOAD ---------------- */

  useEffect(() => {
    setMounted(true);

    fetchGraph().then((res) => {
      if (res && res.nodes && res.links) {
        const formattedNodes = res.nodes.map((node: any) => ({
          id: node.id,
          type: node.label || "Unknown",
          ...node,
        }));

        const formattedLinks = res.links.map((link: any) => ({
          source: link.source,
          target: link.target,
          type: link.type,
        }));

        setData({
          nodes: formattedNodes,
          links: formattedLinks,
        });
      }
    });
  }, []);

  if (!mounted) return null;

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">
          DEMOCRACY <span className="text-emerald-500">GRAPH</span>
        </h1>

        <button
          onClick={() =>
            setView(view === "graph" ? "data" : "graph")
          }
          className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold"
        >
          {view === "graph" ? "VIEW DATA" : "VIEW GRAPH"}
        </button>
      </div>

      {view === "graph" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* GRAPH */}
          <div className="lg:col-span-2 h-[600px] bg-black rounded-xl border border-white/10">
            <ForceGraph2D
  graphData={data}

  // Hover tooltip
  nodeLabel={(node: any) => `
Type: ${node.type}
${node.status ? `Status: ${node.status}` : ""}
${node.priority ? `Priority: ${node.priority}` : ""}
`}

  // Color edges based on relation type
  linkColor={(link: any) => {
    switch (link.type) {
      case "REGISTERED_IN":
        return "#10b981"; // green
      case "LOCATED_IN":
        return "#3b82f6"; // blue
      case "RELATED_TO":
        return "#f59e0b"; // amber
      case "RECORDED_ON":
        return "#ef4444"; // red
      case "ASSIGNED_TO":
        return "#14b8a6"; // teal
      case "AFFECTS":
        return "#eab308"; // yellow
      default:
        return "#a1a1aa"; // gray for unknown
    }
  }}

  onNodeClick={handleNodeClick}

  nodeCanvasObject={(node: any, ctx, globalScale) => {
    // Draw nodes only (no text)
    ctx.fillStyle = getNodeColor(node);
    ctx.beginPath();
    ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
    ctx.fill();
  }}

/>
          </div>

          {/* DETAILS PANEL */}
          <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-6 h-[600px] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-emerald-400">
              Node Details
            </h2>

            {selectedNode ? (
              <div className="space-y-2 text-sm">
                {renderNodeDetails(selectedNode)}
              </div>
            ) : (
              <p className="text-zinc-500">
                Click a node to inspect
              </p>
            )}
          </div>
        </div>
      ) : (
        /* DATA TABLE */
        <div className="bg-zinc-900/40 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-emerald-400">
            Graph Data
          </h2>

          <div className="overflow-x-auto text-sm">
            <table className="w-full">
              <thead className="border-b border-white/10 text-zinc-400">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Label</th>
                </tr>
              </thead>

              <tbody>
                {data.nodes.map((node: any, i: number) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-2">{node.id}</td>
                    <td className="p-2">{node.type}</td>
                    <td className="p-2">{getNodeLabel(node)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}