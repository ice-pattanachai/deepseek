'use client';

import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types"; 
import { createContext, useContext, ReactNode } from "react";

interface AppContextType {
  user: UserResource | null | undefined; 
}
export const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === null) {
        throw new Error("useAppContext ต้องถูกเรียกใช้ภายใน AppContextProvider เท่านั้น");
    }

    return context;
}

interface AppContextProviderProps {
    children: ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
    const { user } = useUser();
    const value: AppContextType = {
        user
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
