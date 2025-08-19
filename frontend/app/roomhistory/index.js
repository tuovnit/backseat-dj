import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View, Button, Pressable, StyleSheet } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import GLOBAL from '../global'

const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

function RoomHistory() {

	return (
		<View style={styles.main}>
			<Text style={styles.pageTitle}>Room History</Text>

			<RoomListContainer/>
			{/* <RoomListItem room={testRooms.rooms[0]}/> */}

		</View>
	)

}

function RoomListContainer() {
	const [rooms, setRooms] = useState([])

	// Fetch Rooms from db
	useEffect(() => {
		fetchRooms()
	}, [])

	const fetchRooms = () => {

		fetch(`${baseUrl}/user/${GLOBAL.userID}/rooms`, {
			headers: {
				'Content-Type': 'application/json',
			},
		})
		.then(response => response.json())
		.then(data => setRooms(data.rooms))
		.catch((error) => {
		console.error('Error:', error);
		});
		console.log(rooms)
	}

	return (
		<View >
			{/* // Render Room List with rooms passed in as prop */}
			<RoomList rooms={rooms}/>
		</View>
	)
}

function RoomList({rooms}) {

	return (
		<ScrollView style={styles.scrollView}>
			<View style={styles.scrollViewItems} >
				{rooms.length === 0 ? 
				<View style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderColor: 'white', borderWidth: 1, borderRadius: 5, padding: 10, gap: 5}}>
					<Text style={{color: '#F2F0F0', fontSize: 16, textAlign: 'center'}}>History is unavailable for this account.</Text>
					<Text style={{color: '#F2F0F0', fontSize: 16, textAlign: 'center'}}>Once you join a room, they will be displayed here.</Text>
				</View>
				:
					rooms.map((room) => {
						return <RoomListItem key={room.roomid} room={room} id={room.roomid}/>
					})
				}
			</View>
		</ScrollView>
	)
}

function RoomListItem({room, id}) {
	
	const handlePress = () => {
		console.log("clicked on room item")
		router.push({ pathname: '/summary', params: {roomID: id} })
	}

	const date = new Date(room.createdAt)
	const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

	return (
		<Pressable onPress={handlePress}>
			<View style={styles.listItem}>
				<View style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, gap: 10, paddingTop: 10, paddingBottom: 10}}>
					<Text style={styles.listItemRoomTitle}>Room {room.code}</Text>
					<View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexGrow: 1, gap: '70%'}}>
						<Text style={styles.songTitle}>Hosted by: {room.host_name}</Text>
						<Text style={styles.songTitle}>{formattedDate}</Text>
					</View>
				</View>
			</View>
		</Pressable>
	)
}

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
		display: 'flex',
		flexDirection: 'column',
		gap: '5px',
		minWidth: 'auto',
		maxWidth: '85%',
		minHeight: '60%',
		maxHeight: '85%',
	},
	scrollViewItems: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		maxWidth: 'auto',
		gap: 5,
	},
	listItem: {
		// Background and Borders
		backgroundColor: '#424549',
		borderWidth: 1,
		borderColor: 'white',
		borderRadius: 25,

		// Flex
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',

		//Padding and margins
		marginStart: 15,
		marginEnd: 15,
		paddingStart: 5,
		paddingEnd: 5,
		gap: 10,

		// Dimensions
		width: '85%',
		minWidth: '90%',
		height: 75
	},
	songTitle: {
		color: "#F2F0F0",
	},
	listItemRoomTitle: {
		color: "#F2F0F0",
		fontSize: 16,
		fontWeight: 'bold'
	},
})

export default RoomHistory