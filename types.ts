
export enum TDDStep {
  RED = 'RED',
  GREEN = 'GREEN',
  REFACTOR = 'REFACTOR'
}

export enum Feature {
  CRUD = 'Employee CRUD',
  TDS = 'TDS Calculation',
  METRICS = 'Salary Metrics'
}

export interface Employee {
  id: string;
  fullName: string;
  jobTitle: string;
  country: string;
  salary: number;
}

export interface KataStepContent {
  step: TDDStep;
  testCode: string;
  implementationCode?: string;
  curlCommand: string;
  description: string;
  commitMessage?: string;
}

export interface FeatureDetail {
  id: Feature;
  steps: KataStepContent[];
}

export interface MetricData {
  name: string;
  min?: number;
  max?: number;
  avg: number;
}
