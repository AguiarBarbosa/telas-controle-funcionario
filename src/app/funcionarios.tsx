import { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import Funcionario from '../types/Funcionario';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api'; // Verifique se o caminho para 'api' está correto
import { isAxiosError } from 'axios';

export default function Funcionarios() {
  const navigation = useNavigation();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const JWT_TOKEN_KEY = '@MyApp:jwtToken';
  const REMEMBERED_EMAIL_KEY = '@MyApp:rememberedEmail'; // Chave para o e-mail lembrado

  const carregarFuncionarios = async () => {
    setLoading(true);
    console.log('[Funcionarios] Iniciando carregamento de funcionários...'); // Log 1

    try {
      const tokenCheck = await AsyncStorage.getItem(JWT_TOKEN_KEY);
      console.log('[Funcionarios] Token existe no AsyncStorage para esta sessão:', tokenCheck ? 'SIM' : 'NÃO'); // Log 2

      const response = await api.get('/ponto');
      console.log('[Funcionarios] Resposta da API recebida!'); // Log 3
      console.log('[Funcionarios] Status da Resposta:', response.status); // Log 4: CRÍTICO
      console.log('[Funcionarios] Dados da Resposta:', response.data); // Log 5: CRÍTICO

      if (response.data && Array.isArray(response.data)) {
        setFuncionarios(response.data);
        console.log('[Funcionarios] Funcionários definidos no estado. Total:', response.data.length); // Log 6
      } else {
        console.warn('[Funcionarios] Resposta da API não é um array como esperado:', response.data);
        Alert.alert('Erro', 'Formato de dados inesperado da API.');
      }

    } catch (error: any) {
      console.error('[Funcionarios] Erro capturado na função carregarFuncionarios:', error); // Log 7
      let errorMessage = 'Não foi possível carregar os funcionários.';

      if (isAxiosError(error)) {
        console.error('[Funcionarios] Detalhes do erro Axios:', error); // Log 8: Loga o erro completo do Axios
        if (error.response) {
          console.error('[Funcionarios] Erro Status:', error.response.status); // Log 9
          console.error('[Funcionarios] Erro Data:', error.response.data); // Log 10
          if (error.response.status === 403) {
            errorMessage = 'Você não tem permissão para visualizar esta lista.';
          } else if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
            errorMessage = (error.response.data as { message?: string }).message || `Erro do servidor: ${error.response.status}`;
          } else {
            errorMessage = `Erro do servidor: ${error.response.status}`;
          }
        } else if (error.request) {
          console.error('[Funcionarios] Erro de Requisição (sem resposta do servidor):', error.request); // Log 11
          errorMessage = 'Servidor não respondeu. Verifique sua conexão ou o IP da API.';
        } else {
          console.error('[Funcionarios] Erro na configuração da requisição:', error.message); // Log 12
          errorMessage = 'Ocorreu um erro ao configurar a requisição. Tente novamente.';
        }
      } else if (error instanceof Error) {
        console.error('[Funcionarios] Erro padrão:', error.message); // Log 13
        errorMessage = error.message;
      }
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: 'Funcionários',
      headerRight: () => (
        <Button
          title="Logout"
          onPress={async () => {
            try {
              await AsyncStorage.removeItem(JWT_TOKEN_KEY);
              await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY); // Remove também o e-mail lembrado
              router.replace('/login');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
            }
          }}
          color="#ff3b30"
        />
      ),
    });
  }, [navigation, router]);

  function abrirDetalhes(funcionario: Funcionario) {
    router.push({
      pathname: '/funcionarioDetalhes',
      params: { id: funcionario.id?.toString() },
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Carregando funcionários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {funcionarios.length === 0 ? (
        <Text style={styles.noDataText}>Nenhum funcionário encontrado ou erro ao carregar.</Text>
      ) : (
        <FlatList
          data={funcionarios}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => abrirDetalhes(item)}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Button title="Detalhes" onPress={() => abrirDetalhes(item)} />
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/novo-funcionario')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  nome: { fontSize: 18 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: {
    color: 'white',
    fontSize: 32,
    lineHeight: 32,
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#888',
  },
});