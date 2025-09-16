import React from 'react';

interface MatchConfidenceBarProps {
  matchScore: number;
  confidence: number;
  deiScore?: number;
  showDetails?: boolean;
}

const MatchConfidenceBar: React.FC<MatchConfidenceBarProps> = ({
  matchScore,
  confidence,
  deiScore,
  showDetails = false
}) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return 'var(--up-primary)';
    if (conf >= 75) return '#10B981'; // green
    if (conf >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 90) return 'Çok Yüksek';
    if (conf >= 75) return 'Yüksek';
    if (conf >= 60) return 'Orta';
    return 'Düşük';
  };

  return (
    <div className="space-y-3">
      {/* Match Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium" style={{ color: 'var(--up-dark-gray)' }}>
            Eşleşme
          </span>
          <span 
            className="text-lg font-bold"
            style={{ color: 'var(--up-primary)' }}
          >
            %{matchScore}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
            Güven: %{confidence}
          </span>
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getConfidenceColor(confidence) }}
          />
        </div>
      </div>

      {/* Match Score Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: `${matchScore}%`,
            background: `linear-gradient(90deg, ${getConfidenceColor(confidence)} 0%, var(--up-primary) 100%)`
          }}
        />
      </div>

      {/* Confidence Details */}
      {showDetails && (
        <div className="text-xs space-y-1" style={{ color: 'var(--up-dark-gray)' }}>
          <div className="flex justify-between">
            <span>Match Confidence:</span>
            <span className="font-medium" style={{ color: getConfidenceColor(confidence) }}>
              %{confidence} ({getConfidenceLabel(confidence)})
            </span>
          </div>
          {deiScore && (
            <div className="flex justify-between">
              <span>Diversity & Impact Score:</span>
              <span className="font-medium" style={{ color: 'var(--up-primary)' }}>
                %{deiScore}
              </span>
            </div>
          )}
        </div>
      )}

      {/* DEI Score */}
      {deiScore && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium" style={{ color: 'var(--up-dark-gray)' }}>
              Diversity & Impact
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--up-primary)' }}>
              %{deiScore}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="h-1 rounded-full"
              style={{
                width: `${deiScore}%`,
                backgroundColor: 'var(--up-primary)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchConfidenceBar; 