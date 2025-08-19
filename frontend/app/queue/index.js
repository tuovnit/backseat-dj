import React, { useState, useEffect } from 'react';

// Native imports.
import { AppState, Dimensions, Modal, Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect, useRoute } from '@react-navigation/native';

// Router imports.
import { Link } from 'expo-router';
import { router } from 'expo-router';

// Gluestack imports.
import { config } from '@gluestack-ui/config';
import { AddIcon, Button, ButtonText, ButtonIcon, GluestackUIProvider, Image, Spinner } from '@gluestack-ui/themed';

// Component imports.
import GLOBAL, { roomCode } from "../global"
import SOCKET from "../socket";
import SongListItem from '../../components/queue/SongListItem';


// Globals
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const scrollViewHeight = ((0.65) * windowHeight);
var globalRoomID;

/*
*	Queue - screen for viewing the currently queued songs.
*/
export default function Queue() {
	// Route paramters
	const route = useRoute()
	const userID = route.params?.userID
	const userName = route.params?.userName
	const host = GLOBAL.host
	
	// States
	const [queue, setQueue] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [fetchingSettings, setFetchingSettings] = useState(true);
	const [sessionConnectorVisible, setSessionConnectorVisible] = useState(false);
	const [service, setService] = useState(null);
	const [roomId, setRoomId] = useState(null);
	const [songVoting, setSongVoting] = useState(false);
	const [updated, setUpdated] = useState(false)

	useFocusEffect(
		React.useCallback(() => {
			setIsLoading(true);
			setFetchingSettings(true);
			handleGetRoomInfo();
			fetchQueue();
			setUpdated(false)
		}, [updated])
	);

	useEffect(() => {
		SOCKET.socket.on('refreshQueue', (test) => {
			console.log(test)
			console.log("In refresh queue")
			//fetchQueue();
			setUpdated(true)
		})
	}, [])

	useEffect(() => {
		SOCKET.socket.on('kickingAnimal', (kickedID) => {
			console.log("KICKING ID: ", kickedID)
			
			//fetchQueue();
			setUpdated(true)
			console.log(roomId)
			console.log(GLOBAL.roomID)
			console.log(globalRoomID)
			console.log((roomId == GLOBAL.roomID))
			if((userID==kickedID) && (GLOBAL.roomID)){
				//socket.leave(roomCode)
				SOCKET.socket.close()
				//socket.emit("leaveRoom", GLOBAL.userID);
				Alert.alert('Kicked',
					`You have been kicked from the room.`,
					[
						
						{
							text: 'OK',
						}
					]);
				router.push({pathname: "/welcome", params: {userID: GLOBAL.userID, userName: GLOBAL.username}});
				
			}
		})
	}, [])
	useEffect(() => {
		SOCKET.socket.on('roomClosed', (roomID) => {
			
			//fetchQueue();
			setUpdated(true)
			console.log("Received room closed in roomID: ", roomID)
			console.log("userID: ", userID, "stateroomId: ",roomId, "kickedID: ",)
			//console.log(userID == kickedID)
			//console.log(kickedID == userID)
			//(kickedID == userID) &&
			if( (!roomId)){
				//socket.leave(roomCode)
				SOCKET.socket.disconnect()
				
				//socket.emit("leaveRoom", GLOBAL.userID);
				Alert.alert('Room Closed',
					`This room has closed.`,
					[
						
						{
							text: 'OK',
						}
					]);
				router.push({pathname: "/welcome", params: {userID: GLOBAL.userID, userName: GLOBAL.username}});
				
			}
		})
	}, [])

	useEffect(() => {
		if (service == "spotify"){
			connectSpotify();
		}
	}, [fetchingSettings])
	
	const connectSpotify = async () => {
		await fetch(`${baseUrl}/spotify/state`)
			.then(response => response.json())
			.then(result => {
				if (result != null || result != undefined){
					if (result.active == true){
						const device = result.device_id;
						console.log("device is ", device)
						updateActiveDevice(device);
						fetchQueue()
						setSessionConnectorVisible(false);
					}else{
						console.log("no active device found")
						setSessionConnectorVisible(true);
					}
				}else {
					setSessionConnectorVisible(true);
				}
			})
			.catch((error) => {
				// console.error("spotify connect", error);
				setSessionConnectorVisible(true);
			});
	}

	const updateActiveDevice = async (device_id) => {
		return fetch(`${baseUrl}/spotify/playback`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				deviceID: device_id,
			})
		}).then(result => result.json())
		.then(response => console.log(response));
	}

	// Gets current room queue
	const fetchQueue = async () => {
		SOCKET.socket.emit("getQueue", userID, async (queue) => {
			console.log("Queue:", queue);
			if (queue != undefined || queue != null){
				setIsLoading(true)
				setQueue(queue["queue"].queue);
				setIsLoading(false);
			}else {
				setIsLoading(true)
				setQueue([]);
				setIsLoading(false);
			}
		})
	}

	// Opens modal to get user to connect to spotify
	const handleCloseModalOnCancel = () => {
		setSessionConnectorVisible(false);
		fetchQueue()
	}

	var id = 0;
	const handleGetRoomInfo = async () => {
		//console.log("User id: ",userID)
		const idUrl = `${baseUrl}/room/getRoomID?userID=${userID}`;
		var roomId_ = 0
		await fetch(idUrl)
			.then(result => result.json())
			.then(data => {
				console.log("Get room id result: ",data)
				setRoomId(data.roomId)
				
				roomId_ = data.roomId
			})
			.catch(error => {
				console.error('Error:', error);
			  });
		console.log("SETTING global room id: ")
		GLOBAL.roomID = roomId_  
		globalRoomID = roomId_
		console.log(GLOBAL.roomID)
		console.log(globalRoomID)
		const settingsUrl = `${baseUrl}/room/getSettings?roomId=${roomId_}`;
		await fetch(settingsUrl)
			.then(result => result.json())
			.then(data => {
				//console.log(data)
				setService(data.streamingService)
				setSongVoting(data.songVoting)
				setFetchingSettings(false);
			})
			.catch(error => {
				console.error('Error:', error);
			  });
	};

	return (
		<GluestackUIProvider config={config}>
			<View style={styles.main}>

				<Text style={styles.pageTitle}>Song Queue</Text>

				<SessionConnector isVisible={service == "spotify" ?  sessionConnectorVisible : false} handleCancel={handleCloseModalOnCancel}/>

				<ScrollView style={styles.scrollView}>
					<View style={styles.scrollViewItems}>
						{isLoading ? 
						<GluestackUIProvider config={config}>
							<View style={styles.loading}>
								<Spinner size="large" color="$white"/>
							</View>
						</GluestackUIProvider>	
						:
						(queue.length != 0 ? 
							<GluestackUIProvider config={config}>
								{queue.map((song) => (
									<SongListItem 
									key={song.id}
									style={styles.songList} 
									song={song}
									voteCount={song.vote_count} 
									vote={songVoting} 
									host={host} 
									addedBy={song.added_by}
									refreshQueue={fetchQueue}
									/>
								))}
							</GluestackUIProvider>
						:
						<GluestackUIProvider config={config}>
							<View style={styles.emptyQueueDialog} >
								<Text style={styles.emptyQueueText} >
									There are currently no songs in the queue.
									{"\n"}
									Add songs to start playing!
								</Text>
							</View>
						</GluestackUIProvider>)
						}
					</View>
				</ScrollView>

				{/* Scuffed... TODO: Add and sync animations for when we have song data */}
				<View style={styles.bottomControls} >
					{/* <Link href="/player" asChild>
						<Pressable>
							<Image
								size="xs"
								source={
									require("../../assets/audio-wave.gif")
								}
								alt='Audio Wave'
								borderRadius={20}
							/>
						</Pressable>
					</Link> */}

					<Link reload href={{ pathname: "/player", params: { userID: userID, userName: userName, service: service, host: host}}} asChild>
						<Button style={styles.addSongButton} bg="white">
								<Image
									size="xs"
									source={
										require("../../assets/audio-wave.gif")
									}
									alt='Audio Wave'
									role='button'
								/>
							<ButtonText color="black">Currently Playing</ButtonText>
						</Button>
					</Link>

					<Link href={{ pathname: "/addsong", params: { userID: userID, userName: userName, service: service, roomId: roomId }}} asChild>
						<Button style={styles.addSongButton} bg="#057602">
							<ButtonText color="white">Add Song</ButtonText>
							<ButtonIcon as={AddIcon} color="white" size="xl"/>
						</Button>
					</Link>
				</View>
			</View>
		</GluestackUIProvider>
		);
	}


function SessionConnector({isVisible, handleCancel}) {
	const [isLoading, setIsLoading] = useState(false);
	const [visible, setVisible] = useState(false);

	// Handles refresh on appstate changes
	useEffect(() => {
		const sub = AppState.addEventListener('change', nextAppState => {
			if (nextAppState === 'active'){
				fetchQueue()
			}
		})
		return () => {
			sub.remove()
		}
	}, [])

	// Fetches the queue from spotify (if active) and automatically merges it into app queue
	const fetchQueue = async () => {
		await fetch(`${baseUrl}/spotify/queue`)
		.then(response => response.json())
		.then(result => {
			if (result.error === null){
				setIsLoading(false);
				handleCancel()
			}else {
				setIsLoading(false);
			}
		})
		.catch(error => {
			console.error(error);
			setIsLoading(false);
		});
	}

	// Assists with opening the help page
	const handleOpenHelp = () => {
		handleCancel();
	}

	// Attempts to connect to spotify queue when refresh button pressed
	const handleRetry = () => {
		setIsLoading(true);
		fetchQueue();
	}

	return (
		<Modal animationType='slide' transparent={true} visible={isVisible}>
			<View style={modalStyles.popup} >
				<View style={modalStyles.titleContainer}>
					<Text style={modalStyles.title}>Connecting to Spotify Session</Text>
				</View>
				<View style={modalStyles.mainContent}>
					{isLoading ? 
					<Spinner size="large"/> :
					<GluestackUIProvider config={config}>
						<View style={modalStyles.error}>
							<Text>Could not find session</Text>
							<Button
							size="md"
							variant="fill"
							action="primary"
							isDisabled={false}
							isFocusVisible={false}
							onPress={handleRetry}
							>
								<ButtonText>Retry</ButtonText>
							</Button>
						</View>
					</GluestackUIProvider>
				}
				</View>
				<View style={modalStyles.messageContent}>
					<Pressable>
						<Link href="/help" onPress={handleOpenHelp}>
							<Text style={modalStyles.hint}>Don't see your Spotify session?</Text>
						</Link>
					</Pressable>
				</View>
				<View style={modalStyles.modalOptions}>
					<GluestackUIProvider config={config}>
						<Button
						size="md"
						variant="outline"
						action="primary"
						isDisabled={false}
						isFocusVisible={false}
						onPress={handleCancel}
						>
							<ButtonText>Cancel</ButtonText>
						</Button>
					</GluestackUIProvider>
				</View>
			</View>
		</Modal>
	)
}

const contentWidth = windowWidth * 0.90;
const modalPosY = windowHeight * 0.4;
const modalPosX = windowWidth * 0.05;

const modalStyles = StyleSheet.create({
	popup:{
		backgroundColor: 'white',
		width: contentWidth,
		position: 'absolute',
		top: modalPosY,
		left: modalPosX, 
		borderRadius: 15,
		display: 'flex',
		flexDirection: 'column',
		flexGrow: 1,
		justifyContent: 'space-evenly'
	},
	titleContainer: {
		height: 35,
		alignItems: 'center',
		borderBottomColor: 'black',
		borderBottomWidth: 1
	},
	title: {
		color: 'black',
		fontSize: 18,
		paddingTop: 5,
		paddingBottom: 5
	},
	mainContent: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		paddingTop: 10,
		paddingBottom: 10
	},
	messageContent: {
		height: 'auto',
		borderBottomColor: 'black',
		borderBottomWidth: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 5,
		paddingBottom: 5
	},
	hint: {
		color: 'blue'
	},
	modalOptions: {
		height: 50,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		flexGrow: 1,
		alignItems: 'center'
	},
	error: {
		display: 'flex',
		flexDirection: 'column',
		maxWidth: '50%',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 10
	}
})

// Style sheet
const styles = StyleSheet.create({
	main:{
		backgroundColor: '#282B30',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		gap: 5,
		flexGrow: 1,
	},
	text:{
		color: '#F2F0F0',
		padding: 10,
	},
	button: {
		marginStart: 10,
		marginEnd: 10,
	},
	pageTitle:{
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 30,
		marginBottom: '5%',
		marginTop: '5%',
	},
	scrollView:{
		maxHeight: scrollViewHeight,
	},
	scrollViewItems: {
		gap: 5,
	},
	addSongButton: {
		borderWidth: 1,
		borderColor: 'black',
		borderRadius: 50,
		gap: 5,
		minHeight: 50,
	},
	bottomControls: {
		flexGrow: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '10',
		maxHeight: '15%'
	},
	emptyQueueDialog: {
		flexDirection: 'column',
		justifyContent: 'center',
		borderColor: '#F2F0F0',
		borderWidth: 1,
		borderRadius: 10,
		minWidth: '85%',
		minHeight: 75,
	},
	emptyQueueText: {
		color: '#F2F0F0',
		textAlign: 'center',
		fontSize: 16,
	},
	loading: {
		display: "flex",
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: '85%',
		minHeight: scrollViewHeight,
	}
})