import { useEffect, useState } from 'react';

// Native imports.
import { Dimensions, StyleSheet, ScrollView, Text, View } from 'react-native';

// Expo imports.
import { Link } from 'expo-router';
import { AntDesign, Fontisto } from '@expo/vector-icons';

// Gluestack imports.
import { Avatar, AvatarFallbackText, Box, Button, ButtonText, GluestackUIProvider, Divider, HStack, Pressable, VStack } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

// Local imports.
import GLOBAL from '../global';

// Global variables.
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const url = `${baseUrl}/user/profile`;
const windowWidth = Dimensions.get('window').width;
const listItemWidth = (0.85) * windowWidth;

/*
*	Profile - screen that allows users to see their data or have the option of changing it.
*/
export default function Profile() {
	const [spotifyConnected, setSpotifyConnected] = useState(null)
	const [appleMusicConnected, setAppleMusicConnected] = useState(null)
	const [youtubeConnected, setYoutubeConnected] = useState(null)

	useEffect(() => {
		fetchConnectedServices();
	}, []);
	
	const fetchConnectedServices = async () => {
		await fetch(`${baseUrl}/user/${GLOBAL.userID}/services`, {
			headers: {
				'Content-Type': 'application/json',
			}
		}).then(response => response.json())
		.then(data => {
			console.log(data);
			setSpotifyConnected(data.spotify);
			setAppleMusicConnected(data.apple_music);
			setYoutubeConnected(data.youtube_music);
		});
	}

	return (
		<GluestackUIProvider config={config}>
			<ScrollView style={{ backgroundColor: '#282B30', flex: 1 }}>
				<View style={styles.mainContent}>
				
					<Text style={styles.pageTitle}> Profile </Text>

					{/* Profile Card */}
					<VStack space="2xl" paddingBottom="$10">
						<Pressable bg="#424549" width={listItemWidth} borderRadius={30}
							onPress={() => console.log("This lets you change your profile picture.")}
							sx={{ ":hover": {bg: "#6e737a"}, ":active": {bg: "#6e737a"} }}
						>
							<HStack space="md" alignItems="center" padding="$3">
								<Avatar size="lg" borderRadius="$full">
									<AvatarFallbackText>{GLOBAL.username}</AvatarFallbackText>
									{/* <AvatarImage
										source={{
											uri: "https://users.cs.utah.edu/~germain/Eye_Candy/jim_p.png",
										}}
									/> */}
								</Avatar>
								<VStack space="xs">
									<Text style={styles.username}> {GLOBAL.username} </Text>
									<Text style={styles.subtext}> {GLOBAL.userEmail} </Text>
								</VStack>
							</HStack>
						</Pressable>
					</VStack>

					{/* Connections Card */}
					<VStack space="2xl" paddingBottom="$10">
						<Box bg="#424549" width={listItemWidth} borderRadius={30}>
							<HStack space="md" justifyContent="space-between" alignItems="center" padding="$5">
								<HStack space="md" alignItems="center">
									<Fontisto name="spotify" size={24} color="#1DB954" />
									<VStack space="xs">
										<Text style={styles.buttonText}> Spotify </Text>
										<HStack space="xs">
											<AntDesign name={spotifyConnected ? "checkcircle" : "closecircle"} 
												size={15} color={spotifyConnected ? "green" : "red"} />
											<Text style={styles.subtext}>{spotifyConnected ? "Connected" : "Not Connected"}</Text>
										</HStack>
									</VStack>
								</HStack>
								<Link reload href="/connectservices" asChild>
									{/* <Button size="sm" bg="#ff0000" borderRadius={30}
										onPress={() => console.log("This takes you to the connections page.")}
										sx={{ ":hover": { bg: "#ff4040" }, ":active": { bg: "#ff4040" } }}
									>
										<ButtonText style={styles.buttonText}>Disconnect</ButtonText>
									</Button> */}
									<Button size="sm" bg={spotifyConnected ? "#800000" : "#008000"} borderRadius={30}
										onPress={() => setSpotifyConnected(true)}
										sx={spotifyConnected ? {":hover": {bg: "#df0000"}, ":active": {bg: "#df0000"}} : { ":hover": {bg: "#00df00"}, ":active": {bg: "#00df00"} }}
									>
										<ButtonText style={styles.buttonText}>{spotifyConnected ? "Disconnect" : "Connect"}</ButtonText>
									</Button>
								</Link>
							</HStack>

							<Divider />

							<HStack space="md" justifyContent="space-between" alignItems="center" padding="$5">
								<HStack space="md" alignItems="center">
									<Fontisto name="applemusic" size={24} color="#69a6f9" />
									<VStack space="xs">
										<Text style={styles.buttonText}> Apple Music </Text>
										<HStack space="xs">
											<AntDesign name="closecircle" size={15} color="red" />
											<Text style={styles.subtext}> Not Connected </Text>
										</HStack>
									</VStack>
								</HStack>
								<Link reload href="/connectservices" asChild>
									<Button size="sm" bg="#008000" borderRadius={30}
										onPress={() => console.log("This takes you to the connections page.")}
										sx={{ ":hover": {bg: "#00df00"}, ":active": {bg: "#00df00"} }}
									>
										<ButtonText style={styles.buttonText}>Connect</ButtonText>
									</Button>
								</Link>
							</HStack>

							<Divider />

							<HStack space="md" justifyContent="space-between" alignItems="center" padding="$5">
								<HStack space="md" alignItems="center">
									<AntDesign name="youtube" size={24} color="#c3352e" />
									<VStack space="xs">
										<Text style={styles.buttonText}> Youtube Music </Text>
										<HStack space="xs">
											<AntDesign name="closecircle" size={15} color="red" />
											<Text style={styles.subtext}> Not Connected </Text>
										</HStack>
									</VStack>
								</HStack>
								<Link reload href="/connectservices" asChild>
									<Button size="sm" bg="$green" borderRadius={30}
										onPress={() => console.log("This takes you to the connections page.")}
										sx={{ ":hover": {bg: "#00df00"}, ":active": {bg: "#00df00"} }}
									>
										<ButtonText style={styles.buttonText}>Connect</ButtonText>
									</Button>
								</Link>
							</HStack>
						</Box>
					</VStack>

					{/* Additional Profile Options Card */}
					<VStack space="2xl" paddingBottom="$10">
						<Link reload href="/roomhistory" asChild>
							<Pressable bg="#424549" width={listItemWidth} borderRadius={30}
								onPress={() => console.log("This takes you to settings page.")}
								sx={{ ":hover": { bg: "#6e737a" }, ":active": { bg: "#6e737a" } }}
							>
								<HStack space="md" justifyContent="space-between" alignItems="center" padding="$5">
									<HStack space="xs" alignItems="center">
										<AntDesign name="book" size={30} color="white" />
										<Text style={styles.buttonText}> Room History </Text>
									</HStack>
									<AntDesign name="rightcircle" size={24} color="white" />
								</HStack>
							</Pressable>
						</Link>
					</VStack>
			
				</View>
			</ScrollView>
		</GluestackUIProvider>
	);
}

// Stylesheet
const styles = StyleSheet.create({
	mainContent: {
		backgroundColor: '#282B30',
		flexDirection: 'column',
		alignItems: 'center',
	},
	pageTitle: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 30,
		marginBottom: '5%',
		marginTop: '5%',
		justifyContent: 'center'
	},
	username: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 20
	},
	subtext: {
		color: '#F2F0F0',
		fontSize: 15
	},
	buttonText: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 15
	}
})