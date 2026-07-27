export interface AdminStats {
  students?: number;
  teachers?: number;
  staff?: number;
  privateTeachers?: number;
  revenue?: number;
  [key: string]: any; // For any additional properties
}

export interface LoginActivity {
  id: string;
  time: string;
  email?: string;
  name?: string;
  status?: 'success' | 'failed';
}
