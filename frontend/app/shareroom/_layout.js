// Expo imports.
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Components imports.
import Header from '../../components/Header';

/**
 * Custom header for the ShareRoom screen.
 * @returns The custom header as a slot.
 */
export default function ShareRoomLayout(){
	return(
		<>
			<StatusBar style="light"/>
			<Slot/>
		</>
	);
}