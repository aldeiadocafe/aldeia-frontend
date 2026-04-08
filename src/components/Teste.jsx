import React from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';

const Teste = () => {
  // Captura a largura e altura automaticamente
  const { height, width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <Text>Largura do Tablet: {width}px</Text>
      <Text>Altura do Tablet: {height}px</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default Teste;
