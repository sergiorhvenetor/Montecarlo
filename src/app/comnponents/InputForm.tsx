'use client';
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify"; // Importamos toast y el contenedor de react-toastify
import 'react-toastify/dist/ReactToastify.css';

type Activity = {
  name: string;
  precedence: string[];
  to: number;
  tm: number;
  tp: number;
  [key: string]: string | string[] | number;
};

export default function InputForm({
  onSubmit,
  savedActivities,
}: {
  onSubmit: (activities: Activity[]) => void;
  savedActivities?: Activity[]; // Nuevo prop para pasar las actividades guardadas
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState<Activity>({
    name: "",
    precedence: [],
    to: 0,
    tm: 0,
    tp: 0,
  });

  useEffect(() => {
    // Cargar datos guardados en localStorage si existen
    if (savedActivities && savedActivities.length > 0) {
      setActivities(savedActivities);
    } else {
      const storedActivities = localStorage.getItem("activities");
      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      }
    }
  }, [savedActivities]);

  useEffect(() => {
    // Guardar los datos actuales en localStorage
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  const handleChange = (field: keyof Activity, value: string | number) => {
    if (field === "precedence") {
      setNewActivity({
        ...newActivity,
        [field]: (value as string).split(",").map((item) => item.trim()),
      });
    } else {
      setNewActivity({
        ...newActivity,
        [field]: value,
      });
    }
  };

  const addActivity = () => {
    setActivities([...activities, newActivity]);
    setNewActivity({ name: "", precedence: [], to: 0, tm: 0, tp: 0 }); // Limpiar el formulario después de agregar
  };

  const handleEditActivity = (
    index: number,
    field: keyof Activity,
    value: string | number
  ) => {
    const updatedActivities = [...activities];
    if (field === "precedence") {
      updatedActivities[index][field] = (value as string)
        .split(",")
        .map((item) => item.trim());
    } else {
      updatedActivities[index][field] = value;
    }
    setActivities(updatedActivities);
  };

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(activities);
  };

  const handleClearData = () => {
    // Mostrar confirmación antes de limpiar la data
    if (window.confirm("¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.")) {
      localStorage.removeItem("activities");
      setActivities([]);
      setNewActivity({ name: "", precedence: [], to: 0, tm: 0, tp: 0 }); // Limpiar el formulario
      toast.success("Todos los datos han sido eliminados."); // Notificación de éxito usando react-toastify
    }
  };

  return (
  <>
    <ToastContainer /> {/* Contenedor de notificaciones */}
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 max-w-2xl mx-auto mt-10">
      {/* Formulario para agregar nuevas actividades */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre de la actividad"
            value={newActivity.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Precedencia (ej. A,B,C)"
            value={newActivity.precedence.join(",")}
            onChange={(e) => handleChange("precedence", e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="To (Optimista)"
            value={newActivity.to || ""}
            onChange={(e) => handleChange("to", parseFloat(e.target.value))}
            required
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Tm (Más probable)"
            value={newActivity.tm || ""}
            onChange={(e) => handleChange("tm", parseFloat(e.target.value))}
            required
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Tp (Pesimista)"
            value={newActivity.tp || ""}
            onChange={(e) => handleChange("tp", parseFloat(e.target.value))}
            required
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={addActivity}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
        >
          Agregar Actividad
        </button>
      </form>

      {/* Tabla Editable */}
      {activities.length > 0 && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold mb-4">Lista de Actividades</h3>
          <table className="table-auto w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-4 py-2">Actividad</th>
                <th className="px-4 py-2">Precedencia</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Tm</th>
                <th className="px-4 py-2">Tp</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={index} className="text-center">
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={activity.name}
                      onChange={(e) =>
                        handleEditActivity(index, "name", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-1 w-full"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      value={activity.precedence.join(",")}
                      onChange={(e) =>
                        handleEditActivity(index, "precedence", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-1 w-full"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      value={activity.to}
                      onChange={(e) =>
                        handleEditActivity(index, "to", parseFloat(e.target.value))
                      }
                      className="border border-gray-300 rounded-lg p-1 w-full"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      value={activity.tm}
                      onChange={(e) =>
                        handleEditActivity(index, "tm", parseFloat(e.target.value))
                      }
                      className="border border-gray-300 rounded-lg p-1 w-full"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      value={activity.tp}
                      onChange={(e) =>
                        handleEditActivity(index, "tp", parseFloat(e.target.value))
                      }
                      className="border border-gray-300 rounded-lg p-1 w-full"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleRemoveActivity(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-colors duration-300"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between">
            <button
              onClick={handleClearData}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-300"
            >
              Limpiar todo
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Realizar Análisis
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
