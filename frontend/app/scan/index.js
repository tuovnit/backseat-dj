import React, { useState, useEffect } from 'react';

// React imports.
import { Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';

// Expo imports.
import { router } from 'expo-router';
import { BarCodeScanner } from 'expo-barcode-scanner';

// Gluestack imports.
import { config } from '@gluestack-ui/config';
import { Button, ButtonText } from '@gluestack-ui/themed';

// Local imports.
import GLOBAL from "../global"
import SOCKET from "../socket";
import { io } from "socket.io-client";
import { socket } from "../socket";

// Global variables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const checkRoomURL = `${baseUrl}/room/checkroom`;
const url = `${baseUrl}/room/checkroom`;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const scanWidth = (0.85) * windowWidth;
const scanHeight = (0.85) * windowHeight;

/*
*	Scan - screen that allows users to scan a QR Code to join a room.
*/
export default function Scan() {
	const route = useRoute();
	const userID = route.params?.userID;
	const userName = route.params?.userName;
	const isGuest = route.params?.isGuest;

	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(false);

	// For scan with guests.
	const [roomCode, setRoomCode] = useState('')

	useEffect(() => {
		const getBarCodeScannerPermissions = async () => {
			const { status } = await BarCodeScanner.requestPermissionsAsync();
			setHasPermission(status === 'granted');
		};

		getBarCodeScannerPermissions();
	}, []);

	const handleBarCodeScanned = ({ type, data }) => {
		setScanned(true);
		// alert(`Bar code with type ${type} and data ${data} has been scanned!`);

		if (isGuest == 0) {
			// Joining with an account through QR code.
			console.log("Scanning QR code as a user.")

			strCode = data.toString();
			setRoomCode(strCode);

			console.log(`Checking Room Exists with Code: ${roomCode}`)
			fetch(url, 
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'roomCode': roomCode,
				}),
			})
			.then(result => result.json())
			.then(async (response) => {
				try
				{
					if(response.status === 200){
						//connect socket and join the room
						console.log("Room code status: 200")
						SOCKET.socket = io(`${process.env.EXPO_PUBLIC_BASE_URL}`, {
							autoConnect: false
						});
						SOCKET.socket.connect()
						SOCKET.socket.emit("joinRoom", userID, userName, roomCode, (result) => {
							if (result.status == 200){
								console.log("pushing to queue")
								GLOBAL.host = false;
								router.replace({pathname: '/queue', params: {userID: userID, userName: userName}})
							}
							else{
								Alert.alert("Something went wrong");
							}
						})
					}
					else{
						Alert.alert(response.message);
					}
				}
				catch(error)
				{
					console.log(error)
				}
			})
			.catch(error => {console.log(error)})
		}
		else {
			// Joining as a guest through QR code.
			console.log("Scanning QR code as a guest.")

			strCode = data.toString();
			setRoomCode(strCode);
			
			console.log(`Checking Room Exists with Code: ${roomCode}`)
			fetch(checkRoomURL, 
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'roomCode': roomCode,
				}),
			})
			.then(result => result.json())
			.then(async (response) => {
				try
				{
					if(response.status === 200){
						//connect socket and join the room.
						console.log("Room code status: 200")
						socket.connect()
						socket.emit("joinRoom", null, null, roomCode, (result) => {
							if (result.status == 200){
								GLOBAL.userID = result.user.id;
								GLOBAL.username = result.user.name;
								GLOBAL.host = false;
								router.replace({pathname: '/queue', params: {userID: result.user.id, userName: result.user.name} });
							}
							else{
								Alert.alert("Something went wrong");
							}
						})
					}
					else{
						Alert.alert(response.message);
					}
				}
				catch(error)
				{
					console.log(error);
				}
			})
			.catch(error => {console.log(error)});
		}
	};

	if (hasPermission === null) {
		return <Text>Requesting for camera permission</Text>;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	return (
		<View style={styles.container}>
			<BarCodeScanner
				barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
				onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
				style={StyleSheet.absoluteFillObject}
			/>
			{scanned && 
			<Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} borderRadius={30} >
				<ButtonText>
					Tap to Scan Again
				</ButtonText>
			</Button>
			}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#282B30',
		alignItems: 'center',
		justifyContent: 'flex-end',
		padding: 50,
		//width: scanWidth,
		//height: scanHeight,
	},
})