import * as readline from 'readline'
import { createWriteStream } from 'fs'

// const noop = () => {}
// eslint-disable-line  @typescript-eslint/no-empty-function

const generateEnvironment = async () => {
  const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const config = {
    URL:
      'https://nate-eu-west-1-prediction-test-webpages.s3-eu-west-1.amazonaws.com/tech-challenge/page1.html',
    CITY: 'London',
    NAME: 'nate',
    PHONE: '07000000000',
    PASSWORD: '07000000000',
    EMAIL: 'nate@nate.tech',
    GENDER: 'female',
  }

  const question = (str: string) =>
    new Promise<string>((resolve) => reader.question(str, resolve))

  const url = await question(`url (default ${config.URL}):`)
  config.URL = url || config.URL

  const name = await question(`name (default ${config.NAME}):`)
  config.NAME = name || config.NAME

  const city = await question(`city (default ${config.CITY}):`)
  config.CITY = city || config.CITY

  const phone = await question(`phone (default ${config.PHONE}):`)
  config.PHONE = phone || config.PHONE

  const password = await question(`password (default ${config.PASSWORD}):`)
  config.PASSWORD = password || config.PASSWORD

  const email = await question(`email (default ${config.EMAIL}):`)
  config.EMAIL = email || config.EMAIL

  const gender = await question(`gender (default ${config.GENDER}):`)
  config.GENDER = gender || config.GENDER

  reader.close()

  const stream = createWriteStream('./.env')
  Object.entries(config).forEach(([key, value]) => {
    const data = new Uint8Array(Buffer.from(`${key}=${value}\n`))
    stream.write(data)
  })
}

generateEnvironment()
