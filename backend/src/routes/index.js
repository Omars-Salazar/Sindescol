// backend/src/routes/index.js
import express from "express";

// Importar rutas de auth
import authRoutes from "./authRoutes.js";

// Importar middleware
import { verificarToken, filtrarPorDepartamento } from "../middleware/auth.js";

// Importar todas las demás rutas
let afiliadsRoutes, cargosRoutes, cuotasRoutes, salariosDepartamentosRoutes;
let religionesRoutes, municipiosRoutes, epsRoutes, arlRoutes, pensionRoutes, cesantiasRoutes, institucionesRoutes;
let actasRoutes, otrosCargosRoutes, rectoresRoutes;
let departamentosRoutes;

try {
  departamentosRoutes = (await import("./departamentosRoutes.js")).default;
  console.log("✅ departamentosRoutes importado");
} catch (err) {
  console.error("❌ Error importando departamentosRoutes:", err.message);
}

try {
  afiliadsRoutes = (await import("./afiliadsRoutes.js")).default;
  console.log("✅ afiliadsRoutes importado");
} catch (err) {
  console.error("❌ Error importando afiliadsRoutes:", err.message);
}

try {
  cargosRoutes = (await import("./cargosRoutes.js")).default;
  console.log("✅ cargosRoutes importado");
} catch (err) {
  console.error("❌ Error importando cargosRoutes:", err.message);
}

try {
  cuotasRoutes = (await import("./cuotasRoutes.js")).default;
  console.log("✅ cuotasRoutes importado");
} catch (err) {
  console.error("❌ Error importando cuotasRoutes:", err.message);
}

try {
  salariosDepartamentosRoutes = (await import("./salariosDepartamentosRoutes.js")).default;
  console.log("✅ salariosDepartamentosRoutes importado");
} catch (err) {
  console.error("❌ Error importando salariosDepartamentosRoutes:", err.message);
}

try {
  religionesRoutes = (await import("./religionesRoutes.js")).default;
  console.log("✅ religionesRoutes importado");
} catch (err) {
  console.error("❌ Error importando religionesRoutes:", err.message);
}

try {
  municipiosRoutes = (await import("./municipiosRoutes.js")).default;
  console.log("✅ municipiosRoutes importado");
} catch (err) {
  console.error("❌ Error importando municipiosRoutes:", err.message);
}

try {
  epsRoutes = (await import("./epsRoutes.js")).default;
  console.log("✅ epsRoutes importado");
} catch (err) {
  console.error("❌ Error importando epsRoutes:", err.message);
}

try {
  arlRoutes = (await import("./arlRoutes.js")).default;
  console.log("✅ arlRoutes importado");
} catch (err) {
  console.error("❌ Error importando arlRoutes:", err.message);
}

try {
  pensionRoutes = (await import("./pensionRoutes.js")).default;
  console.log("✅ pensionRoutes importado");
} catch (err) {
  console.error("❌ Error importando pensionRoutes:", err.message);
}

try {
  cesantiasRoutes = (await import("./cesantiasRoutes.js")).default;
  console.log("✅ cesantiasRoutes importado");
} catch (err) {
  console.error("❌ Error importando cesantiasRoutes:", err.message);
}

try {
  institucionesRoutes = (await import("./institucionesRoutes.js")).default;
  console.log("✅ institucionesRoutes importado");
} catch (err) {
  console.error("❌ Error importando institucionesRoutes:", err.message);
}

try {
  actasRoutes = (await import("./actasRoutes.js")).default;
  console.log("✅ actasRoutes importado");
} catch (err) {
  console.error("❌ Error importando actasRoutes:", err.message);
}

try {
  otrosCargosRoutes = (await import("./otrosCargosRoutes.js")).default;
  console.log("✅ otrosCargosRoutes importado");
} catch (err) {
  console.error("❌ Error importando otrosCargosRoutes:", err.message);
}

try {
  rectoresRoutes = (await import("./rectoresRoutes.js")).default;
  console.log("✅ rectoresRoutes importado");
} catch (err) {
  console.error("❌ Error importando rectoresRoutes:", err.message);
}

const router = express.Router();

// ⚠️ RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
router.use("/auth", authRoutes);

// ⚠️ TODAS LAS DEMÁS RUTAS REQUIEREN AUTENTICACIÓN
router.use(verificarToken);
router.use(filtrarPorDepartamento);

// Registrar rutas protegidas
if (afiliadsRoutes) router.use("/afiliados", afiliadsRoutes);
if (cargosRoutes) router.use("/cargos", cargosRoutes);
if (cuotasRoutes) router.use("/cuotas", cuotasRoutes);
if (salariosDepartamentosRoutes) router.use("/salarios", salariosDepartamentosRoutes);

// Rutas de catálogos
if (religionesRoutes) router.use("/religiones", religionesRoutes);
if (municipiosRoutes) router.use("/municipios", municipiosRoutes);
if (epsRoutes) router.use("/eps", epsRoutes);
if (arlRoutes) router.use("/arl", arlRoutes);
if (pensionRoutes) router.use("/pension", pensionRoutes);
if (cesantiasRoutes) router.use("/cesantias", cesantiasRoutes);
if (institucionesRoutes) router.use("/instituciones", institucionesRoutes);

// Rutas de actas y otros cargos
if (actasRoutes) router.use("/actas", actasRoutes);
if (otrosCargosRoutes) router.use("/otros-cargos", otrosCargosRoutes);
if (rectoresRoutes) router.use("/rectores", rectoresRoutes);

// Rutas de departamentos
if (departamentosRoutes) router.use("/departamentos", departamentosRoutes);

console.log("✅ Todas las rutas cargadas (con autenticación)");

export default router;