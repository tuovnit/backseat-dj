require('dotenv').config();

// Spotify Tests

// NOTE: only works on first run since other tests update device id.
test('getting playback device is null', async () => {
	return fetch(`${process.env.BASE_URL}/spotify/playback`)
		.then(result => result.json())
		.then(data => {
			expect(data.playbackDevice).toBe(null);
		})
});

test('set playback device', async () => {
	const deviceID = '12345';
	
	const payload = {
		deviceID: deviceID
	}

	return fetch(`${process.env.BASE_URL}/spotify/playback`, {
		method: 'PUT',
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})
		.then(result => result.json())
		.then(data => {
			expect(data.type).toBe('success')
		})
});

test('playback device is updated', async () => {
	const deviceID = '1234567';
	
	const payload = {
		deviceID: deviceID,
	}

	// Update device
	fetch(`${process.env.BASE_URL}/spotify/playback`, {
		method: 'PUT',
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})
		.then(result => result.json())
		.then(data => {
			expect(data.type).toBe('success')
		})

	// check update	
	fetch(`${process.env.BASE_URL}/spotify/playback`)
		.then(result => result.json())
		.then(data => {
			expect(data.playbackDevice).toBe('1234567')
		})
})

// NOTE: Test only works when 
test('playback device list', async () => { 
	return await fetch(`${process.env.BASE_URL}/spotify/devices`, {
			headers: {
				'Content-Type': 'application/json',
			}
		})
		.then(response => {
			response.json()
			expect(response.ok).toBe(true);
		})
		.then(data => {
			expect(data.devices).toBe([]);
		})
		.catch(error => {
			console.log("Error fetching playback devices - " + error);
		})
})