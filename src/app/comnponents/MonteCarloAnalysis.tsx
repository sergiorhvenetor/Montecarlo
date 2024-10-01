import React, { useState } from 'react';

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

// Función para obtener duraciones aleatorias basadas en la distribución PERT
function getRandomPertDuration(to: number, tm: number, tp: number) {
  const alpha = (4 * tm + to + tp) / 6; // Media PERT
  const sigma = (tp - to) / 6; // Desviación estándar
  return alpha + sigma * (Math.random() - 0.5); // Generación aleatoria con la media y desviación
}

export default function MonteCarloAnalysis({ activities }: { activities: Activity[] }) {
  const monteCarloIterations = 1000;
  const results: number[] = [];

  // Estado para controlar si el cálculo incluye día adicional entre actividades
  const [addDayBetweenActivities, setAddDayBetweenActivities] = useState(false);

  // Manejar el cambio en el input form (checkbox para sumar o no 1 día)
  const handleDayBetweenActivitiesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddDayBetweenActivities(event.target.checked);
  };

  // Cálculo del forward y backward pass para PERT-CPM
  const calculatePertCPM = () => {
    const activityResults: ActivityResult[] = [];

    // Forward Pass (ES y EF)
    activities.forEach((activity) => {
      const duration = parseFloat(((activity.to + 4 * activity.tm + activity.tp) / 6).toFixed(3));
      const stdDeviation = parseFloat(((activity.tp - activity.to) / 6).toFixed(3));

      const precedenceActivities = activity.precedence.map((prec: string) =>
        activityResults.find((res) => res?.name === prec)
      );

      // Si el checkbox está marcado, el ES de una actividad sucesora será el EF de la predecesora + 1
      const earliestStart = precedenceActivities.length > 0
        ? Math.max(...precedenceActivities.map((res) => (res?.earliestFinish || 0) + (addDayBetweenActivities ? 1 : 0)))
        : 0;
      const earliestFinish = earliestStart + duration;

      activityResults.push({
        name: activity.name,
        duration,
        stdDeviation,
        earliestStart: parseFloat(earliestStart.toFixed(3)),
        earliestFinish: parseFloat(earliestFinish.toFixed(3)),
        latestStart: 0, // Temporal
        latestFinish: 0, // Temporal
        totalFloat: 0, // Temporal
        isCritical: false,
        successors: [],
      });
    });

    // Asignar sucesoras
    activities.forEach((activity) => {
      activity.precedence.forEach((prec: string) => {
        const predecessor = activityResults.find((act) => act.name === prec);
        if (predecessor) {
          predecessor.successors.push(activity.name);
        }
      });
    });

    // Backward Pass (LS y LF) iterativo para corregir cálculos
    const totalProjectDuration = Math.max(...activityResults.map((a) => a.earliestFinish));
    activityResults.forEach((activity) => {
      activity.latestFinish = totalProjectDuration;
      activity.latestStart = activity.latestFinish - activity.duration;
    });

    let updated = true;
    while (updated) {
      updated = false;

      // Iterar para estabilizar los valores de LS y LF
      activityResults.forEach((activity) => {
        if (activity.successors.length > 0) {
          const successorResults = activity.successors.map((succ: string) =>
            activityResults.find((res) => res?.name === succ)
          );

          // Si se agrega un día en el forward pass, también se debe agregar en el backward pass
          const minLatestStart = Math.min(
            ...successorResults.map((res) => (res?.latestStart || totalProjectDuration) - (addDayBetweenActivities ? 1 : 0))
          );
          if (minLatestStart < activity.latestFinish) {
            activity.latestFinish = minLatestStart;
            activity.latestStart = activity.latestFinish - activity.duration;
            updated = true; // Continuar iterando si hubo cambios
          }
        }
      });
    }

    // Cálculo de holgura y actividades críticas
    activityResults.forEach((activity) => {
      activity.totalFloat = parseFloat((activity.latestStart - activity.earliestStart).toFixed(3));
      activity.isCritical = activity.totalFloat === 0;
    });

    return activityResults;
  };

  // Cálculo del análisis Monte Carlo
  const calculateMonteCarlo = () => {
    const activitySummaries: { [key: string]: { durations: number[], criticalCount: number } } = {};

    // Inicializar contadores y arreglos de duraciones
    activities.forEach((activity) => {
      activitySummaries[activity.name] = { durations: [], criticalCount: 0 };
    });

    for (let i = 0; i < monteCarloIterations; i++) {
      const activityResults: ActivityResult[] = [];
      let totalVariance = 0;

      // Forward Pass (ES y EF)
      activities.forEach((activity) => {
        const duration = getRandomPertDuration(activity.to, activity.tm, activity.tp);
        const stdDeviation = parseFloat(((activity.tp - activity.to) / 6).toFixed(3));
        totalVariance += Math.pow(stdDeviation, 2);

        const precedenceActivities = activity.precedence.map((prec: string) =>
          activityResults.find((res) => res?.name === prec)
        );

        // Aplicar la lógica de +1 día si está seleccionado
        const earliestStart = precedenceActivities.length > 0
          ? Math.max(...precedenceActivities.map((res) => (res?.earliestFinish || 0) + (addDayBetweenActivities ? 1 : 0)))
          : 0;
        const earliestFinish = earliestStart + duration;

        activityResults.push({
          name: activity.name,
          duration,
          stdDeviation,
          earliestStart: parseFloat(earliestStart.toFixed(3)),
          earliestFinish: parseFloat(earliestFinish.toFixed(3)),
          latestStart: 0, // Temporal
          latestFinish: 0, // Temporal
          totalFloat: 0, // Temporal
          isCritical: false,
          successors: [],
        });
      });

      // Asignar sucesoras
      activities.forEach((activity) => {
        activity.precedence.forEach((prec: string) => {
          const predecessor = activityResults.find((act) => act.name === prec);
          if (predecessor) {
            predecessor.successors.push(activity.name);
          }
        });
      });

      // Backward Pass (LS y LF) con iteraciones
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

            // Ajustar backward pass para reflejar el día adicional si es necesario
            const minLatestStart = Math.min(
              ...successorResults.map((res) => (res?.latestStart || totalProjectDuration) - (addDayBetweenActivities ? 1 : 0))
            );
            if (minLatestStart < activity.latestFinish) {
              activity.latestFinish = minLatestStart;
              activity.latestStart = activity.latestFinish - activity.duration;
              updated = true;
            }
          }
        });
      }

      // Calcular la holgura y determinar si la actividad es crítica
      activityResults.forEach((activity) => {
        activity.totalFloat = parseFloat((activity.latestStart - activity.earliestStart).toFixed(3));
        activity.isCritical = activity.totalFloat === 0;

        // Guardar la duración de la actividad en el resumen
        activitySummaries[activity.name].durations.push(activity.duration);
        if (activity.isCritical) {
          activitySummaries[activity.name].criticalCount++;
        }
      });

      // Guardar la duración total del proyecto
      results.push(totalProjectDuration);
    }

    // Análisis de las simulaciones Monte Carlo
    const avgDuration = results.reduce((acc, val) => acc + val, 0) / monteCarloIterations;
    const stdDev = Math.sqrt(
      results.reduce((acc, val) => acc + Math.pow(val - avgDuration, 2), 0) / monteCarloIterations
    );
    const percentiles = (p: number) => results.sort()[(p / 100) * results.length];

    return { avgDuration, stdDev, percentiles, activitySummaries };
  };

  const activityResults = calculatePertCPM();
  const { avgDuration, stdDev, percentiles, activitySummaries } = calculateMonteCarlo();

  return (
    <div>
      <h3>Resultados del Análisis PERT-CPM</h3>

      {/* Checkbox para seleccionar si se suma un día entre actividades o no */}
      <label>
        <input
          type="checkbox"
          checked={addDayBetweenActivities}
          onChange={handleDayBetweenActivitiesChange}
        />
        Sumar 1 día entre actividades sucesoras (marcar para tipo calendario iniciando en el dia 1)
      </label>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Actividad</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Duración</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Desviación Estándar</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Inicio Temprano (ES)</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Finalización Temprana (EF)</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Inicio Tardío (LS)</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Finalización Tardía (LF)</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Holgura Total</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Es Crítica</th>
          </tr>
        </thead>
        <tbody>
          {activityResults.map((activity) => (
            <tr
              key={activity.name}
              style={{ color: activity.isCritical ? 'red' : 'black' }} // Color rojo para actividades críticas
            >
              <td style={{ border: '1px solid black', padding: '8px' }}>{activity.name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{activity.duration.toFixed(3)}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{activity.stdDeviation.toFixed(3)}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{activity.earliestStart.toFixed(3)}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{activity.earliestFinish.toFixed(3)}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{activity.latestStart.toFixed(3)}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{activity.latestFinish.toFixed(3)}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{activity.totalFloat.toFixed(3)}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{activity.isCritical ? 'Sí' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Resultados del Análisis Monte Carlo</h3>
      <p>Duración promedio del proyecto: {avgDuration.toFixed(3)} días</p>
      <p>Desviación estándar de las duraciones: {stdDev.toFixed(3)} días</p>
      <p>Percentil 50 (Mediana): {percentiles(50).toFixed(3)} días</p>
      <p>Percentil 90: {percentiles(90).toFixed(3)} días</p>

      <h4>Detalles de las Actividades (Monte Carlo)</h4>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Actividad</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Duración Promedio</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Desviación Estándar</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Veces Crítica</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Porcentaje Crítica</th>
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
              <tr
                key={activity.name}
                style={{ color: activitySummaries[activity.name].criticalCount > 0 ? 'red' : 'black' }} // Color rojo para actividades críticas en Monte Carlo
              >
                <td style={{ border: '1px solid black', padding: '8px' }}>{activity.name}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{avgDuration.toFixed(3)}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{stdDevActivity.toFixed(3)}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{criticalCount}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{criticalPercentage.toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
