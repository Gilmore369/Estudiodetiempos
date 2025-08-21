import { useState } from 'react';
import type { Collaborator, Process } from '@/types';

interface MasterDataFormProps {
  type: 'collaborator' | 'process';
  initialData?: Collaborator | Process;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function MasterDataForm({ 
  type, 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: MasterDataFormProps) {
  const [formData, setFormData] = useState(() => {
    if (type === 'collaborator') {
      const collaborator = initialData as Collaborator;
      return {
        name: collaborator?.name || '',
        department: collaborator?.department || '',
        position: collaborator?.position || '',
        experience: collaborator?.experience || ''
      };
    } else {
      const process = initialData as Process;
      return {
        name: process?.name || '',
        description: process?.description || '',
        department: process?.department || '',
        resources: process?.resources?.join(', ') || ''
      };
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (type === 'collaborator') {
      // Additional validation for collaborators if needed
    } else {
      // Additional validation for processes if needed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = { ...formData };
      
      // Convert resources string to array for processes
      if (type === 'process' && formData.resources) {
        (submitData as any).resources = formData.resources
          .split(',')
          .map(r => r.trim())
          .filter(r => r.length > 0);
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isEdit = !!initialData;
  const title = isEdit 
    ? `Edit ${type === 'collaborator' ? 'Collaborator' : 'Process'}`
    : `Add New ${type === 'collaborator' ? 'Collaborator' : 'Process'}`;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`input-field ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isLoading}
                placeholder={type === 'collaborator' ? 'Enter collaborator name' : 'Enter process name'}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                id="department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="input-field"
                disabled={isLoading}
                placeholder="Enter department"
              />
            </div>

            {type === 'collaborator' ? (
              <>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    className="input-field"
                    disabled={isLoading}
                    placeholder="Enter position/role"
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                    className="input-field"
                    disabled={isLoading}
                    placeholder="e.g., 5 years, Beginner, Expert"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className="input-field"
                    disabled={isLoading}
                    placeholder="Describe the process"
                  />
                </div>

                <div>
                  <label htmlFor="resources" className="block text-sm font-medium text-gray-700 mb-1">
                    Resources
                  </label>
                  <input
                    type="text"
                    id="resources"
                    value={formData.resources}
                    onChange={(e) => handleChange('resources', e.target.value)}
                    className="input-field"
                    disabled={isLoading}
                    placeholder="Tools, materials, equipment (comma separated)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate multiple resources with commas
                  </p>
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? 'Saving...' : (isEdit ? 'Update' : 'Add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}