import { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import Funcionario from '../types/Funcionario';

interface Props {
  funcionario: Funcionario;
  onSalvar: (id: number, novosDados: Partial<Funcionario>) => void;
}

export default function FuncionarioItem({ funcionario, onSalvar }: Props) {
  const [nome, setNome] = useState(funcionario.nome);
  const [email, setEmail] = useState(funcionario.email);
  const [senha, setSenha] = useState(funcionario.senha);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>ID: {funcionario.id}</Text>

      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome"
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Senha"
        secureTextEntry
      />

      <Button
        title="Salvar"
        onPress={() => onSalvar(funcionario.id!, { nome, email, senha })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
});
