import ModulePage from "../components/modules/_core/ModulePage/ModulePage";
import ResumenMain from "../components/modules/resumen/ResumenMain";

const ResumenPage = () => {
  return (
    <ModulePage moduleId="resumen" moduleName="Resumen" showSubRoutes={false}>
      <ResumenMain />
    </ModulePage>
  );
};

export default ResumenPage;
