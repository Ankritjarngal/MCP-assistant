import React, { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, Mail, Calendar, HelpCircle } from "lucide-react";

export default function RenderScore({ res, darkMode = false }) {
  const [expanded, setExpanded] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  
  const hasResponse = res !== undefined && res !== null && res !== "" && !(Array.isArray(res) && res.length === 0);
  
  // Determine service type and get appropriate styling
  const getServiceInfo = () => {
    if (!hasResponse) {
      return {
        type: 'error',
        icon: XCircle,
        label: 'Unknown Service',
        color: 'red',
        bgColor: darkMode ? 'bg-red-900/20' : 'bg-red-50',
        borderColor: darkMode ? 'border-red-800' : 'border-red-200',
        textColor: darkMode ? 'text-red-300' : 'text-red-700',
        iconColor: darkMode ? 'text-red-400' : 'text-red-600'
      }
    }
    
    const service = res?.res?.service || res?.service || 'unknown'
    
    switch (service.toLowerCase()) {
      case 'mailing service':
        return {
          type: 'mailing',
          icon: Mail,
          label: 'Mailing Service',
          color: 'blue',
          bgColor: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
          borderColor: darkMode ? 'border-blue-800' : 'border-blue-200',
          textColor: darkMode ? 'text-blue-300' : 'text-blue-700',
          iconColor: darkMode ? 'text-blue-400' : 'text-blue-600'
        }
      case 'google calendar':
        return {
          type: 'calendar',
          icon: Calendar,
          label: 'Google Calendar',
          color: 'green',
          bgColor: darkMode ? 'bg-green-900/20' : 'bg-green-50',
          borderColor: darkMode ? 'border-green-800' : 'border-green-200',
          textColor: darkMode ? 'text-green-300' : 'text-green-700',
          iconColor: darkMode ? 'text-green-400' : 'text-green-600'
        }
      default:
        return {
          type: 'unknown',
          icon: HelpCircle,
          label: 'Unknown Service',
          color: 'gray',
          bgColor: darkMode ? 'bg-gray-800/50' : 'bg-gray-50',
          borderColor: darkMode ? 'border-gray-700' : 'border-gray-200',
          textColor: darkMode ? 'text-gray-400' : 'text-gray-600',
          iconColor: darkMode ? 'text-gray-500' : 'text-gray-500'
        }
    }
  }

  const serviceInfo = getServiceInfo()
  const ServiceIcon = serviceInfo.icon

  // Format service data for display
  const formatServiceData = () => {
    if (!hasResponse || serviceInfo.type === 'unknown') {
      return null
    }

    const serviceData = res?.res?.item || res?.item || {}
    
    return (
      <div className={`${serviceInfo.bgColor} ${serviceInfo.borderColor} border rounded-lg p-4 space-y-3`}>
        {serviceInfo.type === 'mailing' && (
          <>
            <div>
              <span className={`text-sm font-medium ${serviceInfo.textColor}`}>To: </span>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{serviceData.to || 'N/A'}</span>
            </div>
            <div>
              <span className={`text-sm font-medium ${serviceInfo.textColor}`}>Subject: </span>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{serviceData.subject || 'N/A'}</span>
            </div>
            <div>
              <span className={`text-sm font-medium ${serviceInfo.textColor}`}>Message:</span>
              <div className={`mt-2 p-3 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded text-sm whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {serviceData.message || 'N/A'}
              </div>
            </div>
          </>
        )}
        
        {serviceInfo.type === 'calendar' && (
          <>
            {Object.entries(serviceData).map(([key, value]) => (
              <div key={key}>
                <span className={`text-sm font-medium ${serviceInfo.textColor} capitalize`}>{key.replace(/([A-Z])/g, ' $1')}: </span>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div
        className={`border rounded-lg shadow-sm transition-colors duration-200 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } ${serviceInfo.borderColor}`}
        role="alert"
        aria-live="polite"
      >
        {/* Status bar */}
        <div className={`h-1 rounded-t-lg bg-${serviceInfo.color}-500`} />
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ServiceIcon className={`w-6 h-6 ${serviceInfo.iconColor}`} aria-hidden="true" />
              
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {serviceInfo.label}
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {hasResponse && serviceInfo.type !== 'unknown' ? 'Request processed successfully' : 'Service error occurred'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-controls="response-details"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                darkMode 
                  ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500' 
                  : 'text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
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
            <div className="mt-6 space-y-4">
              {/* Service-specific formatted data */}
              {hasResponse && serviceInfo.type !== 'unknown' && formatServiceData()}
              
              {/* Error state for unknown services */}
              {(!hasResponse || serviceInfo.type === 'unknown') && (
                <div className={`p-4 rounded-md ${
                  darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                    {!hasResponse ? 'No response data available' : 'Unknown service type - raw data may be available below'}
                  </p>
                </div>
              )}

              {/* Button to show raw data */}
              {hasResponse && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowRawData(!showRawData)}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      darkMode 
                        ? 'text-gray-400 bg-gray-800 border-gray-600 hover:bg-gray-700 hover:text-gray-300' 
                        : 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">
                      {showRawData ? "Hide Raw Data" : "Show Raw Data"}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showRawData ? "rotate-180" : "rotate-0"
                      }`} 
                      aria-hidden="true" 
                    />
                  </button>
                </div>
              )}

              {/* Raw response data for debugging */}
              {hasResponse && showRawData && (
                <div className={`border rounded-md ${darkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                  <div className={`flex items-center justify-between px-4 py-2 border-b rounded-t-md ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'
                  }`}>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Raw Response Data</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      typeof res === "string" 
                        ? darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                        : darkMode ? "bg-purple-900 text-purple-200" : "bg-purple-100 text-purple-800"
                    }`}>
                      {typeof res === "string" ? "TEXT" : "JSON"}
                    </span>
                  </div>
                  <pre
                    className={`p-4 text-sm overflow-x-auto max-h-64 font-mono rounded-b-md ${
                      darkMode ? 'text-gray-300 bg-gray-800' : 'text-gray-800 bg-white'
                    }`}
                    style={{ 
                      scrollbarWidth: "thin",
                      scrollbarColor: darkMode ? "#4B5563 #1F2937" : "#d1d5db #f9fafb"
                    }}
                  >
                    {typeof res === "string" ? res : JSON.stringify(res, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}