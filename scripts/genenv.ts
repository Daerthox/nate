import * as readline from 'readline'
import { createWriteStream } from 'fs'

const noop = () => {}

const generateEnvironment = async () => {
    const reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    const config = {
        city: 'london',
        name: 'nate',
        phone: '07000000000',
        password: '07000000000',
        email: 'nate@nate.tech',
        gender: 'female',
    }

    const question = (str: string) => new Promise<string>(resolve => reader.question(str, resolve))

    const name = await question(`name (default ${config.name}):`)
    name ? config.name = name : noop()

    const city = await question(`city (default ${config.city}):`)
    city ? config.city = city : noop()
    
    const phone = await question(`phone (default ${config.phone}):`)
    phone ? config.password = phone : noop()

    const password = await question(`password (default ${config.password}):`)
    password ? config.password = password : noop()
    
    const email = await question(`email (default ${config.email}):`)
    email ? config.email = email : noop()
    
    const gender = await question(`gender (default ${config.gender}):`)
    gender ? config.gender = gender : noop()
    
    reader.close()
    
    const stream = createWriteStream('./.env')
    Object.entries(config).forEach(([key, value]) => {
        const data = new Uint8Array(Buffer.from(`${key}=${value}\n`))
        stream.write(data)
    })
}

generateEnvironment()
