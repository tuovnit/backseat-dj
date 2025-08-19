import React, { useEffect, useState } from 'react';

// Native imports.
import { Alert, Dimensions, Image, LayoutAnimation, Pressable, StyleSheet, Text, View } from "react-native"
import TextTicker from 'react-native-text-ticker';

// Expo imports.
import { MaterialIcons } from '@expo/vector-icons';

// Gluestack imports.
import { config } from "@gluestack-ui/config";
import { Button, ButtonText, GluestackUIProvider } from "@gluestack-ui/themed";

// Component imports.
import GLOBAL from '../../app/global'
import {socket} from '../../app/socket'
import VoteCounter from "./VoteCounter";

// Global variables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const windowWidth = Dimensions.get('window').width; // Height of the screen.

/**
* Renders a single song item in the queue list.
*
* @param {Object} props - The props object containing the song details.
*
*	key (integer) - holds the id of the song object
*	songTitle (string) - title of the song to be displayed as the main text
*	songArtist (string) - name of the artist of the song (used only if no vote
*	or in the popup when song is clicked)
*	songAlbum (string) - name of the songs album (used only in the popup when
*	song is clicked)
*	vote (bool) - determines whether or not the vote buttons and values
*	are displayed on the item (i.e. voting disabled -> no vote buttons)
*	voteCount (integer) - number of votes a song has received
*	host (bool) - displays an icon to delete the song form the cue if 
*	enabled (hosts view only) 
* 
* @returns {JSX.Element} The rendered song list item component.
*/
const SongListItem = ({song, vote, voteCount, host, addedBy, refreshQueue}) => {
	const [visible, setVisible] = useState(true);
	const [loading, setLoading] = useState(true);
	const [expanded, setExpanded] = useState(false);
	const [songData, setSongData] = useState();
	const [hostView, setHostView] = useState(host);

	useEffect(() => {
		loadSongData()
	}, [])

	const loadSongData = () => {
		setSongData(song)
		setLoading(false)
	}

	// Animation for tapping on component to expand it
	const expandItem = () => {
		LayoutAnimation.configureNext({
			duration: 1000,
			create: {type: 'easeInEaseOut', property: 'opacity', duration: 600, delay: 650},
			update: {type: 'easeInEaseOut', property: 'opacity'},
			delete: {type: 'easeInEaseOut', property: 'opacity', duration: 300},
		  });
		  setExpanded(expanded === false ? true : false);
	};

	const createRemoveSongAlert = () => {
		Alert.alert('Remove Song?',
					`You are about to remove ${songData.songTitle} from the queue. Do you want to continue?`,
					[
						{
							text: 'Cancel',
							style: 'cancel',
						},
						{
							text: 'OK',
							onPress: handleRemoveSong,
						}
					]);
	}

	// Sends update request to backend to update/remove song from queue
	const handleRemoveSong = async () => {
		socket.emit('removeSong', GLOBAL.userID, songData.id, (result) => {
			console.log(result);
			if (result.status == 200){
				setVisible(false);
			}
		})
	}

	if (!loading){
		if (visible){
			return (
				<GluestackUIProvider config={config}>
					<Pressable onPress={expandItem} >
						<View style={expanded === false ? baseStyles.listItem : expandedStyles.expandedListItem}>
							{expanded ? 
								<>
									<View style={expandedStyles.songInfoView} >
										<Image 
										source={{uri: songData.song_img}}
										style={expandedStyles.albumImage}
										/>
										<Text style={expandedStyles.songInfo}>Song: {songData.song_title}</Text>
										<Text style={expandedStyles.songInfo}>Artist: {songData.song_artist}</Text>
										<Text style={expandedStyles.songInfo}>Album: {songData.song_album}</Text>
										<Text style={expandedStyles.songInfo}>Added by: {addedBy}</Text>
										{hostView ? <Button style={expandedStyles.removeButton} onPress={createRemoveSongAlert}>
													<ButtonText style={expandedStyles.removeButtonText}>
														Remove Song
													</ButtonText>
												</Button> : <></>}
									</View>
								</>
								:
								<>
									<View style={songData.explicit ? voteableStyles.explicitSongInfo : voteableStyles.songInfo}>
										<Image style={voteableStyles.albumImage} source={{uri: songData.song_img}}/>
										<TextTicker style={baseStyles.songTitle} 
													scrollSpeed={50}
													repeatSpacer={25}
													loop
													bounce={false}
													>
													{songData.song_title} - {songData.song_artist}
													</TextTicker>
										{songData.explicit ? <MaterialIcons name="explicit" size={16} color="#F2F0F0" /> : <></>}			
									</View>
									{vote ? 
										<VoteCounter 
											style={voteableStyles.counter} 
											voteCount={voteCount}
											id={songData.id}
										/> 
									: 
										<></>}
								</>
								}
						</View>
					</Pressable>
				</GluestackUIProvider>
				);
		}else {
			return null;
		}
	}
}

export default SongListItem;

// Calculates 85% of the width of the screen for song list item width
const listItemWidth = (0.85) * windowWidth;

// Base styles for user view
const baseStyles = StyleSheet.create({
	listItem: {
		// Background and Borders
		backgroundColor: '#424549',
		borderWidth: 1,
		borderColor: 'black',
		borderRadius: 25,

		// Flex
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',

		//Padding and margins
		marginStart: 15,
		marginEnd: 15,
		paddingStart: 10,
		paddingEnd: 5,
		gap: 10,

		// Dimensions
		width: listItemWidth,
		maxWidth: listItemWidth,
		height: 75
	},
	songTitle: {
		color: "#F2F0F0",
	},
	songInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		maxWidth: '65%',
		gap: 30,
	},
	explicitSongInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		maxWidth: '60%',
		gap: 30,
	},
	explicit: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5
	}
});

// Styles for when voting is enabled
const voteableStyles = StyleSheet.create({
	songTitle: {
		color: "#F2F0F0",
		padding: 10,
		textAlign: 'center',
		flexGrow: 2,
		maxWidth: '70%',
		fontSize: 16
	},
	vote: {
		width: '30%'
	},
	albumImage: {
		width: 50,
		height: 50,
		borderRadius: 10
	},
	counter: {
		width: 20
	},
	songInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		maxWidth: '70%',
		gap: 5
	},
	explicitSongInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		maxWidth: '60%',
		gap: 5
	},
});

// Styles for expanded components
const expandedStyles = StyleSheet.create({
	expandedListItem: {
		// Background and Borders
		backgroundColor: '#424549',
		borderWidth: 1,
		borderColor: 'black',
		borderRadius: 25,

		// Flex
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		
		//Padding and margins
		marginStart: 15,
		marginEnd: 15,
		
		// Dimensions
		width: listItemWidth,
		height: 215
	},
	songInfoView: {
		justifyContent: 'center',
		alignItems: 'center',
		gap: 5,
		maxHeight: 150,
	},
	songInfo: {
		color: "#F2F0F0",
		textAlign: 'center',
		flexGrow: 2,
		fontSize: 14
	},
	albumImage: {
		width: 75,
		height: 75,
		borderRadius: 10
	},
	removeButton: {
		backgroundColor: '#E40707',
		borderRadius: 25,
		height: 25,
		width: 'auto'
	},
	removeButtonText: {
		color: "#F2F0F0"
	}
});
