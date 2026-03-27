"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/navbar";
import { useWallet } from "../../components/WalletContext";
import CONTRACT_ABI from "../../contractABI/contractABI.json";
import Commit from "../../components/commit";

/* ---------------- TYPES ---------------- */

interface BackendResponse {
  success: boolean;
  metadataUri: string;
}

/* ---------------- COMPONENT ---------------- */

export default function ComplaintPage() {
  const { address } = useWallet();

  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  /* ---------------- CONTRACT SETUP ---------------- */

  useEffect(() => {
    if (!address) return;

    const setupContract = async () => {
      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      );
      const signer = await provider.getSigner();

      const instance = new ethers.Contract(
        "0x7Fef4d9a84678BA1025E7692f95bC5e1b4b74539",
        CONTRACT_ABI.abi,
        signer
      );

      setContract(instance);
    };

    setupContract();
  }, [address]);

  /* ---------------- OPTIONAL GEO AUTO-FILL ---------------- */

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
    });
  }, []);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contract || !address || !file) return;

    try {
      setLoading(true);
      setStatus("UPLOADING COMPLAINT DATA...");

      const formData = new FormData();
      formData.append("ownerAddress", address);
      formData.append("title", title);
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("location", location);
      formData.append("description", description);
      formData.append("department", department);
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/api/repo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Backend upload failed");

      const data: BackendResponse = await res.json();

      setStatus("MINTING COMPLAINT ON BLOCKCHAIN...");

      const tx = await contract.mintRequest(address, data.metadataUri);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === "ComplaintMinted"
      );

      const mintedId = Number(event.args.tokenId);
      setStatus(`SUCCESS: COMPLAINT #${mintedId} REGISTERED`);

      // Reset
      setTitle("");
      setCategory("");
      setPriority("Medium");
      setLocation("");
      setDescription("");
      setDepartment("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus("ERROR: SUBMISSION FAILED");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(""), 5000);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-6xl font-black">
            REGISTER{" "}
            <span className="text-emerald-500 italic">COMPLAINT</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
            Submit Issue to Public Governance System
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/40 border border-white/5 p-10 rounded-[2.5rem]"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">

              <input
                placeholder="Complaint Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-white/5 rounded-xl px-5 py-4"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="bg-white/5 rounded-xl px-5 py-4"
              >
                <option value="">Select Category</option>
                <option value="Water">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Roads">Roads</option>
                <option value="Waste">Waste Management</option>
                <option value="Healthcare">Healthcare</option>
              </select>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-white/5 rounded-xl px-5 py-4"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Emergency</option>
              </select>

              <input
                placeholder="Location / Area"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="bg-white/5 rounded-xl px-5 py-4"
              />

              <input
                placeholder="Department (e.g. Municipal, Electricity Board)"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-white/5 rounded-xl px-5 py-4"
              />

              <textarea
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="md:col-span-2 bg-white/5 rounded-xl px-5 py-4"
              />

              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="md:col-span-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black tracking-widest
                ${
                  loading
                    ? "bg-zinc-800 text-zinc-500"
                    : "bg-emerald-500 text-black hover:bg-emerald-400"
                }`}
            >
              {loading ? "PROCESSING..." : "REGISTER COMPLAINT"}
            </button>
          </form>
        </motion.div>

        <div className="mt-32">
          <Commit />
        </div>
      </main>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-8 py-4 rounded-full font-mono text-xs"
          >
            {status}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}