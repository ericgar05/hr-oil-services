import { Routes, Route } from "react-router-dom";
import ModulePage from "../components/modules/_core/ModulePage/ModulePage";
import ContratoMain from "../components/modules/contrato/ContratoMain";
import PresupuestoMain from "../components/modules/contrato/submodules/presupuesto/PresupuestoMain";
import ValuacionesMain from "../components/modules/contrato/submodules/valuaciones/ValuacionesMain";

const ContratoPage = () => {
  return (
    <ModulePage moduleId="contrato" showSubRoutes={true}>
      <Routes>
        <Route index element={<ContratoMain />} />
        <Route path="presupuesto" element={<PresupuestoMain />} />
        {/* Agrega aquí otras subrutas cuando las crees */}

        <Route path="valuaciones" element={<ValuacionesMain />} />
      </Routes>
    </ModulePage>
  );
};

export default ContratoPage;
