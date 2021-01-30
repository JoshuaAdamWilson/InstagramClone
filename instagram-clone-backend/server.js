import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import Pusher from 'pusher'
import dbModel from './dbModel.js'

// app config
const app = express()
const port = process.env.PORT || 8080
const pusher = new Pusher({
  appId: "1123821",
  key: "cd29fe0511d430ef3198",
  secret: "0cd2bd4c9d29f31f00f5",
  cluster: "us3",
  useTLS: true,
});

// middlewares
app.use(express.json())
app.use(cors())

// db config
const connection_url = 'mongodb+srv://admin:Ts2cCJvaxCkKM2yu@cluster0.9cyjb.mongodb.net/instaDB?retryWrites=true&w=majority'

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.connection.once('open', () => {
  console.log('Database connected')
  const changeStream = mongoose.connection.collection('posts').watch()
  changeStream.on('change', (change) => {
    console.log('Change Triggered on Pusher...')
    console.log(change)
    console.log('End of change')
    if(change.operationType === 'insert') {
      console.log('Triggering Pusher ***IMG UPLOAD***')

      const portDetails = change.fullDocument
      pusher.trigger('posts', 'inserted', {
        user: userDetails.user,
        caption: postDetails.caption,
        image: postDetails.image
      })
    } else {
      console.log('Unknown Trigger from Pusher')
    }
  })
})

// api routes
app.get('/', (req, res) => res.status(200).send('hello world'))

app.post('/upload', (req, res) => {
  const body = req.body;
  dbModel.create(body, (err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(201).send(data)
    }
  })
})

app.get('/sync', (req, res) => {
  dbModel.find((err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(200).send(data)
    }
  })
})

//  listen
app.listen(port, () => {
  console.log(`Express Server is running on localhost:${port}`)
})
