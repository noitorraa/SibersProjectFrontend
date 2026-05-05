export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  patronymic?: string;
  email: string;
}

export interface Company {
  id: number;
  name: string;
}

export interface Project {
  id: number;
  name: string;
  customerCompany: Company;
  executorCompany: Company;
  startDate: string;
  endDate: string;
  priority: number;
  projectManager: Employee;
  employees: Employee[];
  documents?: ProjectDocument[];
}

export interface ProjectDocument {
  id: number;
  fileName: string;
  filePath: string;
  uploadDate: string;
}

export interface ProjectFilterParams {
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  priority?: number;
  customerCompanyId?: number;
  executorCompanyId?: number;
  projectManagerId?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
