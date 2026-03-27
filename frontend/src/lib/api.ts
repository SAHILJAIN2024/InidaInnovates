const BASE_URL = "http://localhost:5000";

export const fetchCitizens = async () => {
  const res = await fetch(`${BASE_URL}/citizens`);
  return res.json();
};

export const fetchGraph = async () => {
  const res = await fetch(`${BASE_URL}/graph`);
  return res.json();
};

export const createComplaint = async (data: any) => {
  const res = await fetch(`${BASE_URL}/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateComplaint = async (id: string, status: string) => {
  const res = await fetch(`${BASE_URL}/complaints/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const deleteComplaint = async (id: string) => {
  const res = await fetch(`${BASE_URL}/complaints/${id}`, {
    method: "DELETE",
  });
  return res.json();
};