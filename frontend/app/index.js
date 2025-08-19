import React from 'react';

// Native imports.
import { StyleSheet } from "react-native";

// Expo imports
import { Redirect, SplashScreen } from "expo-router";

// Component imports
import { Header } from "../components/Header"
import { SongListItem } from "../components/queue/SongListItem"

SplashScreen.preventAutoHideAsync();

/**
 * Main app function.
 * @returns The main function of the app.
 */
export default function App() {
	// Handles Splash screen display with timeout.
	// NOTE: Only the timeout is being used because no data has to be loaded during this
	// time. Adjust timeout to display splash screen for longer when reloading app. 
	const [isReady, setReady] = React.useState(false);
	React.useEffect(() => {
		// Perform some sort of async data or asset fetching.
		setTimeout(() => {
			// When all loading is setup, unmount the splash screen component.
			SplashScreen.hideAsync();
			setReady(true);
		}, 1000);
	}, []);

	return (
		<Redirect href="/login"/>
	);
}

// Stylesheet for the overall app.
const styles = StyleSheet.create({
	darkBackground: {
		justifyContent: 'center',
		alignItems: 'center',
		gap: 10
	},
	text: {
		color: '#F2F0F0',
		padding: 10
	},
	button: {
		marginStart: 10,
		marginEnd: 10
	}
});