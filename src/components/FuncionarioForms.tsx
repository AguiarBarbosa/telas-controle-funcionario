import React from 'react';
import { View, TextInput, Button, StyleSheet, Text, Switch } from 'react-native';

// Define a interface para o estado do formulário de edição
interface FuncionarioFormState {
  nome: string;
  email: string;
  administrador: boolean;
  senha?: string; // Senha é opcional, só será enviada se preenchida
}

// Define as props que este componente irá receber
interface FuncionarioFormProps {
  formData: FuncionarioFormState; // Os dados atuais do formulário
  onFormChange: (field: keyof FuncionarioFormState, value: string | boolean) => void; // Função para atualizar um campo específico
  onSave: () => void; // Função para salvar as alterações
  onConfirmDelete?: () => void; // Função para confirmar exclusão (opcional, pois pode não existir em um formulário de criação)
}

export default function FuncionarioForm({ formData, onFormChange, onSave, onConfirmDelete }: FuncionarioFormProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Funcionário</Text>
      <TextInput
        style={styles.input}
        value={formData.nome}
        onChangeText={(text) => onFormChange('nome', text)}
        placeholder="Nome"
      />
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(text) => onFormChange('email', text)}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none" // Impede capitalização automática do teclado
      />
      <TextInput
        style={styles.input}
        value={formData.senha}
        onChangeText={(text) => onFormChange('senha', text)}
        placeholder="Senha (deixe em branco para não alterar)"
        secureTextEntry
      />

      <View style={styles.switchContainer}>
        <Text>Administrador</Text>
        <Switch
          value={formData.administrador}
          onValueChange={(value) => onFormChange('administrador', value)}
        />
      </View>

      <Button title="Salvar Alterações" onPress={onSave} />

      {/* Renderiza o botão de excluir apenas se a função for fornecida */}
      {onConfirmDelete && (
        <View style={styles.deleteButtonContainer}>
          <Button
            title="Excluir Funcionário"
            onPress={onConfirmDelete}
            color="#FF3B30" // Cor vermelha para ação destrutiva
          />
        </View>
      )}
    </View>
  );
}

// Estilos movidos para este componente
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteButtonContainer: {
    marginTop: 20,
  },
});
