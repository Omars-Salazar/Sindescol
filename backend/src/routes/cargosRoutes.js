import express from 'express';
import { cargosController } from '../controllers/cargosController.js';

const router = express.Router();

// Listar todos los cargos (filtrado automático por departamento)
router.get('/', cargosController.getCargos);

// Obtener cargos por municipio (DEBE IR ANTES que /:id/municipios)
router.get('/municipio/:id_municipio', cargosController.getCargosByMunicipio);

// Obtener municipios y salarios por cargo (DEBE IR ANTES que /:id)
router.get('/:id/municipios', cargosController.getMunicipiosByCargo);

// Obtener cargo por ID
router.get('/:id', cargosController.getCargoById);

// Crear cargo
router.post('/', cargosController.createCargo);

// Actualizar cargo
router.put('/:id', cargosController.updateCargo);

// Eliminar cargo (validación automática de departamento)
router.delete('/:id', cargosController.deleteCargo);

export default router;