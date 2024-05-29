import { FeatureTitle } from '../reusable/FeatureTitle';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Gerenciar } from '../reusable/Gerenciar';

import { LoadingButton } from '@/components/ui/LoadingButton';
import BACKEND_URL from '@/sistema/backend-urls';
import { useToast } from "@/components/ui/use-toast"

export const terceirosSchema = z.object({
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

export const Terceiros = ()=>{

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
        setLoading(true);
        fetch(BACKEND_URL+'/terceiros/cadastro',{
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
        <>
          <FeatureTitle>Gestão de terceiros</FeatureTitle>
          <Tabs defaultValue="cadastro" className="space-y-8 2xl:w-[30%] md:w-[45%] sm:w-[55%] w-[80%] mt-[5%]">
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cadastro">Cadastrar</TabsTrigger>
                  <TabsTrigger value="gerenciar">Gerenciar</TabsTrigger>
              </TabsList>
              <TabsContent value="cadastro">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                      control={form.control}
                      name="nometerceiro"
                      render={({ field }) => (
                          <FormItem style={{ marginBottom: '30px' }}>
                          <FormLabel>Nome do terceiro</FormLabel>
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
                          <FormLabel>Tipo terceiro</FormLabel>
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
                          <FormLabel>CNPJ/CPF (sem máscara)</FormLabel>
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
                          <FormLabel>Estado</FormLabel>
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
                        type="skyler">Cadastrar
                      </LoadingButton>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="gerenciar">
                <Gerenciar author="terceiros"/>
              </TabsContent>
          </Tabs>
        </>
    )
}