import { useEffect, useState } from 'react';

// Native imports.
import { Text, View, StyleSheet, Image } from 'react-native';

function Help() {

	return(
		<View style={styles.container}>
			<Image style={styles.logo} source={require('../../assets/BDJ-logo-black.png')}/>
			<Text style={styles.title}>Spotify Connection Troubleshooting</Text>
			<Text style={{marginStart: 10, marginEnd: 10, textAlign: 'center', fontSize: 16}}>
				This guide will help you troubleshoot all issues with Spotify and potential ways to resolve them. 
			</Text>
			<View style={styles.mainContent}>
				<View style={styles.issue}>
					<Text style={styles.issueTitle}>1. Spotify Session Not Found</Text>
					<Text style={styles.issueSolution}>
						If you are unable to connect to a Spotify session, try some of these
						possible solutions:
						{'\n'}
						{'\n'}
						- Ensure that your Spotify is playing a track, playlist, or podcast episode
						{'\n'}
						- Check that your Spotify account is connected to your Backseat DJ profile
						{'\n'}
						- Ensure you are connected to the internet and your connection is stable
					</Text>
				</View>
			</View>
		</View>
	)

}

export default Help;

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		flexGrow: 1,
		backgroundColor: '#F2F0F0'
	},
	logo: {
		width: 125,
		height: 125
	},
	title: {
		fontWeight: 'bold',
		fontSize: 30,
		marginBottom: '5%',
		textAlign: 'center'
	},
	mainContent: {
		width: '100%'
	},
	issue: {
		margin: 15,
		paddingTop: 10,
		paddingBottom: 10,
		borderTopWidth: '1px',
		borderBottomWidth: '1px',
		borderColor: 'black',
	},
	issueTitle: {
		fontSize: 22,
		fontWeight: 'bold'
	},
	issueSolution: {
		marginTop: 10
	},
})