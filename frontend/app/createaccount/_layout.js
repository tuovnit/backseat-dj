// Expo imports.
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Component imports.
import Header from '../../components/Header';

/**
 * Custom header for the CreateAccount screen.
 * @returns The custom header as a slot.
 */
export default function CreateAccountLayout(){
	return(
		<>
			<StatusBar style="light"/>
			<Slot/>
		</>
	);
}