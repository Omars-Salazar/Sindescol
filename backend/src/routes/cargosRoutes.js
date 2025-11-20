import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [cargos] = await db.query("SELECT * FROM cargos");
    res.json({ success: true, data: cargos });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
