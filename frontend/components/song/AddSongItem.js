import React, { useEffect, useState } from 'react';

// Native imports.
import { Animated, Dimensions, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import TextTicker from 'react-native-text-ticker';

// Expo imports.
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

// Gluestack imports.
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';

// Local imports.
import GLOBAL from '../../app/global';
import { socket } from '../../app/socket';

// Global variables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const windowWidth = Dimensions.get('window').width; // Height of the screen.

/*
*	AddSongItem - list item for song search and adding song to song queue
*
*	Props:
*
*	id (int) - used for component key
*	trackID (string) - id for spotify track
*	songTitle (string) - title of the song
*	songArtist (string) - name of artist
*	albumImg (string url) - link to album image
*	albumTitle (string) - name of album
*	explicit (bool) - explicit content or not
*/
export default function AddSongItem(props){
	const [icon, setIcon] = useState(<AntDesign name="pluscircleo" size={30} color="white" />);

	const twirl = new Animated.Value(0);
	const spin = () => {
		twirl.setValue(0);
		Animated.timing(twirl, {
			toValue: 1,
			duration: 1000,
			easing: Easing.linear,
			useNativeDriver: true,
		}).start(() => spin());
	}

	const rotate = twirl.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "360deg"],
	});

	const handleAddSong = async () => {
		setIcon(
			<Animated.View style={{transform: [{rotate}]}} >
				<AntDesign name="loading1" size={30} color="#F2F0F0" />
			</Animated.View>
			);
			console.log(props)
			console.log("UserID: ", GLOBAL.userID)

			socket.emit("addSong", GLOBAL.userID, props.trackID, props.songTitle, props.songArtist, props.albumTitle, props.albumImg, props.explicit, props.previewURL, props.duration_ms, async (result) => {
				if (result.status == 200){
					setIcon(
						<AntDesign name="checkcircleo" size={30} color="#F2F0F0" />
					);
				}else {
					setIcon(
						<AntDesign name="pluscircleo" size={30} color="white" />
					);
				}
			})

			if (props.service == "spotify"){
				await fetch(`${baseUrl}/spotify/addsong`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						track: props.trackID
					})
				}).then(response => response.json())
				.then(result => console.log(result))
			}
	}

	return(
		<GluestackUIProvider config={config} >
			<Pressable>
					{props.explicit ? 
					<View style={baseStyles.listItem}>
						<View style={baseStyles.explicitSongInfo}>
							<Image style={baseStyles.albumImage} source={{uri: props.albumImg}}/>
							<TextTicker 
								style={baseStyles.text} 
								scrollSpeed={50}
								repeatSpacer={25}
								loop
								bounce={false}
								>
								{props.songTitle} - {props.songArtist}
								</TextTicker>
							<MaterialIcons name="explicit" size={16} color="#F2F0F0" />
						</View> 
						<Pressable onPress={handleAddSong} style={baseStyles.addButton} >
							{icon}
						</Pressable>
					</View>
					: 
					<View style={baseStyles.listItem}>
						<View style={baseStyles.songInfo}>
							<Image style={baseStyles.albumImage} source={{uri: props.albumImg}}/>
							<TextTicker 
								style={baseStyles.text} 
								scrollSpeed={50}
								repeatSpacer={25}
								loop
								bounce={false}
								>
								{props.songTitle} - {props.songArtist}
							</TextTicker>
						</View>
						<Pressable onPress={handleAddSong} style={baseStyles.addButton} >
							{icon}
						</Pressable>
					</View>
					}
			</Pressable>
		</GluestackUIProvider>
	);
}

const listItemWidth = (0.85) * windowWidth;

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
	addButton: {
		borderRadius: 100,
		width: 30,
		height: 30,
		backgroundColor: "#057602",
		justifyContent: 'center',
		alignItems: 'center'
	},
	albumImage: {
		width: 50,
		height: 50,
		borderRadius: 10
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
		maxWidth: '65%',
		gap: 5
	}
});