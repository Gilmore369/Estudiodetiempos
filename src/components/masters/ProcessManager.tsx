import { useEffect, useState } from 'react';
import { useMasterDataStore } from '@/stores/masterDataStore';
import MasterDataForm from './MasterDataForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { Process } from '@/types';

export default function ProcessManager() {
  const {
    processes,
    isLoading,
    error,
    loadProcesses,
    addProcess,
    updateProcess,
    deleteProcess,
    clearError
  } = useMasterDataStore();

  const [showForm, setShowForm] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadProcesses();
  }, [loadProcesses]);

  const handleAdd = () => {
    setEditingProcess(null);
    setShowForm(true);
  };

  const handleEdit = (process: Process) => {
    setEditingProcess(process);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingProcess) {
        await updateProcess(editingProcess.id, data);
      } else {
        await addProcess(data);
      }
      setShowForm(false);
      setEditingProcess(null);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProcess(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProcess(id);
      setDeleteConfirm(null);
    } catch (error) {
      // Error is handled by the store
    }
  };

  if (isLoading && processes.length === 0) {
    return (
      <div className="card">
        <LoadingSpinner className="py-8" />
        <p className="text-center text-gray-600 mt-4">Loading processes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Processes</h2>
          <p className="text-gray-600">Manage process database</p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Process
        </button>
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

      <div className="card">
        {processes.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No processes</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first process.</p>
            <div className="mt-6">
              <button onClick={handleAdd} className="btn-primary">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Process
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {processes.map((process) => (
              <div key={process.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{process.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(process)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(process.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-2">ID: {process.id}</div>
                    
                    {process.description && (
                      <p className="text-sm text-gray-700 mb-3">{process.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Department:</span>
                        <span className="ml-2 text-gray-600">{process.department || 'Not specified'}</span>
                      </div>
                      
                      {process.resources && process.resources.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Resources:</span>
                          <div className="ml-2 flex flex-wrap gap-1 mt-1">
                            {process.resources.map((resource, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {resource}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <MasterDataForm
          type="process"
          initialData={editingProcess || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isLoading}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Process</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this process? This action cannot be undone.
              </p>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}