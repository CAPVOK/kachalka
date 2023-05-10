import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ onClose, children }) => {
    return ReactDOM.createPortal(
      <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"></div>
          <div className="relative z-50 w-full max-w-lg overflow-hidden bg-white rounded-lg shadow-xl">
            <div className="absolute top-0 right-0 pt-2 pr-2">
              <button
                className="text-gray-500 transition duration-150 ease-in-out hover:text-gray-400 focus:outline-none focus:text-gray-400"
                onClick={onClose}
              >
                <svg
                  className="w-6 h-6 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.414 10l4.293-4.293a1 1 0 00-1.414-1.414L10 8.586 5.707 4.293a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 001.414 1.414L10 11.414l4.293 4.293a1 1 0 001.414-1.414L11.414 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="px-4 py-6">{children}</div>
          </div>
        </div>
      </div>,
      document.body
    );
  };  

export default Modal;