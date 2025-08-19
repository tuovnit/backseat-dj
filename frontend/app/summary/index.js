import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useRoute } from "@react-navigation/native";

const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

function Summary() {

	const route = useRoute();
	const roomID = route.params?.roomID;

	return (
		<View style={styles.main}>
			<Text style={styles.pageTitle}>Room Summary</Text>

			<SummaryCard roomID={roomID}/>
		</View>
	)
}

function SummaryCard({roomID}) {
	const [data, setData] = useState({})
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		fetchSummary(roomID);
	}, [])

	const fetchSummary = (roomID) => {
		setIsLoading(true)
		fetch(`${baseUrl}/room/summary/${roomID}`, {
			headers: {
				'Content-Type': 'application/json',
			},
		})
		.then(response => response.json())
		.then(data => {
			setData(data)
			console.log(data);
			setIsLoading(false)
		})
		.catch((error) => {
		console.error('Error:', error);
		});
	}

	return (
		<>
			{isLoading ? 
				<></> 
			:
				<>
					{data.summary.song == null ? 
					<View style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderColor: 'white', borderWidth: 1, borderRadius: 5, padding: 10, gap: 5}}>
						<Text style={{color: '#F2F0F0', fontSize: 16, textAlign: 'center'}}>Summary is unavailable for this room.</Text>
						<Text style={{color: '#F2F0F0', fontSize: 16, textAlign: 'center'}}>Once a room has been closed or more songs are played, a summary will be available.</Text>
					</View>	
					:
					<>
					<Image source={data.summary.song.song_img} style={styles.albumImage}/>
					<View style={styles.summaryCard}>

						<View style={styles.popularSongSummary} >
							<Text style={styles.popularSongText}>Most Popular Song</Text>

							<View style={styles.popularSongSummaryInfo} >
								<Text style={styles.summaryText}>{data.summary.song.song_title}</Text>
								<Text style={styles.summaryText}>
									{data.summary.song.song_album == 'no album' || data.summary.song.song_album == null ? <></> : data.summary.song.song_album}
								</Text>
								<Text style={styles.summaryText}>{data.summary.song.song_artist}</Text>
							</View>

						</View>
						<View style={styles.summaryLine}>
							<View style={styles.summaryItem}>
								<Text style={styles.summaryText}>Songs Played</Text>
								<View style={styles.summaryBlock}>
									<Text style={[styles.summaryText, {fontWeight: 'bold', color: 'black'}]}>{data.summary.song_count}</Text>
								</View>
							</View>
							<View style={styles.summaryItem}>
								<Text style={styles.summaryText}>Users Joined</Text>
								<View style={styles.summaryBlock}>
									<Text style={[styles.summaryText, {fontWeight: 'bold', color: 'black'}]}>{data.summary.user_count}</Text>
								</View>
							</View>
						</View>

						<View style={styles.summaryLine}>
							<View style={styles.summaryItem}>
								<Text style={styles.summaryText}>Most Played Genre</Text>
								<View style={[styles.summaryBlock, {width: 'auto', minWidth: 50, paddingStart: 5, paddingEnd: 5}]}>
									<Text style={[styles.summaryText, {fontWeight: 'bold', color: 'black'}]}>{data.summary.genre == null ? 'n/a' : data.summary.genre}</Text>
								</View>
							</View>
						</View>
						<View style={styles.summaryItem}>
								<Text style={styles.summaryText}>Most Popular DJ</Text>
								<View style={[styles.summaryBlock, {width: 'auto', minWidth: 50, paddingStart: 5, paddingEnd: 5}]}>
									<Text style={[styles.summaryText, {fontWeight: 'bold', color: 'black'}]}>{data.summary.DJ}</Text>
								</View>
							</View>
					</View>
					</>
					}
				</>
			}
		</>
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
	summaryText: {
		color: '#F2F0F0',
		fontSize: 16
	},
	popularSongText: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		paddingBottom: 10,
		fontSize: 18
	},
	popularSongSummary: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	popularSongSummaryInfo: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 5,
		borderWidth: 1,
		borderColor: 'orange',
		borderRadius: 10,
		minWidth: '40%',
		maxWidth: 'auto',
		padding: 10
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
	summaryLine: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-evenly'
	},
	summaryItem: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 5
	},
	summaryBlock: {
		display: 'flex',
		flexDirection: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'orange',
		borderColor: 'transparent',
		borderWidth: 1,
		borderRadius: 15,
		width: 50,
		height: 50
	},
	summaryCard: {
		display: 'flex',
		backgroundColor: 'transparent',
		width: '85%',
		height: '50%',
		// borderWidth: 3,
		// borderColor: 'green',
		// borderRadius: 25,
		gap: 10,
		paddingTop: 10,
		paddingBottom: 10,
	},
	albumImage: {
		height: '30%',
		width: '60%',
		borderWidth: 1,
		borderColor: 'transparent',
		borderRadius: 10
	},

})

export default Summary;