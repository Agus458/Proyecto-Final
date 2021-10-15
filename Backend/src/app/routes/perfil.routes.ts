import { Router } from "express";
import { NivelEducativo } from "../models/perfil/nivel-educativo";
import * as profileController from "../controllers/profile.controller";
import { Estado } from "../models/perfil/estado";
import { AreaTematica } from "../models/perfil/area-tematica";
import { NombreIdioma } from "../models/perfil/nombre-idioma.model";
import { NivelJerarquico } from "../models/perfil/nivel-jerarquico.model";
import { TipoPermiso } from "../models/perfil/tipo-permiso.model";

const router = Router();

// NivelEducativo
router.get("/nivelesEducativos", profileController.get(NivelEducativo.prototype));

// EstadoNivelEducativo
router.get("/estadosNivelEducativo", profileController.get(Estado.prototype));

// AreaTematica
router.get("/areasTematicas", profileController.get(AreaTematica.prototype));

router.get("/nombresIdiomas", profileController.get(NombreIdioma.prototype));

router.get("/nivelesJerarquicos", profileController.get(NivelJerarquico.prototype));

router.get("/tiposPermisos", profileController.get(TipoPermiso.prototype));

export default router;