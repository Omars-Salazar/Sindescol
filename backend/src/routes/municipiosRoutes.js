import express from "express";
import { getMunicipios } from "../services/municipiosService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { departamento, rol } = req.user;
    const municipios = await getMunicipios(departamento, rol);
    res.json({ success: true, data: municipios });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;