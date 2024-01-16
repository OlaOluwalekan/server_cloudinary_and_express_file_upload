require('dotenv').config()

const express = require('express')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary').v2
const cors = require('cors')
const mongoose = require('mongoose')

const connect_string = process.env.MONGO_URI

mongoose.connect(connect_string)

const app = express()

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  })
)
app.use(fileUpload())
app.use(express.json())

const imageModel = mongoose.model(
  'images',
  new mongoose.Schema({
    image: String,
  })
)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

app.get('/', (req, res) => {
  res.status(200).json({ url: 'home' })
})

app.get('/test', (req, res) => {
  res.status(200).json({ url: 'test' })
})

const uploadFile = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.')
  }

  let file = req.files.image
  let img_path = __dirname + '/public/images/' + file.name

  file.mv(img_path, (err) => {
    if (err) {
      return res.status(500).send(err)
    }
    req.image = img_path
    next()
  })
}

app.post('/uploads', uploadFile, async (req, res) => {
  try {
    const clo = await cloudinary.uploader.upload(req.image, {
      folder: 'Bells Arena/test',
    })
    const image = await imageModel.create({ image: clo.secure_url })
    res.status(200).json({ msg: 'file uploaded', image })
  } catch (error) {
    res.status(500).json(error)
  }
})

const port = process.env.PORT || 9000

app.listen(port, console.log(`server is running on port ${port}...`))
