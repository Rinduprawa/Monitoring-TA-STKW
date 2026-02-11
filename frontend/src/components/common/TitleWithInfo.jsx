import { useState } from 'react';

export default function TitleWithInfo({ title, tooltipTitle, tooltipItems = [] }) {
    const [showTooltip, setShowTooltip] = useState(false);
    
    return (
        <div className="flex items-center gap-2 mb-6">
          <p className="text-sm text-gray-600">{title}</p>
          {tooltipItems.length > 0 && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 text-xs hover:bg-gray-100"
              >
                i
              </button>
              {showTooltip && (
                <div className="absolute left-0 top-6 bg-gray-800 text-white text-xs p-3 rounded shadow-lg w-64 z-10">
                  {tooltipTitle && <p className="font-semibold mb-2">{tooltipTitle}</p>}
                  <ul className="list-disc list-inside space-y-1">
                    {tooltipItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
    )
};
