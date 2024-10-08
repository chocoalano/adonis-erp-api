import app from '@adonisjs/core/services/app'
import Ws from '#services/ws'

// Listener untuk menunggu aplikasi siap
app.ready(() => {
  Ws.boot() // Boot WebSocket service
  // const io = Ws.io
  // io?.on('connection', (socket) => {
  //   console.log('Client connected:', socket.id)
  //   socket.broadcast.emit('userConnected', { userId: socket.id })
  //   socket.on('disconnect', () => {
  //     console.log('Client disconnected:', socket.id)
  //   })
  // })
})
