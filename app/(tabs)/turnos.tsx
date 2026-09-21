import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TurnosScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Turnos</Text>
        <Text style={styles.subtitle}>
          Consulta los turnos de tus mascotas
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Próximos turnos</Text>

        {/* Turno 1 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.petName}>🐶 Santino</Text>

            <View style={styles.status}>
              <Text style={styles.statusText}>Confirmado</Text>
            </View>
          </View>

          <View style={styles.info}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>20 de septiembre de 2026</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.label}>Hora</Text>
            <Text style={styles.value}>15:30 hs</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.label}>Veterinaria</Text>
            <Text style={styles.value}>Veterinaria San Martin</Text>
          </View>
        </View>

        {/* Turno 2 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.petName}>🐱 Santino</Text>

            <View style={styles.statusRequested}>
              <Text style={styles.statusText}>Solicitado</Text>
            </View>
          </View>

          <View style={styles.info}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>25 de septiembre de 2026</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.label}>Hora</Text>
            <Text style={styles.value}>10:00 hs</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.label}>Veterinaria</Text>
            <Text style={styles.value}>Clinica Veterinaria Central</Text>
          </View>
        </View>

        <View style={styles.emptyMessage}>
          <Text style={styles.emptyText}>
            Estos turnos son de ejemplo.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },    

  header: {
    backgroundColor: 'rgb(13, 51, 24)',
    paddingTop: 55,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  subtitle: {
    color: '#E9F9ED',
    fontSize: 15,
  },

  content: {
    padding: 25,
  },

  sectionTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 18,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,

    elevation: 3,

    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  petName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222222',
  },

  status: {
    backgroundColor: '#E9F9ED',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  statusRequested: {
    backgroundColor: '#FFF3CD',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },

  info: {
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 3,
  },

  value: {
    fontSize: 15,
    color: '#222222',
    fontWeight: '500',
  },

  emptyMessage: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 25,
  },

  emptyText: {
    fontSize: 13,
    color: '#888888',
  },
});
