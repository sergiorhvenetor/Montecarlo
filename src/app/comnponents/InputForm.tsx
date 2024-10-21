"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid"; // Librería para generar un id único

// Definir correctamente los tipos para la actividad
type Activity = {
  id: string;
  name: string;
  precedence: string[]; // Precedencia siempre debe ser un array
  duration?: number;
  to?: number;
  tm?: number;
  tp?: number;
};

export default function InputForm({
  onSubmit,
  savedActivities,
  useMonteCarlo,
  onBackToMethodSelection, // Nueva función para regresar a la selección del método
}: {
  onSubmit: (activities: Activity[]) => void;
  savedActivities?: Activity[];
  useMonteCarlo: boolean;
  onBackToMethodSelection: () => void; // Añadimos esta función
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState<Activity>({
    id: uuidv4(),
    name: "",
    precedence: [], // Asegurarse de inicializar como un array vacío
  });

  useEffect(() => {
    // Cargar actividades guardadas si existen
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
    // Guardar actividades en localStorage
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  const handleChange = <T extends keyof Activity>(
    field: T,
    value: Activity[T] // Asegurarse de que el tipo de valor sea el correcto
  ) => {
    setNewActivity((prevState) => ({
      ...prevState,
      [field]: value, // Actualizar el valor del campo correspondiente
    }));
  };

  const handleNumberInputChange = (field: keyof Activity, value: string) => {
    if (value === "" || !isNaN(parseFloat(value))) {
      handleChange(field, value === "" ? undefined : parseFloat(value));
    } else {
      toast.error("Por favor, introduce un valor numérico válido.");
    }
  };

  const addActivity = () => {
    if (!newActivity.name) {
      toast.error("El nombre de la actividad es obligatorio");
      return;
    }

    setActivities([...activities, { ...newActivity, id: uuidv4() }]);
    setNewActivity({ id: uuidv4(), name: "", precedence: [] });
    toast.success("Actividad agregada correctamente.");
  };

  const handleEditActivity = <T extends keyof Activity>(
    index: number,
    field: T,
    value: Activity[T]
  ) => {
    const updatedActivities = [...activities];
    updatedActivities[index][field] = value;
    setActivities(updatedActivities);
    toast.info("Actividad editada.");
  };

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
    toast.warn("Actividad eliminada.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activities.length === 0) {
      toast.error("Debe agregar al menos una actividad antes de realizar el análisis.");
      return;
    }
    onSubmit(activities);
  };

  const handleClearData = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.")) {
      localStorage.removeItem("activities");
      setActivities([]);
      setNewActivity({ id: uuidv4(), name: "", precedence: [] });
      toast.success("Todos los datos han sido eliminados.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre de la actividad"
              value={newActivity.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="border border-gray-300 rounded-lg p-2"
            />
            <input
              type="text"
              placeholder="Precedencia (ej. A,B,C)"
              value={newActivity.precedence.join(",")} // Convertir array a string para mostrar
              onChange={(e) =>
                handleChange("precedence", e.target.value.split(",")) // Convertir la entrada a un array de strings
              }
              className="border border-gray-300 rounded-lg p-2"
            />
            {useMonteCarlo ? (
              <>
                <input
                  type="number"
                  placeholder="To (Optimista)"
                  value={newActivity.to !== undefined ? newActivity.to : ""}
                  onChange={(e) => handleNumberInputChange("to", e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg p-2"
                />
                <input
                  type="number"
                  placeholder="Tm (Más probable)"
                  value={newActivity.tm !== undefined ? newActivity.tm : ""}
                  onChange={(e) => handleNumberInputChange("tm", e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg p-2"
                />
                <input
                  type="number"
                  placeholder="Tp (Pesimista)"
                  value={newActivity.tp !== undefined ? newActivity.tp : ""}
                  onChange={(e) => handleNumberInputChange("tp", e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg p-2"
                />
              </>
            ) : (
              <input
                type="number"
                placeholder="Duración"
                value={newActivity.duration !== undefined ? newActivity.duration : ""}
                onChange={(e) => handleNumberInputChange("duration", e.target.value)}
                required
                className="border border-gray-300 rounded-lg p-2"
              />
            )}
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={addActivity}
              className="bg-green-500 text-white px-4 py-2 mt-4 rounded-lg"
            >
              Agregar Actividad
            </button>
            <button
              onClick={() => {
                handleClearData(); // Limpia todos los datos
                onBackToMethodSelection(); // Regresa a la selección del método
              }}
              className="bg-gray-500 text-white px-4 py-2 mt-4 rounded-lg hover:bg-gray-600 transition-colors duration-300"
            >
              Volver a selección de método
            </button>
          </div>
        </form>

        {activities.length > 0 && (
          <div className="mt-6">
            <h3 className="text-2xl font-bold mb-4">Lista de Actividades</h3>
            <table className="table-auto w-full bg-white rounded-lg shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-2">Actividad</th>
                  <th className="px-4 py-2">Precedencia</th>
                  {useMonteCarlo ? (
                    <>
                      <th className="px-4 py-2">To</th>
                      <th className="px-4 py-2">Tm</th>
                      <th className="px-4 py-2">Tp</th>
                    </>
                  ) : (
                    <th className="px-4 py-2">Duración</th>
                  )}
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
                          handleEditActivity(index, "precedence", e.target.value.split(","))
                        }
                        className="border border-gray-300 rounded-lg p-1 w-full"
                      />
                    </td>
                    {useMonteCarlo ? (
                      <>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={activity.to || ""}
                            onChange={(e) =>
                              handleEditActivity(index, "to", e.target.value === "" ? undefined : parseFloat(e.target.value))
                            }
                            className="border border-gray-300 rounded-lg p-1 w-full"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={activity.tm || ""}
                            onChange={(e) =>
                              handleEditActivity(index, "tm", e.target.value === "" ? undefined : parseFloat(e.target.value))
                            }
                            className="border border-gray-300 rounded-lg p-1 w-full"
                          />
                        </td>
                        <td className="border px-4 py-2">
                          <input
                            type="number"
                            value={activity.tp || ""}
                            onChange={(e) =>
                              handleEditActivity(index, "tp", e.target.value === "" ? undefined : parseFloat(e.target.value))
                            }
                            className="border border-gray-300 rounded-lg p-1 w-full"
                          />
                        </td>
                      </>
                    ) : (
                      <td className="border px-4 py-2">
                        <input
                          type="number"
                          value={activity.duration || ""}
                          onChange={(e) =>
                            handleEditActivity(index, "duration", e.target.value === "" ? undefined : parseFloat(e.target.value))
                          }
                          className="border border-gray-300 rounded-lg p-1 w-full"
                        />
                      </td>
                    )}
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
