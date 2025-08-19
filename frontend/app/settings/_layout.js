// Expo imports.
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Component imports.
import Header from '../../components/Header';

/**
 * Custom header for the Settings screen.
 * @returns The custom header as a slot.
 */
export default function SettingsLayout(){
	return(
		<>
			<StatusBar style="light"/>
			<Slot/>
		</>
	);
}