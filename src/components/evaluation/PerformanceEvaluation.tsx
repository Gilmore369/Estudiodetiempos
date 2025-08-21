import { useState } from 'react';
import WestinghouseEvaluation from './WestinghouseEvaluation';
import ToleranceAssignment from './ToleranceAssignment';

export default function PerformanceEvaluation() {
  const [activeTab, setActiveTab] = useState<'westinghouse' | 'tolerances'>('westinghouse');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Evaluation</h1>
        <p className="text-gray-600">Evaluate performance factors and assign tolerances for standard time calculation</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('westinghouse')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'westinghouse'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Westinghouse Evaluation
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('tolerances')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tolerances'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tolerance Assignment
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'westinghouse' && <WestinghouseEvaluation />}
        {activeTab === 'tolerances' && <ToleranceAssignment />}
      </div>
    </div>
  );
}