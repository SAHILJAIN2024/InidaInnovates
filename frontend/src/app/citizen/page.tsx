"use client";

import { useEffect, useState } from "react";
import { fetchCitizens } from "../../lib/api";

export default function CitizensPage() {
  const [citizens, setCitizens] = useState<any[]>([]);

  useEffect(() => {
    fetchCitizens().then(setCitizens);
  }, []);

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Citizens</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {citizens.map((item, i) => (
          <div key={i} className="p-4 bg-zinc-900 rounded-xl">
            <p>ID: {item.c.properties.citizen_id}</p>
            <p>Name: {item.c.properties.name}</p>
            <p>Age: {item.c.properties.age}</p>
          </div>
        ))}
      </div>
    </div>
  );
}