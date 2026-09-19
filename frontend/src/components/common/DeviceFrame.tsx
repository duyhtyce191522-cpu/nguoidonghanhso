import React from 'react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  return (
    <div className="mobile-app-root">
      <div className="mobile-app-shell">
        {children}
      </div>
    </div>
  );
};
