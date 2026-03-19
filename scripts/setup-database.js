import { setupDatabase } from '../src/lib/setup-database.js'

setupDatabase()
  .then(() => {
    console.log('Database setup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Database setup failed:', error)
    process.exit(1)
  })
