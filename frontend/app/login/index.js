import { useState } from 'react';

// Native imports.
import { Alert, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

// Expo imports.
import { Link, router } from 'expo-router';
import { Fontisto } from '@expo/vector-icons';

// Gluestack imports.
import { config } from '@gluestack-ui/config';
import { Button, ButtonText, GluestackUIProvider } from '@gluestack-ui/themed';

// Local imports.
import GLOBAL from '../global';
import { socket } from "../socket";

// Global vairables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const checkRoomURL = `${baseUrl}/room/checkroom`;
const url = `${baseUrl}/authenticate/login`;

/*
*	Login - screen that allows user to login or scan a qr code to join a room.
*/
export default function Login() {

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(false);
	const [message, setMessage] = useState('');
	const [userName, setUserName] = useState('');

	const [roomCode, setRoomCode] = useState('')


	const loginHandler = () => {
		console.log("Logging in")

		//Alert only works on iOS and Android. Not Web
		if (email === '' || password === '') {
			console.log("Requires all fields to be completed.")
			Alert.alert("Form Incomplete", "One or more fields is incomplete.")
			return;
		}

		//Post request to backend server. sends over the username and email that was inputted
		fetch(url,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'email': email,
					'password': password
				}),
			})
			.then(async response => {
				try {
					const jsonResponse = await response.json();
					if (response.status !== 200) {
						setError(true);
						setMessage(jsonResponse.message);
						console.log(jsonResponse.message);
						Alert.alert(jsonResponse.message);;
					}
					else {
						//navigate to Welcome screen
						setError(false);
						setMessage(jsonResponse.message);
						setUserName(jsonResponse.userName);
						console.log(userName);
						GLOBAL.userID = jsonResponse.userID;
						GLOBAL.username = jsonResponse.userName;
						GLOBAL.userEmail = jsonResponse.email;
						GLOBAL.guest = false
						router.replace({ pathname: '/welcome', params: { userID: jsonResponse.userID, userName: jsonResponse.userName} })
					}
				}
				catch (error) {
					console.log(error);
				}
			})
			.catch(error => { console.log(error) })
	};

	const guestLoginHandler = () => {
		console.log(`Checking Room Exists with Code: ${roomCode}`)
		fetch(checkRoomURL, 
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
					socket.connect()
					socket.emit("joinRoom", null, null, roomCode, (result) => {
						if (result.status == 200){
							GLOBAL.userID = result.user.id;
							GLOBAL.username = result.user.name;
							GLOBAL.host = false;
							router.replace({pathname: '/queue', params: {userID: result.user.id, userName: result.user.name} })
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
	};

	return (
		<GluestackUIProvider config={config}>
			<View style={styles.darkBackground}>

				{/* Login Block */}
				<View style={styles.loginForm}>
					<Text style={styles.title}>Login</Text>
					<View style={styles.inputView}>
						<TextInput style={styles.inputText}
							placeholder="Email"
							placeholderTextColor="#93a2ba"
							onChangeText={(text) => setEmail(text)}>
						</TextInput>
					</View>
					<View style={styles.inputView}>
						<TextInput style={styles.inputText} secureTextEntry
							placeholder="Password"
							placeholderTextColor="#93a2ba"
							onChangeText={(text) => setPassword(text)}>
						</TextInput>
					</View>
				</View>

				<View style={styles.loginButtons}>
					<Button style={styles.button} borderRadius={30} onPress={loginHandler}>
						<ButtonText>Submit</ButtonText>
					</Button>

					{/* <Fontisto.Button style={styles.button} backgroundColor={"#0D652D"} borderRadius={30} name="google" size={24}>
						<ButtonText>Login With Google</ButtonText>
					</Fontisto.Button> */}

					<Text style={styles.subtext}>
						Want to become a party animal?
						{' '}
						<Link href="/createaccount" style={styles.sublink}>Create Account</Link>
					</Text>
					<Text style={styles.subtext}>
						Forgot Password?
						{' '}
						<Link href="/forgotpassword" style={styles.sublink}>Reset Password</Link>
					</Text>
				</View>

				{/* Join Existing Room Title */}
				<View style={styles.or}>
					<View style={styles.horizontalLine} />
					<Text style={styles.title}>Join Existing Room</Text>
					<View style={styles.horizontalLine} />
				</View>

				{/* Room Code and QR Button */}
				<View style={styles.joinForm}>
					<View style={styles.inputView}>
						<TextInput style={styles.inputText} 
							placeholder="Room Code" 
							placeholderTextColor="#93a2ba"
							onChangeText={(text) => setRoomCode(text)}
							onSubmitEditing={guestLoginHandler}></TextInput>
					</View>
				</View>

				<Text style={styles.text}>Or</Text>

				<View style={styles.loginButtons}>
					{/* <Link href="/scan" asChild> */}
					<Link href={{ pathname: "/scan", params: { isGuest: 1 } }} asChild>
						<Fontisto.Button style={styles.button} borderRadius={30} name="qrcode" >
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
	loginForm: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
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
		marginTop: 30,
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
	subtext: {
		color: '#F2F0F0',
	},
	sublink: {
		color: '#1a91ff',
	},
	text: {
		color: '#F2F0F0',
		textAlign: 'center',
		marginBottom: 20,
	},
})
