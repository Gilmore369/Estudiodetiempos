export interface Collaborator {
  id: string;
  name: string;
  department?: string;
  position?: string;
  experience?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Process {
  id: string;
  name: string;
  description?: string;
  department?: string;
  resources?: string[];
  estimatedTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MasterDataFormProps {
  onSubmit: (data: Collaborator | Process) => void;
  onCancel: () => void;
  initialData?: Collaborator | Process;
  type: 'collaborator' | 'process';
}