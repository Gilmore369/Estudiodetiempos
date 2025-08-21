import { useState, useEffect } from 'react';
import { useStudyStore } from '@/stores/studyStore';
import StudyCreation from './StudyCreation';
import ElementTimer from './ElementTimer';


export default function TimeStudyManager() {
  const { activeStudy, studies, loadStudies, setActiveStudy } = useStudyStore();
  const [view, setView] = useState<'list' | 'create' | 'timer'>('list');

  useEffect(() => {
    loadStudies();
  }, [loadStudies]);

  const handleStudyCreated = (studyId: string) => {
    const newStudy = studies.find(s => s.id === studyId);
    if (newStudy) {
      setActiveStudy(newStudy);
      setView('timer');
    }
  };

  const handleStudySelected = (study: any) => {
    setActiveStudy(study);
    setView('timer');
  };

  if (view === 'create') {
    return (
      <StudyCreation
        onStudyCreated={handleStudyCreated}
        onCancel={() => setView('list')}
      />
    );
  }

  if (view === 'timer') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Time Study</h1>
            {activeStudy && (
              <p className="text-gray-600">Study ID: {activeStudy.id}</p>
            )}
          </div>
          <button
            onClick={() => setView('list')}
            className="btn-secondary"
          >
            Back to Studies
          </button>
        </div>
        <ElementTimer />
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Studies</h1>
          <p className="text-gray-600">Manage and conduct time studies</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="btn-primary"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Study
        </button>
      </div>

      <div className="card">
        {studies.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No time studies</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first time study.</p>
            <div className="mt-6">
              <button
                onClick={() => setView('create')}
                className="btn-primary"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create First Study
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {studies.map((study) => (
              <div
                key={study.id}
                className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  activeStudy?.id === study.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleStudySelected(study)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        Study {study.id}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        study.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : study.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {study.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Process:</span>
                        <span className="ml-2 text-gray-600">{study.processId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Collaborator:</span>
                        <span className="ml-2 text-gray-600">{study.collaboratorId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Analyst:</span>
                        <span className="ml-2 text-gray-600">{study.analyst}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      Created: {study.createdAt.toLocaleDateString()} at {study.createdAt.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center">
                    {activeStudy?.id === study.id && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        Active
                      </span>
                    )}
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {activeStudy && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setView('timer')}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center mb-2">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Continue Timing</span>
              </div>
              <p className="text-sm text-gray-600">Record element times</p>
            </button>

            <button
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
              disabled
            >
              <div className="flex items-center mb-2">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Evaluate Performance</span>
              </div>
              <p className="text-sm text-gray-600">Westinghouse evaluation</p>
            </button>

            <button
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
              disabled
            >
              <div className="flex items-center mb-2">
                <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">View Results</span>
              </div>
              <p className="text-sm text-gray-600">Calculate standard times</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}