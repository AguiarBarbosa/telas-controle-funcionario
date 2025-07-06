import { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Switch, Text } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import Funcionario from '../types/Funcionario';
import api from '../api/api';
import { isAxiosError } from 'axios';

export default function NovoFuncionario() {
  const [form, setForm] = useState<Funcionario>({
    id: 0,
    nome: '',
    email: '',
    senha: '',
    administrador: false,
  });

  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Cadastrar Funcionário',
    });
  }, []);

  const salvarFuncionario = async () => {
  
    if (!form.nome.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o campo Nome.');
      return;
    }
    if (!form.email.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o campo E-mail.');
      return; 
    }
    if (!form.senha.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o campo Senha.');
      return;
    }


    try {
      const response = await api.post('/ponto', form);

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Sucesso', 'Funcionário cadastrado!');
        router.replace('/funcionarios');
      } else {
        throw new Error('Erro inesperado ao salvar funcionário.');
      }
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);

      let errorMessage = 'Não foi possível salvar o funcionário.';

      if (isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 403) {
            errorMessage = 'Você não tem permissão para cadastrar funcionários.';
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
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nome"
        value={form.nome}
        onChangeText={(text) => setForm({ ...form, nome: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        value={form.senha}
        onChangeText={(text) => setForm({ ...form, senha: text })}
        style={styles.input}
        secureTextEntry
      />

      <View style={styles.switchContainer}>
        <Text>Administrador</Text>
        <Switch
          value={form.administrador}
          onValueChange={(value) => setForm({ ...form, administrador: value })}
        />
      </View>

      <Button title="Salvar Funcionário" onPress={salvarFuncionario} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
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