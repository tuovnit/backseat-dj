import React, {useState} from 'react';

// Native imports.
import { StyleSheet, Text, View } from "react-native";

// Gluestack imports.
import { config } from "@gluestack-ui/config"
import { Button, ButtonIcon, GluestackUIProvider, ChevronDownIcon, ChevronUpIcon, Spinner } from "@gluestack-ui/themed"

// Local imports.
import GLOBAL from "../../app/global"
import { socket } from "../../app/socket";

// Sample component export
export default function VoteCounter(props){
	const [count, setCount] = useState(props.voteCount);
	const [isLoading, setIsLoading] = useState(false);

	// increases the vote count when the upvote button is clicked
	function handleUpvote(){
		setIsLoading(true)
		console.log("upvoting song with id:", props.id)
		socket.emit('upVote', GLOBAL.userID, props.id, true, false, (result) => {
			console.log(result);
			if (result.status == 200){
				setCount(result.count);
				setIsLoading(false)
			}
		})
	}
	
	// decreases the vote count when the downvote button is clicked
	function handleDownvote(){
		setIsLoading(true)
		console.log("downvoting song with id:", props.id)
		socket.emit('downVote', GLOBAL.userID, props.id, false, true, (result) => {
			console.log(result);
			if (result.status == 200){
				setCount(result.count);
				setIsLoading(false)
			}
		})
	}

  return (
	<GluestackUIProvider config={config}>
		<View style={style2.voteCounter}>
			<Button bg="$transparent" borderRadius="$full" style={styles.upvote} onPress={handleUpvote}>
				<ButtonIcon as={ChevronUpIcon} color="#057602" size='xl' />
			</Button>
			{isLoading ? 
				<Spinner size="small"/>
				:
				<Text style={styles.voteNum}>{count}</Text>
			}
			<Button bg="$transparent" borderRadius="$full" style={styles.upvote} onPress={handleDownvote}>
				<ButtonIcon as={ChevronDownIcon} color="#E40707" size="xl"/>
			</Button>
		</View>
	</GluestackUIProvider>
  );
}


const styles = StyleSheet.create({
	// voteCounter - handles styling for the view which contains the up arrow, num votes, and down arrow
	voteCounter: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		alignItems: 'center',
		flexGrow: 0,
		maxWidth: "30%", 
	},
	// voteNum - handles styling for number of votes displayed between the arrows
	voteNum: {
		textAlign: 'center',
		fontSize: 16,
		minWidth: 25,
		color: "#F2F0F0"

	},
	// upvote - styling for upvote button
	upvote: {
	},
	// downvote - styling for downvote button
	downvote: {
	}
});


const style2 = StyleSheet.create({
	voteCounter: {
		flexDirection: 'column',
		justifyContent: 'space-evenly',
		alignItems: 'center'
	},
	// voteNum - handles styling for number of votes displayed between the arrows
	voteNum: {
		textAlign: 'center',
		fontSize: 16,
		minWidth: 25,
		color: "#F2F0F0"

	},
	// upvote - styling for upvote button
	upvote: {
	},
	// downvote - styling for downvote button
	downvote: {
	}
})