import React, { useEffect, useState } from 'react';

// Native imports.
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRoute } from '@react-navigation/native';

// Expo imports.
import { FontAwesome } from '@expo/vector-icons';

// Gluestack imports.
import { GluestackUIProvider, Input, InputField, InputSlot } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

// Component imports.
import AddSongItem from '../../components/song/AddSongItem';

// Global variables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const windowWidth = Dimensions.get('window').width;
const windowHeight= Dimensions.get('window').height;

// Room settings.
//const roomService = process.env.roomService;
var roomSettings = {
	filteredGenres: [],
	explicit: false,
	durationFilter: 0,
	anyRoomCode: false,
	songVoting: true,
	streamingService: null
}

/*
*	AddSong - screen for adding songs to the queue 
*
*	Props:
*
*	id (int) - id to be assigned as the key for each list item component
*	songTitle (string) - title of the song
*	songArtist (string) - name of artist
*/
export default function AddSong() {
	const route = useRoute()
	const userID = route.params?.userID
	const userName = route.params?.userName
	const service = route.params?.service
	const roomId = route.params?.roomId
	const [loading, setLoading] = useState(true);
	const [inputValue, setInputValue] = useState("");
	const [searchResults, setSearchResults] = useState();
	const [roomService, setRoomService] = useState("");
	//const [roomId, setRoomId] = useState("");

	useEffect(() => {
		//handleGetRoomInfo();
	}, [])
	
	// Fetches the spotify search results from the specified input value in search bar
	const handleSearch = async () => {
		setLoading(true);
		const url = `${baseUrl}/${service}/search/track?input=${inputValue}&roomId=${roomId}`;
		await fetch(url)
			.then(result => result.json())
			.then(data => {
				setSearchResults(data.tracks);
				setLoading(false);
			})
			.catch(error => {
				console.error('Error:', error);
			});
	};
	
	return (
		<GluestackUIProvider config={config}>
			<View style={baseStyles.mainContent}>
				<Text style={baseStyles.pageTitle}>Add Song</Text>

				<View style={baseStyles.searchBarView}>
					{/* <FontAwesome name="search" size={30} color="white"/> */}

					<Input variant="rounded" 
						size="lg" 
						isDisabled={false} 
						isInvalid={false} 
						isReadOnly={false}
						style={baseStyles.searchBar}
						>
						<InputSlot pl="$3">
							<FontAwesome name="search" size={30} color="white"/>
						</InputSlot>
						<InputField style={baseStyles.input} multiline={false} color="#F2F0F0" placeholder="Song Name, Artist, Album" onChangeText={setInputValue} onSubmitEditing={handleSearch}/>
					</Input>
				</View>

				<ScrollView style={baseStyles.scrollView}>
					<View style={baseStyles.listItem}>
						<AddSongList searchResults={searchResults} loading={loading} roomService = {roomService}/>
					</View>
				</ScrollView>
			</View>
		</GluestackUIProvider>
  	);
}

// List which renders add song items
function AddSongList({searchResults, loading, roomService}) {
	if (!loading){
		return (
			searchResults.map((song, id)=> 
				<AddSongItem 
					key={id++}
					song={song}
					trackID={song.trackID}
					songTitle={song.name}
					songArtist={song.artist}
					albumTitle={song.album}
					albumImg={song.albumImg}
					explicit={song.explicit}
					previewURL={song.previewURL}
					duration_ms={song.duration_ms}
					service={roomService}
					/>
			)
		)
	}
}

function normalizeGenre(artist){
	artist.genres = artist.genres.map(genre => genre.replace(" ", '-'))
	return artist
}

// Component widths
const searchBarWidth = ((0.85) * windowWidth);
const scrollViewHeight = ((0.65) * windowHeight);

// Stylesheet
const baseStyles = StyleSheet.create({
	mainContent: {
		backgroundColor: '#282B30',
		flexDirection: 'column',
		alignItems: 'center',
		flex: 1,
	},
	pageTitle:{
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 30,
		marginBottom: '5%',
		marginTop: '5%',
		// justifyContent: 'center'
	},
	searchBarView: {
		minWidth: searchBarWidth,
		flexDirection: 'row',
		// justifyContent: 'center',
		// alignItems: 'center',
		// flexGrow: 1,
		gap: 5
	},
	searchBar: {
		flexGrow: 1,
		// justifyContent: 'center',
		// alignItems: 'center'
		gap: -5,
	},
	scrollView: {
		marginTop: 25
	},
	listItem: {
		gap: 5,
	},
	input: {
		flex: 1,
		width: '100%',
		textAlignVertical: 'top',
		paddingBottom: 5,
	}
});
