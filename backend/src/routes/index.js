import express from "express";

// Importar todas las rutas
let afiliadsRoutes, cargosRoutes, cuotasRoutes, salariosDepartamentosRoutes;
let religionesRoutes, municipiosRoutes, epsRoutes, arlRoutes, pensionRoutes, cesantiasRoutes, institucionesRoutes;

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

// Nuevas rutas
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

const router = express.Router();

// Registrar todas las rutas
if (afiliadsRoutes) router.use("/afiliados", afiliadsRoutes);
if (cargosRoutes) router.use("/cargos", cargosRoutes);
if (cuotasRoutes) router.use("/cuotas", cuotasRoutes);
if (salariosDepartamentosRoutes) router.use("/salarios", salariosDepartamentosRoutes);

// Nuevas rutas
if (religionesRoutes) router.use("/religiones", religionesRoutes);
if (municipiosRoutes) router.use("/municipios", municipiosRoutes);
if (epsRoutes) router.use("/eps", epsRoutes);
if (arlRoutes) router.use("/arl", arlRoutes);
if (pensionRoutes) router.use("/pension", pensionRoutes);
if (cesantiasRoutes) router.use("/cesantias", cesantiasRoutes);
if (institucionesRoutes) router.use("/instituciones", institucionesRoutes);

console.log("✅ Todas las rutas cargadas");

export default router;