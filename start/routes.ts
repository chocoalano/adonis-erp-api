import router from '@adonisjs/core/services/router'

import './routes_app/files.js'
import './routes_app/auth.js'
import './routes_app/web.js'
import './routes_app/mobile.js'

router.get('/', () => {
  return 'Hello world from the home page.'
})
