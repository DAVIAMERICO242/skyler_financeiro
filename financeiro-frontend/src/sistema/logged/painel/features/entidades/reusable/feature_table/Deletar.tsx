/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useToast } from "@/components/ui/use-toast"
import BACKEND_URL from "@/sistema/backend-urls";
import { useState } from "react";
import { useTerceiros } from "../../Terceiros/Terceiros";
import { useLojas } from "../../Lojas/Lojas";
import { useBancos } from "../../Bancos/Bancos";
import { useContas } from "../../Contas/local-contexts/contas-context";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { areAllValuesUndefined, singularWord } from "@/sistema/essentials";
import { DeleteEntity } from "../../BackendHelper/API/fetch";
import { usePagination } from "./pagination/PaginationContext";
import { useFilterContas } from "./filter/contas/ContextFilterContas";
import { Trash2 } from "lucide-react";

export const Deletar = ({author,identifier_value}:{author:string,identifier_value:string})=>{

    const filterContas = useFilterContas().filterContas;

    const { toast } = useToast();
    const [loading,setLoading] = useState<boolean>(false);

    const terceiros_refetch = useTerceiros().refetch;
    const lojas_refetch = useLojas().refetch;
    const bancos_refetch = useBancos().refetch;
    const contas_refetch = useContas().refetch;

    const contasData = useContas().data;

    const current_page = usePagination().current_page;// apenas para contas
    const setCurrent_page = usePagination().setCurrent_page

    switch (author){
      case "terceiros":
        var refetch = terceiros_refetch;
        break;
      case "lojas":
        var refetch = lojas_refetch;
        break;
      case "bancos":
        var refetch = bancos_refetch;
        break;
      case "contas":
        var refetch = contas_refetch;
        break;
    }

    function submit() {
        console.log('form');
        setLoading(true);
        DeleteEntity(author,identifier_value).then((d)=>d.json())
          .then((d)=>{
            if(d.success){
              if(author==="contas"){
                if(filterContas && !areAllValuesUndefined(filterContas)){
                  if(contasData?.length===1 && current_page>1){//ultimo item deletado da pagina
                    refetch(current_page-1,filterContas).then(()=>{
                      setCurrent_page(prev=>(prev-1))
                    });
                  }else{
                    refetch(current_page,filterContas);
                  }
                }else{
                  if(contasData?.length===1 && current_page>1){
                    refetch(current_page-1).then(()=>{
                      setCurrent_page(prev=>(prev-1))
                    });
                  }else{
                    refetch(current_page);
                  }
                }
              }else{
                refetch();
              }
              toast({
                title: "Sucesso",
                className: "success",
                description: "Ocorreu tudo certo com a operação",
              })
              setLoading(false);
            }else{
              if(d.duplicate){
                console.log('duplicata')
                toast({
                  title: "Duplicata",
                  className: "error",
                  description: "Esse nome ou conta bancária já existe no banco de dados",
                })
              }else if(d.foreign_key){
                toast({
                  title: "NÃO AUTORIZADO",
                  className: "error",
                  description: "Você não pode excluir um terceiro/loja/banco que esteja em contas a pagar ou receber",
                })
              }
              else{
                toast({
                  title: "Erro desconhecido",
                  className: "error",
                  description: "Comunique ao desenvolvedor",
                })
              }
              setLoading(false);
            }
          })
          .catch(()=>{
            toast({
              title: "Erro desconhecido",
              className: "error",
              description: "Comunique ao desenvolvedor",
            })
            setLoading(false);
          })
      }

      return(
        <AlertDialog>
            <AlertDialogTrigger style={{color:"red"}}><Trash2 /></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Essa ação não pode ser desfeita
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={submit}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )

}