// Expo imports.
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Component imports.
import Header from '../../components/Header';

/**
 * Custom header for the CreateRoom screen.
 * @returns The custom header as a slot.
 */
export default function CreateRoomLayout(){
	return(
		<>
			<StatusBar style="light"/>
			<Slot/>
		</>
	);
}
