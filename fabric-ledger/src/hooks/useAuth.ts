import { useState } from 'react';

export function useAuth() {
  // Placeholder for authentication logic
  const [user, setUser] = useState(null);
  return { user, setUser };
} 