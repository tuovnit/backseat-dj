import React, { useState } from 'react';

// Native imports.
import { Dimensions, LayoutAnimation, Pressable, StyleSheet, Text, View, Alert } from "react-native";

// Expo imports.
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { socket } from '../../app/socket';
// Gluestack imports.
import { ButtonIcon, GluestackUIProvider, Button, CloseIcon} from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

// Global variables.
const windowWidth = Dimensions.get('window').width; // Height of the screen.
//const [icon, setIcon] = useState(<AntDesign name="pluscircleo" size={30} color="white" />)
//const twirl = new Animated.Value(0);

/* Item that displays a user name, and a remove button if host view is enabled.
*
* Props:
*
* key (integer) - holds the id of the user object
* userName (string) - represents the name of the connected party animal
* host (bool) - displays an icon to remove the party animal from the room if 
* enabled (hosts view only) 
*/
export default function UserListItem(props) {
	const [expanded, setExpanded] = useState(false);
    const [icon, setIcon] = useState(<AntDesign name="pluscircleo" size={30} color="white" />);
	
	const kickPartyAnimalAlert = () => {
		Alert.alert('Kick Party Animal?',
					`You are about to remove ${props.userName} from the queue. Do you want to continue?`,
					[
						{
							text: 'Cancel',
							style: 'cancel',
						},
						{
							text: 'OK',
							onPress: handleRemoveUser,
						}
					]);
	}
	const handleRemoveUser = () => {
		socket.emit("kick", props.userID); 
	 }
	 /*
		*	displayHostContent - loads relevant content into list items for host view
		*
		*	userName (String) - the name of the connected party animal
		*/
		function displayHostContent(userName) {	
			return(
			<>
				<Text style={hostStyles.userName}>{userName} </Text>
				{props.host && (props.userID!=props.hostID) ?
				<Pressable backgroundColor="#ff0a0a" width={30} borderRadius={30}
								onPress={kickPartyAnimalAlert}
								style={({pressed}) => [
									{
									  backgroundColor: pressed ? '#b70000' : '#ff0a0a',
									}
									
								  ]}
							>
									{<AntDesign name="closecircleo" size={30} color="white" />}
							</Pressable>
			:<></>}
			</>
			);			
		}
	if (props.host){
		
			// returns host view list item 
			return (<GluestackUIProvider config={config}>
					
						<View style={expanded === false ? hostStyles.listItem : expandedStyles.expandedListItem}>
							{displayHostContent( props.userName)}
						</View>
					
				</GluestackUIProvider>);
		
	}else{
		
			// returns basic list item 
			return (
				<GluestackUIProvider config={config}>
					
						<View style={expanded === false ? baseStyles.listItem : expandedStyles.expandedListItem}>
							{displayBaseContent(props.userName)}
						</View>
					
				</GluestackUIProvider>
			  );
		
	}
	

}



/*
*	displayBaseContent - loads relevant content into list items for party animal view
*
*	userName (String) - the name of the connected party animal
*/
function displayBaseContent(userName) {		
	return (
	<>
		<Text style={baseStyles.userName}>{userName} </Text>				
	</>
	);
}



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

		// Dimensions
		width: listItemWidth,
		height: 75
	},
	userName: {
		color: "#F2F0F0",
		padding: 10,
		textAlign: 'center',
		flexGrow: 2,
		fontSize: 16,
	},
});



// Styles for host view
const hostStyles = StyleSheet.create({
	listItem: {
		// Background and Borders
		backgroundColor: '#424549',
		borderWidth: 1,
		borderColor: 'black',
		borderRadius: 15,

		// Flex
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',

		//Padding and margins
		marginStart: 15,
		marginEnd: 15,
        paddingStart: 10,
		paddingEnd: 10,
		// Dimensions
		width: listItemWidth,
		height: 75
	},
	userName: {
		color: "#F2F0F0",
		padding: 10,
		textAlign: 'center',
		flexGrow: 2,
		maxWidth: '90%',
		fontSize: 22
	},
	removeButton: {
		borderRadius: 100,
		width: 50,
		height: 50,
		backgroundColor: "#E40707",
		justifyContent: 'center',
		alignItems: 'center',

	}
});

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
		height: 200
	}
});
