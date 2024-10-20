"use client";
import React, { useState } from "react";
import GanttDeterministic from "./GanttDeterministic";
import NetworkDiagram from "./NetWorkDiagram";

type Activity = {
  name: string;
  precedence: string[];
  duration: number;
};

type ActivityResult = {
  name: string;
  duration: number;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  totalFloat: number;
  isCritical: boolean;
  successors: string[];
};

type CompleteActivity = {
  id: string;
  name: string;
  precedence: string[];
  duration: number;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  totalFloat: number;
  isCritical: boolean;
  to: number;
  tm: number;
  tp: number;
  successors: string[];
};

export default function CPMDeterministic({
  activities,
  onReset,
}: {
  activities: Activity[];
  onReset: () => void;
}) {
  const [viewType, setViewType] = useState<"gantt" | "network">("gantt");

  const calculateCPM = () => {
    const activityResults: ActivityResult[] = [];

    activities.forEach((activity) => {
      const precedenceActivities = activity.precedence.map((prec: string) =>
        activityResults.find((res) => res?.name === prec)
      );

      const earliestStart =
        precedenceActivities.length > 0
          ? Math.max(
              ...precedenceActivities.map((res) => res?.earliestFinish || 0)
            )
          : 0;
      const earliestFinish = earliestStart + activity.duration;

      activityResults.push({
        name: activity.name,
        duration: activity.duration,
        earliestStart: parseFloat(earliestStart.toFixed(2)),
        earliestFinish: parseFloat(earliestFinish.toFixed(2)),
        latestStart: 0,
        latestFinish: 0,
        totalFloat: 0,
        isCritical: false,
        successors: [],
      });
    });

    activities.forEach((activity) => {
      activity.precedence.forEach((prec: string) => {
        const predecessor = activityResults.find((act) => act.name === prec);
        if (predecessor) {
          predecessor.successors.push(activity.name);
        }
      });
    });

    const totalProjectDuration = Math.max(
      ...activityResults.map((a) => a.earliestFinish)
    );

    activityResults.forEach((activity) => {
      activity.latestFinish = totalProjectDuration;
      activity.latestStart = activity.latestFinish - activity.duration;
    });

    let updated = true;
    while (updated) {
      updated = false;
      activityResults.forEach((activity) => {
        if (activity.successors.length > 0) {
          const successorResults = activity.successors.map((succ: string) =>
            activityResults.find((res) => res?.name === succ)
          );

          const minLatestStart = Math.min(
            ...successorResults.map(
              (res) => res?.latestStart || totalProjectDuration
            )
          );
          if (minLatestStart < activity.latestFinish) {
            activity.latestFinish = minLatestStart;
            activity.latestStart = activity.latestFinish - activity.duration;
            updated = true;
          }
        }
      });
    }

    activityResults.forEach((activity) => {
      activity.totalFloat = parseFloat(
        (activity.latestStart - activity.earliestStart).toFixed(2)
      );
      activity.isCritical = activity.totalFloat === 0;
    });

    return activityResults;
  };

  const activityResults = calculateCPM();
  const totalProjectDuration = Math.max(
    ...activityResults.map((a) => a.earliestFinish)
  );

  const handleViewChange = (view: "gantt" | "network") => {
    setViewType(view);
  };

  // Mapeamos a CompleteActivity agregando las propiedades que faltan
  const completeActivityResults: CompleteActivity[] = activityResults.map(
    (activity, index) => ({
      id: `ID-${index}`,
      name: activity.name,
      precedence: activity.successors,
      duration: activity.duration,
      earliestStart: activity.earliestStart,
      earliestFinish: activity.earliestFinish,
      latestStart: activity.latestStart,
      latestFinish: activity.latestFinish,
      totalFloat: activity.totalFloat,
      isCritical: activity.isCritical,
      to: 0, // Valor por defecto
      tm: 0, // Valor por defecto
      tp: 0, // Valor por defecto
      successors: activity.successors,
    })
  );

  return (
    <div className="min-h-screen bg-cover max-w-[1300px] bg-no-repeat p-10">
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-lg max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-600">
          Resultados del Análisis CPM (Determinista)
        </h2>

        {/* Mostrar los resultados del análisis */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white rounded-lg shadow-lg overflow-hidden text-xs md:text-base">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-2 py-2 md:px-4">Actividad</th>
                <th className="px-2 py-2 md:px-4">Duración</th>
                <th className="px-2 py-2 md:px-4">Inicio Temprano (ES)</th>
                <th className="px-2 py-2 md:px-4">Finalización Temprana (EF)</th>
                <th className="px-2 py-2 md:px-4">Inicio Tardío (LS)</th>
                <th className="px-2 py-2 md:px-4">Finalización Tardía (LF)</th>
                <th className="px-2 py-2 md:px-4">Holgura Total</th>
                <th className="px-2 py-2 md:px-4">Es Crítica</th>
              </tr>
            </thead>
            <tbody>
              {activityResults.map((activity) => (
                <tr
                  key={activity.name}
                  className={`text-center ${
                    activity.isCritical
                      ? "text-red-600 font-bold"
                      : "text-gray-700"
                  }`}
                >
                  <td className="border px-2 py-2 md:px-4">{activity.name}</td>
                  <td className="border px-2 py-2 md:px-4">
                    {activity.duration.toFixed(2)}
                  </td>
                  <td className="border px-2 py-2 md:px-4">
                    {activity.earliestStart.toFixed(2)}
                  </td>
                  <td className="border px-2 py-2 md:px-4">
                    {activity.earliestFinish.toFixed(2)}
                  </td>
                  <td className="border px-2 py-2 md:px-4">
                    {activity.latestStart.toFixed(2)}
                  </td>
                  <td className="border px-2 py-2 md:px-4">
                    {activity.latestFinish.toFixed(2)}
                  </td>
                  <td className="border px-2 py-2 md:px-4">
                    {activity.totalFloat.toFixed(2)}
                  </td>
                  <td className="border px-2 py-2 md:px-4">
                    {activity.isCritical ? "Sí" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Duración total del proyecto */}
          <div className="mt-4 text-lg font-semibold text-gray-800">
            La duración del proyecto es: {totalProjectDuration.toFixed(2)} días.
          </div>

          {/* Selector de vista (Gantt o Red) */}
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => handleViewChange("gantt")}
              disabled={viewType === "gantt"}
              className={`px-4 py-2 mr-2 rounded-lg ${
                viewType === "gantt"
                  ? "bg-gray-500 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              Ver Gantt
            </button>
            <button
              onClick={() => handleViewChange("network")}
              disabled={viewType === "network"}
              className={`px-4 py-2 ml-2 rounded-lg ${
                viewType === "network"
                  ? "bg-gray-500 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              Ver Diagrama de Red
            </button>
          </div>

          {/* Renderizar el diagrama correspondiente */}
          {viewType === "gantt" ? (
            <GanttDeterministic activities={completeActivityResults} />
          ) : (
            <NetworkDiagram activities={completeActivityResults} />
          )}

          {/* Botón para reiniciar */}
          <div className="text-center mt-8">
            <button
              onClick={onReset}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Volver a escoger metodo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
