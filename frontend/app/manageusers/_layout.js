// Expo imports.
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Component imports.
import Header from '../../components/Header';

/**
 * Custom header for the ManageUsers screen.
 * @returns The custom header as a slot.
 */
export default function ManageUsersLayout(){
	return(
		<>
			<StatusBar style="light"/>
			<Slot/>
		</>
	);
}
