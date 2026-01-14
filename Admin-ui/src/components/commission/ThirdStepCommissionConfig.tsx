import React, { useEffect, useState } from 'react'
import { commissionService } from '@/services/commissionService'
import { showToast } from '@/components/ui/sonner'
import { NOTIFICATION_CONSTANTS } from '@/utils/constant'
import { Card, CardContent } from '@/components/ui/card'

interface ThirdStepCommissionConfigProps {
  commissionConfigId?: number;
  initialData?: any;
  isEditMode?: boolean;
  onSaveSuccess: () => void;
}

// Parse Quartz.NET cron expression to extract schedule details
// Format: Seconds Minutes Hours Day-of-month Month Day-of-week
const parseCronExpression = (cron: string) => {
  if (!cron || !cron.trim()) {
    return null;
  }

  const parts = cron.trim().split(/\s+/);
  if (parts.length < 6) {
    return null;
  }

  const [sec, min, hr, dayOfMonth, , dayOfWeek] = parts;

  const parsed = {
    seconds: parseInt(sec) || 0,
    minutes: parseInt(min) || 0,
    hours: parseInt(hr) || 0,
    frequency: 'DAILY' as 'DAILY' | 'WEEKLY' | 'MONTHLY',
    daysOfWeek: [] as string[],
    dayOfMonth: 1
  };

  // Determine frequency based on pattern
  if (dayOfMonth === '?' && dayOfWeek !== '?') {
    // WEEKLY: dayOfMonth is ?, dayOfWeek has values
    parsed.frequency = 'WEEKLY';
    parsed.daysOfWeek = dayOfWeek.split(',').filter(d => d);
  } else if (dayOfMonth !== '*' && dayOfMonth !== '?' && dayOfWeek === '?') {
    // MONTHLY: dayOfMonth has specific value, dayOfWeek is ?
    parsed.frequency = 'MONTHLY';
    parsed.dayOfMonth = parseInt(dayOfMonth) || 1;
  } else {
    // DAILY: dayOfMonth is *, dayOfWeek is ?
    parsed.frequency = 'DAILY';
  }

  return parsed;
};

const ThirdStepCommissionConfig: React.FC<ThirdStepCommissionConfigProps> = ({ 
  commissionConfigId = 0,
  initialData,
  isEditMode = false,
  onSaveSuccess
}) => {
  // Parse initial data to extract values
  const parsedCron = initialData?.cronExpression ? parseCronExpression(initialData.cronExpression) : null;
  
  const initialJobType = initialData?.jobType || '';
  const initialHours = parsedCron?.hours || 0;
  const initialMinutes = parsedCron?.minutes || 0;
  const initialSeconds = parsedCron?.seconds || 0;
  const initialFrequency = parsedCron?.frequency || 'DAILY';
  const initialDaysOfWeek = parsedCron?.daysOfWeek || [];
  const initialDayOfMonth = parsedCron?.dayOfMonth || 1;
  const initialSimpleTime = initialHours || initialMinutes 
    ? `${String(initialHours).padStart(2, '0')}:${String(initialMinutes).padStart(2, '0')}`
    : '12:00';

  const [jobType, setJobType] = useState(initialJobType);
  const [hours, setHours] = useState<number>(initialHours);
  const [minutes, setMinutes] = useState<number>(initialMinutes);
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>(initialFrequency);
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>(initialDaysOfWeek);
  const [dayOfMonth, setDayOfMonth] = useState<number>(initialDayOfMonth);
  const [cronExpression, setCronExpression] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useSimpleMode, setUseSimpleMode] = useState(true);
  const [simpleTime, setSimpleTime] = useState(initialSimpleTime);

  const parseTimeInput = (timeString: string) => {
    const [h, m] = timeString.split(':');
    setHours(parseInt(h) || 0);
    setMinutes(parseInt(m) || 0);
  };

  const generateCron = () => {
    // Quartz.NET format: Seconds Minutes Hours Day-of-month Month Day-of-week Year(optional)
    const sec = seconds.toString();
    const min = minutes.toString();
    const hr = hours.toString();

    switch (frequency) {
      case 'DAILY':
        return `${sec} ${min} ${hr} * * ?`;

      case 'WEEKLY':
        if (daysOfWeek.length === 0) {
          return '';
        }
        const quartzDays = daysOfWeek.join(',');
        return `${sec} ${min} ${hr} ? * ${quartzDays}`;

      case 'MONTHLY':
        return `${sec} ${min} ${hr} ${dayOfMonth} * ?`;

      default:
        return '';
    }
  };

  // Update state when initialData changes (for edit mode)
  useEffect(() => {
    if (isEditMode && initialData) {
      const parsed = initialData.cronExpression ? parseCronExpression(initialData.cronExpression) : null;
      
      if (initialData.jobType) {
        setJobType(initialData.jobType);
      }
      
      if (parsed) {
        setHours(parsed.hours);
        setMinutes(parsed.minutes);
        setSeconds(parsed.seconds);
        setFrequency(parsed.frequency);
        setDaysOfWeek(parsed.daysOfWeek);
        setDayOfMonth(parsed.dayOfMonth);
        
        const timeStr = `${String(parsed.hours).padStart(2, '0')}:${String(parsed.minutes).padStart(2, '0')}`;
        setSimpleTime(timeStr);
      }
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    const cron = generateCron();
    setCronExpression(cron);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency, hours, minutes, seconds, daysOfWeek, dayOfMonth]);

  const handleSave = async () => {
    if (!jobType.trim()) {
      setError('Job Name is required');
      return;
    }

    if (!commissionConfigId || commissionConfigId === 0) {
      setError('Commission Config ID is required');
      return;
    }

    if (!cronExpression) {
      setError('Invalid cron expression. Please check your schedule settings.');
      return;
    }

    if (frequency === 'WEEKLY' && daysOfWeek.length === 0) {
      setError('Please select at least one day for weekly schedule');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        commissionConfigId,
        jobType: jobType.trim(),
        triggerType: 'CRON',
        cronExpression
      };

      console.log('Submitting payload:', payload);
      
      await commissionService.updateCron(payload);
      
      showToast(NOTIFICATION_CONSTANTS.SUCCESS, 'Step 3 saved successfully!', {
        description: 'Schedule configuration has been saved.'
      });
      onSaveSuccess();
    } catch (err: any) {
      console.error('Error saving cron schedule:', err);
      const errorMessage = err?.message || 'Failed to save schedule. Please try again.';
      setError(errorMessage);
      showToast(NOTIFICATION_CONSTANTS.ERROR, 'Failed to save schedule', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getReadableSchedule = () => {
    if (!cronExpression) return 'No schedule configured';
    
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    switch (frequency) {
      case 'DAILY':
        return `Runs daily at ${timeStr}`;
      case 'WEEKLY':
        return `Runs ${daysOfWeek.join(', ')} at ${timeStr}`;
      case 'MONTHLY':
        return `Runs on day ${dayOfMonth} of each month at ${timeStr}`;
      default:
        return 'Custom schedule';
    }
  };

  return (
      <CardContent className="!px-6">
        <div className="bg-white p-6 rounded-md space-y-6">
          <h1 className="text-lg font-semibold">Step 3: Schedule Configuration</h1>

      {/* Job Type Input */}
      <div>
        <label className="block mb-2 font-medium">Job Type</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Job Type"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
        />
      </div>

      {/* Simple/Advanced Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setUseSimpleMode(true)}
          className={`px-4 py-2 rounded-md transition-colors ${
            useSimpleMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Simple Mode
        </button>
        <button
          type="button"
          onClick={() => setUseSimpleMode(false)}
          className={`px-4 py-2 rounded-md transition-colors ${
            !useSimpleMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Advanced Mode
        </button>
      </div>

      {useSimpleMode ? (
        /* Simple Mode */
        <div className="space-y-4">
          {/* Frequency */}
          <div>
            <label className="block mb-2 font-medium">Frequency Pattern</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={frequency} 
              onChange={(e) => {
                setFrequency(e.target.value);
                if (e.target.value !== 'WEEKLY') {
                  setDaysOfWeek([]);
                }
              }}
            >
              <option value="DAILY">Every day</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="block mb-2 font-medium">Time</label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={simpleTime}
              onChange={(e) => {
                setSimpleTime(e.target.value);
                parseTimeInput(e.target.value);
                setSeconds(0); // Reset seconds in simple mode
              }}
            />
          </div>

          {/* Weekly - Days of Week */}
          {frequency === 'WEEKLY' && (
            <div>
              <label className="block mb-2 font-medium">Days of Week</label>
              <div className="flex flex-wrap gap-3">
                {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(day => (
                  <label key={day} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={daysOfWeek.includes(day)}
                      onChange={() =>
                        setDaysOfWeek(prev =>
                          prev.includes(day)
                            ? prev.filter(d => d !== day)
                            : [...prev, day]
                        )
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
              {daysOfWeek.length === 0 && (
                <p className="mt-1 text-sm text-red-500">Please select at least one day</p>
              )}
            </div>
          )}

          {/* Monthly - Day of Month */}
          {frequency === 'MONTHLY' && (
            <div>
              <label className="block mb-2 font-medium">Day of Month (1-31)</label>
              <input
                type="number"
                min={1}
                max={31}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Math.max(1, Math.min(31, Number(e.target.value) || 1)))}
              />
            </div>
          )}
        </div>
      ) : (
        /* Advanced Mode */
        <div className="space-y-4">
          {/* Time Fields */}
          <div className="grid grid-cols-3 gap-4">
            {/* Hours */}
            <div>
              <label className="block mb-2 font-medium">Hours (0-23)</label>
              <input
                type="number"
                min={0}
                max={23}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hours}
                onChange={(e) => setHours(Math.max(0, Math.min(23, Number(e.target.value) || 0)))}
              />
            </div>

            {/* Minutes */}
            <div>
              <label className="block mb-2 font-medium">Minutes (0-59)</label>
              <input
                type="number"
                min={0}
                max={59}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
              />
            </div>

            {/* Seconds */}
            <div>
              <label className="block mb-2 font-medium">Seconds (0-59)</label>
              <input
                type="number"
                min={0}
                max={59}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block mb-2 font-medium">Frequency Pattern</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={frequency} 
              onChange={(e) => {
                setFrequency(e.target.value);
                if (e.target.value !== 'WEEKLY') {
                  setDaysOfWeek([]);
                }
              }}
            >
              <option value="DAILY">Every day</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          {/* Weekly - Days of Week */}
          {frequency === 'WEEKLY' && (
            <div>
              <label className="block mb-2 font-medium">Days of Week</label>
              <div className="flex flex-wrap gap-3">
                {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(day => (
                  <label key={day} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={daysOfWeek.includes(day)}
                      onChange={() =>
                        setDaysOfWeek(prev =>
                          prev.includes(day)
                            ? prev.filter(d => d !== day)
                            : [...prev, day]
                        )
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
              {daysOfWeek.length === 0 && (
                <p className="mt-1 text-sm text-red-500">Please select at least one day</p>
              )}
            </div>
          )}

          {/* Monthly - Day of Month */}
          {frequency === 'MONTHLY' && (
            <div>
              <label className="block mb-2 font-medium">Day of Month (1-31)</label>
              <input
                type="number"
                min={1}
                max={31}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Math.max(1, Math.min(31, Number(e.target.value) || 1)))}
              />
            </div>
          )}
        </div>
      )}

      {/* Cron Expression Display */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-700">Generated Cron Expression</h3>
          <span className="text-xs text-gray-500">Quartz.NET Format</span>
        </div>
        <div className="bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-md mb-2">
          {cronExpression || 'Configure schedule to generate expression'}
        </div>
        <p className="text-sm text-gray-600">{getReadableSchedule()}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className={`px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md transition-colors ${
            isLoading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Save & Continue'
          )}
        </button>
      </div>
        </div>
      </CardContent>
  );
};

export { ThirdStepCommissionConfig };