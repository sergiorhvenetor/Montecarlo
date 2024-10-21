export interface Activity {
  id: string;
  name: string;
  precedence: string[];
  to?: number;
  tm?: number;
  tp?: number;
  duration?: number; // Opcional en Activity
}

export interface ActivityResult {
  id: string;
  name: string;
  duration: number; // No opcional en ActivityResult
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  totalFloat: number;
  isCritical: boolean;
  successors: string[];
}

// Combinamos manualmente Activity y ActivityResult para evitar conflictos
export interface CompleteActivity {
  id: string;
  name: string;
  precedence: string[];
  to?: number;
  tm?: number;
  tp?: number;
  duration: number; // Aquí resolvemos el conflicto, duration será requerida
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  totalFloat: number;
  isCritical: boolean;
  successors: string[];
}



  // Agregar esta declaración global
declare module "jointjs" {
  namespace shapes {
    let custom: any;
  }
}
  
