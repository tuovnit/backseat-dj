# Backseat DJ

Backseat DJ is a mobile application built using React Native Expo with a Node.js backend using Express. Backseat DJ allows you to connect with your friends
to share a music queue and improve your music listening experience. Whether it's a road trip or a party, let your guests
take control of the music by searching, adding, and voting on the songs you want to hear!


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them.

```bash
npm install npm@latest -g
```

### Installation

1. Clone the repo

```bash
git clone https://capstone-cs.eng.utah.edu/backseat-dj/backend.git
```

2. Install NPM packages

```bash
npm install
```
### Setup `.env`

A `.env` file may be necessary to specify database connection information. To setup and use a `.env` file, follow the steps below:

1. Create a new file in the root directory of your project.
2. Name the file .env. The leading dot indicates that it is a hidden file.
3. Open the `.env` file in a text editor.
4. Add your environment variables in the format KEY=VALUE. For example:
key

NOTE: Each line represents a separate environment variable.

## Usage

Running the system via NPM:

```bash
npm start
```

## Deployment

Deployment via AWS EC2 instance. 

## Built With

* [Node.js](https://nodejs.org/) - The backend framework used
* [Express.js](https://expressjs.com/) - Node.js web application framework
* [MySQL](https://www.mysql.com/) - Database
* [Sequelize](https://sequelize.org/) - Database Management Framework
* [Socket.io](https://socket.io/) - Socket Communication

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
