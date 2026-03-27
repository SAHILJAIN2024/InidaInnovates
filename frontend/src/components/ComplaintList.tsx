"use client";

import { useState } from "react";
import { updateComplaint, deleteComplaint } from "../lib/api";

export default function ComplaintList() {
  const [id, setId] = useState("");

  return (
    <div className="p-4 bg-zinc-900 rounded-xl mt-6">
      <input
        placeholder="Complaint ID"
        className="p-2 mb-2 w-full text-black"
        onChange={(e) => setId(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={() => updateComplaint(id, "Resolved")}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          Mark Resolved
        </button>

        <button
          onClick={() => deleteComplaint(id)}
          className="bg-red-500 px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}