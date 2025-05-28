import React from 'react';
import { useApp } from '../../contexts/AppContext';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            relative overflow-hidden rounded-xl shadow-2xl backdrop-blur-sm border
            transform transition-all duration-300 ease-out animate-in slide-in-from-right-2 fade-in-0
            hover:scale-105 hover:shadow-3xl
            ${
              notification.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100'
                : notification.type === 'error'
                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 shadow-red-100'
                : notification.type === 'warning'
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-yellow-100'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-blue-100'
            }
          `}
        >
          {/* Animated left border */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${
              notification.type === 'success'
                ? 'bg-gradient-to-b from-green-400 to-emerald-500'
                : notification.type === 'error'
                ? 'bg-gradient-to-b from-red-400 to-rose-500'
                : notification.type === 'warning'
                ? 'bg-gradient-to-b from-yellow-400 to-amber-500'
                : 'bg-gradient-to-b from-blue-400 to-indigo-500'
            }`}
          />
          
          <div className="p-4 pl-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                {notification.type === 'success' && (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                {notification.type === 'error' && (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                {notification.type === 'warning' && (
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                )}
                {notification.type === 'info' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${
                  notification.type === 'success'
                    ? 'text-green-800'
                    : notification.type === 'error'
                    ? 'text-red-800'
                    : notification.type === 'warning'
                    ? 'text-yellow-800'
                    : 'text-blue-800'
                }`}>
                  {notification.type === 'success' && '✅ Success'}
                  {notification.type === 'error' && '❌ Error'}
                  {notification.type === 'warning' && '⚠️ Warning'}
                  {notification.type === 'info' && 'ℹ️ Info'}
                </p>
                <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                  {notification.message}
                </p>
              </div>
              
              <div className="ml-3 flex-shrink-0">
                <button
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center
                    transition-all duration-200 hover:scale-110
                    ${
                      notification.type === 'success'
                        ? 'text-green-400 hover:bg-green-100 hover:text-green-600'
                        : notification.type === 'error'
                        ? 'text-red-400 hover:bg-red-100 hover:text-red-600'
                        : notification.type === 'warning'
                        ? 'text-yellow-400 hover:bg-yellow-100 hover:text-yellow-600'
                        : 'text-blue-400 hover:bg-blue-100 hover:text-blue-600'
                    }
                  `}
                  onClick={() => removeNotification(notification.id)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress bar for auto-dismiss */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden">
            <div 
              className={`h-full animate-pulse ${
                notification.type === 'success'
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : notification.type === 'error'
                  ? 'bg-gradient-to-r from-red-400 to-rose-500'
                  : notification.type === 'warning'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                  : 'bg-gradient-to-r from-blue-400 to-indigo-500'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer; 