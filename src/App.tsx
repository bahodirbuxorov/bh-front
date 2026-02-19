import { useEffect } from 'react';
import { AppRouter } from './router';
import { initTheme } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { mockUser, mockCompanies } from './utils/mockData';
import { useCompanyStore } from './store/authStore';

function App() {
  const { isAuthenticated, login } = useAuthStore();
  const { setCompanies, setActiveCompany } = useCompanyStore();

  useEffect(() => {
    initTheme();
    // Seed demo data
    if (!isAuthenticated) {
      login(mockUser);
    }
    setCompanies(mockCompanies);
    if (!useCompanyStore.getState().activeCompany) {
      setActiveCompany(mockCompanies[0]);
    }
  }, []);

  return <AppRouter />;
}

export default App;
