const express = require('express')
const app = express()
const port = 5000

app.get('/', (req, res) => {
  res.send('RoomReady Server Running!')
})

app.listen(port, () => {
  console.log(`RoomReady Server listening on port ${port}`)
})