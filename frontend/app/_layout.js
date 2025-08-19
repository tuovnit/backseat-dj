// Native imports.
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger } from 'react-native-popup-menu'

// Expo imports.
import { Link, Stack, router } from 'expo-router';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons';

// Local imports.
import GLOBAL, { userID } from './global';
import { socket } from './socket';

/**
 * Custom MenuOption object that takes you to the ManageRoom screen.
 * @param {*} props
 * @returns A ManageOption object.
 */
const ManageOption = (props) => (
	<MenuOption onSelect={() => router.push({ pathname: "/manageroom", params: {userID: GLOBAL.userID, userName: GLOBAL.username} })} value={props.value} text={'\u{1F6E0}  ' + props.text} />
);

/**
 * Custom MenuOption object that takes you to the Profile screen.
 * @param {*} props
 * @returns A ProfileOption object.
 */
const ProfileOption = (props) => (
	<MenuOption onSelect={() => router.push("/profile")} value={props.value} text={'\u{1F464}  ' + props.text} />
);

/**
 * Custom MenuOption object that takes you to the Settings screen.
 * @param {*} props
 * @returns A SettingOption object.
 */
const SettingOption = (props) => (
	<MenuOption onSelect={() => router.push("/settings")} value={props.value} text={'\u{2699}  ' + props.text} />
);

/**
 * Custom MenuOption object that takes you to the welcome or login screen after leaving a room.
 * @param {*} props
 * @returns A LeaveOption object.
 */
const LeaveOption = (props) => (
    <MenuOption onSelect={() => {
		if (GLOBAL.guest === false) {
			router.replace({ pathname: "/welcome", params: {userID: GLOBAL.userID, userName: GLOBAL.username} }); 
			socket.emit("leaveRoom", GLOBAL.userID); 
		}
		else {
			console.log("Global fields: ", GLOBAL.userID, GLOBAL.username, GLOBAL.userEmail);
			socket.emit("leaveRoom", GLOBAL.userID);
			GLOBAL.userID = "";
			GLOBAL.username = "";
			GLOBAL.userEmail = "";
			router.replace({pathname: "/login"});
		}
		// router.push({pathname: "/welcome", params: {userID: GLOBAL.userID, userName: GLOBAL.username}}); socket.emit("leaveRoom", GLOBAL.userID); 
	}} 
	value={props.value} text={'\u{274C}  ' + props.text} />
);

// The width and height of the screen.
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

/**
 * Custom header for the overall app.
 * @returns The custom header.
 */
export default function HomeLayout() {
	return (
		<>
			<MenuProvider>
				{/* Overall header options. */}
				<Stack
					screenOptions={{
						headerStyle: {
							backgroundColor: "#282B30"
						},
						headerTintColor: "#F2F0F0",
						headerTitle: "",
						headerShadowVisible: false
					}} >

					{/* Login screen header options. */}
					<Stack.Screen name="login" options={{
						headerBackVisible: false,
						gestureEnabled: false
					}} />

					{/* Welcome screen header options. */}
					<Stack.Screen name="welcome" options={{
						headerBackVisible: false,
						gestureEnabled: false,
						headerRight: () => (
							<Pressable>
								<Link href="/profile" asChild>
									<Ionicons name="person-circle-outline" size={40} color="#F2F0F0" />
								</Link>
							</Pressable>
						)
					}} />

					{/* Scan screen header options. */}
					<Stack.Screen name="scan" options={{}} />

					{/* CreateRoom screen header options. */}
					<Stack.Screen name="createroom" options={{}} />

					{/* SelectContent screen header options. */}
					<Stack.Screen name="selectcontent" options={{}} />

					{/* Help screen header options. */}
					<Stack.Screen name="help" options={{}} />

					{/* Queue screen header options. */}
					<Stack.Screen name="queue" options={{
						headerBackVisible: false,
						gestureEnabled: false,
						headerRight: () => (
							<Menu>
								<MenuTrigger>
									<SimpleLineIcons name="menu" size={24} color="#F2F0F0" />
								</MenuTrigger>
								<MenuOptions customStyles={optionsStyles}>
									<ScrollView style={{ maxHeight: windowHeight * 0.4 }} >
										{GLOBAL.host && <ManageOption text='Manage Room' />}
										<ProfileOption text='Profile' />
										<SettingOption text='Settings' />
										<LeaveOption text='Leave Room' />
									</ScrollView>
								</MenuOptions>
							</Menu>
						)
					}} />

					{/* AddSong screen header options. */}
					<Stack.Screen name="addsong" options={{
						headerRight: () => (
							<Pressable>
								<Link href="/profile" asChild>
									<Ionicons name="person-circle-outline" size={40} color="#F2F0F0" />
								</Link>
							</Pressable>
						)
					}} />

					{/* Profile screen header options. */}
					<Stack.Screen name="profile" options={{}} />
					<Stack.Screen name="roomhistory" options={{}} />
					<Stack.Screen name="settings" options={{}} />

					{/* ConnectServices screen header options. */}
					<Stack.Screen name="connectservices" options={{}} />

					{/* CreateAccount screen header options. */}
					<Stack.Screen name="createaccount" options={{}} />
					<Stack.Screen name="summary" options={{}} />
					<Stack.Screen name="player" options={{}} />

					{/* ShareRoom screen header options. */}
					<Stack.Screen name="shareroom" options={{}} />

				</Stack>
			</MenuProvider>
		</>
	);
}

// Stylesheets for the custom header.
const styles = StyleSheet.create({
	root: {
		backgroundColor: '#282B30',
		flexDirection: 'column',
		flexGrow: 1
	},
});

const optionsStyles = {
	optionsContainer: {
		backgroundColor: '#424549'
	},
	optionWrapper: {
		padding: 25
	},
	optionText: {
		color: '#F2F0F0'
	}
}