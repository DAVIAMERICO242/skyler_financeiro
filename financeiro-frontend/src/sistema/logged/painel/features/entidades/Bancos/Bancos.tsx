import { FeatureTitle } from '../reusable/FeatureTitle';
import BACKEND_URL from '@/sistema/backend-urls';
import { createContext, ReactNode, useState, useEffect, useContext } from 'react';
import { LoadingFeature } from '../reusable/LoadingFeature';
import { FeatureTable } from '../reusable/feature_table/FeatureTable';
import { NotFoundFeature } from '../reusable/NotFoundFeature';
import { getBancos } from '../BackendHelper/API/fetch';

export interface SchemaBancosData {
    nome_banco?:string;
    banco?: string;
    agencia?: string;
    conta?: string;
    saldo_inicial:number;
}

interface BancosContextType {
    data: SchemaBancosData[] | null;
    refetch: () => void;
}

const BancosContext = createContext<BancosContextType>({ data: null,refetch: () => {} });

export const BancosProvider = ({ children }:{children:ReactNode}) => {
const [data, setData] = useState<SchemaBancosData[] | null>(null);

const fetchData = async () => {
        try {
        const response = await getBancos();
        setData(response);
        } catch (error) {
        console.log('erro')
        } 
};


useEffect(() => {
    fetchData();
}, []);

const refetch = () => {
    fetchData();
};

return (
    <BancosContext.Provider value={{data,refetch}}>
        {children}
    </BancosContext.Provider>
);
};

export const useBancos = () => {
    return useContext(BancosContext);
};

export const Bancos = ()=>{

    return (
        <>
            <BancosProvider>
                <FeatureTitle>Gestão de Bancos</FeatureTitle>
                <BancosUI/>
            </BancosProvider>
        </>
    )
}

export const BancosUI = ()=>{
    const [loading,setLoading] = useState(true);
    const [foundData,setFoundData] = useState(false);

    const thisContextData = useBancos().data;

    useEffect(()=>{
      if(thisContextData!==null){
        setLoading(false);
        if(thisContextData?.length){
          setFoundData(true);
        }else{
          setFoundData(false);
        }
      }
    },[thisContextData])
    
    return(
      <>
        {loading?<LoadingFeature/>
          :foundData?(<FeatureTable author="bancos"/>):(<NotFoundFeature author="bancos"/>)}
      </> 
    )
}