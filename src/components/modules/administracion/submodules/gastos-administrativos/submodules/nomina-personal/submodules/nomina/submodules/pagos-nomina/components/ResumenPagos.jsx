

// src/components/modules/administracion/submodules/gastos-administrativos/submodules/nomina-personal/submodules/nomina/submodules/pagos-nomina/components/ResumenPagos.jsx
import React from "react";
import * as XLSX from "xlsx";
import "./ResumenPagos.css";

const ResumenPagos = ({
  pagosCalculados,
  fechaPago,
  tasaCambio,
  onGuardar,
  onVolver,
  selectedProject,
}) => {
  // Calcular período de pago
  const calcularPeriodoPago = (empleado) => {
    const fecha = new Date(fechaPago.replace(/-/g, '\/'));

    if (empleado.frecuenciaPago === "Semanal") {
      // Encontrar lunes de la semana del pago
      const lunes = new Date(fecha);
      const diaSemana = fecha.getDay();
      const diffLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
      lunes.setDate(fecha.getDate() + diffLunes);

      // Encontrar viernes de la semana del pago
      const viernes = new Date(lunes);
      viernes.setDate(lunes.getDate() + 4);

      return `Semana del ${lunes.toLocaleDateString(
        "es-ES"
      )} al ${viernes.toLocaleDateString("es-ES")}`;
    } else {
      // Pago quincenal
      const mes = fecha.getMonth();
      const año = fecha.getFullYear();

      const mitad =
        empleado.mitadPagoQuincenal || empleado.mitadPago || "primera";

      if (mitad === "primera") {
        const primerDia = new Date(año, mes, 1);
        const ultimoDia = new Date(año, mes, 15);
        return `Pago del ${primerDia.toLocaleDateString(
          "es-ES"
        )} al ${ultimoDia.toLocaleDateString("es-ES")}`;
      } else {
        const primerDia = new Date(año, mes, 16);
        const ultimoDia = new Date(año, mes + 1, 0);
        return `Pago del ${primerDia.toLocaleDateString(
          "es-ES"
        )} al ${ultimoDia.toLocaleDateString("es-ES")}`;
      }
    }
  };

  const exportToExcel = () => {
    const excelData = pagosCalculados.map((pago) => {
      const periodoPago = calcularPeriodoPago(pago.empleado);

      // Agregar información de deducciones para nóminas con ley
      const datosBase = {
        "Nombre del Trabajador": `${pago.empleado.nombre} ${pago.empleado.apellido}`,
        Cédula: pago.empleado.cedula,
        Cargo: pago.empleado.cargo,
        "Tipo Nómina": pago.empleado.tipoNomina,
        "Días Trabajados": pago.diasTrabajados,
        "Monto Diario ($)": pago.montoDiarioCalculado?.toFixed(2) || "0.00",
        "Horas Extras Diurnas": pago.horasExtras.diurna,
        "Horas Extras Nocturnas": pago.horasExtras.nocturna,
        "Monto Horas Extras Total ($)": pago.totalHorasExtrasUSD.toFixed(2),
        "Deducciones ($)": pago.deduccionesManualesUSD.toFixed(2),
        "Total a Pagar ($)": pago.subtotalUSD.toFixed(2),
        "Tasa del Día": parseFloat(tasaCambio).toFixed(4),
        "Total Pagar (Bs)": pago.totalPagarBs.toFixed(2),
        "Pagado por": pago.bancoPago || "No especificado",
        "Periodo de Pago": periodoPago,
        "Nombre del Contrato": selectedProject?.name || "No especificado",
        Observaciones: pago.observaciones || "",
      };

      // Agregar columnas de deducciones de ley para nóminas administrativas y ejecución
      if (["Administrativa", "Ejecucion"].includes(pago.empleado.tipoNomina)) {
        datosBase["Porcentaje ISLR Individual (%)"] =
          pago.empleado.porcentajeIslr || "0";
        datosBase["Deducciones Ley IVSS (Bs)"] =
          pago.desgloseDeduccionesLey?.ivss?.toFixed(2) || "0.00";
        datosBase["Deducciones Ley Paro Forzoso (Bs)"] =
          pago.desgloseDeduccionesLey?.paroForzoso?.toFixed(2) || "0.00";
        datosBase["Deducciones Ley FAOV (Bs)"] =
          pago.desgloseDeduccionesLey?.faov?.toFixed(2) || "0.00";
        datosBase["Deducciones Ley ISLR (Bs)"] =
          pago.desgloseDeduccionesLey?.islr?.toFixed(2) || "0.00";
        datosBase["Total Deducciones Ley (Bs)"] =
          pago.deduccionesLeyBs?.toFixed(2) || "0.00";
      }

      return datosBase;
    });

    // Agregar fila de totales
    const totales = calcularTotales();
    const filaTotales = {
      "Nombre del Trabajador": "TOTALES",
      Cédula: "",
      Cargo: "",
      "Tipo Nómina": "",
      "Días Trabajados": "",
      "Monto Diario ($)": "",
      "Horas Extras Diurnas": "",
      "Horas Extras Nocturnas": "",
      "Monto Horas Extras Total ($)": totales.totalHorasExtras.toFixed(2),
      "Deducciones ($)": totales.totalDeduccionesManuales.toFixed(2),
      "Total a Pagar ($)": totales.totalUSD.toFixed(2),
      "Tasa del Día": "",
      "Total Pagar (Bs)": totales.totalPagar.toFixed(2),
      "Pagado por": "",
      "Periodo de Pago": "",
      "Nombre del Contrato": "",
      Observaciones: "",
    };

    // Agregar totales de deducciones de ley si hay nóminas con ley
    if (
      pagosCalculados.some((pago) =>
        ["Administrativa", "Ejecucion"].includes(pago.empleado.tipoNomina)
      )
    ) {
      filaTotales["Porcentaje ISLR Individual (%)"] = "";
      filaTotales["Deducciones Ley IVSS (Bs)"] =
        totales.totalIvss?.toFixed(2) || "0.00";
      filaTotales["Deducciones Ley Paro Forzoso (Bs)"] =
        totales.totalParoForzoso?.toFixed(2) || "0.00";
      filaTotales["Deducciones Ley FAOV (Bs)"] =
        totales.totalFaov?.toFixed(2) || "0.00";
      filaTotales["Deducciones Ley ISLR (Bs)"] =
        totales.totalIslr?.toFixed(2) || "0.00";
      filaTotales["Total Deducciones Ley (Bs)"] =
        totales.totalDeduccionesLey?.toFixed(2) || "0.00";
    }

    excelData.push(filaTotales);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Estilo de tabla
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!ws[cell_ref]) continue;

        // Encabezados en negrita
        if (R === 0) {
          ws[cell_ref].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "D3D3D3" } },
          };
        }

        // Totales en negrita
        if (R === excelData.length - 1) {
          ws[cell_ref].s = { font: { bold: true } };
        }
      }
    }

    // Autoajustar columnas
    const columnas = [
      { wch: 25 },
      { wch: 12 },
      { wch: 20 },
      { wch: 30 },
      { wch: 8 },
      { wch: 12 },
      { wch: 8 },
      { wch: 8 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 30 },
    ];

    // Agregar columnas para deducciones de ley
    if (
      pagosCalculados.some((pago) =>
        ["Administrativa", "Ejecucion"].includes(pago.empleado.tipoNomina)
      )
    ) {
      columnas.push({ wch: 8 }); // Porcentaje ISLR Individual
      columnas.push({ wch: 15 }); // Deducciones Ley IVSS
      columnas.push({ wch: 15 }); // Deducciones Ley Paro Forzoso
      columnas.push({ wch: 15 }); // Deducciones Ley FAOV
      columnas.push({ wch: 15 }); // Deducciones Ley ISLR
      columnas.push({ wch: 15 }); // Total Deducciones Ley
    }

    ws["!cols"] = columnas;

    XLSX.utils.book_append_sheet(wb, ws, "Pagos Nómina");
    const fileName = `pagos_nomina_${fechaPago}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const calcularTotales = () => {
    return pagosCalculados.reduce(
      (totales, pago) => ({
        totalHorasExtras: totales.totalHorasExtras + pago.totalHorasExtrasUSD,
        totalDeduccionesManuales:
          totales.totalDeduccionesManuales + pago.deduccionesManualesUSD,
        totalUSD: totales.totalUSD + pago.subtotalUSD,
        totalPagar: totales.totalPagar + pago.totalPagarBs,
        // Totales de deducciones de ley
        totalIvss: totales.totalIvss + (pago.desgloseDeduccionesLey?.ivss || 0),
        totalParoForzoso:
          totales.totalParoForzoso +
          (pago.desgloseDeduccionesLey?.paroForzoso || 0),
        totalFaov: totales.totalFaov + (pago.desgloseDeduccionesLey?.faov || 0),
        totalIslr: totales.totalIslr + (pago.desgloseDeduccionesLey?.islr || 0),
        totalDeduccionesLey:
          totales.totalDeduccionesLey + pago.deduccionesLeyBs,
      }),
      {
        totalHorasExtras: 0,
        totalDeduccionesManuales: 0,
        totalUSD: 0,
        totalPagar: 0,
        totalIvss: 0,
        totalParoForzoso: 0,
        totalFaov: 0,
        totalIslr: 0,
        totalDeduccionesLey: 0,
      }
    );
  };

  const totales = calcularTotales();

  const handleGuardar = async () => {
    try {
      await onGuardar(pagosCalculados);
    } catch (error) {
      console.error("Error guardando pagos:", error);
    }
  };

  return (
    <div className="resumen-pagos">
      <div className="resumen-header">
        <h3>
          Resumen de Pagos -{" "}
          {new Date(fechaPago.replace(/-/g, '\/')).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h3>
        <div className="resumen-info">
          <span>
            <strong>Tasa de Cambio:</strong> Bs{" "}
            {parseFloat(tasaCambio).toFixed(4)}/$
          </span>
          <span>
            <strong>Total Empleados:</strong> {pagosCalculados.length}
          </span>
          <span>
            <strong>Contrato:</strong>{" "}
            {selectedProject?.name || "No especificado"}
          </span>
        </div>
        {/* Mostrar montos base por defecto */}
        <div className="montos-base-info">
          <small>
            <strong>Montos base por defecto:</strong> IVSS: 150 Bs, Paro
            Forzoso: 150 Bs, FAOV: 1300 Bs, ISLR: 120 USD$
          </small>
        </div>
      </div>

      {/* Tabla de resumen COMPLETA */}
      <div className="pagos-table-container">
        <table className="pagos-table">
          <thead>
            <tr>
              <th>Nombre del Trabajador</th>
              <th>Cédula</th>
              <th>Cargo</th>
              <th>Tipo Nómina</th>
              <th>Días Trab.</th>
              <th>Monto Diario ($)</th>
              <th>H. Extra D.</th>
              <th>H. Extra N.</th>
              <th>Monto H. Extra Total ($)</th>
              <th>Deducciones ($)</th>
              <th>Total a Pagar ($)</th>
              <th>Tasa del Día</th>
              <th>Total Pagar (Bs)</th>
              <th>Pagado por</th>
              <th>Periodo de Pago</th>
              <th>Nombre del Contrato</th>
              <th>Observaciones</th>
              {/* Columnas para deducciones de ley */}
              {pagosCalculados.some((pago) =>
                ["Administrativa", "Ejecucion"].includes(
                  pago.empleado.tipoNomina
                )
              ) && (
                <>
                  <th>% ISLR</th>
                  <th>Ded. IVSS (Bs)</th>
                  <th>Ded. Paro (Bs)</th>
                  <th>Ded. FAOV (Bs)</th>
                  <th>Ded. ISLR (Bs)</th>
                  <th>Total Ded. Ley (Bs)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {pagosCalculados.map((pago, index) => {
              const periodoPago = calcularPeriodoPago(pago.empleado);

              return (
                <tr
                  key={pago.empleado.id}
                  className={index % 2 === 0 ? "even" : "odd"}
                >
                  <td className="employee-name">
                    {pago.empleado.nombre} {pago.empleado.apellido}
                  </td>
                  <td>{pago.empleado.cedula}</td>
                  <td>{pago.empleado.cargo}</td>
                  <td>
                    <span
                      className={`nomina-badge ${pago.empleado.tipoNomina.replace(
                        /\s+/g,
                        "-"
                      )}`}
                    >
                      {pago.empleado.tipoNomina}
                    </span>
                  </td>
                  <td className="text-center">{pago.diasTrabajados}</td>
                  <td className="text-right">
                    ${pago.montoDiarioCalculado?.toFixed(2) || "0.00"}
                  </td>
                  <td className="text-center">{pago.horasExtras.diurna}</td>
                  <td className="text-center">{pago.horasExtras.nocturna}</td>
                  <td className="text-right">
                    ${pago.totalHorasExtrasUSD.toFixed(2)}
                  </td>
                  <td className="text-right">
                    ${pago.deduccionesManualesUSD.toFixed(2)}
                  </td>
                  <td className="text-right">${pago.subtotalUSD.toFixed(2)}</td>
                  <td className="text-right">
                    Bs {parseFloat(tasaCambio).toFixed(4)}
                  </td>
                  <td className="text-right total-pagar">
                    <strong>Bs {pago.totalPagarBs.toFixed(2)}</strong>
                  </td>
                  <td>{pago.bancoPago || "No especificado"}</td>
                  <td className="periodo-pago">{periodoPago}</td>
                  <td>{selectedProject?.name || "No especificado"}</td>
                  <td className="observaciones">{pago.observaciones || ""}</td>

                  {/* Celdas para deducciones de ley */}
                  {pagosCalculados.some((p) =>
                    ["Administrativa", "Ejecucion"].includes(
                      p.empleado.tipoNomina
                    )
                  ) && (
                    <>
                      <td className="text-center">
                        {["Administrativa", "Ejecucion"].includes(
                          pago.empleado.tipoNomina
                        )
                          ? (pago.empleado.porcentajeIslr || "0") + "%"
                          : ""}
                      </td>
                      <td className="text-right">
                        {pago.desgloseDeduccionesLey?.ivss?.toFixed(2) ||
                          "0.00"}
                      </td>
                      <td className="text-right">
                        {pago.desgloseDeduccionesLey?.paroForzoso?.toFixed(2) ||
                          "0.00"}
                      </td>
                      <td className="text-right">
                        {pago.desgloseDeduccionesLey?.faov?.toFixed(2) ||
                          "0.00"}
                      </td>
                      <td className="text-right">
                        {pago.desgloseDeduccionesLey?.islr?.toFixed(2) ||
                          "0.00"}
                      </td>
                      <td className="text-right deducciones-ley-total">
                        <strong>
                          {pago.deduccionesLeyBs?.toFixed(2) || "0.00"}
                        </strong>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="table-totals">
              <td colSpan="8" className="text-right">
                <strong>TOTALES:</strong>
              </td>
              <td className="text-right">
                <strong>${totales.totalHorasExtras.toFixed(2)}</strong>
              </td>
              <td className="text-right">
                <strong>${totales.totalDeduccionesManuales.toFixed(2)}</strong>
              </td>
              <td className="text-right">
                <strong>${totales.totalUSD.toFixed(2)}</strong>
              </td>
              <td></td>
              <td className="text-right total-pagar">
                <strong>Bs {totales.totalPagar.toFixed(2)}</strong>
              </td>
              <td colSpan="3"></td>

              {/* Totales de deducciones de ley */}
              {pagosCalculados.some((pago) =>
                ["Administrativa", "Ejecucion"].includes(
                  pago.empleado.tipoNomina
                )
              ) && (
                <>
                  <td></td>
                  <td className="text-right">
                    <strong>{totales.totalIvss.toFixed(2)}</strong>
                  </td>
                  <td className="text-right">
                    <strong>{totales.totalParoForzoso.toFixed(2)}</strong>
                  </td>
                  <td className="text-right">
                    <strong>{totales.totalFaov.toFixed(2)}</strong>
                  </td>
                  <td className="text-right">
                    <strong>{totales.totalIslr.toFixed(2)}</strong>
                  </td>
                  <td className="text-right deducciones-ley-total">
                    <strong>{totales.totalDeduccionesLey.toFixed(2)}</strong>
                  </td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="resumen-actions">
        <button className="btn-outline" onClick={onVolver}>
          ← Volver a Calculadora
        </button>
        <div className="action-group">
          <button className="btn-secondary" onClick={exportToExcel}>
            📊 Exportar a Excel
          </button>
          <button className="btn-primary" onClick={handleGuardar}>
            💾 Guardar Pagos
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumenPagos;
