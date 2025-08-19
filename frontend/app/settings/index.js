// Native imports.
import { StyleSheet, View } from "react-native";

// Gluestack imports.
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

// Another Page component export
export default function Queue() {
  return (
	<GluestackUIProvider config={config}>

		<View style={styles.darkBackground}>

		</View>
		
	</GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
	darkBackground:{
		backgroundColor: "#282B30",
		justifyContent: 'center',
		alignItems: 'center',
		gap: 10
	},
	text:{
		color: "#F2F0F0",
		padding: 10
	},
	
	button: {
		marginStart: 10,
		marginEnd: 10
	}
})