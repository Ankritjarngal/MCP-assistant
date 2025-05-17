import React, { useState } from "react";
import { CheckCircle, XCircle, ChevronDown } from "lucide-react";

export default function RenderScore({ res }) {
  const [expanded, setExpanded] = useState(true);
  
  const hasResponse = res !== undefined && res !== null && res !== "" && !(Array.isArray(res) && res.length === 0);
  
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div
        className={`border rounded-lg shadow-sm bg-white transition-colors duration-200 ${
          hasResponse 
            ? "border-green-200 shadow-green-50" 
            : "border-red-200 shadow-red-50"
        }`}
        role="alert"
        aria-live="polite"
      >
        {/* Status bar */}
        <div 
          className={`h-1 rounded-t-lg ${
            hasResponse 
              ? "bg-green-500" 
              : "bg-red-500"
          }`}
        />
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {hasResponse ? (
                <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" aria-hidden="true" />
              )}
              
              <div>
                <h3 className={`text-lg font-semibold ${
                  hasResponse ? "text-green-900" : "text-red-900"
                }`}>
                  {hasResponse ? "Request Successful" : "Request Failed"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {hasResponse ? "Response data received" : "No response data available"}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-controls="response-details"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
            >
              <span className="mr-2">
                {expanded ? "Hide Details" : "View Details"}
              </span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-200 ${
                  expanded ? "rotate-180" : "rotate-0"
                }`} 
                aria-hidden="true" 
              />
            </button>
          </div>
          
          {expanded && (
            <div className="mt-6 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200 rounded-t-md">
                <span className="text-sm font-medium text-gray-700">Response Data</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  typeof res === "string" 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-purple-100 text-purple-800"
                }`}>
                  {typeof res === "string" ? "TEXT" : "JSON"}
                </span>
              </div>
              <pre
                id="response-details"
                className="p-4 text-sm text-gray-800 overflow-x-auto max-h-64 font-mono bg-white rounded-b-md"
                style={{ 
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d1d5db #f9fafb"
                }}
              >
                {typeof res === "string" ? res : JSON.stringify(res, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}