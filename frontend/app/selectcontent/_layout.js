// Expo imports.
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Custom header for the SelectContent screen.
 * @returns The custom header as a slot.
 */
export default function SelectContentLayout(){
	return(
		<>
			<StatusBar style="light"/>
			<Slot/>
		</>
	);
}
