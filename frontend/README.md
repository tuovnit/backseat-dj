# Backseat DJ

Backseat DJ is a mobile application built using React Native Expo. Backseat DJ allows you to connect with your friends
to share a music queue and improve your music listening experience. Whether it's a road trip or a party, let your guests
take control of the music by searching, adding, and voting on the songs you want to hear!

## Setup

Follow these steps to setup the Expo app:

1. Install Node.js and npm. You can download them from [here](https://nodejs.org/).

2. Install Expo CLI by running the following command in your terminal:

```bash
npm install -g expo-cli
```

3. Clone this repository:

```bash
git clone https://capstone-cs.eng.utah.edu/backseat-dj/backseat-dj.git
```

4. Navigate into the project directory:

```bash
cd Backseat-DJ
```

5. Install the dependencies:

```bash
npm install
```

6. Start the Expo server:

```bash
expo start
```
or 
```bash
npx expo start
```
## Setting up and Adding a .env File to an Expo Project

To set up and add a .env file to your Expo project, follow these steps:

1. **Install the necessary dependencies**:
   Make sure you have `react-native-dotenv` installed in your project. 
   
   If not, you can install it by running the following command:

   ```bash
   npm install react-native-dotenv --save
   ```

2. **Create a .env file**:
   Create a file named `.env` at the root of your project directory. This file will store your environment variables in the format `KEY=value`.

3. **Add environment variables**:
   Add your environment variables to the `.env` file.

   In this case, you may create your own or add these preset ones which handle communication with our backend hosted on AWS.

   ```plaintext
	# Hosting stuff
	EXPO_PUBLIC_BASE_URL='http://3.133.210.237:3000'
	EXPO_PUBLIC_HOSTNAME='3.133.210.237'
	EXPO_PUBLIC_PORT=3000

	# Spotify app stuff
	EXPO_PUBLIC_SPOTIFY_CLIENT_ID='270d164a81be45baa68b4e12798bfc41'
	EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET='57d2ea6d81fa466ba8f26a97c766fd7c'
	EXPO_PUBLIC_SPOTIFY_REDIRECT_URL='http://3.133.210.237:3000/spotify/spotify-auth-callback'
	```

4. **Accessing environment variables**:
   To access these environment variables in your code, you can use the `dotenv` package. Import `dotenv` at the top of your file and configure it to load the variables from the `.env` file:

   ```javascript
   import 'dotenv/config';
   ```

   Now you can access the variables as follows:

   ```javascript
   const apiKey = process.env.API_KEY;
   const baseUrl = process.env.BASE_URL;
   ```

5. **Usage in Expo project**:
   If you are using Expo, you can access the variables in your Expo project. Just ensure that you have `dotenv` setup correctly as mentioned above.

By following these steps, you should be able to add all the information needed to run our application. Without a proper `.env` file setup, there will be no communication with
the server.


## Usage

After starting the Expo server, you can run the app on your device by scanning the QR code displayed in the terminal or on the Expo developer tools page that opens in your web browser.

You can also use an Android or iOS emulator. On the Expo developer tools page, click "Run on Android device/emulator" or "Run on iOS simulator".

## License

[MIT](https://choosealicense.com/licenses/mit/)

