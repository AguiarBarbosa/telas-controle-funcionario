// app/baterPontoScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Button } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { isAxiosError } from 'axios';

interface FuncionarioLogadoData {
  id: number;
  nome: string;
  email: string;
  administrador: boolean; 
}

export default function BaterPontoScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [funcionarioLogado, setFuncionarioLogado] = useState<FuncionarioLogadoData | null>(null);
  const [ultimaBatida, setUltimaBatida] = useState<string | null>(null);

  const JWT_TOKEN_KEY = '@MyApp:jwtToken';
  const REMEMBERED_EMAIL_KEY = '@MyApp:rememberedEmail';
  const LOGGED_IN_USER_DATA_KEY = '@MyApp:loggedInUserData';

  const carregarDadosFuncionarioLogado = async () => {
    setLoading(true);
    try {
      const storedUserData = await AsyncStorage.getItem(LOGGED_IN_USER_DATA_KEY);
      if (storedUserData) {
        const userData: FuncionarioLogadoData = JSON.parse(storedUserData);
        console.log('Dados do usuário carregados do AsyncStorage:', userData);

        if (!userData.id || !userData.nome || typeof userData.administrador === 'undefined') {
            Alert.alert('Erro', 'Dados do funcionário incompletos no AsyncStorage. Faça login novamente.');
            router.replace('/login');
            return;
        }

        setFuncionarioLogado(userData);
        

        const response = await api.get(`/ponto/${userData.id}`);
        if (response.data && response.data.pontos && response.data.pontos.length > 0) {
          const pontos = response.data.pontos;
          const ultimoPonto = pontos[pontos.length - 1];
          const dataHora = new Date(ultimoPonto);
          setUltimaBatida(dataHora.toLocaleString('pt-BR', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
          }));
        }
      } else {
        Alert.alert('Erro', 'Dados do funcionário não encontrados. Faça login novamente.');
        router.replace('/login');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do funcionário logado:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do funcionário ou a API de detalhes está inacessível. Faça login novamente.');
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosFuncionarioLogado();

    navigation.setOptions({
      title: 'Bater Ponto',
      headerRight: () => (
        <Button
          title="Logout"
          onPress={async () => {
            try {
              await AsyncStorage.removeItem(JWT_TOKEN_KEY);
              await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
              await AsyncStorage.removeItem(LOGGED_IN_USER_DATA_KEY);
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

  const handleBaterPonto = async () => {
    if (!funcionarioLogado?.id) {
      Alert.alert('Erro', 'Não foi possível identificar o funcionário para bater o ponto.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/ponto/${funcionarioLogado.id}/bater`);
      console.log('Resposta da API (Bater Ponto):', response.data);
      Alert.alert('Sucesso!', response.data);
      const now = new Date();
      setUltimaBatida(now.toLocaleString('pt-BR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        day: '2-digit', month: '2-digit', year: 'numeric'
      }));
    } catch (error) {
      console.error('Erro ao bater ponto:', error);
      let errorMessage = 'Não foi possível bater o ponto. Tente novamente.';
      if (isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data?.message || `Erro do servidor: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = 'Servidor não respondeu. Verifique sua conexão ou o IP da API.';
        } else {
          errorMessage = 'Ocorreu um erro ao configurar a requisição.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {funcionarioLogado ? (
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Olá, {funcionarioLogado.nome}!</Text>
          {ultimaBatida && (
            <Text style={styles.lastPunchText}>Última batida: {ultimaBatida}</Text>
          )}
          <TouchableOpacity
            style={styles.punchButton}
            onPress={handleBaterPonto}
            disabled={loading}
          >
            <Text style={styles.punchButtonText}>
              {loading ? 'Batendo Ponto...' : 'BATER PONTO'}
            </Text>
          </TouchableOpacity>


          {funcionarioLogado.administrador && (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/funcionarios')}
              disabled={loading}
            >
              <Text style={styles.adminButtonText}>Ver Funcionários</Text>
            </TouchableOpacity>
          )}

        </View>
      ) : (
        <Text style={styles.errorText}>Falha ao carregar dados do funcionário.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  lastPunchText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  punchButton: {
    backgroundColor: '#007AFF', // Cor azul padrão do iOS
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  punchButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // NOVO ESTILO PARA O BOTÃO DO ADMINISTRADOR
  adminButton: {
    marginTop: 20, // Espaço acima do botão
    backgroundColor: '#4CAF50', // Um verde amigável para o administrador
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  adminButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});