// Función para generar un token JWT simulado
const generateMockToken = (user: any) => {
  // En un entorno real, esto sería generado por el backend
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 // 24 horas
  }))}.MOCK_SIGNATURE`;
};

interface MockAuthProviderProps {
  children: React.ReactNode;
}

const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Inicializar datos mock en localStorage si no existen
    const mockUsers = getLocalStorageItem('mockUsers', defaultUsers);
    const mockTenants = getLocalStorageItem('mockTenants', defaultTenants);
    const mockProducts = getLocalStorageItem('mockProducts', defaultProducts);
    const mockTransactions = getLocalStorageItem('mockTransactions', defaultTransactions);
    const mockCustomers = getLocalStorageItem('mockCustomers', defaultCustomers);
    
    // Guardar datos mock en localStorage
    setLocalStorageItem('mockUsers', mockUsers);
    setLocalStorageItem('mockTenants', mockTenants);
    setLocalStorageItem('mockProducts', mockProducts);
    setLocalStorageItem('mockTransactions', mockTransactions);
    setLocalStorageItem('mockCustomers', mockCustomers);
    
    // Verificar si hay un usuario guardado en localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      // Si hay datos guardados, cargarlos en el estado de Redux
      dispatch(loadAuthData());
    }
    
    setInitialized(true);
  }, [dispatch]);