"use client";

import { useState } from "react";
import { createComplaint } from "../lib/api";

export default function ComplaintForm() {
  const [citizen_id, setCitizenId] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = async () => {
    await createComplaint({
      citizen_id,
      complaint_id: "CMP" + Date.now(),
      title,
    });

    alert("Complaint Created 🚀");
  };

  return (
    <div className="p-4 bg-zinc-900 rounded-xl">
      <input
        placeholder="Citizen ID"
        className="p-2 mb-2 w-full text-black"
        onChange={(e) => setCitizenId(e.target.value)}
      />
      <input
        placeholder="Complaint Title"
        className="p-2 mb-2 w-full text-black"
        onChange={(e) => setTitle(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-emerald-500 px-4 py-2 rounded"
      >
        Create Complaint
      </button>
    </div>
  );
}