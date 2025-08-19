import React, { useEffect, useState } from 'react';

// Native imports.
import { Text, View, StyleSheet, Dimensions, Animated } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useFocusEffect, useRoute } from '@react-navigation/native';

// Gluestack imports.
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

// Component imports.
import UserListItem from "../../components/manageusers/UserListItem";
import GLOBAL from "../global"
import SOCKET from "../socket"

// Globals
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const scrollViewHeight = ((0.65) * windowHeight);

// Another Page component export
export default function ManageUsers() {
	const route = useRoute()
	const [loadingPartyAnimals, setLoadingPartyAnimals] = useState(true);
	const [partyAnimals, setPartyAnimals] = useState("");
	const [updated, setUpdated] = useState(false)
	//const userID = route.params?.userID
	//const userName = route.params?.userName
	const partyAnimalList = route.params?.partyAnimals
	const hostID = route.params?.hostID
	//console.log("LIST: ", partyAnimalList)
	useFocusEffect( 
		React.useCallback((manageusers) => {
		fetchPartyAnimals()
		setUpdated(false)
	}, [updated])
	);

	useEffect(() => {
		SOCKET.socket.on('refreshManageAnimals', (test) => {
			console.log(test)
			console.log("In refresh manageusers")
			//fetchQueue();
			setUpdated(true)
		})
	}, [])
	
	
	const fetchPartyAnimals = async() => {
		const roomID = GLOBAL.roomID
		setLoadingPartyAnimals(true);
		console.log("Getting animal list from room: ", roomID)
			await fetch(`${baseUrl}/room/getAnimals/${roomID}`)
				.then(result => result.json())
				.then(data => {
					if (data.status == 200){
					console.log("Connected Users: ", data.partyAnimalList)
					setPartyAnimals(data.partyAnimalList)
					//partyAnimalsGlobal = ["john", "bob", "cat"]
					setLoadingPartyAnimals(false);
					
				
					}
				})
				.catch(error => {
					console.error('Error:', error);
				  });
	}
    return (
        <GluestackUIProvider config={config}>
    
            <View style={styles.main}>
                <Text style={styles.pageTitle}>All Party Animals</Text>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.scrollViewItems}>
                        {loadRoom(partyAnimals, config, true, hostID)}
                    </View>
                </ScrollView>
                
            </View>
        </GluestackUIProvider>
      );
}
const loadRoom = (userList, config, host, hostID)=>{
	
	
	console.log("User List: ",userList)
	//console.log("User List Length: ",animalList.length)
	var animalList = []
	animalList = (userList)
	//console.log(userList[0].userid)
	if (animalList.length === 0){
		return (
			<GluestackUIProvider config={config}>
				<View style={styles.emptyRoomDialog} >
					<Text style={styles.emptyRoomText} >
						There are currently no party animals connected to your room.
						{"\n"}
						Share your room to start the party!
					</Text>
				</View>
			</GluestackUIProvider>
		);
	}else{
		const userItems = animalList.map((user) => 
			<UserListItem style={styles.userList} key={user.userid} userName={user.name}  host={host} userID={user.userid} hostID = {hostID}/>
			);
		return (
			<GluestackUIProvider config={config}>
				{userItems}
			</GluestackUIProvider>
		);
	}
}


/*
Dummy list of connected party animals.
*/
/*
const partyAnimalList = [
    { id: "Patrick Star"},
    { id: "Eugene Krabs"},
    { id: "Michael Jackson"},
    { id: "Jim De St Germain"}
   ]
   */
const styles = StyleSheet.create({
	main:{
		backgroundColor: '#282B30',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		gap: 5,
		flexGrow: 1

	},
	text:{
		color: "#F2F0F0",
		padding: 10
	},
	button: {
		marginStart: 10,
		marginEnd: 10
	},
	pageTitle:{
		color: "#F2F0F0",
		fontWeight: 'bold',
		fontSize: 30,
		marginBottom: '5%',
		marginTop: '5%'
	},
	scrollView:{
		maxHeight: scrollViewHeight
	},
	scrollViewItems: {
		gap: 5,
	},
	bottomControls: {
		flexGrow: 1,
		flexDirection: 'column',
		justifyContent: 'flex-end',
	},
	emptyRoomDialog: {
		flexDirection: 'column',
		justifyContent: 'center',
		borderColor: '#F2F0F0',
		borderWidth: 1,
		borderRadius: 10,
		minWidth: '85%',
		minHeight: 75
	},
	emptyRoomText: {
		color: '#F2F0F0',
		textAlign: 'center',
		fontSize: 16
	}
})