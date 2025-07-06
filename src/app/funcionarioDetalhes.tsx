import React, { useEffect, useState, useCallback } from 'react';
import { View, Alert, Text, ActivityIndicator, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import Funcionario from '../types/Funcionario';
import api from '../api/api';
import { isAxiosError } from 'axios';
import FuncionarioForm from '../components/FuncionarioForms';

interface FuncionarioFormState {
  nome: string;
  email: string;
  administrador: boolean;
  senha?: string;
}

export default function FuncionarioDetalhes() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const [funcionarioForm, setFuncionarioForm] = useState<FuncionarioFormState>({
    nome: '',
    email: '',
    administrador: false,
    senha: '',
  });
  const [loading, setLoading] = useState(true);
  const [funcionarioOriginal, setFuncionarioOriginal] = useState<Funcionario | null>(null);

  // Atualiza o título da tela
  useEffect(() => {
    navigation.setOptions({
      title: 'Detalhes do Funcionário',
    });
  }, [navigation]);


  const handleFormChange = useCallback((field: keyof FuncionarioFormState, value: string | boolean) => {
    setFuncionarioForm(prevForm => ({
      ...prevForm,
      [field]: value,
    }));
  }, []);


  const carregarFuncionario = useCallback(async () => {
    if (!id) {
      Alert.alert('Erro', 'ID do funcionário não fornecido.');
      router.back();
      return;
    }
    setLoading(true);
    try {
      const response = await api.get<Funcionario>(`/ponto/${id}`);
      const f: Funcionario = response.data;

      if (f) {
        setFuncionarioOriginal(f);
        setFuncionarioForm({
          nome: f.nome,
          email: f.email,
          administrador: !!f.administrador,
          senha: '',
        });
      } else {
        Alert.alert('Erro', 'Funcionário não encontrado.');
        router.back();
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do funcionário:', error);
      let errorMessage = 'Falha ao buscar dados do funcionário.';

      if (isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = 'Funcionário não encontrado no servidor.';
          } else if (error.response.status === 403) {
            errorMessage = 'Você não tem permissão para visualizar detalhes.';
          } else if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
            errorMessage = (error.response.data as { message?: string }).message || `Erro do servidor: ${error.response.status}`;
          } else {
            errorMessage = `Erro do servidor: ${error.response.status}`;
          }
        } else if (error.request) {
          errorMessage = 'Servidor não respondeu. Verifique sua conexão ou o IP da API.';
        } else {
          errorMessage = 'Ocorreu um erro inesperado ao buscar os dados.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Erro', errorMessage);
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);


  useEffect(() => {
    carregarFuncionario();
  }, [carregarFuncionario]);


  const salvarAlteracoes = useCallback(async () => {
    if (!funcionarioOriginal || !id) return;

    setLoading(true);
    try {
      const dadosParaAtualizar: Partial<Funcionario> = {
        nome: funcionarioForm.nome,
        email: funcionarioForm.email,
        administrador: funcionarioForm.administrador,
      };

      if (funcionarioForm.senha && funcionarioForm.senha.trim() !== '') {
        dadosParaAtualizar.senha = funcionarioForm.senha;
      }

      const response = await api.put(`/ponto/${id}`, dadosParaAtualizar);

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Funcionário atualizado!');
        router.back();
      } else {
        throw new Error('Erro ao salvar alterações.');
      }
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      let errorMessage = 'Não foi possível salvar as alterações.';

      if (isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 403) {
            errorMessage = 'Você não tem permissão para editar este funcionário.';
          } else if (error.response.status === 404) {
            errorMessage = 'Funcionário não encontrado para atualização.';
          } else if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
            errorMessage = (error.response.data as { message?: string }).message || `Erro do servidor: ${error.response.status}`;
          } else {
            errorMessage = `Erro do servidor: ${error.response.status}`;
          }
        } else if (error.request) {
          errorMessage = 'Servidor não respondeu. Verifique sua conexão ou o IP da API.';
        } else {
          errorMessage = 'Ocorreu um erro inesperado ao salvar os dados.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [funcionarioForm, funcionarioOriginal, id, router]);


  const confirmarExclusao = useCallback(() => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir o funcionário "${funcionarioForm.nome}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          onPress: () => excluirFuncionario(),
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  }, [funcionarioForm.nome]);


  const excluirFuncionario = useCallback(async () => {
    if (!id) {
        Alert.alert('Erro', 'ID do funcionário não fornecido para exclusão.');
        return;
    }
    setLoading(true);
    try {
      const response = await api.delete(`/ponto/${id}`);
      
      if (response.status === 204) {
        Alert.alert("Sucesso", "Funcionário excluído com sucesso!");
        router.replace('/funcionarios');
      } else {
        throw new Error(`Erro inesperado ao excluir. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      let errorMessage = 'Não foi possível excluir o funcionário.';

      if (isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 403) {
            errorMessage = 'Você não tem permissão para excluir funcionários.';
          } else if (error.response.status === 404) {
            errorMessage = 'Funcionário não encontrado para exclusão.';
          } else if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
            errorMessage = (error.response.data as { message?: string }).message || `Erro do servidor: ${error.response.status}`;
          } else {
            errorMessage = `Erro do servidor: ${error.response.status}`;
          }
        } else if (error.request) {
          errorMessage = 'Servidor não respondeu. Verifique sua conexão ou o IP da API.';
        } else {
          errorMessage = 'Ocorreu um erro ao configurar a requisição. Tente novamente.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, router]);
  if (loading) {
    return (
      <View style={localStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Carregando dados do funcionário...</Text>
      </View>
    );
  }


  if (!funcionarioOriginal) {
    return (
      <View style={localStyles.loadingContainer}>
        <Text>Nenhum funcionário para exibir.</Text>
        <Button title="Voltar" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <FuncionarioForm
      formData={funcionarioForm}
      onFormChange={handleFormChange}
      onSave={salvarAlteracoes}
      onConfirmDelete={confirmarExclusao}
    />
  );
}


const localStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
