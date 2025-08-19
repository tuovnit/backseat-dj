import { QRCode } from 'react-qr-code';

// Native imports.
import { Text, View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

// Gluestack imports.
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';

/*
*	ShareRoom - screen for sharing a normal code or qr code for others to join a room.
*/
export default function ShareRoom() {
	const route = useRoute();
	const roomCode = route.params?.roomCode;

	return (
		<GluestackUIProvider config={config}>
			<View style={styles.darkBackground}>

				<Text style={styles.pageTitle}>Share Room</Text>
				{/* <Image
					size="2xl"
					borderRadius="$none"
					source={require('../../assets/Sample-QR-Code.png')}
					alt="QR Code"
				/> */}
				<QRCode value={roomCode} />

				<Text style={styles.text}>Room Code:</Text>
				<Text style={styles.subtext}>{roomCode}</Text>

			</View>
		</GluestackUIProvider>
	);
}

const styles = StyleSheet.create({
	darkBackground: {
		backgroundColor: '#282B30',
		alignItems: 'center',
		gap: 10,
		flex: 1,
	},
	text: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 30,
		marginTop: '5%'
	},
	subtext: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 30,
		marginBottom: '5%'
	},
	pageTitle: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 30,
		marginBottom: '5%',
		marginTop: '5%'
	},
})