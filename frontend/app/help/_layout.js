// Expo imports.
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Custom header for the HelpLayout screen.
 * @returns The custom header as a slot.
 */
export default function HelpLayout(){
	return(
		<>
			<StatusBar style="light"/>
			<Slot/>
		</>
	);
}