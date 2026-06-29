import { createContext, useContext, useState } from "react";

type AddressDraft = {
  lat: number;
  lng: number;
  label: string;
  notes: string;
};

type SetupData = {
  name: string;
  address: AddressDraft | null;
};

type SetupContextType = {
  setupData: SetupData;
  setName: (name: string) => void;
  setAddress: (address: AddressDraft) => void;
  clearSetupData: () => void;
};

const SetupContext = createContext<SetupContextType | undefined>(undefined) 

export function SetupProvider({children}:{children:React.ReactNode}) {
    const [setupData, setSetupData] = useState<SetupData>({name: '', address: null})

    const setName = (name: string) => setSetupData(prev => ({...prev, name}))
    const setAddress = (address: AddressDraft) => setSetupData(prev => ({...prev, address}))
    const clearSetupData = () => setSetupData({name: '', address: null})

    return (
        <SetupContext.Provider value={{setupData, setName, setAddress, clearSetupData}}>
            {children}
        </SetupContext.Provider>
    )
}

export function useSetup() {
    const ctx = useContext(SetupContext)
    if(!ctx) throw new Error('useSetup must be used within SetupProvider.')
    return ctx
}
