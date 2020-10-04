# Run the build pipeline
[https://technicallyrural.ca/2017/09/02/how-to-run-typescript-in-the-browser/](source)

Open command line in this folder, then execute this command (it will take approx. 10 seconds):
```
npm run pipeline
```

Open this file in your web browser:
./build/index.html







# --- ALT ---
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