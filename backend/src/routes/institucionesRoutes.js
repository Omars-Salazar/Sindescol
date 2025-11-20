import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [instituciones] = await db.query("SELECT * FROM instituciones_educativas");
    res.json({ success: true, data: instituciones });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;