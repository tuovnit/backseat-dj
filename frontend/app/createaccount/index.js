import { useState } from 'react';

// Native imports.
import { Alert, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

// Expo imports.
import { Link, router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// Gluestack imports.
import { Button, ButtonText, GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

// Local imports.
import GLOBAL from '../global';

// Global variables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const url = `${baseUrl}/authenticate/createaccount`;

/*
*	CreateAccount screen to allow users to create an account.
*/
export default function CreateAccount() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [error, setError] = useState(false);
	const [message, setMessage] = useState('');

	const createAccountHandler = () => {
		console.log("Creating Account")

		//Alert only works on iOS and Android. Not Web
		if(email === '' || password === '' || name === ''){
			console.log("Requires all fields to be completed.")
			Alert.alert("Form Incomplete", "One or more fields is incomplete.")
			return;
		}

		//Post request to backend server. sends over the username and email that was inputed
		fetch(url, 
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'email': email,
				'name': name,
				'password': password
			}),
		})
		.then(async response => {
			try
			{
				const jsonResponse = await response.json();
				if(response.status !== 200){
					setError(true);
					setMessage(jsonResponse.message);
					console.log(jsonResponse.message);
					Alert.alert(jsonResponse.message);
				}
				else{
					setMessage(jsonResponse.message);
					console.log(jsonResponse.message);
					GLOBAL.userID = jsonResponse.userID;
					GLOBAL.username = jsonResponse.userName;
					GLOBAL.userEmail = jsonResponse.email;
					router.push({pathname: '/welcome', params: { userID: jsonResponse.userID, userName: jsonResponse.userName}} )
				}
			}
			catch(error)
			{
				console.log(error);
			}

		})
		.catch(error => {console.log(error)})
	};

  return (
	<GluestackUIProvider config={config}>

		<View style={styles.darkBackground}>

			<View style={styles.form}>
				<Text style={styles.title}>Sign Up</Text>
				<View style={styles.inputView}>
					<TextInput style={styles.inputText} 
						placeholder="Email" 
						placeholderTextColor="#93a2ba"
						onChangeText={(text) => setEmail(text)}>
					</TextInput>
				</View>
				<View style={styles.inputView}>
					<TextInput style={styles.inputText} 
						placeholder="Your Name" 
						placeholderTextColor="#93a2ba"
						onChangeText={(text) => setName(text)}>
					</TextInput>
				</View>
				<View style={styles.inputView}>
					<TextInput style={styles.inputText} secureTextEntry 
						placeholder="Create Password" 
						placeholderTextColor="#93a2ba"
						onChangeText={(text) => setPassword(text)}>
					</TextInput>
				</View>
				<Button style={styles.button} borderRadius={30} onPress={createAccountHandler}>
					<ButtonText>Create Account</ButtonText>
				</Button>
			</View>

			<View style={styles.or}>
				<View style={styles.horizontalLine}/>
				<Text style={styles.title}>Or</Text>
				<View style={styles.horizontalLine}/>
			</View>

			<View style={styles.buttonForm}>
				<Button style={styles.googleButton} borderRadius={30}>
					<FontAwesome5 name="google" size={24} color="#F2F0F0"/>
					<Text style={styles.googleText}>Sign Up With Google</Text>
				</Button>

				<Text style={styles.subtext}>
					Already a party animal?
					{' '}
					<Link href="/login" style={styles.sublink}>Login</Link>
				</Text>
			</View>

		</View>
	</GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
	darkBackground:{
		backgroundColor: '#282B30',
		flex: 1,
	},
	title: {
		color: '#F2F0F0',
		fontWeight: "bold",
		fontSize: 25,
		margin: 30,
	},
	form: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
	inputView: {
		width:'80%',
		backgroundColor:'#40444b',
		borderRadius: 25,
		height: 50,
		marginBottom: 20,
		justifyContent: 'center',
		padding: 20,
	},
	inputText:{
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
	googleButton: {
		backgroundColor: '#0D652D',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: 50,
		width: 290,
		gap: 10,
	},
	googleText: {
		color: 'white',
	},
	buttonForm: {
		flexDirection: 'column',
		justifyContent: 'center',
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
	subtext: {
		color: '#F2F0F0',
	},
	sublink: {
		color: '#1a91ff',
	},
})
