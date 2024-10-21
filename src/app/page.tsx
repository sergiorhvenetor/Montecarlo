"use client";
import { useState } from "react";
import InputForm from './comnponents/InputForm';
import MonteCarloAnalysis from './comnponents/MonteCarloAnalysis';
import CPMDeterministic from './comnponents/CPMDeterministic';
import { Activity } from "./comnponents/types"; // Usar el tipo unificado de Activity

type AnalysisMethod = "deterministic" | "montecarlo";

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
  const [method, setMethod] = useState<AnalysisMethod | null>(null);
  const [isEditing, setIsEditing] = useState(false); // Nuevo estado para manejar la edición

  // Asegurarse de que cada actividad tenga un id antes de guardar los datos
  const handleFormSubmit = (activitiesData: Activity[]) => {
    const preparedActivities = activitiesData.map((activity) => ({
      ...activity,
      id: activity.id || `id-${Math.random().toString(36).substr(2, 9)}`, // Generar ID si no existe
      to: activity.to || 0, // Valor por defecto si no se asigna
      tm: activity.tm || 0, // Valor por defecto si no se asigna
      tp: activity.tp || 0, // Valor por defecto si no se asigna
    }));
    setActivities(preparedActivities);
    setIsAnalysisMode(true);
    setIsEditing(false); // Desactivamos la edición cuando los datos son actualizados
  };

  const handleReset = () => {
    setActivities([]); // Limpiamos las actividades
    setIsAnalysisMode(false);
    setMethod(null); // Permitimos que el usuario seleccione nuevamente el método
  };
  
  const handleEdit = (editedActivities: Activity[]) => {
    setActivities(editedActivities); // Actualizamos las actividades editadas
    setIsAnalysisMode(false); // Salimos del modo análisis
    setIsEditing(true); // Entramos en modo edición
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat p-4 sm:p-10" style={{ backgroundImage: 'url(/image/PERT-CPM-Monte-Carlo.png)' }}>
      <div className="bg-white bg-opacity-80 p-6 sm:p-8 rounded-lg shadow-lg max-w-6xl mx-auto mt-6 sm:mt-10">
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-blue-600 mb-6 sm:mb-8">
          Cronograma de Proyecto
        </h1>
        
        {!method ? (
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setMethod("deterministic")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Determinístico
            </button>
            <button
              onClick={() => setMethod("montecarlo")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              PERT-CPM con Monte Carlo
            </button>
          </div>
          
        ) : (
          !isAnalysisMode || isEditing ? (
            <InputForm
              onSubmit={handleFormSubmit} // Manejamos el submit desde el formulario
              savedActivities={activities} // Pasamos las actividades actuales al formulario
              useMonteCarlo={method === "montecarlo"} // Pasamos el método seleccionado
              onBackToMethodSelection={handleReset} // Pasamos esta función para volver a la selección del método
            />
          ) : (
            method === "montecarlo" ? (
              <MonteCarloAnalysis
                activities={activities}
                onReset={handleReset}
                onEdit={handleEdit} // Función para editar los datos actuales
              />
            ) : (
              <CPMDeterministic
                activities={activities}
                onReset={handleReset}
                onEdit={handleEdit} // Función para editar los datos actuales
              />
            )
          )
        )}
         <h4 className="text-xl sm:text-2xl font-bold text-center text-blue-600 mt-10 mb-6 sm:mb-8">
          Seleccione el analisis deseado
        </h4>
      </div>     
    </div>
  );
}
