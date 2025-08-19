import React, { useState } from 'react';

// Native imports.
import { Text, View, StyleSheet } from 'react-native';

// Expo imports.
import { Fontisto } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

// Gluestack imports.
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

// Local imports.
import GLOBAL from '../global';

// Global variables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

// Another Page component export.
export default function ConnectServices() {
	// States.
	const [accessToken, setAccessToken] = useState(null);

	const handleSpotifyLogin = async () => {
		const authorizeUrl = `${baseUrl}/spotify/${GLOBAL.userID}/spotify-auth`
		// const authorizeUrl = 'http://172.16.0.8:3000/spotify/spotify-auth'

		console.log(authorizeUrl);

		// Better web browser launcher
		let auth = await WebBrowser.openAuthSessionAsync(authorizeUrl, 'Backseat-DJ://');
		console.log(auth);
		// Open the Spotify authorization page in a web browser
		// Linking.openURL(authorizeUrl);

	};

	return (
		<GluestackUIProvider config={config}>
			<View style={styles.darkBackground}>

				{/* Title Container */}
				<View style={styles.titleContainer}>
					<Text style={styles.titleText}>Connect</Text>
					<Text style={styles.titleText}>Streaming Services</Text>
				</View>

				{/* Connect Service Buttons */}
				<View style={styles.buttonContainer}>
					{/* <Fontisto.Button style={styles.button} borderRadius={30} backgroundColor={"#1DB954"} name="spotify" onPress={() => spotifyLogIn()}>
						<Text style={styles.buttonText}>Spotify</Text>
					</Fontisto.Button> */}

					{/* Connect Service Buttons */}
					<View style={styles.buttonContainer}>
						<Fontisto.Button style={styles.button} borderRadius={30} backgroundColor={"#1DB954"} name="spotify" onPress={handleSpotifyLogin}>
							<Text style={styles.buttonText}>Spotify</Text>
						</Fontisto.Button>

						<Fontisto.Button style={styles.button} borderRadius={30} backgroundColor={"#69a6f9"} name="applemusic" onPress={() => spotifyLogIn()}>
							<Text style={styles.buttonText}>Apple Music</Text>
						</Fontisto.Button>

						<Fontisto.Button style={styles.button} borderRadius={30} backgroundColor={"#c3352e"} name="youtube-play" onPress={() => spotifyLogIn()}>
							<Text style={styles.buttonText}>Youtube Music</Text>
						</Fontisto.Button>
					</View>
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
	titleText: {
		flexDirection: 'row',
		justifyContent: 'center',
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 25,
	},
	titleContainer: {
		flexDirection: 'column',
		alignItems: 'center',
		margin: 30,
	},
	button: {
		height: 50,
		width: 275,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonText: {
		color: 'white',
	},
	buttonContainer: {
		flexDirection: 'column',
		alignItems: 'center',
		marginTop: 40,
		gap: 40,
	},
})