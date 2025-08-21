import { useState, useEffect } from 'react';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { useStudyStore } from '@/stores/studyStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface StudyCreationProps {
  onStudyCreated?: (studyId: string) => void;
  onCancel?: () => void;
}

export default function StudyCreation({ onStudyCreated, onCancel }: StudyCreationProps) {
  const { collaborators, processes, loadCollaborators, loadProcesses } = useMasterDataStore();
  const { createStudy, isLoading, error, clearError } = useStudyStore();

  const [formData, setFormData] = useState({
    processId: '',
    collaboratorId: '',
    analyst: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load master data when component mounts
    loadCollaborators();
    loadProcesses();
  }, [loadCollaborators, loadProcesses]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.processId) {
      errors.processId = 'Please select a process';
    }

    if (!formData.collaboratorId) {
      errors.collaboratorId = 'Please select a collaborator';
    }

    if (!formData.analyst.trim()) {
      errors.analyst = 'Please enter analyst name';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const study = await createStudy(formData);
      if (onStudyCreated) {
        onStudyCreated(study.id);
      }
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing/selecting
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear global error
    if (error) {
      clearError();
    }
  };

  const selectedProcess = processes.find(p => p.id === formData.processId);
  const selectedCollaborator = collaborators.find(c => c.id === formData.collaboratorId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create New Time Study</h2>
        <p className="text-gray-600">Set up a new time study by selecting the process and collaborator</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Process Selection */}
          <div>
            <label htmlFor="process" className="block text-sm font-medium text-gray-700 mb-2">
              Process *
            </label>
            <select
              id="process"
              value={formData.processId}
              onChange={(e) => handleChange('processId', e.target.value)}
              className={`input-field ${formErrors.processId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={isLoading}
            >
              <option value="">Select a process</option>
              {processes.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.name} {process.department && `(${process.department})`}
                </option>
              ))}
            </select>
            {formErrors.processId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.processId}</p>
            )}
            
            {selectedProcess && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <h4 className="text-sm font-medium text-blue-900">Process Details:</h4>
                <p className="text-sm text-blue-800 mt-1">{selectedProcess.description || 'No description available'}</p>
                {selectedProcess.resources && selectedProcess.resources.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-blue-900">Resources: </span>
                    <span className="text-sm text-blue-800">{selectedProcess.resources.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collaborator Selection */}
          <div>
            <label htmlFor="collaborator" className="block text-sm font-medium text-gray-700 mb-2">
              Collaborator *
            </label>
            <select
              id="collaborator"
              value={formData.collaboratorId}
              onChange={(e) => handleChange('collaboratorId', e.target.value)}
              className={`input-field ${formErrors.collaboratorId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={isLoading}
            >
              <option value="">Select a collaborator</option>
              {collaborators.map((collaborator) => (
                <option key={collaborator.id} value={collaborator.id}>
                  {collaborator.name} {collaborator.position && `- ${collaborator.position}`}
                </option>
              ))}
            </select>
            {formErrors.collaboratorId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.collaboratorId}</p>
            )}
            
            {selectedCollaborator && (
              <div className="mt-2 p-3 bg-green-50 rounded-md">
                <h4 className="text-sm font-medium text-green-900">Collaborator Details:</h4>
                <div className="text-sm text-green-800 mt-1 space-y-1">
                  {selectedCollaborator.department && (
                    <div><span className="font-medium">Department:</span> {selectedCollaborator.department}</div>
                  )}
                  {selectedCollaborator.position && (
                    <div><span className="font-medium">Position:</span> {selectedCollaborator.position}</div>
                  )}
                  {selectedCollaborator.experience && (
                    <div><span className="font-medium">Experience:</span> {selectedCollaborator.experience}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Analyst Name */}
          <div>
            <label htmlFor="analyst" className="block text-sm font-medium text-gray-700 mb-2">
              Analyst Name *
            </label>
            <input
              type="text"
              id="analyst"
              value={formData.analyst}
              onChange={(e) => handleChange('analyst', e.target.value)}
              className={`input-field ${formErrors.analyst ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={isLoading}
              placeholder="Enter your name as the analyst"
            />
            {formErrors.analyst && (
              <p className="mt-1 text-sm text-red-600">{formErrors.analyst}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || processes.length === 0 || collaborators.length === 0}
              className="btn-primary flex-1"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating Study...
                </>
              ) : (
                'Create Study'
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        {(processes.length === 0 || collaborators.length === 0) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Setup Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Before creating a study, you need to:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {processes.length === 0 && <li>Add at least one process in Master Data</li>}
                    {collaborators.length === 0 && <li>Add at least one collaborator in Master Data</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}