import { useState } from 'react';

// Native imports.
import { Alert, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useRoute } from '@react-navigation/native';

// Expo imports.
import { Link, router } from 'expo-router';
import { Fontisto } from '@expo/vector-icons';

// Gluestack imports.
import { Button, ButtonText, GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

// Local imports.
import GLOBAL from "../global"
import SOCKET from "../socket";
import { io } from "socket.io-client";

// Global variables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const url = `${baseUrl}/room/checkroom`;

/*
*	Queue - screen for viewing currently queued songs.
*/
export default function Welcome() {
	const route = useRoute();
	const userID = route.params?.userID;
	const userName = route.params?.userName;

	const [roomCode, setRoomCode] = useState('');

	const onSubmitRoomCode = () => {

		console.log(`Checking Room Exists with Code: ${roomCode}`)
		fetch(url, 
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'roomCode': roomCode,
			}),
		})
		.then(result => result.json())
		.then(async (response) => {
			try
			{
				if(response.status === 200){
					//connect socket and join the room
					console.log("Room code status: 200")
					SOCKET.socket = io(`${process.env.EXPO_PUBLIC_BASE_URL}`, {
						autoConnect: false
					});
					SOCKET.socket.connect()
					SOCKET.socket.emit("joinRoom", userID, userName, roomCode, (result) => {
						if (result.status == 200){
							console.log("pushing to queue")
							GLOBAL.host = false;
							router.replace({pathname: '/queue', params: {userID: userID, userName: userName}})
						}
						else{
							Alert.alert("Something went wrong");
						}
					})
				}
				else{
					Alert.alert(response.message);
				}
			}
			catch(error)
			{
				console.log(error)
			}
		})
		.catch(error => {console.log(error)})
	
	}

	return (
		<GluestackUIProvider config={config}>
			<View style={styles.darkBackground}>

				{/* Login Block */}
				<View style={styles.titleForm}>
					<Text style={styles.title}>Welcome {GLOBAL.username}</Text>
					{/* <Text style={styles.title}></Text> */}
				</View>

				<View style={styles.loginButtons}>
					{/* <Link reload href="/createroom" asChild> */}
					<Link href={{ pathname: "/createroom", params: { userID: userID, userName: userName, roomExists: false }}} asChild>
						<Button style={styles.button} borderRadius={30}>
							<ButtonText>Create Room</ButtonText>
						</Button>
					</Link>
				</View>

				{/* Join Existing Room Title */}
				<View style={styles.or}>
					<View style={styles.horizontalLine} />
					<Text style={styles.subtitle}>Join Existing Room</Text>
					<View style={styles.horizontalLine} />
				</View>

				{/* Room Code and QR Button */}
				<View style={styles.joinForm}>
					<View style={styles.inputView}>
						<TextInput style={styles.inputText} 
							placeholder="Room Code" 
							placeholderTextColor="#93a2ba"
							onChangeText={(text) => setRoomCode(text)}
							onSubmitEditing={onSubmitRoomCode}></TextInput>
					</View>
				</View>

				<Text style={styles.text}>Or</Text>

				<View style={styles.loginButtons}>
					{/* <Link href="/scan" asChild> */}
					<Link href={{ pathname: "/scan", params: { userID: userID, userName: userName, isGuest: 0 } }} asChild>
						<Fontisto.Button style={styles.button} borderRadius={30} name="qrcode">
							<ButtonText style={styles.googleText}>Scan QR</ButtonText>
						</Fontisto.Button>
					</Link>
				</View>

			</View>
		</GluestackUIProvider>
	);
}

const styles = StyleSheet.create({
	darkBackground: {
		backgroundColor: '#282B30',
		flex: 1,
	},
	titleForm: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		margin: 50,
	},
	loginButtons: {
		flexDirection: 'column',
		alignItems: 'center',
		gap: 20,
	},
	button: {
		height: 50,
		width: 290,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 25,
	},
	subtitle: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 25,
		margin: 30,
	},
	inputView: {
		width: '80%',
		backgroundColor: '#40444b',
		borderRadius: 25,
		height: 50,
		marginBottom: 20,
		justifyContent: 'center',
		padding: 20,
	},
	inputText: {
		height: 50,
		color: 'white',
	},
	or: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 50,
	},
	horizontalLine: {
		flex: 1,
		height: 1,
		backgroundColor: 'white',
	},
	joinForm: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	text: {
		color: '#F2F0F0',
		textAlign: 'center',
		marginBottom: 20,
	},
})