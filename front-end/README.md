# Do only once: install npm
Download and install npm from [https://www.npmjs.com/get-npm](here).  

After installation, open the shell in this folder, then execute this command:
```
npm install
```


# Run the build pipeline

## If you have changed javascript code
Open the shell in this folder, then execute this command (it will take approx. 15 seconds):
```
npm run pipeline
```
[https://technicallyrural.ca/2017/09/02/how-to-run-typescript-in-the-browser/](source)

## If you have changed html and css
Open the shell in this folder, then execute this command:
```
npm run postbuild
```

## Launch website
Open this file in your web browser:
./build/index.html







# ----- ALT -----
# Do once: install dependencies
Open command line in this folder, then execute this command:
```
npm install --global http-server
```

# Do only when you start your computer
## Run your server
Open command line tool (not PowerShell!), browse into this folder, then run
```
http-server build
```

## Open the website
Browse this website with your internet browser:  
http://127.0.0.1:8080


# Do always when you changed your code:
Open command line in this folder, then execute this command:
```
npm run pipeline
```

Press F5 in the internet browser.

# Notes
It does not work to use `import mapCreator from "./map-creator";` and use this in the 'tsconfig.json' compiler settings:
```
      "module": "es2015",
      "moduleResolution": "node"
```