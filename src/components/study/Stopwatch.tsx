import { useState, useEffect, useRef } from 'react';
import { formatTime } from '@/utils/timeCalculations';

interface StopwatchProps {
  onTimeRecorded?: (time: number) => void;
  isRecording?: boolean;
  className?: string;
}

export default function Stopwatch({ onTimeRecorded, className = '' }: StopwatchProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time * 1000;
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000;
        setTime(elapsed);
      }, 10); // Update every 10ms for smooth display
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const handleRecord = () => {
    if (onTimeRecorded && time > 0) {
      onTimeRecorded(time);
    }
  };

  const handleLap = () => {
    if (onTimeRecorded && time > 0) {
      onTimeRecorded(time);
      // Continue running for continuous timing
    }
  };

  return (
    <div className={`text-center ${className}`}>
      {/* Time Display */}
      <div className="mb-6">
        <div className="text-6xl md:text-8xl font-mono font-bold text-gray-900 mb-2">
          {formatTime(time)}
        </div>
        <div className="text-lg text-gray-500">
          {(time % 1).toFixed(2).substring(1)}s
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4 mb-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h10a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z" />
            </svg>
            Start
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
            </svg>
            Stop
          </button>
        )}

        <button
          onClick={handleReset}
          disabled={isRunning}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
      </div>

      {/* Record/Lap Buttons */}
      {time > 0 && (
        <div className="flex justify-center space-x-4">
          {isRunning ? (
            <button
              onClick={handleLap}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Record & Continue
            </button>
          ) : (
            <button
              onClick={handleRecord}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Record Time
            </button>
          )}
        </div>
      )}

      {/* Status Indicator */}
      <div className="mt-4 flex justify-center items-center">
        <div className={`h-3 w-3 rounded-full mr-2 ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="text-sm text-gray-600">
          {isRunning ? 'Recording...' : 'Stopped'}
        </span>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-500 max-w-md mx-auto">
        <p className="mb-2">
          <strong>Instructions:</strong>
        </p>
        <ul className="text-left space-y-1">
          <li>• Click <strong>Start</strong> to begin timing</li>
          <li>• Click <strong>Stop</strong> to pause the timer</li>
          <li>• Click <strong>Record & Continue</strong> to save the current time and keep timing</li>
          <li>• Click <strong>Record Time</strong> to save the current time</li>
          <li>• Click <strong>Reset</strong> to clear the timer</li>
        </ul>
      </div>
    </div>
  );
}