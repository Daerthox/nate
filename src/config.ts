import dotenv from 'dotenv'

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const envFound = dotenv.config()
if (envFound.error) {
  console.log('could not find .env file') // eslint-disable-line no-console
}

export default {
  url: process.env.URL || '',
  city: process.env.CITY || '',
  name: process.env.NAME || '',
  phone: process.env.PHONE || '',
  password: process.env.PASSWORD || '',
  email: process.env.EMAIL || '',
  gender: process.env.GENDER || '',
}
