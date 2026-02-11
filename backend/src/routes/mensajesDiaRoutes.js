import express from "express";
import * as mensajesDiaController from "../controllers/mensajesDiaController.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

// Cualquier usuario autenticado puede ver el mensaje del dia
router.get("/actual", mensajesDiaController.getMensajeDelDia);

// Solo presidencia y presidencia nacional pueden gestionar mensajes
router.get(
  "/",
  requireRole("presidencia_nacional", "presidencia"),
  mensajesDiaController.getMensajes
);
router.post(
  "/",
  requireRole("presidencia_nacional", "presidencia"),
  mensajesDiaController.createMensaje
);
router.put(
  "/:id",
  requireRole("presidencia_nacional", "presidencia"),
  mensajesDiaController.updateMensaje
);
router.delete(
  "/:id",
  requireRole("presidencia_nacional", "presidencia"),
  mensajesDiaController.deleteMensaje
);

export default router;
