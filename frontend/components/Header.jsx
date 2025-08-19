// Native imports.
import { StyleSheet, View, Pressable } from "react-native";

// Expo imports.
import { Link } from "expo-router";
import { AntDesign, Ionicons } from "@expo/vector-icons";

// Gluestack imports.
import { config } from "@gluestack-ui/config"
import { GluestackUIProvider } from "@gluestack-ui/themed"

/*
	Header component - Displays specified icons at the top of the screen and allows
	the user to navigate between different pages

	Size - component scales based on size of screen. Header box takes 20% of screen
	height

	Props:

	leftButton - determines what kind of button is displayed in the top left corner
	leftButtonPath - determines where the button navigates to
	rightButton - determines what kind of button is displayed in the top right corner
	rightButtonPath - determines where the button navigates to
*/
export default function Header(props) {

	return (
		<GluestackUIProvider config={config}>
			<View style={styles.header}>
				
				{setupLeftButton(props.leftButton, props.leftButtonPath)}
				
				{setupRightButton(props.rightButton, props.rightButtonPath)}

			</View>
		</GluestackUIProvider>
	);
}

/*
*	setupLeftButton() - formats the button for the left side of the header
*	by getting the specified icon name and path for where the button should point
*
*	buttonIcon (string) - string with the name of the icon to display
* 	buttonPath (string) - path of page that the button should display
*/
function setupLeftButton(buttonIcon, buttonPath){
	if (buttonIcon){
		return (
			<Pressable>
				<Link href={buttonPath} asChild>
					{getIcon(buttonIcon)}		
				</Link>
			</Pressable>
		);
	}else{
		return (
			<View>
			</View>
		)
	}

}

/*
*	setupLeftButton() - formats the button for the left side of the header
*	by getting the specified icon name and path for where the button should point
*
*	buttonIcon (string) - string with the name of the icon to display
* 	buttonPath (string) - path of page that the button should display
*/
function setupRightButton(buttonIcon, buttonPath){
	if (buttonIcon){
		return (
			<Pressable>
				<Link href={buttonPath} asChild>
					{getIcon(buttonIcon)}		
				</Link>
			</Pressable>
		);
	}else{
		return (
			<View>
			</View>
		)
	}

}

/*
*	getIcon - takes in an icon name and returns a react object with the 
*	formatted icon 
*
*	icon (string) - name of icon to be displayed
*/
function getIcon(icon){
	if (icon == "backArrow"){
		return (
			<AntDesign name="arrowleft" size={40} color="#F2F0F0" />
		);
	}else if (icon == "menuUnfold"){
		return (
			<AntDesign name="menuunfold" size={40} color="#F2F0F0" />
		);
	}else if (icon == "menuFold"){
		return (
			<AntDesign name="menufold" size={40} color="#F2F0F0" />
		);
	}else if (icon == "profile"){
		return (
			<Ionicons name="person-circle-outline" size={40} color="#F2F0F0" />
		);
	}else if (icon == "settings"){
		return (
			<Ionicons name="settings-outline" size={40} color="#F2F0F0" />
		);
	}
}

// Stylesheet 
const styles = StyleSheet.create({
	header: {
		maxHeight: '10%',
		justifyContent: 'space-between',
		alignItems: 'center',
		flexDirection: 'row',
		marginStart: '5%',
		marginEnd: '5%',
	}
});


