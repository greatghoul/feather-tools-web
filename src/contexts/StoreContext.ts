// static/_shared/BusyContext.js
import { createContext, useContext } from 'react';

// Busy context for global busy state
export const StoreContext = createContext<any>(null);

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreContext.Provider');
    }
    return context;
};
