import React, { useEffect, useState } from 'react';

// Native imports.
import { Text, View, StyleSheet, Dimensions, Alert } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';

// Expo imports.
import { Link } from 'expo-router';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

// Gluestack imports.
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider, HStack, Pressable, Spinner, VStack } from '@gluestack-ui/themed';

// Local imports.
import { socket } from "../socket";

// Global variables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
import SOCKET from "../socket"
import GLOBAL from "../global"

const windowWidth = Dimensions.get('window').width;
const listItemWidth = (0.85) * windowWidth;

/*
*	ManageRoom - screen for managing the current room of the host.
*/
export default function ManageRoom() {
	const route = useRoute()
	const userID = route.params?.userID
	const userName = route.params?.userName

	const [roomCode, setRoomCode] = useState("");
	const [roomID, setRoomID] = useState("");
	const [partyAnimals, setPartyAnimals] = useState("");
	const [colorList, setColorList] = useState("");
	const [loadingRoomCode, setLoadingRoomCode] = useState(false);
	const [loadingRoomID, setLoadingRoomID] = useState(false);
	const [loadingPartyAnimals, setLoadingPartyAnimals] = useState(true);
	const [updated, setUpdated] = useState(false)
	
	useFocusEffect( 
		React.useCallback((manageroom) => {
		fetchRoomCode(userID)
		fetchRoomID(userID)
		fetchPartyAnimals()
		setUpdated(false)
	}, [updated])
	);

	useEffect(() => {
		SOCKET.socket.on('refreshAnimals', (test) => {
			//console.log(test)
			//console.log("In refresh manageroom")
			//fetchQueue();
			setUpdated(true)
		})
	}, [])
	const deleteRoomAlert = async () => {
		Alert.alert('Delete Room?',
					`You are about to delete this room. Do you want to continue?`,
					[
						{
							text: 'Cancel',
							style: 'cancel',
						},
						{
							text: 'OK',
							onPress: handleDeleteRoom,
						}
					]);
	}
	const handleDeleteRoom = () => {
		SOCKET.socket.emit("deleteRoom", roomID, roomCode); 
	}
	const fetchRoomCode = async (user_id) => {
		setLoadingRoomCode(true);
		await fetch(`${baseUrl}/room/code/${userID}`)
		.then(result => result.json())
		.then((data) => {
			if (data.status == 200){
				setRoomCode(data.code);
				setLoadingRoomCode(false);
			}
		}).catch(err => console.error(err));
	}
	const fetchRoomID = async (user_id) => {
		setLoadingRoomID(true);
		//console.log("Fetching room id")
		await fetch(`${baseUrl}/room/getRoomID?userID=${userID}`)
		.then(result => result.json())
		.then((data) => {
			console.log("Get room id result: ",data)
				setRoomID(data.roomId);
				setLoadingRoomID(false);
				//console.log("id: ", data)
			
		}).catch(err => console.error(err));
	}
	const fetchPartyAnimals = async() => {
		const roomID = GLOBAL.roomID
		setLoadingPartyAnimals(true);
		console.log("Getting animal list from room: ", roomID, loadingRoomID)
			await fetch(`${baseUrl}/room/getAnimals/${roomID}`)
				.then(result => result.json())
				.then(data => {
					if (data.status == 200){
				//	console.log("Connected Users: ", data.partyAnimalList)
					setPartyAnimals(data.partyAnimalList)
					//partyAnimalsGlobal = ["john", "bob", "cat"]
					setLoadingPartyAnimals(false);
					
				
					}
				})
				.catch(error => {
					console.error('Error:', error);
				  });
	}
	return (
		<GluestackUIProvider config={config}>
			<View style={styles.darkBackground}>

				<Text style={styles.pageTitle}>Manage Room</Text>
				<View style={styles.roomCodeDisplay}>
					<Text style={styles.text}>Room Code:</Text>
					{loadingRoomCode ? 
						<Spinner style={styles.roomCodeText} size="small" color="$white"/>
						:
						<Text style={styles.roomCodeText}>{roomCode}</Text>
					}
				</View>
				<Text style={styles.text}>Party Animals</Text>
				{loadingPartyAnimals ? 
				<Spinner style={styles.roomCodeText} size="small" color="$white"/>
				:
				<Link reload href={{ pathname: "/manageusers", params: {  partyAnimals: JSON.stringify(partyAnimals), hostID: userID}}} asChild>
					<Pressable bg="#424549" width={listItemWidth/1.2} borderRadius={30}
								alignItems="center"
								sx={{ ":hover": { bg: "#6e737a" }, ":active": { bg: "#6e737a" } }}>
						{loadPartyAnimals(partyAnimals)}
					</Pressable>		
				</Link>
				}
				<View style={{
					padding: 20, gap: 10
				}}>

					<VStack space="2xl" paddingBottom="$5">
						<Link href={{ pathname: "/createroom", params: {userID: userID,  roomExists: true}}} asChild>
							<Pressable bg="#424549" width={listItemWidth} borderRadius={30}
								sx={{ ":hover": { bg: "#6e737a" }, ":active": { bg: "#6e737a" } }}
							>
								<HStack space="md" justifyContent="space-between" alignItems="center" padding="$5">
									<HStack space="xs" alignItems="center">
										<AntDesign name="setting" size={30} color="white" />
										<Text style={styles.buttonText}> Settings </Text>
									</HStack>
									<AntDesign name="rightcircle" size={24} color="white" />
								</HStack>
							</Pressable>
						</Link>
					</VStack>

					<VStack space="2xl" paddingBottom="$5">
						<Link href={{ pathname: "/shareroom", params: { roomCode: roomCode } }} asChild>
							<Pressable bg="#009500" width={listItemWidth} borderRadius={30}
								sx={{ ":hover": { bg: "#00ef00" }, ":active": { bg: "#00ef00" } }}
							>
								<HStack space="md" justifyContent="space-between" alignItems="center" padding="$5">
									<HStack space="xs" alignItems="center">

										<Text style={styles.buttonText}> Share Room </Text>
									</HStack>
									<AntDesign name="rightcircle" size={24} color="white" />
								</HStack>
							</Pressable>
						</Link>
					</VStack>
					<VStack space="2xl" paddingBottom="$10">
						
							<Pressable bg="#b70000" width={listItemWidth} borderRadius={30}
								onPress={deleteRoomAlert}
								sx={{ ":hover": { bg: "#ff0a0a" }, ":active": { bg: "#ff0a0a" } }}
							>
								<HStack space="md" justifyContent="space-between" alignItems="center" padding="$5">
									<HStack space="xs" alignItems="center">
										<Text style={styles.buttonText}> Delete Room </Text>
									</HStack>
								</HStack>
							</Pressable>
						
					</VStack>
				</View>

			</View>
		</GluestackUIProvider>
	);
	/*
 Displays icons for connected party animals, capped at 3. If there are none connected, 
 displays an rectangle with a message.
*/
function loadPartyAnimals(pAnimals) {
	if (pAnimals.length == 0) {
		return (
			<View style={styles.darkBackground}>
				<Text style={styles.roomText}>No Connected Party Animals</Text>
				<View style={styles.rectangle} />
			</View>
		);
	}
	else {
		const colors=["#e76f51", "#e9c46a", "#8ac926", "#00b4d8", "red", "green", "blue", "orange"]
		if(colorList == ''){
			
			var colorList_ = [];
			while(colorList_.length < 3){
				var r = Math.floor(Math.random() * 8);
				if(colorList_.indexOf(r) === -1) colorList_.push(r);
			}
			setColorList(colorList_)
		}
		var partyAnimalInitials = []
		var i = 0
		//console.log(colorList)
		pAnimals.map((animal)=>{
			if(i<3){
				const id = animal.name[0]
				const color = colors[colorList[i]];
				partyAnimalInitials.push({id, color})
				i++
			}
		}
		)
		if(pAnimals.length > 3){ //Add plus x icon
			const id = `+${pAnimals.length-3}`
			const color = 'grey'
			partyAnimalInitials.push({id, color})
		}
		const initialsIcons = partyAnimalInitials.map(initial => <InitialIcon initials = {initial.id} color = {initial.color} key = {initial.id} />)
		return(
		<HStack space="none" reversed={false} paddingVertical={7} height={65}>
			{initialsIcons}
		</HStack>
	)};
}
}



/*
Dummy list of connected party animals.
*/

const partyAnimalList = [
 { name: "Patrick Star"},
 { name: "Eugene Krabs"},
 { name: "Michael Jackson"},
 { name: "Jim De St Germain"},
 { name: "Tracy"}
]

/*
Dummy list that contains the initials of connected party animals. Once 3 initials have been added, the next initial
should be "+x" where x is the number of connected party animals minus the first 3. Currently, conversion from
the list of party animals to this list of their initials isn't supported
*/
/*
const partyAnimalInitials = [
	{id: "PS", color: "#e76f51"},
	{id: "EK", color: "#00b4d8"},
	{ id: "MJ", color: "#e9c46a"},
	{ id: "+1", color: "grey"},
]

/*
Component for displaying a user's initials within an icon.
*/
const InitialIcon = ({ initials, color }) => {
	return (
		<View
			style={[styles.icon, { backgroundColor: color }]}>
			<Text style={{ color: 'white', fontSize: 25 }}>{initials}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	darkBackground: {
		backgroundColor: '#282B30',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 20,
		flex: 1,
	},
	iconContainer: {
		flexDirection: 'row',
		justifyContent: 'left',
		alignItems: 'center',

		//Padding and margins
		marginStart: 100,
		marginEnd: 50,

		// Dimensions
		width: 50,
		height: 50,
	},
	icon: {
		flexDirection: 'row',
		backgroundColor: '#057602',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 30,
		marginStart: -12,
		width: 50,
		height: 50,
		marginBottom: 10,
	},
	rectangle: {
		width: 100 * 2,
		height: 75,
		borderColor: 'white',
		borderWidth: 5,
		backgroundColor: '#282B30',
		paddingHorizontal: 150,
		zIndex: 50,
	},
	pageTitle: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 30,
		marginBottom: '5%',
		marginTop: '5%',
	},
	text: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 20,
		flexDirection: 'row',
		alignItems: 'center',
		//marginTop: opened ? 175 : 20,
		//marginStart: 0,
		//marginEnd: 50,
		marginBottom: -10,
		padding: 10,
		zIndex: 100,
	},
	roomText: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 15,
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10,
		marginBottom: -70,
		//marginTop: opened ? 175 : 20,
		//marginStart: 0,
		//marginEnd: 50,
		padding: 10,
		zIndex: 100,
	},
	button: {
		borderRadius: 30,
		marginStart: 0,
		marginEnd: 0,
		marginTop: 10,
		marginBottom: 0,
		width: 200,
		padding: 0,
	},
	buttonText: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 15,
	},
	roomCodeDisplay: {
		height: 75
	},
	roomCodeText: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 20,
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: -10,
		padding: 10,
		marginBottom: 10,
		zIndex: 100,
		textAlign: 'center'
	}
})