export interface DraftActivityResult {
  activity_id: number;
  tipo_activity_id: string | null;
  user_id: string;
  grado_id: number | null;
  tema_id: number | null;
  publico: boolean;
  estatus: string; 
}