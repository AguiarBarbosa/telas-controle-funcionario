
export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  administrador: boolean; 
  pontos?: string[];
  senha: string;
}

export default Funcionario;