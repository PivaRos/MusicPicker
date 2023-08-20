# MusicPicker

MusicPicker is a nodejs application that allow's the user to give controlled access of the media player to the LAN users

## Installation

Install dependencies

```bash
npm install
```

Edit DefaultAppConfig.json in order to setup your configuration

Example:

```json
{
  "platform": "spotify/youtube-music",
  "genres": ["alternative", "samba"]
}
```

Add .env file

note: You will have to setup spotify/youtube-music application prior to adding .env file

```bash
client_id = "<client_id>"
client_secret = <client_secret>
redirect_route = "/example/route"
PORT = <PORT>
```

## Usage

Then start the application as developer

```bash
npm run dev
```

At the first start you will have to visit localhost:PORT/auth/login in order to authorize the application to control the player.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
