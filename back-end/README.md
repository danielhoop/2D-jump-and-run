# Do only once: install npm
Download and install npm from [https://www.npmjs.com/get-npm](https://www.npmjs.com/get-npm).  

# Do this, when dependencies have changed
## Development & production
Open the shell in this folder, then execute this command:
```
npm install
```
## Production only
Open the shell in this folder, then execute this command:
```
npm install --only=prod


# Run the build pipeline
Open the shell in this folder, then execute this command:
```
npm run pipeline
```
The server will be started automatically.


# Only start the server (without building)
Open the shell in this folder, then execute this command:
```
npm run startServer
```
