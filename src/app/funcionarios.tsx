import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import Funcionario from '../types/Funcionario';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { isAxiosError } from 'axios';

export default function Funcionarios() {
  const navigation = useNavigation();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const JWT_TOKEN_KEY = '@MyApp:jwtToken';
  const REMEMBERED_EMAIL_KEY = '@MyApp:rememberedEmail';

  const carregarFuncionarios = async () => {
    setLoading(true);
    console.log('[Funcionarios] Iniciando carregamento de funcionários...');

    try {
      const tokenCheck = await AsyncStorage.getItem(JWT_TOKEN_KEY);
      console.log(
        '[Funcionarios] Token existe no AsyncStorage para esta sessão:',
        tokenCheck ? 'SIM' : 'NÃO'
      );

      const response = await api.get('/ponto');
      console.log('[Funcionarios] Resposta da API recebida!');
      console.log('[Funcionarios] Status da Resposta:', response.status);
      console.log('[Funcionarios] Dados da Resposta:', response.data);

      if (response.data && Array.isArray(response.data)) {
        setFuncionarios(response.data);
        console.log(
          '[Funcionarios] Funcionários definidos no estado. Total:',
          response.data.length
        );
      } else {
        console.warn(
          '[Funcionarios] Resposta da API não é um array como esperado:',
          response.data
        );
        Alert.alert('Erro', 'Formato de dados inesperado da API.');
      }
    } catch (error: any) {
      console.error('[Funcionarios] Erro capturado na função carregarFuncionarios:', error);
      let errorMessage = 'Não foi possível carregar os funcionários.';

      if (isAxiosError(error)) {
        console.error('[Funcionarios] Detalhes do erro Axios:', error);
        if (error.response) {
          console.error('[Funcionarios] Erro Status:', error.response.status);
          console.error('[Funcionarios] Erro Data:', error.response.data);
          if (error.response.status === 403) {
            errorMessage = 'Você não tem permissão para visualizar esta lista.';
          } else if (
            error.response.data &&
            typeof error.response.data === 'object' &&
            'message' in error.response.data
          ) {
            errorMessage =
              (error.response.data as { message?: string }).message ||
              `Erro do servidor: ${error.response.status}`;
          } else {
            errorMessage = `Erro do servidor: ${error.response.status}`;
          }
        } else if (error.request) {
          console.error(
            '[Funcionarios] Erro de Requisição (sem resposta do servidor):',
            error.request
          );
          errorMessage = 'Servidor não respondeu. Verifique sua conexão ou o IP da API.';
        } else {
          console.error('[Funcionarios] Erro na configuração da requisição:', error.message);
          errorMessage = 'Ocorreu um erro ao configurar a requisição. Tente novamente.';
        }
      } else if (error instanceof Error) {
        console.error('[Funcionarios] Erro padrão:', error.message);
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
              await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
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

  const filteredFuncionarios = funcionarios.filter((funcionario) =>
    funcionario.nome.toLowerCase().includes(searchText.toLowerCase())
  );

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
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar por nome..."
        value={searchText}
        onChangeText={setSearchText}
      />
      {filteredFuncionarios.length === 0 ? (
        <Text style={styles.noDataText}>
          {searchText
            ? 'Nenhum funcionário encontrado com este nome.'
            : 'Nenhum funcionário encontrado ou erro ao carregar.'}
        </Text>
      ) : (
        <FlatList
          data={filteredFuncionarios}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => abrirDetalhes(item)}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Button title="Detalhes" onPress={() => abrirDetalhes(item)} />
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/novo-funcionario')}>
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
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
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