// utils/api.ts
import axios, { isAxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';


const JWT_TOKEN_KEY = '@MyApp:jwtToken';

// Crie uma instância do Axios
const api = axios.create({
  baseURL: 'http://192.168.1.3:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(JWT_TOKEN_KEY);
    console.log('[API Interceptor] Token obtido do AsyncStorage:', token ? 'SIM' : 'NÃO');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
        console.log('[API Interceptor] Cabeçalho Authorization definido.');
    } else {
        console.warn('[API Interceptor] Token não encontrado no AsyncStorage. Requisição pode falhar.');
    }
    return config;
  },
  (error) => {
    console.error('[API Interceptor] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API Interceptor] Resposta recebida para ${response.config.url}. Status: ${response.status}`);
    return response;
},
  async (error) => {

    if (isAxiosError(error)) {
        console.error(`[API Interceptor] Erro na resposta para ${error.config?.url}. Status: ${error.response?.status}`);
      if (error.response?.status === 401) {
        console.warn('[API Interceptor] Token JWT inválido ou expirado. Desconectando usuário.');
        await AsyncStorage.removeItem(JWT_TOKEN_KEY);
        Alert.alert('Sessão Expirada', 'Sua sessão expirou. Por favor, faça login novamente.');
        router.replace('/login');
      } else if (error.response?.status === 403) {
            console.warn('[API Interceptor] Acesso negado (403).');
            Alert.alert('Acesso Negado', 'Você não tem permissão para esta ação.');
        } else {
            console.error('[API Interceptor] Erro Axios:', error.message);
            if (error.response) {
                console.error('  Status:', error.response.status);
                console.error('  Dados da Resposta:', error.response.data);
            } else if (error.request) {
                console.error('  Nenhuma resposta do servidor. Erro de rede?');
            }
        }
    } else {
        console.error('[API Interceptor] Erro não-Axios:', error);
    }
    return Promise.reject(error);
  }
);

export default api;