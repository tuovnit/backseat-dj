import { useState } from 'react';

// Native imports.
import { Alert, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

// Expo imports.
import { Link, router } from 'expo-router';

// Gluestack imports.
import { config } from '@gluestack-ui/config';
import { Button, ButtonText, GluestackUIProvider } from '@gluestack-ui/themed';

// Global variables.
const url = `http://${process.env.EXPO_PUBLIC_HOSTNAME}:3000/authenticate/reset`;

/*
*	Reset Screen
*/
export default function Login() {
	const [email, setEmail] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [error, setError] = useState(false);
	const [message, setMessage] = useState('');

	const resetPasswordHandler = () => {
		console.log("Resetting Password")

		//Alert only works on iOS and Android. Not Web
		if(email === '' || newPassword === ''){
			console.log("Requires all fields to be completed.")
			Alert.alert("Email and a new password are required")
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
				'newPassword': newPassword
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
					Alert.alert(jsonResponse.message);;
				}
				else{
					//navigate back to login screen
					setError(false);``
					setMessage(jsonResponse.message);
					router.replace('/login')
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
			
			{/* Reset Block */}
			<View style={styles.resetForm}>
				<Text style={styles.title}>Reset Password</Text>
				<View style={styles.inputView}>
					<TextInput style={styles.inputText} 
						placeholder="Email" 
						placeholderTextColor="#93a2ba" 
						onChangeText={(text) => setEmail(text)}>
					</TextInput>
				</View>
				<View style={styles.inputView}>
					<TextInput style={styles.inputText} secureTextEntry 
						placeholder="New Password" 
						placeholderTextColor="#93a2ba" 
						onChangeText={(text) => setNewPassword(text)}>
					</TextInput>
				</View>
			</View>

			<View style={styles.resetButton}>
				<Button style={styles.button} borderRadius={30} onPress={resetPasswordHandler}>
					<ButtonText>Reset</ButtonText>
				</Button>
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
	resetForm: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
        paddingTop: 100
	},
	resetButton: {
		flexDirection: 'column',
		alignItems: 'center',
		gap: 20,
	},
	button: {
		height: 50,
		width: 150,
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

})
