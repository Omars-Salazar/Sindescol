import express from "express";
import * as salarioController from "../controllers/salariosDepartamentosController.js";

const router = express.Router();

// IMPORTANTE: Las rutas más específicas deben ir ANTES que las genéricas
// Ruta para obtener todos los salarios o filtrar por cargo y/o municipio mediante query params
router.get("/", salarioController.getSalarios);

// Ruta para obtener un salario por ID (debe estar después de la ruta con query params)
router.get("/:id", salarioController.getSalarioById);

// Crear un nuevo salario
router.post("/", salarioController.createSalario);

// Actualizar un salario
router.put("/:id", salarioController.updateSalario);

// Eliminar un salario
router.delete("/:id", salarioController.deleteSalario);

export default router;