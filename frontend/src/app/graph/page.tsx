import GraphView from "../../components/GraphView";
import Navbar from "@/src/components/navbar";
export default function GraphPage() {
  return (
    <div className="p-10 text-white">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6">
        Graph Visualization
      </h1>

      <GraphView />
    </div>
  );
}