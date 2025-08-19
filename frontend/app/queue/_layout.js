// Expo imports.
import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Component imports.
import Header from '../../components/Header';

/**
 * Custom header for the QueueLayout screen.
 * @returns The custom header as a slot.
 */
export default function QueueLayout(){
	return(
		<>
			<StatusBar style="light"/>
			<Slot/>
		</>
	);
}
