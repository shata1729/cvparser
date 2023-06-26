const express = require('express')
const router = express.Router()
const path = require('path')
const cors = require('cors')
const download = require('download')
const { AffindaCredential, AffindaAPI } = require('@affinda/affinda')
const fs = require('fs')
const { getParsedResumeJson } = require('./../affinda/parser')
const credential = new AffindaCredential(
  'aff_9b2f4d8a28c11eedc88bdeb091e6e54c6f63cf54',
)
const client = new AffindaAPI(credential)

const corsOptions = {
  exposedHeaders: 'Location',
}

router.use(cors(corsOptions))

const getIdFromGoogleDriveURL = (url) => {
  const slicedURL = url.slice(url.indexOf('/d/') + 3)
  const fileId = slicedURL.split('/')[0]
  // console.log(fileId)
  return fileId
}

router.get('/parse', async function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'parseresume.html'))
})

router.get('/filepicker', async function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'helloworld.html'))
})
router.post('/parse', async (req, res) => {
  // if (!req.files || Object.keys(req.files).length === 0) {
  //   //empty "File" field in form-data of POST
  //   res.status(404).send('No file was found for upload');
  //   console.log('debug', 'No file was uploaded');
  // } else {
  let tempFilePath = ''
  let { googleDriveLink } = req.body
  if (req.files && req.files.uploadedCV) {
    // let uploadedCVFile = Buffer.from(req.files.uploadedCV.data); // uploaded file
    let fileName = req.files.uploadedCV.name // name of uploaded file
    let extName = path.extname(fileName).toLowerCase()
    tempFilePath = path.join(__dirname, '..', '/temp/', `temp${extName}`)
    console.log("tempFilePath")
    console.log(tempFilePath)
    console.log(extName)
    // if (extName == ".pdf" || extName == ".docx" || extName == ".doc") {

      req.files.uploadedCV.mv(tempFilePath, function (err) {
        if (err) console.log(err)

        const readStream = fs.createReadStream(tempFilePath)
        console.log("tempFilePath")

        client.createDocument({ file: readStream, collection: 'pBIoVbBR' }).then(async (result) => {
          // console.log("Returned data:");

          // console.dir(result.data)
          if (result.data) {
            let parsedResume = await getParsedResumeJson(result.data);
            // console.log(parsedResume)
            if (parsedResume.isResumeProbability > 75) {
              if (fs.existsSync(tempFilePath)) {
                console.log(`deleting ${tempFilePath}`)
                fs.unlinkSync(tempFilePath)
              }

              return res.status(200).render('parseresume', {
                message: `success`,
                data: parsedResume
              })
            } else {
              if (fs.existsSync(tempFilePath)) {
                console.log(`deleting ${tempFilePath}`)
                fs.unlinkSync(tempFilePath)
              }
              if (fs.existsSync(tempFilePath)) {
                console.log(`deleting ${tempFilePath}`)
                fs.unlinkSync(tempFilePath)
              }

              return res.status(400).render('parseresume', {
                message: `Please upload valid resume`,
                errors: [{ msg: "File uploaded was not a valid resume" }],
              })
            }


          }
          // fs.writeFileSync("temp.json",JSON.stringify(result.data))
        }).catch((err) => {
          console.log("An error occurred:");
          console.error(err);
          if (fs.existsSync(tempFilePath)) {
            console.log(`deleting ${tempFilePath}`)
            fs.unlinkSync(tempFilePath)
          }

          return res.status(400).render('parseresume', {
            message: `Error while parsing file. Make sure you upload valid resume`,
            errors: err,
          })
        });
      })
    // } else {
    //   return res.status(400).render('parseresume', {
    //     message: `Error while parsing file. Make sure you upload only doc,docx or pdf file`,
    //     errors: [{ msg: `Error while parsing file. Make sure you upload only doc,docx or pdf file` }],
    //   })
    // }
    // for(i in array) {
    //     console.log(array[i]);
    // }
  } else if (googleDriveLink) {
    if (getIdFromGoogleDriveURL(googleDriveLink)) {
      let downloadURL = `https://docs.google.com/uc?id=${getIdFromGoogleDriveURL(
        googleDriveLink,
      )}&export=download`
      console.log('downloadURL')
      console.log(downloadURL)
      // Path to store the downloaded file
      const dirName = path.join(__dirname, '..', '/temp/')
      download(downloadURL, dirName).then(() => {
        let files = fs.readdirSync(dirName)
        if (files.length == 1) {
          tempFilePath = path.join(dirName, files[0])
          console.log("tempFilePath")
          console.log(tempFilePath)
          let extName = path.extname(tempFilePath).toLowerCase()
          console.log("ext name")
          console.log(extName)
          if (extName == ".pdf" || extName == ".docx" || extName == ".doc") {

            const readStream = fs.createReadStream(tempFilePath)

            client.createDocument({ file: readStream, collection: 'pBIoVbBR' }).then(async (result) => {
              // console.log("Returned data:");

              // console.dir(result.data)
              if (result.data) {
                let parsedResume = await getParsedResumeJson(result.data);
                // console.log(parsedResume)
                if (fs.existsSync(tempFilePath)) {
                  console.log(`deleting ${tempFilePath}`)
                  fs.unlinkSync(tempFilePath)
                }

                if (parsedResume.isResumeProbability > 75) {
                  return res.status(200).render('parseresume', {
                    message: `success`,
                    data: parsedResume
                  })
                } else {
                  return res.status(400).render('parseresume', {
                    message: `Please upload valid resume`,
                    errors: [{ msg: "File uploaded was not a valid resume" }],
                  })
                }
              }


            }).catch((err) => {
              console.log("An error occurred:");
              console.error(err);

              if (fs.existsSync(tempFilePath)) {
                console.log(`deleting ${tempFilePath}`)
                fs.unlinkSync(tempFilePath)
              }
              return res.status(400).render('parseresume', {
                message: `Error while parsing file. Make sure you uploaded valid resume`,
                errors: err,
              })

            });
          } else {
            return res.status(400).render('parseresume', {
              message: `Error while parsing file. Make sure you upload only doc,docx or pdf file`,
              errors: [{ msg: `Error while parsing file. Make sure you upload only doc,docx or pdf file` }],
            })
          }


        }

      })
    }
  }
})

module.exports = router
