import { useState, useEffect } from 'react';
import { useStudyStore } from '@/stores/studyStore';
import { googleSheetsService } from '@/services/googleSheetsService';
import type { DAPActivity, ActivityType } from '@/types';

const ACTIVITY_SYMBOLS = {
  operation: { symbol: '○', label: 'Operation', color: 'bg-blue-100 text-blue-800' },
  transport: { symbol: '→', label: 'Transport', color: 'bg-green-100 text-green-800' },
  delay: { symbol: 'D', label: 'Delay', color: 'bg-yellow-100 text-yellow-800' },
  inspection: { symbol: '□', label: 'Inspection', color: 'bg-purple-100 text-purple-800' },
  storage: { symbol: '▽', label: 'Storage', color: 'bg-red-100 text-red-800' }
};

export default function DAPBuilder() {
  const { activeStudy } = useStudyStore();
  const [activities, setActivities] = useState<DAPActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'operation' as ActivityType,
    description: '',
    distance: '',
    time: ''
  });

  useEffect(() => {
    if (activeStudy) {
      loadActivities();
    }
  }, [activeStudy]);

  const loadActivities = async () => {
    if (!activeStudy) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await googleSheetsService.readData('DAP_Data');
      
      if (data.length > 1) {
        const studyActivities: DAPActivity[] = data
          .slice(1) // Skip header
          .filter((row: any[]) => row[0] === activeStudy.id)
          .map((row: any[]) => ({
            id: `${row[0]}_${row[1]}`, // studyId_sequence
            studyId: row[0],
            sequence: parseInt(row[1]) || 0,
            type: row[2] as ActivityType,
            description: row[3] || '',
            distance: row[4] ? parseFloat(row[4]) : undefined,
            time: row[5] ? parseFloat(row[5]) : undefined
          }))
          .sort((a, b) => a.sequence - b.sequence);

        setActivities(studyActivities);
      } else {
        setActivities([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load DAP activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!activeStudy || !newActivity.description.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const sequence = activities.length + 1;
      const activity: DAPActivity = {
        id: `${activeStudy.id}_${sequence}`,
        studyId: activeStudy.id,
        sequence,
        type: newActivity.type,
        description: newActivity.description.trim(),
        distance: newActivity.distance ? parseFloat(newActivity.distance) : undefined,
        time: newActivity.time ? parseFloat(newActivity.time) : undefined
      };

      // Write to Google Sheets
      const rowData = [
        activity.studyId,
        activity.sequence.toString(),
        activity.type,
        activity.description,
        activity.distance?.toString() || '',
        activity.time?.toString() || '',
        new Date().toISOString()
      ];

      await googleSheetsService.writeData('DAP_Data', rowData);

      // Update local state
      setActivities(prev => [...prev, activity]);
      
      // Reset form
      setNewActivity({
        type: 'operation',
        description: '',
        distance: '',
        time: ''
      });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add activity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!activeStudy) return;

    setIsLoading(true);
    setError(null);

    try {
      // Find the activity to get its sequence
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;

      // Delete from Google Sheets (simplified - in real implementation, you'd use proper delete)
      // For now, we'll just reload the data after marking it as deleted
      
      // Remove from local state
      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete activity');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeStudy) {
    return (
      <div className="card text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Study</h2>
        <p className="text-gray-600">Please select a study to create a Process Analysis Diagram.</p>
      </div>
    );
  }

  const summary = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {} as Record<ActivityType, number>);

  const totalDistance = activities.reduce((sum, activity) => sum + (activity.distance || 0), 0);
  const totalTime = activities.reduce((sum, activity) => sum + (activity.time || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Process Analysis Diagram (DAP)</h2>
          <p className="text-gray-600">Document the process flow with standard symbols</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={isLoading}
          className="btn-primary"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Activity
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
                onClick={() => setError(null)}
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

      {/* Study Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Study ID:</span>
            <span className="ml-2 text-gray-600">{activeStudy.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Process:</span>
            <span className="ml-2 text-gray-600">{activeStudy.processId}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Collaborator:</span>
            <span className="ml-2 text-gray-600">{activeStudy.collaboratorId}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">DAP Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {Object.entries(ACTIVITY_SYMBOLS).map(([type, config]) => (
            <div key={type} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-2xl font-bold ${config.color} mb-2`}>
                {config.symbol}
              </div>
              <div className="text-sm font-medium text-gray-900">{config.label}</div>
              <div className="text-lg font-bold text-gray-700">{summary[type as ActivityType] || 0}</div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">Total Activities</div>
            <div className="text-2xl font-bold text-gray-900">{activities.length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">Total Distance</div>
            <div className="text-2xl font-bold text-gray-900">{totalDistance.toFixed(1)}m</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-700">Total Time</div>
            <div className="text-2xl font-bold text-gray-900">{totalTime.toFixed(1)}min</div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Activities</h3>
        
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities defined</h3>
            <p className="mt-1 text-sm text-gray-500">Start building your process analysis diagram by adding activities.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const config = ACTIVITY_SYMBOLS[activity.type];
              return (
                <div key={activity.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${config.color}`}>
                        {config.symbol}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">#{activity.sequence}</span>
                        <span className="text-sm font-medium text-gray-700">{config.label}</span>
                      </div>
                      <div className="text-gray-900">{activity.description}</div>
                      
                      <div className="flex space-x-4 mt-1 text-sm text-gray-500">
                        {activity.distance && (
                          <span>Distance: {activity.distance}m</span>
                        )}
                        {activity.time && (
                          <span>Time: {activity.time}min</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    disabled={isLoading}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Activity Form */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Activity</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                  <select
                    value={newActivity.type}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value as ActivityType }))}
                    className="input-field"
                  >
                    {Object.entries(ACTIVITY_SYMBOLS).map(([type, config]) => (
                      <option key={type} value={type}>
                        {config.symbol} {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="input-field"
                    placeholder="Describe the activity..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distance (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newActivity.distance}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, distance: e.target.value }))}
                      className="input-field"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time (min)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newActivity.time}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                      className="input-field"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  disabled={isLoading}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddActivity}
                  disabled={isLoading || !newActivity.description.trim()}
                  className="btn-primary flex-1"
                >
                  {isLoading ? 'Adding...' : 'Add Activity'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}