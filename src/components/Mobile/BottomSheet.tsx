import React from 'react';

interface BottomSheetProps {
  report: any;
  onClose: () => void;
}

export default function BottomSheet({ report, onClose }: BottomSheetProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'danger': return 'text-red-500';
      case 'safe': return 'text-green-500';
      case 'checkpoint': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-30">
      <div className="bg-white w-full rounded-t-xl p-6 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className={`text-lg font-semibold ${getTypeColor(report.type)}`}>
              {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
            </div>
            <div className="text-sm text-gray-500">
              {formatTime(report.created_at)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {report.description && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
            <div className="text-gray-600">{report.description}</div>
          </div>
        )}

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Severity</div>
          <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            report.severity === 'critical' ? 'bg-red-100 text-red-800' :
            report.severity === 'high' ? 'bg-orange-100 text-orange-800' :
            report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {report.severity}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-1">Verification</div>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${
              report.verified ? 'bg-green-500' : 'bg-gray-300'
            }`}></span>
            <span className="text-sm text-gray-600">
              {report.verification_count} verifications
            </span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded text-sm font-medium">
            Verify
          </button>
          <button className="flex-1 bg-red-500 text-white py-2 px-4 rounded text-sm font-medium">
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
}