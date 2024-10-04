import React, { useEffect, useRef, useState } from "react";
import * as joint from "jointjs";
import { CompleteActivity } from "./types";

interface NetworkDiagramProps {
  activities: CompleteActivity[];
}

export default function NetworkDiagram({ activities }: NetworkDiagramProps) {
  const graphRef = useRef<joint.dia.Graph | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const paperInstance = useRef<joint.dia.Paper | null>(null); // Referencia para el paper
  const [zoom, setZoom] = useState(1); // Estado para manejar el zoom

  useEffect(() => {
    if (!paperRef.current) return;

    // Crear un gráfico JointJS
    const graph = new joint.dia.Graph();
    graphRef.current = graph;

    // Crear el área donde se renderizará el diagrama
    const paper = new joint.dia.Paper({
      el: paperRef.current,
      model: graph,
      width: 1500, // Área más grande para permitir más nodos
      height: 550,
      gridSize: 10,
      drawGrid: true,
      interactive: true, // El drag-and-drop está habilitado para los nodos
    });

    // Guardar la instancia del paper para manipular el zoom y el centrado
    paperInstance.current = paper;

    // Limpiar el gráfico antes de agregar los elementos
    graph.clear();

    // Crear un espacio de nombres personalizado para los nodos con grid
    if (!joint.shapes.custom) {
      joint.shapes.custom = {};
    }

    // Definir un nodo personalizado con un layout de grid (9 rectángulos)
    joint.shapes.custom.ActivityNodeGrid = joint.dia.Element.define(
      "custom.ActivityNodeGrid",
      {
        attrs: {
          ".outer": {
            fill: "#ffffff",
            stroke: "#000000",
            "stroke-width": 2,
            width: 100,
            height: 70,
          },
          // Definir los colores de los rectángulos y sus bordes dinámicamente según la criticidad
          ".rect1": { width: 60, height: 30, x: 0, y: 0, stroke: "#000" },
          ".rect2": { width: 60, height: 30, x: 60, y: 0, stroke: "#000" },
          ".rect3": { width: 60, height: 30, x: 120, y: 0, stroke: "#000" },
          ".rect4": { width: 60, height: 30, x: 0, y: 30, stroke: "#000" },
          ".rect5": { width: 60, height: 30, x: 60, y: 30, stroke: "#000" },
          ".rect6": { width: 60, height: 30, x: 120, y: 30, stroke: "#000" },
          ".rect7": { width: 60, height: 30, x: 0, y: 60, stroke: "#000" },
          ".rect8": { width: 60, height: 30, x: 60, y: 60, stroke: "#000" },
          ".rect9": { width: 60, height: 30, x: 120, y: 60, stroke: "#000" },

          // Textos centrados en cada rectángulo
          ".es-text": {
            text: "ES",
            "ref-x": 30,
            "ref-y": 15,
            "text-anchor": "middle",
            "y-alignment": "middle",
            "font-size": 12,
            fill: "#000",
            "ref-width": 60,
            "ref-height": 30,
          },
          ".ef-text": {
            text: "EF",
            "ref-x": 150,
            "ref-y": 15,
            "text-anchor": "middle",
            "y-alignment": "middle",
            "font-size": 12,
            fill: "#000",
            "ref-width": 60,
            "ref-height": 30,
          },
          ".ls-text": {
            text: "LS",
            "ref-x": 30,
            "ref-y": 75,
            "text-anchor": "middle",
            "y-alignment": "middle",
            "font-size": 12,
            fill: "#000",
            "ref-width": 60,
            "ref-height": 30,
          },
          ".lf-text": {
            text: "LF",
            "ref-x": 150,
            "ref-y": 75,
            "text-anchor": "middle",
            "y-alignment": "middle",
            "font-size": 12,
            fill: "#000",
            "ref-width": 60,
            "ref-height": 30,
          },
          ".tf-text": {
            text: "TF",
            "ref-x": 90,
            "ref-y": 75,
            "text-anchor": "middle",
            "y-alignment": "middle",
            "font-size": 12,
            fill: "#000",
            "ref-width": 60,
            "ref-height": 30,
          },
          ".ff-text": {
            text: "FF",
            "ref-x": 150,
            "ref-y": 45,
            "text-anchor": "middle",
            "y-alignment": "middle",
            "font-size": 12,
            fill: "#000",
            "ref-width": 60,
            "ref-height": 30,
          },
          ".dur-text": {
            text: "Dur",
            "ref-x": 90,
            "ref-y": 15,
            "text-anchor": "middle",
            "y-alignment": "middle",
            "font-size": 12,
            fill: "#000",
            "ref-width": 60,
            "ref-height": 30,
          },
          ".name-text": {
            text: "Name",
            "ref-x": 90,
            "ref-y": 45,
            "text-anchor": "middle",
            "y-alignment": "middle",
            "font-size": 20,
            fill: "#000",
            "ref-width": 60,
            "ref-height": 30,
            'font-weight': 'bold'
          },
          ".id-text": {
            text: "id",
            "ref-x": 30,
            "ref-y": 45,
            "text-anchor": "middle",
            "y-alignment": "middle",
            "font-size": 12,
            fill: "#000",
            "ref-width": 60,
            "ref-height": 30,
          },
        },
      },
      {
        markup: `
          <rect class="rect1"/><rect class="rect2"/><rect class="rect3"/>
          <rect class="rect4"/><rect class="rect5"/><rect class="rect6"/>
          <rect class="rect7"/><rect class="rect8"/><rect class="rect9"/>
          <text class="es-text"/><text class="ef-text"/>
          <text class="ls-text"/><text class="lf-text"/>
          <text class="tf-text"/><text class="ff-text"/>
          <text class="dur-text"/><text class="name-text"/>
          <text class="id-text"/><text class="id-text"/>
        `,
      }
    );

    // Función para determinar el color del borde y fondo basado en totalFloat (para crítico y no crítico)
    const getColor = (activity: CompleteActivity) => {
      return activity.totalFloat === 0 ? "#ffc2fa" : "#b1f3fa"; // Rojo para crítico, celeste para no crítico
    };

    // Crear celdas personalizadas para cada actividad con layout de grid
    const elements: joint.dia.Element[] = activities.map((activity, index) => {
      const criticalColor = getColor(activity); // Determinar el color basado en la criticidad
      const nameColor = activity.totalFloat === 0 ? '#fc0303' : '#032cfc'; // Rojo si es crítica, negro si no es crítica
      const customElement = new joint.shapes.custom.ActivityNodeGrid({
        position: { x: (index % 5) * 220, y: Math.floor(index / 5) * 220 }, // Ajustar la posición distribuyendo en filas y columnas
        size: { width: 200, height: 90 }, // Tamaño del nodo
        attrs: {
          '.rect1': { fill: criticalColor, stroke: activity.totalFloat === 0 ? "#ed280e" : "#0e3fed" },
          '.rect2': { fill: criticalColor, stroke: activity.totalFloat === 0 ? "#ed280e" : "#0e3fed" },
          '.rect3': { fill: criticalColor, stroke: activity.totalFloat === 0 ? "#ed280e" : "#0e3fed" },
          '.rect4': { fill: criticalColor, stroke: activity.totalFloat === 0 ? "#ed280e" : "#0e3fed" },
          '.rect5': { fill: criticalColor, stroke: activity.totalFloat === 0 ? "#ed280e" : "#0e3fed" },
          '.rect6': { fill: criticalColor, stroke: activity.totalFloat === 0 ? "#ed280e" : "#0e3fed" },
          '.rect7': { fill: criticalColor, stroke: activity.totalFloat === 0 ? "#ed280e" : "#0e3fed" },
          '.rect8': { fill: criticalColor, stroke: activity.totalFloat === 0 ? "#ed280e" : "#0e3fed" },
          '.rect9': { fill: criticalColor, stroke: activity.totalFloat === 0 ? "#ed280e" : "#0e3fed" },
    
          // Actualizar el contenido de cada rectángulo con los datos correspondientes
          '.es-text': {  text: `ES: ${activity.earliestStart || 0}` },
          '.ef-text': {  text: `EF: ${activity.earliestFinish || 0}` },
          '.ls-text': {  text: `LS: ${activity.latestStart || 0}` },
          '.lf-text': {  text: `LF: ${activity.latestFinish || 0}` },
          '.tf-text': { text: `TF: ${activity.totalFloat.toFixed(3)}` },
          '.ff-text': {  text: `FF: ${activity.totalFloat.toFixed(3)}` }, // Puedes usar otro valor si FF es diferente
          '.dur-text': {  text: `Dur: ${activity.duration || 0}` },
          '.name-text': { fill:nameColor, text: activity.name || 'No Name' },
          '.id-text': {  text: activity.id || 'No Name' },
        },
      });
    
      return customElement;
    });
    

    // Añadir los elementos al gráfico
    graph.addCells(elements);
// Añadir las conexiones entre las actividades según la precedencia
activities.forEach((activity) => {
  activity.precedence.forEach((prec) => {
    const sourceIndex = activities.findIndex((a) => a.name === prec); // El predecesor es el source
    const targetIndex = activities.findIndex(
      (a) => a.name === activity.name
    ); // El nodo actual es el target
    if (sourceIndex !== -1 && targetIndex !== -1) {
      const link = new joint.shapes.standard.Link({
        source: { id: elements[targetIndex].id }, // El nodo predecesor es el source
        target: { id: elements[sourceIndex].id }, // El nodo actual es el target
        attrs: {
          line: {
            stroke:
              activity.totalFloat === 0 &&
              activities[sourceIndex].totalFloat === 0
                ? "#FF0000"
                : "#000", // Rojo para líneas entre actividades críticas
            strokeWidth: 2,
            targetMarker: {
              type: "path", // Tipo de marcador de flecha solo en el target
              fill:
                activity.totalFloat === 0 &&
                activities[targetIndex].totalFloat === 0
                  ? "#FF0000"
                  : "#000", // Rojo para la flecha entre actividades críticas
              stroke:
                activity.totalFloat === 0 &&
                activities[sourceIndex].totalFloat === 0
                  ? "#FF0000"
                  : "#000",
              d: "M -10 0 L 0 -5 L 0 5 Z", // Flecha que apunta hacia el target
            },
            sourceMarker: {
              type: "none", // Eliminar el marcador en la punta del source
            },
          },
        },
      });
      graph.addCell(link);
    }
  });
});
  }, [activities]);

  // Funciones para manejar el zoom manual con botones
  const zoomIn = () => {
    if (paperInstance.current) {
      const newZoom = Math.min(zoom + 0.1, 2);
      paperInstance.current.scale(newZoom, newZoom);
      setZoom(newZoom);
    }
  };

  const zoomOut = () => {
    if (paperInstance.current) {
      const newZoom = Math.max(zoom - 0.1, 0.2);
      paperInstance.current.scale(newZoom, newZoom);
      setZoom(newZoom);
    }
  };

  // Función para centrar el diagrama
  const centerDiagram = () => {
    if (paperInstance.current) {
      const paperWidth = paperRef.current!.clientWidth;
      const paperHeight = paperRef.current!.clientHeight;
      const graphSize = paperInstance.current.getContentBBox();

      // Calcular el desplazamiento necesario para centrar el gráfico
      const offsetX =
        (paperWidth - graphSize.width * zoom) / 2 - graphSize.x * zoom;
      const offsetY =
        (paperHeight - graphSize.height * zoom) / 2 - graphSize.y * zoom;

      // Aplicar el desplazamiento al gráfico
      paperInstance.current.translate(offsetX, offsetY);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={paperRef}
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid black",
          overflow: "hidden",
        }}
      >
        {/* JointJS renderiza el diagrama aquí */}
      </div>

      {/* Botones de zoom y centrado */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}>
        <button
          onClick={zoomIn}
          style={{
            backgroundColor: "#000", // Color negro para mayor contraste
            color: "#fff",
            border: "1px solid #fff",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            marginBottom: "10px",
            cursor: "pointer",
            fontSize: "20px",
            boxShadow: "2px 2px 6px rgba(0,0,0,0.5)",
          }}
        >
          +
        </button>
        <button
          onClick={zoomOut}
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #fff",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            fontSize: "20px",
            boxShadow: "2px 2px 6px rgba(0,0,0,0.5)",
          }}
        >
          -
        </button>
        <button
          onClick={centerDiagram}
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #fff",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            fontSize: "20px",
            boxShadow: "2px 2px 6px rgba(0,0,0,0.5)",
            marginTop: "10px",
          }}
        >
          ⦿
        </button>
      </div>
    </div>
  );
}
