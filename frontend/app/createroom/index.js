import React, { useState, useEffect } from 'react';

// Native imports.
import { Text, View, StyleSheet, Switch, Dimensions, Linking, Modal} from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { useRoute } from '@react-navigation/native';

// Expo imports.
import { router } from "expo-router";
import { Fontisto, AntDesign } from "@expo/vector-icons";

// Gluestack imports.
import { GluestackUIProvider, Pressable, HStack} from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

// Local imports.
import GLOBAL from "../global"
import SOCKET from "../socket";
import { io } from "socket.io-client";

// Global variables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const listItemWidth = (0.85) * windowWidth;
const scrollViewHeight = ((0.65) * windowHeight);

// Another Page component export
export default function CreateRoomSettings() {
	const route = useRoute();
	const userID = route.params?.userID;
	const userName = route.params?.userName;
	const roomExists = route.params?.roomExists;
	const [allowAnyCode, setValue] = useState(false);
	const [allowExplicitContent, setValue2] = useState(true);
	const [allowSongVoting, setValue3] = useState(true);
	const [streamingService, setStreamingService] = useState(null);
	const onValueChange = value => { setValue(value) };
	const onValueChange2 = value2 => { setValue2(value2) };
	const onValueChange3 = value3 => { setValue3(value3) };
	const [serviceSelectorVisible, setServiceSelectorVisible] = useState(roomExists);
	
	const [open, setOpen] = useState(false);
	const [valueGenres, setValues] = useState([]);
	const [openTimes, setOpenTimes] = useState(false);
	const [valueTimes, setValuesTimes] = useState(null);
	const [itemsTimes, setItemsTimes] = useState(timeList);	
	const [loading, setLoading] = useState(true);
    const [disablePicker, setDisable] = useState(true);
    const disablePickerChange = value4 => { setDisable(value4) };

	const handleCreateRoom = async () => {
		postRoomSettings();

		GLOBAL.host = true;
	}

	const postRoomSettings = async () => {
		const roomSettings = { filteredGenres: valueGenres.join(),
			explicit: allowExplicitContent,
			durationFilter: valueTimes,
			anyRoomCode: allowAnyCode,
			songVoting: allowSongVoting,
			streamingService: streamingService
		}
		
		if(roomExists=='false'){
			SOCKET.socket = io(`${process.env.EXPO_PUBLIC_BASE_URL}`, {
				autoConnect: false
			});
			SOCKET.socket.connect()
			SOCKET.socket.emit("createRoom", userID, userName, roomSettings, streamingService, (result) => {
				console.log("Result: ", result)
				if (result.status == 200){
					streamingService === "spotify" ? router.push({ pathname: '/queue', params: {userID: userID, userName: userName} }) : router.push({ pathname: '/queue', params: {userID: userID, userName: userName} }) 
				}
			})
		}else{
			
			SOCKET.socket.emit("updateSettings", userID, roomSettings, (result) => {
				console.log("Result: ", result)
				if (result.status == 200){
					router.push({ pathname: '/manageroom', params: {userID: userID, userName: userName} })  
				}
			})
		}
    }

	// Fetches the spotify genre list
	const handleGetGenre = async (streamingService) => {
		console.log("getting genre ", streamingService)
		if(genreList.length==0){
		const url = `${baseUrl}/${streamingService}/getGenres`;
		await fetch(url)
			.then(result => result.json({  }))
			.then(data => {
				//console.log(data[0].label);
				if (data[0].label=="error"){genreList = [];}
				else{genreList = data;}
			    disablePickerChange();	//Disable the filter until genre search is finished.	
			})
			.catch(error => {
				console.error('Error:', error);
				genreList=[];
			  });
			}
			//console.log(genreList)
			//setItems(genreList)
	};
	

	const handleSpotifySelection = () => {
		console.log('selected spotify')
		setStreamingService('spotify')
		setServiceSelectorVisible(false)
		//Grabs the genre list from spotify. 
		handleGetGenre("spotify");
	}
	
	const handleSoundcloudSelection = () => {
		console.log('selected soundcloud')
		setStreamingService('soundcloud') //doesnt work???
		setServiceSelectorVisible(false)
		//Grabs the genre list from spotify. 
		handleGetGenre("soundcloud");
	}

	return (
		
		<GluestackUIProvider config={config}>
			<View style={styles.darkBackground}>
				<Text style={styles.pageTitle}>Room Settings</Text>
				<View style={styles.pageContainer}>
					<ServiceSelector 
					isVisible={serviceSelectorVisible=='false'} 
					handleSpotify={handleSpotifySelection} 
					handleSoundcloud={handleSoundcloudSelection}
					userID={userID}
					/>
					<View style={styles.switchContainer}>
						<Switch
							style={styles.switch}
							onValueChange={onValueChange}
							value={allowAnyCode}
						/>
						<Text style={styles.switchLabel}>Allow anyone with a room code to join</Text>
					</View>
					<View style={styles.switchContainer}>
						<Switch
							style={styles.switch}
							onValueChange={onValueChange2}
							value={allowExplicitContent}
						/>
						<Text style={styles.switchLabel}>Allow Explicit Content</Text>
					</View>
					<View style={styles.switchContainer}>
						<Switch
							disabled={streamingService == 'spotify' ? true : false}
							style={styles.switch}
							onValueChange={onValueChange3}
							value={streamingService == 'spotify' ? false : allowSongVoting}
						/>
						<Text style={streamingService == 'spotify' ? styles.disabledSwitchLabel : styles.switchLabel}>Allow Song Voting</Text>
					</View>
				
					<Text style={styles.text}>Genre Filter</Text>
					<View style={styles.dropDown} >					
						
						<DropDownPicker
							open={open}
							searchable={true}
							value={valueGenres}
							loading={loading}
							//disabled={disablePicker}
							items={genreList}
							setOpen={setOpen}
						//	onOpen={() => handleGetGenre()}
							setValue={setValues}
							setItems={genreList}
							dropDownDirection="BOTTOM"
							theme="DARK"
							multiple={true}
							mode="BADGE"
							badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
						/>
					</View>

					<Text style={styles.text}>Maximum Song Length</Text>
					<View
						style={{ zIndex: 100 }}
					>
						<View style={styles.dropDown} >
							<DropDownPicker
								open={openTimes}
								value={valueTimes}
								items={itemsTimes}
								setOpen={setOpenTimes}
								setValue={setValuesTimes}
								setItems={setItemsTimes}
								dropDownDirection="BOTTOM"
								theme="DARK"
								multiple={false}
								mode="BADGE"
								badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#e76f51", "#8ac926", "#00b4d8", "#e9c46a"]}
							/>
						</View>
					</View>
				
					<View style={styles.bottomControls} >
						<Pressable bg="#009500" width={listItemWidth} borderRadius={30}
							onPress={handleCreateRoom}
							sx={{ ":hover": { bg: "#00ef00" }, ":active": { bg: "#00ef00" } }}
						>
							<HStack space="md" justifyContent="space-between" alignItems="center" padding="$5">
								<HStack space="xs" alignItems="center">

									<Text style={styles.buttonText}> {roomExists=='true' ? "Update Settings" : "Create Room"} </Text>
								</HStack>
								<AntDesign name="plus" size={24} color="white" />
							</HStack>
						</Pressable>
					</View>
				</View>
			</View>
		</GluestackUIProvider>
	);
	
}

function ServiceSelector({isVisible, handleSpotify, handleSoundcloud, userID}) {
	const [isLoading, setIsLoading] = useState(false);
	const [spotify, setSpotify] = useState(undefined);

	useEffect(() => {
		getConnectedServices();
	}, [])
	
	const getConnectedServices = async () => {
		setIsLoading(true)
		return await fetch(`${baseUrl}/user/${userID}/services`)
		.then(response => response.json())
		.then((result) => {
			if (result.spotify == true){
				setSpotify(true);
				setIsLoading(false)
			}else{
				setSpotify(false);
				setIsLoading(false)
			}
		}).catch(err => console.error(err))
	}

	return (
		<Modal animationType='slide' transparent={true} visible={isVisible}>
			<View style={modalStyles.popup} >
				<View style={modalStyles.titleContainer}>
					<Text style={modalStyles.title}>Choose your Preferred Service</Text>
				</View>
				<View style={modalStyles.mainContent}>
					{isLoading ? 
							<></>
						:
							(<>
							{spotify ?
								<Fontisto.Button 
								style={styles.button} 
								borderRadius={30} 
								backgroundColor={"#1DB954"} 
								name="spotify" 
								onPress={handleSpotify}
								>
								<Text style={styles.buttonText}>Spotify</Text>
								</Fontisto.Button>
								:
								<></>	
							}
								
								<Fontisto.Button 
								style={styles.button} 
								borderRadius={30} 
								backgroundColor={"#FF5500"} 
								name="soundcloud" 
								onPress={handleSoundcloud}
								>
									<Text style={styles.buttonText}>SoundCloud</Text>
								</Fontisto.Button>
							</>)
					}
				
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
		paddingBottom: 10,
		gap: 10
	},
	messageContent: {
		height: 25,
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


/*
Dummy list of genres
*/
var genreList = [
	//Default 'genre' if genre search failed.
	//{ label: 'No genres found. Check if you are connected.', value: 'error'}

]

/*
Dummy list of potential song length filters
*/
const timeList = [
	{ label: '2 Minutes', value: 120000 },
	{ label: '5 Minutes', value: 300000 },
	{ label: '15 Minutes', value: 1500000 },
	{ label: '30 Minutes', value: 3000000 },
	{ label: '1 Hour', value: 6000000 },
	{ label: '2 Hours', value: 12000000 }
]

const styles = StyleSheet.create({
	darkBackground: {
		backgroundColor: '#282B30',
		justifyContent: 'flex-start',
		alignItems: 'center',
		gap: 10,
		flex: 1,
	},
	text: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 20,
		flexDirection: 'row',
		alignItems: 'center',
		//marginTop: opened ? 175 : 20,
		marginStart: 0,
		marginEnd: 50,
		padding: 10,
	},
	dropDown: {
		backgroundColor: '#282B30',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'left',
		paddingHorizontal: 100,
		paddingVertical: 0,
		zIndex: 120,
		//marginTop: open ? 1 : 20,
		flexDirection: 'column',
		marginStart: 0,
		marginEnd: 50,
		height: 100,
		width: 500,
		marginBottom: 50,
	},
	pageTitle: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 30,
		marginBottom: '5%',
		marginTop: '5%',
	},
	scrollView:{
		height: scrollViewHeight,
	},
	switchLabel: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 15,
		flexDirection: 'row',
		alignItems: 'center',
		padding: 0,
		marginStart: 10,
		marginEnd: 200,
	},
	disabledSwitchLabel: {
		color: '#D0D0D0',
		fontWeight: 'bold',
		fontSize: 15,
		flexDirection: 'row',
		alignItems: 'center',
		padding: 0,
		marginStart: 10,
		marginEnd: 200,
	},
	button: {
		marginStart: 10,
		marginEnd: 10,
	},
	createRoomButton: {
		borderWidth: 1,
		borderColor: 'black',
		borderRadius: 50,
		gap: 5,
		minHeight: 50,
		marginStart: 0,
		//xIndex:50,
		marginEnd: 50,
		marginTop: 0,
		//marginBottom: 100,
		zIndex: 100,
	},
	switchContainer: {
		flexDirection: 'row',
		justifyContent: 'left',
		alignItems: 'center',

		//Padding and margins
		marginStart: 135,
		marginEnd: 50,

		// Dimensions
		width: 420,
		height: 50,
	},
	pageContainer: {
		flexDirection: 'column',
		justifyContent: 'left',
		alignItems: 'center',

		//Padding and margins
		marginStart: 100,
		marginEnd: 50,
		gap: 0,
		// Dimensions
		width: 420,
		height: 75,
	},
	bottomControls: {
		flexGrow: 1,
		flexDirection: 'column',
		justifyContent: 'flex-end',
		marginStart: 100,
		marginEnd: 150,
	},
	buttonText: {
		color: "#F2F0F0",
		fontWeight: 'bold',
		fontSize: 15
	}
})