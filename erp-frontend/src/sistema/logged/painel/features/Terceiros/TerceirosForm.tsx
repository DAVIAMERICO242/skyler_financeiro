import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { useState,useEffect } from 'react';
import { LoadingButton } from '@/components/ui/LoadingButton';
import BACKEND_URL from '@/sistema/backend-urls';
import { useToast } from "@/components/ui/use-toast"
import { useTerceiros } from "./Terceiros";

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export const TerceirosForm = ({edit,setOpen}:{edit:boolean, setOpen?:any})=>{
    const terceirosData = useTerceiros().data;

    console.log('TERCEIROS DATA')
    console.log(terceirosData)

    const terceirosSchema = z.object({
      pastnometerceiro: z.string().min(2, {
        message: "O nome do terceiro deve ter no mínimo 2 caracteres",
      }),
      nometerceiro: z.string().min(2, {
        message: "O nome do terceiro deve ter no mínimo 2 caracteres",
      }),
      uf: z.string().min(2, {
          message: "UF deve ter no mínimo 2 caracteres",
        }),
      cnpjcpfterceiro: z.string().min(10, {
          message: "O campo deve ter no mínimo 10 caracteres",
        }).max(14, {
          message: "O campo deve ter no máximo 14 caracteres",
        }).regex(/^\d+$/, {
          message: "O campo deve conter apenas dígitos numéricos.",
        }),
      tipoterceiro: z.string().min(2,{
        message: "O tipo do terceiro deve ter no mínimo 2 caracteres"
      })
    });

    const { toast } = useToast()

    interface estadosAPI{
        sigla:string;
    }

    const [BRStates, setBRStates] = useState<string[]>([]);
    useEffect(() => {
          fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
              .then((data) => data.json())
              .then((uf_data) => {
                console.log(uf_data)
                const estados = uf_data.map((e:estadosAPI)=>e.sigla).sort();
                console.log(estados)
                setBRStates(estados);
              });
      }, []);
    
    console.log(BRStates);

    const form = useForm<z.infer<typeof terceirosSchema>>({
        resolver: zodResolver(terceirosSchema),
        defaultValues: {
          nometerceiro: "",
          cnpjcpfterceiro: ""
        },
      });
    const [loading,setLoading] = useState<boolean>(false);


    function onSubmit(values: z.infer<typeof terceirosSchema>) {
        console.log('form');
        console.log(values);
        setLoading(true);
        fetch(BACKEND_URL+`/terceiros/${!edit?"cadastro":"update"}`,{
          method:"POST",
          headers:{
            'Content-type':"application/json",
            'token':localStorage.getItem('token') as string,
          },
          body:JSON.stringify({terceiro:values})
        }).then((d)=>d.json())
          .then((d)=>{
            if(d.success){
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
                  description: "Esse nome já existe no banco de dados",
                })
              }else{
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

      return (
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {edit && 
              <FormField
              control={form.control}
              name="pastnometerceiro"
              render={({ field }) => (
                  <FormItem style={{ marginBottom: '30px' }}>
                  <FormLabel>Nome do terceiro a ser mudado</FormLabel>
                  <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger className="w-[100%]">
                            <SelectValue placeholder="Escolher" />
                        </SelectTrigger>
                        <SelectContent {...field }>
                            {terceirosData?.map((e)=>{
                                return (
                                    <SelectItem value={e.nome}>{e.nome}</SelectItem>
                                )
                            })}
                        </SelectContent>
                      </Select>
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
              />
            }
            <FormField
              control={form.control}
              name="nometerceiro"
              render={({ field }) => (
                  <FormItem style={{ marginBottom: '30px' }}>
                  <FormLabel>{"Nome do terceiro " + (edit && "(novo)")}</FormLabel>
                  <FormControl>
                      <Input placeholder="nome terceiro" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
              />
            <FormField
              control={form.control}
              name="tipoterceiro"
              render={({ field }) => (
                  <FormItem style={{ marginBottom: '30px' }}>
                  <FormLabel>{"Tipo do terceiro " + (edit && "(novo)")}</FormLabel>
                  <FormControl>
                      <Input placeholder="fornecedor,cliente,etc.." {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
              />
            <FormField
              control={form.control}
              name="cnpjcpfterceiro"
              render={({ field }) => (
                  <FormItem style={{ marginBottom: '30px' }}>
                  <FormLabel>{"CNPJ/CPF sem máscara " + (edit && "(novo)")}</FormLabel>
                  <FormControl>
                      <Input placeholder="CNPJ/CPF" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
              />
            <FormField
              control={form.control}
              name="uf"
              render={({ field }) => (
                  <FormItem  style={{ marginBottom: '30px' }}>
                  <FormLabel>{"Estado " + (edit && "(novo)")}</FormLabel>
                  <FormControl>
                      <Select onValueChange={field.onChange}>
                      <SelectTrigger className="w-[100%]">
                          <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent {...field }>
                          {BRStates.map((e)=>{
                              return (
                                  <SelectItem value={e}>{e}</SelectItem>
                              )
                          })}
                      </SelectContent>
                      </Select>
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
              />
              <LoadingButton
                loading={loading}
                className="w-[100%]"
                type="skyler">{!edit?"Cadastrar":"Confirmar edição"}
              </LoadingButton>
          </form>
        </Form>
      )
}