import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './stores/AuthContext';
import { router } from './routes';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
