import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [cesantias] = await db.query("SELECT * FROM entidades_cesantias");
    res.json({ success: true, data: cesantias });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;