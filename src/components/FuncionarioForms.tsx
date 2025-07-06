import React from 'react';
import { View, TextInput, Button, StyleSheet, Text, Switch } from 'react-native';


interface FuncionarioFormState {
  nome: string;
  email: string;
  administrador: boolean;
  senha?: string;
}


interface FuncionarioFormProps {
  formData: FuncionarioFormState;
  onFormChange: (field: keyof FuncionarioFormState, value: string | boolean) => void;
  onSave: () => void;
  onConfirmDelete?: () => void;
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
        autoCapitalize="none"
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


      {onConfirmDelete && (
        <View style={styles.deleteButtonContainer}>
          <Button
            title="Excluir Funcionário"
            onPress={onConfirmDelete}
            color="#FF3B30"
          />
        </View>
      )}
    </View>
  );
}


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
