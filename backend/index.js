import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import {ethers} from "ethers";

import repo from "../claimit_backend/routes/repo.route.js";


// ✅ Environment Variables
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;


const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());


app.use("/api",repo);


const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`✅ Metadata uploader running at http://localhost:${port}`);
});



