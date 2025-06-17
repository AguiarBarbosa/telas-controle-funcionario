import { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Switch, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { isAxiosError } from 'axios'; // Importe 'isAxiosError' do axios

// Certifique-se que você tem uma instância de axios configurada para sua API
// Geralmente, isso estaria em um arquivo separado como 'api.ts' ou 'api.js'
// Exemplo:
// const api = axios.create({
//   baseURL: 'http://192.168.1.3:3000', // Sua base URL da API
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// Se você não tiver um 'api.ts' ou similar, pode usar axios diretamente como você já faz.
// Porém, para consistência com o restante do código que usa 'api.post', vou manter essa ideia
// e vou assumir que 'axios' no seu código aqui já está configurado.
// Se você tiver um 'api.ts' como sugerido nas respostas anteriores, substitua 'axios.post' por 'api.post'.

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const router = useRouter();

  const JWT_TOKEN_KEY = '@MyApp:jwtToken';
  const REMEMBERED_EMAIL_KEY = '@MyApp:rememberedEmail';
  // CHAVE PARA ARMAZENAR OS DADOS DO USUÁRIO LOGADO
  const LOGGED_IN_USER_DATA_KEY = '@MyApp:loggedInUserData';

  useEffect(() => {
    const carregarCredenciais = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
        if (savedEmail) {
          setEmail(savedEmail);
          setLembrar(true);
        }
      } catch (error) {
        console.error('Erro ao carregar credenciais:', error);
      }
    };
    carregarCredenciais();
  }, []);

  const fazerLogin = async () => {
    try {
      // Faz a requisição de login
      const response = await axios.post('http://192.168.1.3:3000/ponto/login', {
        email: email,
        senha: senha,
      });

      // DEVE RETORNAR: { token: string, id: number, nome: string, email: string, administrador: boolean }
      const { token, id, nome, email: userEmail, administrador } = response.data;

      if (token) {
        // Salva o token JWT
        await AsyncStorage.setItem(JWT_TOKEN_KEY, token);

        // SALVA OS DADOS DO FUNCIONÁRIO LOGADO
        await AsyncStorage.setItem(LOGGED_IN_USER_DATA_KEY, JSON.stringify({
          id,
          nome,
          email: userEmail,
          administrador
        }));

        // Gerencia a opção "Lembrar e-mail"
        if (lembrar) {
          await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        } else {
          await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }

        // REDIRECIONA PARA A NOVA TELA DE BATER PONTO
        router.replace('/baterPontoScreen'); // Certifique-se que o nome da rota está correto!

      } else {
        Alert.alert('Erro de Login', 'Token de autenticação não recebido.');
      }
    } catch (error) {
      let errorMessage = 'Não foi possível conectar ao servidor.';
      console.error('Erro na requisição de login:', error);

      if (isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = 'Email ou senha inválidos.';
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

      Alert.alert('Erro de Login', errorMessage);
    }
  };

  return (
    <View style={styles.form}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        style={styles.input}
        secureTextEntry
      />

      <View style={styles.switchContainer}>
        <Switch value={lembrar} onValueChange={setLembrar} />
        <Text style={{ marginLeft: 8 }}>Lembrar e-mail</Text>
      </View>

      <Button title="Entrar" onPress={fazerLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
});