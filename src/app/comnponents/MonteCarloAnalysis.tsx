import React from 'react';

type Activity = {
  name: string;
  precedence: string[];
  to: number;
  tm: number;
  tp: number;
};

type ActivityResult = {
  name: string;
  duration: number;
  stdDeviation: number;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  totalFloat: number;
  isCritical: boolean;
  successors: string[];
};

function getRandomPertDuration(to: number, tm: number, tp: number) {
  const alpha = (4 * tm + to + tp) / 6;
  const sigma = (tp - to) / 6;
  return alpha + sigma * (Math.random() - 0.5);
}

export default function MonteCarloAnalysis({ activities }: { activities: Activity[] }) {
  const monteCarloIterations = 1000;
  const results: number[] = [];

  const calculatePertCPM = () => {
    const activityResults: ActivityResult[] = [];
    activities.forEach((activity) => {
      const duration = parseFloat(((activity.to + 4 * activity.tm + activity.tp) / 6).toFixed(3));
      const stdDeviation = parseFloat(((activity.tp - activity.to) / 6).toFixed(3));

      const precedenceActivities = activity.precedence.map((prec: string) =>
        activityResults.find((res) => res?.name === prec)
      );

      const earliestStart = precedenceActivities.length > 0
        ? Math.max(...precedenceActivities.map((res) => res?.earliestFinish || 0))
        : 0;
      const earliestFinish = earliestStart + duration;

      activityResults.push({
        name: activity.name,
        duration,
        stdDeviation,
        earliestStart: parseFloat(earliestStart.toFixed(3)),
        earliestFinish: parseFloat(earliestFinish.toFixed(3)),
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

    const totalProjectDuration = Math.max(...activityResults.map((a) => a.earliestFinish));
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

          const minLatestStart = Math.min(...successorResults.map((res) => res?.latestStart || totalProjectDuration));
          if (minLatestStart < activity.latestFinish) {
            activity.latestFinish = minLatestStart;
            activity.latestStart = activity.latestFinish - activity.duration;
            updated = true;
          }
        }
      });
    }

    activityResults.forEach((activity) => {
      activity.totalFloat = parseFloat((activity.latestStart - activity.earliestStart).toFixed(3));
      activity.isCritical = activity.totalFloat === 0;
    });

    return activityResults;
  };

  const calculateMonteCarlo = () => {
    const activitySummaries: { [key: string]: { durations: number[]; criticalCount: number } } = {};

    activities.forEach((activity) => {
      activitySummaries[activity.name] = { durations: [], criticalCount: 0 };
    });

    for (let i = 0; i < monteCarloIterations; i++) {
      const activityResults: ActivityResult[] = [];
      let totalVariance = 0;

      activities.forEach((activity) => {
        const duration = getRandomPertDuration(activity.to, activity.tm, activity.tp);
        const stdDeviation = parseFloat(((activity.tp - activity.to) / 6).toFixed(3));
        totalVariance += Math.pow(stdDeviation, 2);

        const precedenceActivities = activity.precedence.map((prec: string) =>
          activityResults.find((res) => res?.name === prec)
        );

        const earliestStart = precedenceActivities.length > 0
          ? Math.max(...precedenceActivities.map((res) => res?.earliestFinish || 0))
          : 0;
        const earliestFinish = earliestStart + duration;

        activityResults.push({
          name: activity.name,
          duration,
          stdDeviation,
          earliestStart: parseFloat(earliestStart.toFixed(3)),
          earliestFinish: parseFloat(earliestFinish.toFixed(3)),
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

      const totalProjectDuration = Math.max(...activityResults.map((a) => a.earliestFinish));
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

            const minLatestStart = Math.min(...successorResults.map((res) => res?.latestStart || totalProjectDuration));
            if (minLatestStart < activity.latestFinish) {
              activity.latestFinish = minLatestStart;
              activity.latestStart = activity.latestFinish - activity.duration;
              updated = true;
            }
          }
        });
      }

      activityResults.forEach((activity) => {
        activity.totalFloat = parseFloat((activity.latestStart - activity.earliestStart).toFixed(3));
        activity.isCritical = activity.totalFloat === 0;

        activitySummaries[activity.name].durations.push(activity.duration);
        if (activity.isCritical) {
          activitySummaries[activity.name].criticalCount++;
        }
      });

      results.push(totalProjectDuration);
    }

    const avgDuration = results.reduce((acc, val) => acc + val, 0) / monteCarloIterations;
    const stdDev = Math.sqrt(results.reduce((acc, val) => acc + Math.pow(val - avgDuration, 2), 0) / monteCarloIterations);
    const percentiles = (p: number) => results.sort()[(p / 100) * results.length];

    return { avgDuration, stdDev, percentiles, activitySummaries };
  };

  const activityResults = calculatePertCPM();
  const { avgDuration, stdDev, percentiles, activitySummaries } = calculateMonteCarlo();

  return (
    <div className="min-h-screen bg-cover max-w-[1500px] bg-no-repeat p-10" style={{ backgroundImage: 'url(/your-background-image.jpg)' }}>
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-lg max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-600">Resultados del Análisis PERT-CPM</h2>
        
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white rounded-lg shadow-lg overflow-hidden text-xs md:text-base">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-2 py-2 md:px-4">Actividad</th>
                <th className="px-2 py-2 md:px-4">Duración</th>
                <th className="px-2 py-2 md:px-4">Desviación Estándar</th>
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
                <tr key={activity.name} className={`text-center ${activity.isCritical ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                  <td className="border px-2 py-2 md:px-4">{activity.name}</td>
                  <td className="border px-2 py-2 md:px-4">{activity.duration.toFixed(3)}</td>
                  <td className="border px-2 py-2 md:px-4">{activity.stdDeviation.toFixed(3)}</td>
                  <td className="border px-2 py-2 md:px-4">{activity.earliestStart.toFixed(3)}</td>
                  <td className="border px-2 py-2 md:px-4">{activity.earliestFinish.toFixed(3)}</td>
                  <td className="border px-2 py-2 md:px-4">{activity.latestStart.toFixed(3)}</td>
                  <td className="border px-2 py-2 md:px-4">{activity.latestFinish.toFixed(3)}</td>
                  <td className="border px-2 py-2 md:px-4">{activity.totalFloat.toFixed(3)}</td>
                  <td className="border px-2 py-2 md:px-4">{activity.isCritical ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold my-6 text-center text-blue-600">Resultados del Análisis Monte Carlo</h3>
        <p className="text-sm md:text-lg text-center mb-4">
          <strong>Duración promedio del proyecto:</strong> {avgDuration.toFixed(3)} días
        </p>
        <p className="text-sm md:text-lg text-center mb-4">
          <strong>Desviación estándar de las duraciones:</strong> {stdDev.toFixed(3)} días
        </p>
        <p className="text-sm md:text-lg text-center mb-4">
          <strong>Percentil 50 (Mediana):</strong> {percentiles(50).toFixed(3)} días
        </p>
        <p className="text-sm md:text-lg text-center mb-4">
          <strong>Percentil 90:</strong> {percentiles(90).toFixed(3)} días
        </p>

        <h4 className="text-2xl md:text-3xl font-bold my-4 text-center text-blue-600">Detalles de las Actividades (Monte Carlo)</h4>
        <div className="overflow-x-auto">
          <table className="table-auto w-full bg-white rounded-lg shadow-lg overflow-hidden text-xs md:text-base">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-2 py-2 md:px-4">Actividad</th>
                <th className="px-2 py-2 md:px-4">Duración Promedio</th>
                <th className="px-2 py-2 md:px-4">Desviación Estándar</th>
                <th className="px-2 py-2 md:px-4">Veces Crítica</th>
                <th className="px-2 py-2 md:px-4">Porcentaje Crítica</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => {
                const avgDuration = activitySummaries[activity.name].durations.reduce((acc, val) => acc + val, 0) / monteCarloIterations;
                const stdDevActivity = Math.sqrt(
                  activitySummaries[activity.name].durations.reduce((acc, val) => acc + Math.pow(val - avgDuration, 2), 0) / monteCarloIterations
                );
                const criticalCount = activitySummaries[activity.name].criticalCount;
                const criticalPercentage = (criticalCount / monteCarloIterations) * 100;

                return (
                  <tr key={activity.name} className={`text-center ${activitySummaries[activity.name].criticalCount > 0 ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                    <td className="border px-2 py-2 md:px-4">{activity.name}</td>
                    <td className="border px-2 py-2 md:px-4">{avgDuration.toFixed(3)}</td>
                    <td className="border px-2 py-2 md:px-4">{stdDevActivity.toFixed(3)}</td>
                    <td className="border px-2 py-2 md:px-4">{criticalCount}</td>
                    <td className="border px-2 py-2 md:px-4">{criticalPercentage.toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
