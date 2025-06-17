import { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Switch, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { isAxiosError } from 'axios'; // Importe 'isAxiosError' do axios

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const router = useRouter();

  const JWT_TOKEN_KEY = '@MyApp:jwtToken';
  const REMEMBERED_EMAIL_KEY = '@MyApp:rememberedEmail';

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
      const response = await axios.post('http://192.168.1.3:3000/ponto/login', {
        email: email,
        senha: senha,
      });

      const { token } = response.data;

      if (token) {
        await AsyncStorage.setItem(JWT_TOKEN_KEY, token);

        if (lembrar) {
          await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        } else {
          await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }

        router.replace('/funcionarios');

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