import { useState } from 'react';
import { useStudyStore } from '@/stores/studyStore';
import Stopwatch from './Stopwatch';
import { formatTime, calculateAverageObservedTime } from '@/utils/timeCalculations';

export default function ElementTimer() {
  const { 
    activeStudy, 
    studyElements, 
    addTimeObservation, 
    addStudyElement,
    isLoading,
    error,
    clearError
  } = useStudyStore();

  const [currentElement, setCurrentElement] = useState('');
  const [newElementName, setNewElementName] = useState('');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [showNewElementForm, setShowNewElementForm] = useState(false);

  if (!activeStudy) {
    return (
      <div className="card text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Study</h2>
        <p className="text-gray-600">Please create or select a study to start timing elements.</p>
      </div>
    );
  }

  const handleTimeRecorded = async (time: number) => {
    if (!currentElement) {
      alert('Please select an element first');
      return;
    }

    try {
      await addTimeObservation({
        studyId: activeStudy.id,
        elementName: currentElement,
        cycleNumber: currentCycle,
        observedTime: time
      });

      // Auto-increment cycle for next observation
      setCurrentCycle(prev => prev + 1);
    } catch (error) {
      console.error('Failed to record time:', error);
    }
  };

  const handleAddElement = () => {
    if (newElementName.trim()) {
      addStudyElement(newElementName.trim());
      setCurrentElement(newElementName.trim());
      setNewElementName('');
      setShowNewElementForm(false);
    }
  };

  const handleElementChange = (elementName: string) => {
    setCurrentElement(elementName);
    
    // Find the highest cycle number for this element and set next cycle
    const element = studyElements.find(e => e.name === elementName);
    if (element && element.observations.length > 0) {
      const maxCycle = Math.max(...element.observations.map(obs => obs.cycleNumber));
      setCurrentCycle(maxCycle + 1);
    } else {
      setCurrentCycle(1);
    }
  };

  const currentElementData = studyElements.find(e => e.name === currentElement);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Element Timer</h2>
        <p className="text-gray-600">Time individual elements of the operation</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Element Selection */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Element</h3>
            
            {/* Current Element Info */}
            {currentElement && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <div className="text-sm font-medium text-blue-900">Current Element:</div>
                <div className="text-blue-800">{currentElement}</div>
                <div className="text-sm text-blue-700 mt-1">Cycle #{currentCycle}</div>
              </div>
            )}

            {/* Element List */}
            <div className="space-y-2 mb-4">
              {studyElements.map((element) => (
                <button
                  key={element.name}
                  onClick={() => handleElementChange(element.name)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    currentElement === element.name
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{element.name}</div>
                  <div className="text-sm text-gray-500">
                    {element.observations.length} observations
                    {element.observations.length > 0 && (
                      <span className="ml-2">
                        (Avg: {formatTime(calculateAverageObservedTime(element.observations))})
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Add New Element */}
            {!showNewElementForm ? (
              <button
                onClick={() => setShowNewElementForm(true)}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg className="h-5 w-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Element
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newElementName}
                  onChange={(e) => setNewElementName(e.target.value)}
                  placeholder="Enter element name"
                  className="input-field"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddElement()}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddElement}
                    disabled={!newElementName.trim()}
                    className="btn-primary flex-1 text-sm py-2"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowNewElementForm(false);
                      setNewElementName('');
                    }}
                    className="btn-secondary flex-1 text-sm py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stopwatch */}
        <div className="lg:col-span-2">
          <div className="card">
            <Stopwatch
              onTimeRecorded={handleTimeRecorded}
              isRecording={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Observations History */}
      {currentElementData && currentElementData.observations.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Observations for "{currentElement}"
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cycle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recorded At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentElementData.observations
                  .sort((a, b) => b.cycleNumber - a.cycleNumber) // Most recent first
                  .map((observation, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{observation.cycleNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(observation.observedTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {observation.timestamp.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <div className="text-sm font-medium text-gray-900">
              Average Time: {formatTime(calculateAverageObservedTime(currentElementData.observations))}
            </div>
            <div className="text-sm text-gray-600">
              Based on {currentElementData.observations.length} observations
            </div>
          </div>
        </div>
      )}
    </div>
  );
}