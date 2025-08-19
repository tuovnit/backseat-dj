import { useEffect, useState } from 'react'

// Native imports.
import { Dimensions, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import { TextTicker } from 'react-native-text-ticker';
import { useRoute } from '@react-navigation/native';

// Expo imports.
import { Link, router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

// Global variables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const windowWidth = Dimensions.get('window').width; // Height of the screen.

export default function SelectContent(){
	const route = useRoute()
	const userID = route.params?.userID
	const userName = route.params?.userName
	const [isLoading, setIsLoading] = useState(true)
	const [playlistData, setPlaylistData] = useState(undefined)

	useEffect(() => {
		fetchPlaylists();
	}, [])
	
	// Fetches user playlists from spotify
	const fetchPlaylists = () => {
		fetch(`${baseUrl}/spotify/${userID}/playlists`)
		.then(response => response.json())
		.then(data => {
			setPlaylistData(data)
			setIsLoading(false)
		}).catch(err => console.error(err))
	}

	// Opens the playlist in spotify app if downloaded
	const handleOpenPlaylist = (uri) => {
		if (Linking.canOpenURL(uri)) {
			try {
				Linking.openURL(uri)
			} catch (error) {
				return;	
			}
		}else{
			router.replace('/queue')
		}
	}

	return (
		<View style={styles.darkBackground}>
			<Text style={styles.pageTitle}>Select Content to Start Playing</Text>
			<ScrollView >
				<View style={styles.item} > 
					{isLoading ? 
					<Text>Loading...</Text> : 
					playlistData["playlists"].map(item => 
						<PlaylistItem key={item.id} id={item.id} uri={item.uri} name={item.name} image={item.image} track={item.track} openUrl={handleOpenPlaylist}/>
						)}
				</View>
			</ScrollView>
			<Pressable style={styles.skipButton}>
				<Link href="/queue">
					<View style={styles.skipContent}>
						<Text style={styles.skipText}>Skip</Text>
						<AntDesign name="arrowright" size={24} color="black" />
					</View>
				</Link>
			</Pressable>
		</View>
	)
}

function PlaylistItem({id, uri, name, image, track, openUrl}){

	const handlePress = () => {
		openUrl(uri)
	}

	return(
		<Link replace href='/queue' asChild>
			<Pressable onPress={handlePress}>
				<View style={styles.listItem}>
					<Image 
					style={styles.playlistImage}
					source={{uri: image}}
					/>
					<View style={styles.playlistInfo} >
						<TextTicker 
						style={styles.text}
						scrollSpeed={50}
						repeatSpacer={25}
						loop
						bounce={false}
						>
							{name}
						</TextTicker>
					</View>	
				</View>
			</Pressable>
		</Link>
	)

}

const listItemWidth = (0.85) * windowWidth;

const styles = StyleSheet.create({
	darkBackground: {
		backgroundColor: '#282B30',
		justifyContent: 'flex-start',
		alignItems: 'center',
		gap: 10,
		flex: 1,
	},
	pageTitle: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 25,
		marginBottom: '5%',
		marginTop: '5%',
	},
	listItem: {
		// Background and Borders
		backgroundColor: '#424549',
		borderWidth: 1,
		borderColor: 'black',
		borderRadius: 25,

		// Flex
		flexDirection: 'row',
		alignItems: 'center',

		//Padding and margins
		marginStart: 15,
		marginEnd: 15,
		paddingStart: 10,
		paddingEnd: 10,
		gap: 10,

		// Dimensions
		width: listItemWidth,
		maxWidth: listItemWidth,
		height: 75
	},
	text: {
		color: "#F2F0F0",
	},
	playlistImage: {
		width: 50,
		height: 50,
		borderRadius: 10
	},
	item: {
		gap: 5,
	},
	playlistInfo: {
		alignItems: 'center',
		display: 'flex',
		flexGrow: 1
	},
	skipButton: {
		backgroundColor: "#F2F0F0",
		height: '5%',
		width: '25%',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: 'transparent',
		borderRadius: 15,
		margin: 10,
		marginBottom: 20
	},
	skipContent: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		flexGrow: 1
	},
	skipText: {
		textAlign: 'center',
		fontSize: 16
	}
})