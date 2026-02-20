import { useEffect } from 'react';
import { AppRouter } from './router';
import { initTheme } from './store/themeStore';
import { useAuthStore, useCompanyStore } from './store/authStore';
import { mockUser, mockCompanies } from './utils/mockData';
import { initNetworkListeners } from './lib/apiClient';
import { NetworkBanner } from './components/ui/NetworkBanner';
import { useBrandStore, applyBrandColors } from './store/brandStore';

function App() {
  const { isAuthenticated, login } = useAuthStore();
  const { setCompanies, setActiveCompany } = useCompanyStore();
  const { primaryColor, accentColor } = useBrandStore();

  useEffect(() => {
    initTheme();
    initNetworkListeners();
    applyBrandColors(primaryColor, accentColor);
    if (!isAuthenticated) {
      login(mockUser);
    }
    setCompanies(mockCompanies);
    if (!useCompanyStore.getState().activeCompany) {
      setActiveCompany(mockCompanies[0]);
    }
  }, []);


  return (
    <>
      <NetworkBanner />
      <AppRouter />
    </>
  );
}

export default App;
