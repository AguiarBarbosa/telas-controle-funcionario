
export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  administrador: boolean; 
  pontos?: string[];
}

export default Funcionario;