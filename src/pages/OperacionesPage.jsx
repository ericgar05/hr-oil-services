import { Routes, Route } from "react-router-dom";
import ModulePage from "../.../../components/modules/_core/ModulePage/ModulePage";
import OperacionesMain from "../.../../components/modules/operaciones/OperacionesMain";
import PlanificacionMain from "../components/modules/operaciones/submodules/planificacion/PlanificacionMain";
import EjecucionMain from "../components/modules/operaciones/submodules/ejecucion/EjecucionMain";
import ComprasMain from "../components/modules/operaciones/submodules/compras/ComprasMain";
import InventarioMain from "../components/modules/operaciones/submodules/inventario/InventarioMain";
import RequerimientosMain from "../components/modules/operaciones/submodules/requerimientos/RequerimientosMain";

const OperacionesPage = () => {
  return (
    <ModulePage moduleId="operaciones" showSubRoutes={true}>
      <Routes>
        <Route index element={<OperacionesMain />} />
        <Route path="planificacion" element={<PlanificacionMain />} />
        <Route path="requerimientos" element={<RequerimientosMain />} />
        <Route path="ejecucion" element={<EjecucionMain />} />

        <Route path="compras" element={<ComprasMain />} />
        <Route
          path="inventario"
          element={<InventarioMain />}
        />
      </Routes>
    </ModulePage>
  );
};

export default OperacionesPage;
