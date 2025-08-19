

import { React, useEffect, useRef, useState, useCallback } from 'react';

// Native imports.
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import TextTicker from 'react-native-text-ticker';
// Expo imports.
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

// Gluestack imports.
import {Box, Center, GluestackUIProvider, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Spinner } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

// Local imports.
import { socket } from "../socket";
import GLOBAL from "../global"
import { Lyric } from 'react-native-lyric';

// Global variables.
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const scrollViewHeight = ((1) * screenHeight);
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

var playingFlag = true
var playbackObject = null;
var loading = true;
var sliderMoving = false; //Boolean for if the user is currently moving the slider, so that the slider doesnt move while the user is scrubbing. Doesn't seem to work as a state variable
var positionG = 0;  //Global variables for position/duration for the slider, so that the values are saved when the user navigates between pages
var durationG = 60; //default duration
var lyricsG = "";
var pausedG = false
var sliderMoving = false; // Boolean for if the user is currently moving the slider, so that the slider doesnt move while the user is scrubbing. Doesn't seem to work as a state variable
// Another Page component export
export default function Player() {
	const route = useRoute()
	const userID = route.params?.userID
	const userName = route.params?.userName
	const service = route.params?.service
	const host = GLOBAL.host
	const childRef = useRef();
	
	const [token, setToken] = useState(null);
	const [currSong, setCurrSong] = useState(null);
	const [playingSong, setisPlayingSong] = useState(playingFlag)
	const [position, setPosition] = useState(positionG);
	const [slider, setSliderMoving] = useState(false);
	const [scrolling, setScrolling] = useState(false);
	const [duration, setDuration] = useState(durationG);
	const [updatingSong, setUpdatingSong] = useState(true);
	const [isHost, setIsHost] = useState(true);
	const [loadingLyrics, setLoadingLyrics] = useState(true);
	const [allowSongVoting, setValue3] = useState(true);
	const [LRC, setLRC] = useState(lyricsG);
	
	useEffect(() => {
		if (service == "spotify"){
			console.log("fetching spotify song")
			fetchCurrSong();
		}else if (service == "soundcloud"){
			console.log("fetching soundcloud song")
			fetchCurrSong();
		}
	}, [service])

	const fetchCurrSong = async () => {
		setUpdatingSong(true);
		setLoadingLyrics(true);
		socket.emit('currentlyPlaying', userID, (callback) => {
			console.log(callback)
			updateCurrSong(callback.song);
		})
	}

	const fetchNextSong = async () => {
		if (playbackObject!=null){ //Unload song from memory when previous song is finished
			playbackObject.unloadAsync()
			playbackObject = null
		}
		
		setCurrSong(null)
		positionG = 0
		setLRC("")
		lyricsG=""
		setDuration(60)
		durationG= 60
		setPosition(0)
		setUpdatingSong(true);
		setLoadingLyrics(true);
		playingFlag = false
		setisPlayingSong(false)
		socket.emit('skipSong', GLOBAL.userID, (result) => {
			console.log(result);
			updateCurrSong(result.song);
		})
		
	}

	const updateCurrSong = async (song) => {
		//console.log(song)
		if (service == "spotify"){
			setCurrSong(song)
			setUpdatingSong(false);
			setLoadingLyrics(false);
		}else if(service == "soundcloud"){
			
			if (playbackObject == null ){
			if(song != null){
			durationG = Math.floor(song.duration/1000)
			setDuration(Math.floor(song.duration/1000))
			console.log("Song: ",song.songid)
			await fetch(`${baseUrl}/soundcloud/getTrack?songid=${song.songid}&trackName=${song.song_title}&duration=${song.duration}&artistName=${song.song_artist}`)
			.then(result => result.json())
			.then(async (data) => {
				if (data!=null){
				const { sound } = await Audio.Sound.createAsync(
					{ uri: data.streamLink },
					{ shouldPlay: host },				
					)
					playbackObject = sound
					sound.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate)
					setLRC(data.lyrics)
					lyricsG = data.lyrics
					playingFlag = true
					setisPlayingSong(true)
					
				}
			})
			.catch(err => console.error(err))
			}}else{
				//Reset p
				playbackObject.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate) 
			}
			/*
			socket.emit('upVote', GLOBAL.userID, song.id, true, false, (result) => {
				console.log(result);
				if (result.status == 200){
					console.log("yippe");
				}
			})
			*/
			setCurrSong(song)
			setLoadingLyrics(false)
			setUpdatingSong(false);
		//console.log("AAAAA:", currSong)
		}
		// renderSongInfo(song);
		// renderPlaybackControls(song, true);
	}

	const handleSkip = () => {
		if (service == "spotify"){
			fetchCurrSong();
		}else {
			//Reset duration/position stuff
			
				fetchNextSong();
			
			
		}
	}

	_onPlaybackStatusUpdate = playbackStatus => {
		if (!playbackStatus.isLoaded) {
		  // Update your UI for the unloaded state
		  if (playbackStatus.error) {
			console.error(`Encountered a fatal error during playback: ${playbackStatus.error}`);
			// Send Expo team the error on Slack or the forums so we can help you debug!
		  }
		} else {
		  // Update your UI for the loaded state
	  
		  if (playbackStatus.isPlaying) {
			// Update your UI for the playing state
			playingFlag = true
			setisPlayingSong(true)
			//console.log(sliderMoving)
			if(!sliderMoving){
				positionG = Math.floor(playbackStatus.positionMillis/1000)
				setPosition(Math.floor(playbackStatus.positionMillis/1000))
			}
			//console.log(playbackStatus.position)
		  } else {
			// Update your UI for the paused state
			playingFlag = false
			setisPlayingSong(false)
			
		  }
	  
		  if (playbackStatus.isBuffering) {
			// Update your UI for the buffering state
		  }
	  
		  if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
			fetchNextSong()
			// The player has just finished playing and will stop. Maybe you want to play something else?
		  }
		}
	  };

	const formatDuration= (value) => {	
		 minute = Math.floor(value / 60);
		 secondLeft = value - minute * 60;
		return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
	  }

	const handleSliderChange =  ( newValue) => {
		setSliderMoving(true)
		sliderMoving = true
		//console.log(sliderMoving)
		
		setPosition(newValue)
	  };

	const handleSliderChangeEnd = async ( newValue) => {
		
		//if(!pausedG){
			//await playbackObject.playFromPositionAsync(newValue*1000)
		//	await playbackObject.setPositionAsync(newValue*1000)
		//}
		positionG = newValue
		if(playbackObject){await playbackObject.setPositionAsync(newValue*1000)}
		sliderMoving = false
		//console.log("HEre")
		setSliderMoving(false)
	  };
	  const lineRenderer = useCallback(
		({ lrcLine: { millisecond, content }, index, active }) => (
			<View alignItems={'center'} marginVertical={-150}>
			<TextTicker style={{ textAlign: 'center', color: active ? 'white' : 'gray' , fontSize: 22, textAlignVertical: 'top'}} 
													scrollSpeed={75}
													repeatSpacer={25}
													loop
													bounce={false}
													>
		  
			{content}
		  
		  </TextTicker>
		  </View>
		),
		[],
	  );
	  const renderPlayer = () => { 
		return(
				<>
				 {host ? <View style={baseStyles.controls} >	
					 <View style={baseStyles.sliderView}> 
						
						<Center w={"80%"}>
							<Slider size="md" 
								sliderTrackHeight={5} 
								width={albumWidth}
								value = {position} 
								minValue={0}
								 step={1}
								  maxValue={duration}
								  onChange={(value) => { handleSliderChange(value) }}
								onChangeEnd={(value) => { handleSliderChangeEnd(value) }}
								onTouchCancel={(value) => { handleSliderChangeEnd(value) }}
								onResponderGrant={() => true}
								>
								<SliderTrack bg="#424549">
									<SliderFilledTrack bg="#F2F0F0"/>
								</SliderTrack>
								<SliderThumb
									bg="#F2F0F0"
									sx={{
										":active": {
											outlineColor: "$424549",
										},
									}}
								/>
							</Slider>
							
						</Center>
						
					</View> 
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'space-between',
									width: albumWidth,
									height: '10%',
									marginVertical: 10,											
								}}
								>
									{playbackObject  ? <Text style={baseStyles.songTimes}>{formatDuration(position)}</Text> : <></>}
									{playbackObject  ?<Text style={baseStyles.songTimes}>{formatDuration(duration - position)}</Text> : <></>}
								</Box>	
								
					<View style={baseStyles.playbackControls}>
					<PlaybackContols host={host} song={ currSong } onSkipPressed={handleSkip} service={service} playbackObject={playbackObject} isPlaying={playingSong}/>
					
					</View>
					 <Text style={baseStyles.lyricsLabel}>Lyrics</Text>
				</View> :<></>}
				{loadingLyrics && host ? <Spinner style={baseStyles.spinnerStyle} size="large" color="$white"/> : !loadingLyrics && host && LRC=="" ? 
				<View style={baseStyles.mainContent}>
				<GluestackUIProvider config={config}>
				<View style={baseStyles.emptyQueueDialog} >
							<Text style={baseStyles.emptyQueueText} >
								No lyrics found.
							</Text>
					</View>
					</GluestackUIProvider> 
					</View> : host ?
					<Lyric
					style={{ height: 1 }}
					lrc={LRC}
					currentTime={positionG*1000}
					lineHeight={25}
					lineRenderer={ lineRenderer}
					autoScroll={true}
					   autoScrollAfterUserScroll={500}
					
					marginVertical={-60}
					alignItems={'center'}
					//marginTop={-100}
					//height= {200}
					//minHeight={100}
					//marginBottom={120}
					backgroundColor = '#282B30'
					/>	: <></> }
					</>
		)	
	}
	return (
		<GluestackUIProvider config={config} minHeight={20} >
			
			{host ? <ScrollView style={ baseStyles.scrollView}  onScrollBeginDrag={() => sliderMoving=false} onScrollEndDrag={() => sliderMoving=false}  >	
			{ renderSongInfo(currSong, updatingSong)}
			{host ? <View style={baseStyles.controls} >	
					 <View style={baseStyles.sliderView}> 
						
						<Center w={"80%"}>
							<Slider size="md" 
								sliderTrackHeight={5} 
								width={albumWidth}
								value = {position} 
								minValue={0}
								 step={1}
								  maxValue={duration}
								  onChange={(value) => { handleSliderChange(value) }}
								onChangeEnd={(value) => { handleSliderChangeEnd(value) }}
								onTouchCancel={(value) => { handleSliderChangeEnd(value) }}
								onResponderGrant={() => true}
								>
								<SliderTrack bg="#424549">
									<SliderFilledTrack bg="#F2F0F0"/>
								</SliderTrack>
								<SliderThumb
									bg="#F2F0F0"
									sx={{
										":active": {
											outlineColor: "$424549",
										},
									}}
								/>
							</Slider>
							
						</Center>
						
					</View> 
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'space-between',
									width: albumWidth,
									height: '10%',
									marginVertical: 10,											
								}}
								>
									{playbackObject  ? <Text style={baseStyles.songTimes}>{formatDuration(position)}</Text> : <></>}
									{playbackObject  ?<Text style={baseStyles.songTimes}>{formatDuration(duration - position)}</Text> : <></>}
								</Box>	
								
					<View style={baseStyles.playbackControls}>
					<PlaybackContols host={host} song={ currSong } onSkipPressed={handleSkip} service={service} playbackObject={playbackObject} isPlaying={playingSong}/>
					
					</View>
					 <Text style={baseStyles.lyricsLabel}>Lyrics</Text>
				</View> :<></>}
				{loadingLyrics && host ? <Spinner style={baseStyles.spinnerStyle} size="large" color="$white"/> : !loadingLyrics && host && LRC=="" ? 
				<View style={baseStyles.mainContent}>
				<GluestackUIProvider config={config}>
				<View style={baseStyles.emptyQueueDialog} >
							<Text style={baseStyles.emptyQueueText} >
								No lyrics found.
							</Text>
					</View>
					</GluestackUIProvider> 
					</View> : host ?
					<Lyric
					style={{ height: 1 }}
					lrc={LRC}
					currentTime={positionG*1000}
					lineHeight={25}
					lineRenderer={ lineRenderer}
					autoScroll={true}
					   autoScrollAfterUserScroll={500}
					
					marginVertical={-60}
					alignItems={'center'}
					//marginTop={-100}
					//height= {200}
					//minHeight={100}
					//marginBottom={120}
					backgroundColor = '#282B30'
					/>	: <></> }	
				 
			</ScrollView> : <View style={ baseStyles.controls}>
			{ renderSongInfo(currSong, updatingSong)}
			{renderPlayer()}
			</View>}
			
		</GluestackUIProvider>
	);
}

const renderSongInfo = (song, updatingSong) => {
	if (song != null){
		return (
			<View style={baseStyles.mainContent}>
					<Text style={baseStyles.pageTitle}>Currently Playing</Text>
					<Image source={song.song_img} style={baseStyles.albumImage} />
					<Text style={baseStyles.songTitle}>{song.song_title}</Text>
					<Text style={baseStyles.songArtist}>{song.song_artist}</Text>
			</View>
		);
	}else{
		return (
			<View style={baseStyles.mainContent}>
				<Text style={baseStyles.pageTitle}>Currently Playing</Text>
				<GluestackUIProvider config={config}>
					{updatingSong ? <Spinner style={baseStyles.spinnerStyle} size="large" color="$white"/> :<View style={baseStyles.emptyQueueDialog} >
						<Text style={baseStyles.emptyQueueText} >
							There are currently no songs in the queue.
							{"\n"}
							Add songs to start playing!
						</Text>
					</View>}
				</GluestackUIProvider>
			</View>
		)
	}
}

const PlaybackContols = ({host, song, onSkipPressed, service, playbackObject, isPlaying }) => {
	const [paused, setPaused] = useState(isPlaying);
	const [trackUri, setTrackUri] = useState(null);
		
	useEffect( () => {
		//console.log(props)
		if (song != null){
			setTrackUri(song.songID)	
		}
	})
	
	/**
	 * Handles the playback of a song & icons displayed.
	 */
	const handlePlayback = async () => {
			
		if (paused == false){
			playSong();
		}else{
			pauseSong();
		}
	}

	const fetchNextSong = async () => {
		if (service == "spotify"){
			await fetch(`${baseUrl}/spotify/skip`)
				.then(response => response.json())
				.then(data => {
					console.log("call currsong fetchnext")
					onSkipPressed()
				})
				.catch(error => console.error(error));
		} else {
			if (playbackObject!=null){ //Unload song from memory when previous song is finished
				playbackObject.unloadAsync()
				playbackObject = null
			}
			await fetch(`${baseUrl}/queue/next`)
				.then(response => response.json())
				.then(data => {
					console.log("call currsong fetchnext")
					updateCurrSong(data);
				})
				.catch(error => console.error(error));
		}
	}

	const spotifySkip = async () => {
		console.log("spotify skipping")
		fetch(`${baseUrl}/spotify/skip`)
			.then(response => response.json())
			.then(data => {
				console.log("skipping song")
				onSkipPressed();
			})
			.catch(error => console.error(error));
	}

	const handleSkip = () => {
		console.log("skip pressed")
		if (service === "spotify"){
			spotifySkip();
		}else if (service == "soundcloud"){
			//setPaused(false)
			onSkipPressed();
		}
	}

	/**
	 * Plays a song by making a fetch request to the specified track URI.
	 * @async
	 * @function playSong
	 * @returns {Promise<void>} A promise that resolves when the song starts playing.
	 */
	const playSong = async () => {
		if (service == "spotify"){
			await fetch(`${baseUrl}/${service}/play`)
			.then(response => {
				setPaused(true);
				pausedG=false
			})
			.catch(err => console.error(err))
		}else if (service == "soundcloud"){
			setPaused(true);
			pausedG=false
			isPlaying = true
		//	console.log(playbackObject)
			//await Player.playbackObject.playAsync()
			console.log(host)	
			//await playbackObject.playFromPositionAsync(positionG*1000)
			if(playbackObject){await playbackObject.playAsync()}
			//await playbackObject.playFromPositionAsync(130000)
		}	
	}
		
	/**
	 * Pauses the currently playing song.
	 * @async
	 * @function pauseSong
	 * @returns {Promise<void>} A promise that resolves when the song is paused.
	 */
	const pauseSong = async () => {
		if (service == "spotify"){
			await fetch(`${baseUrl}/${service}/pause`)
				.then(response => {
					setPaused(false);
					pausedG=false
				})
				.catch(err => console.error(err))
		}else if(service == "soundcloud"){
			setPaused(false);
			pausedG=true
			
			if(playbackObject){await playbackObject.pauseAsync();}
		}
	}
	  
	if (host){
		return(
			<GluestackUIProvider config={config}>
				<View style={hostStyles.playback} >
					{/* Queue button */}
					<Link href='/queue' asChild >
						<Pressable>
							<MaterialIcons name="queue-music" size={40} color="#F2F0F0" />
						</Pressable>
					</Link>
					{/* Play/Pause button */}
					<Pressable onPress={handlePlayback}>
						{paused ? 
						<AntDesign name="pausecircle" size={60} color="#F2F0F0" /> :
						<AntDesign name="play" size={60} color="#F2F0F0" />
						}
					</Pressable>
					{/* Skip song button */}
					<Pressable onPress={handleSkip} >
						{/* <Ionicons name="play-skip-forward" size={40} color="white" /> */}
						<MaterialIcons name="skip-next" size={45} color="#F2F0F0" />
					</Pressable>
				</View>
			</GluestackUIProvider>
		);
	}else {
		return(
			<>
			</>
			// <GluestackUIProvider config={config}>
			// 	<View style={playbackStyles.playback} >
			// 		<Link replace href="/addsong" asChild>
			// 			<Button style={playbackStyles.addSongButton} bg="#057602" >
			// 				<ButtonText color="white" >Add Song to Queue</ButtonText>
			// 				<ButtonIcon as={AddIcon} color="white" size="xl"/>
			// 			</Button>
			// 		</Link>
			// 	</View>
			// </GluestackUIProvider>
		);
	}
}

// Album Cover Resolution Scaling
const albumWidth = ((0.85) * screenWidth)
const albumHeight = ((0.40) * screenHeight)

// Stylesheet
const baseStyles = StyleSheet.create({
	mainContent: {
		backgroundColor: '#282B30',
		flexDirection: 'column',
		alignItems: 'center',
		//marginBottom: '5%',
	},
	pageTitle: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 30,
		marginBottom: '5%',
		marginTop: '5%',
		justifyContent: 'center'
	},
	songTitle: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 24,
		marginTop: '5%',
		justifyContent: 'center'
	},
	lyricsLabel: {
		color: '#F2F0F0',
		fontWeight: 'bold',
		fontSize: 24,
		marginTop: '5%',
		justifyContent: 'center'
	},
	songArtist: {
		color: '#F2F0F0',
		fontSize: 18,
		justifyContent: 'center',
		marginBottom: '5%',
	},
	albumImage: {
		height: albumHeight,
		width: albumWidth,
		borderWidth: 1,
		borderColor: 'transparent',
		borderRadius: 10
	},
	controls: {
		backgroundColor: '#282B30',
		flexDirection: 'column',
		alignItems: 'center',
		flexGrow: 2,
	},
	container: {
		backgroundColor: '#282B30',
		flexDirection: 'column',
		//alignItems: 'center',
		flexGrow: 2,
	},
	sliderView: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: '5%',
		maxWidth: '90%',
		gap: 15,
	},
	songTimes: {
		color: '#F2F0F0',
		fontSize: 12,
		justifyContent: 'center'
	},
	playbackControls: {
		flexDirection: 'row',
		maxWidth: '90%',
		marginTop: '1.5%'
		//flexGrow: 2,
	},
	scrollView:{
		maxHeight: scrollViewHeight,
	},
	scrollViewLoading:{
		maxHeight: scrollViewHeight/1,
		
	},
	scrollViewItems: {
		gap: 5,
	},
	emptyQueueDialog: {
		flexDirection: 'column',
		justifyContent: 'center',
		borderColor: '#F2F0F0',
		borderWidth: 1,
		borderRadius: 10,
		height: albumHeight,
		width: albumWidth,
		marginBottom: '25%'
	},
	emptyQueueText: {
		color: '#F2F0F0',
		textAlign: 'center',
		fontSize: 16,
	},
	spinnerStyle: {
		backgroundColor: '#282B30',
		color: '#F2F0F0',
		flexDirection: 'row',
		alignItems: 'center',
		height: albumHeight*1.2,
		width: screenWidth,
		marginBottom: -10,
		
		marginBottom: 10,
		zIndex: 100,
	}
});

const playbackStyles = StyleSheet.create({
	playback: {
		flexDirection: 'row',
		flexGrow: 1,
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	addSongButton: {
		borderWidth: 1,
		borderColor: 'black',
		borderRadius: 50,
		gap: 5,
		minHeight: 50 
	},
});


const hostStyles = StyleSheet.create({
	playback: {
		flexDirection: 'row',
		flexGrow: 1,
		justifyContent: 'space-around',
		alignItems: 'center'
	}
});
