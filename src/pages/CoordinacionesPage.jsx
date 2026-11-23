import ModulePage from "../components/modules/_core/ModulePage/ModulePage";
import CoordinacionesMain from "../components/modules/coordinaciones/CoordinacionesMain";

const CoordinacionesPage = () => {
  return (
    <ModulePage moduleId="coordinaciones" moduleName="Coordinaciones" showSubRoutes={false}>
      <CoordinacionesMain />
    </ModulePage>
  );
};

export default CoordinacionesPage;
