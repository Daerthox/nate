# Nate code challenge

## Description

This is an attempt to solve the nate code challenge consisting in navigating through a sample website and filling out forms based on given data.

When the app runs, it logs the pages' html and css content as files in a `logs` folder created on demand where the app is run.

## Installation

```
npm install
```

## Setup

The application expects some variables to be made availble through the environment.
You can provide the necessary variables through:

```
npm run genenv
```

## Local development

```
npm run local
```

## Test
```
npm run test
```

## Build
```
npm run build
```

This will save the compiled files under the `dist` folder.
You can then run your compiled program using:
```
node dist/src/index.js
```

## Observations

I have picked puppeteer as the main framework for the task.
Since puppeteer is actively maintained and immensely popular, I trust it to be tested properly.
I have only added thin wrappers for tagging elements and logging pages to files.

I also chose TypeScript as it is now my tool of choice and Puppeteer fully supports it.

The architecture is quite straightforward. I kept everything as flat as possible, automated tasks such as linting, formatting and testing on commit/push with the help of husky.
User data and urls are provided through environment variables. I have created a script to help generating them in a file and kept the file out of git.

For the sake of speed and simplicity I allowed myself to ignore a number of things. Mostly, the potential I/O issues when dealing with writing or reading files, and the validation of environment variables.

Both wrappers (for tagging and logging pages to files) are unit tested. You can find the test in the `tests` folder.
I chose to mock as little as possible (and in fact, did not mock anything at all) to mimic as closely as possible the in-app usage.

As for the main behaviour of the app, I did not see much benefit in unit testing it. For unit tests to be of value, they need to be fast and reliable, which implies to mock any networking layer. This would amount to testing puppeteer itself which is not very interesting. The app would benefit instead from integration tests. Unfortunately, I did not find enough time to invest in integration tests.

## Notes

The instructions specify a number of "bonus" considerations.
I have attempted some of them with mixed success and chose to leave unseccessful attempts out of the project. I wish to briefly describe my attempts here:

For example, I gave up tagging visible elements when I discovered how loose the definition of "visible" can get in a headless browser. I was able to target elements based on their "display" and "visibility" properties on top of their styling and hidden properties. This is incomplete in my opinion, as it disregards z-index, opacity and height (which could be 0). I am sure that there must be many more considerations of what constitute "visible". I was not interested in installing more third-party libraries and simply decided to move on.

Having built many dockerized app in the past, I thought that this one would be similar and failed to identify the unique challenges that puppeteer poised. I only attempted to create a Dockerfile late in the project. I hurt myself to the issue of base images typically missing chromium. Rather than insisting in skimming the web for a solution, I decided there was no point in simply copy/pasting some Dockerfile and chose to stop.

Finally, I think that I partially succeeded in extracting and logging the css content to files, and left this in the project. However it seems my program cannot always read the provided stylesheet. Probably some networking issue (CORS?), but at this stage I was happy to move on.
