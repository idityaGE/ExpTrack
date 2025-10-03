import { StyleSheet, Text, View } from "react-native";
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Boom Bam</Text>
      <Link href="/kill" style={styles.link}>Go to Kill</Link>
      <Link href="/setting" style={styles.link}>Go to Setting</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold" },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  link: {
    marginTop: 20,
    fontSize: 18,
    color: 'blue',
    padding: 10,
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 5,
  },
})