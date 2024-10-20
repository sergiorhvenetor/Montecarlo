export interface Activity {
    id: string;
    name: string;
    precedence: string[];
    to?: number;
    tm?: number;
    tp?: number;
  }
  
  export interface ActivityResult {
    id: string;
    name: string;
    duration: number;
    earliestStart: number;
    earliestFinish: number;
    latestStart: number;
    latestFinish: number;
    totalFloat: number;
    isCritical: boolean;
    successors: string[];
  }
  
  // Definimos CompleteActivity que combina Activity y ActivityResult
  export interface CompleteActivity extends Activity, ActivityResult {}

  // Agregar esta declaración global
declare module "jointjs" {
  namespace shapes {
    let custom: any;
  }
}
  
