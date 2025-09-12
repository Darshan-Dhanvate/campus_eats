import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
// We will create the CartProvider later
// import { CartProvider } from './context/CartContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* <CartProvider> */}
          <div className="min-h-screen bg-brand-light-gray">
            <AppRouter />
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        {/* </CartProvider> */}
      </AuthProvider>
    </Router>
  );
}

export default App;
