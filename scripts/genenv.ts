import * as readline from 'readline'
import { createWriteStream } from 'fs'

const noop = () => {}

const generateEnvironment = async () => {
    const reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    const config = {
        URL: 'https://nate-eu-west-1-prediction-test-webpages.s3-eu-west-1.amazonaws.com/tech-challenge/page1.html',
        CITY: 'London',
        NAME: 'nate',
        PHONE: '07000000000',
        PASSWORD: '07000000000',
        EMAIL: 'nate@nate.tech',
        GENDER: 'female',
    }

    const question = (str: string) => new Promise<string>(resolve => reader.question(str, resolve))

    const url = await question(`url (default ${config.URL}):`)
    url ? config.URL = url : noop()

    const name = await question(`name (default ${config.NAME}):`)
    name ? config.NAME = name : noop()

    const city = await question(`city (default ${config.CITY}):`)
    city ? config.CITY = city : noop()
    
    const phone = await question(`phone (default ${config.PHONE}):`)
    phone ? config.PHONE = phone : noop()

    const password = await question(`password (default ${config.PASSWORD}):`)
    password ? config.PASSWORD = password : noop()
    
    const email = await question(`email (default ${config.EMAIL}):`)
    email ? config.EMAIL = email : noop()
    
    const gender = await question(`gender (default ${config.GENDER}):`)
    gender ? config.GENDER = gender : noop()
    
    reader.close()
    
    const stream = createWriteStream('./.env')
    Object.entries(config).forEach(([key, value]) => {
        const data = new Uint8Array(Buffer.from(`${key}=${value}\n`))
        stream.write(data)
    })
}

generateEnvironment()
