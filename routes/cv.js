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
    req.files.uploadedCV.mv(tempFilePath, function (err) {
      if (err) console.log(err)

      const readStream = fs.createReadStream(tempFilePath)
 
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
          message: `Error while parsing file. Make sure you uploaded valid resume`,
          errors: err,
        })
      });
      // ResumeParser.parseResumeFile(tempFilePath, './files') // input file, output dir
      //   .then((file) => {
      //     // console.log("Yay! " + file);
      //     var allRows = fs
      //       .readFileSync(path.join(__dirname, '..', 'PARSED', 'temp.txt'))
      //       .toString()
      //       .split('\n')
      //     console.log('reading from intermediatee parsed file')

      //     let jsonData = fs.readFileSync(`./files/${file}.json`)

      //     let {
      //       name,
      //       email,
      //       phone,
      //       profiles,
      //       skills,
      //       education,
      //       certification,
      //       objective,
      //       summary,
      //       experience,
      //       languages,
      //       courses,
      //       projects,
      //       links,
      //       contacts,
      //       positions,
      //       awards,
      //       honors,
      //       additional,
      //       interests,
      //     } = JSON.parse(jsonData)

      //     let jsonObject = JSON.parse(jsonData)
      //     let rows = []
      //     for (var key in jsonObject) {
      //       rows.push(...jsonObject[key].split('\n'))
      //     }
      //     let remainingRows = allRows.filter((n) => !rows.includes(n))
      //     remainingRows = remainingRows.filter(
      //       (n) => !lowercaseDictionary.includes(n.toLowerCase()),
      //     )

      //     // console.log("remainingRows")
      //     // console.log(remainingRows)
      //     let miscellaneous = remainingRows.join('\n')

      //     if (name) {
      //       name = name.replace(/\n/g, ' ')
      //     } else name = ''
      //     if (email) {
      //       email = email.replace(/\n/g, ' ')
      //     } else email = ''
      //     if (skills) {
      //       skills = skills.replace(/\n/g, ' ')
      //     } else skills = ''
      //     if (profiles) {
      //       profiles = profiles.replace(/\n/g, ' ')
      //     } else profiles = ''
      //     if (education) {
      //       education = education.replace(/\n/g, ' ')
      //     } else education = ''
      //     if (certification) {
      //       certification = certification.replace(/\n/g, ' ')
      //     } else certification = ''
      //     if (objective) {
      //       objective = objective.replace(/\n/g, ' ')
      //     } else objective = ''
      //     if (experience) {
      //       experience = experience.replace(/\n/g, ' ')
      //     } else experience = ''
      //     if (summary) {
      //       summary = summary.replace(/\n/g, ' ')
      //     } else summary = ''
      //     if (languages) {
      //       languages = languages.replace(/\n/g, ' ')
      //     } else languages = ''
      //     if (courses) {
      //       courses = courses.replace(/\n/g, ' ')
      //     } else courses = ''
      //     if (projects) {
      //       projects = projects.replace(/\n/g, ' ')
      //     } else projects = ''
      //     if (links) {
      //       links = links.replace(/\n/g, ' ')
      //     } else links = ''
      //     if (contacts) {
      //       contacts = contacts.replace(/\n/g, ' ')
      //     } else contacts = ''
      //     if (positions) {
      //       positions = positions.replace(/\n/g, ' ')
      //     } else positions = ''
      //     if (awards) {
      //       awards = awards.replace(/\n/g, ' ')
      //     } else awards = ''
      //     if (honors) {
      //       honors = honors.replace(/\n/g, ' ')
      //     } else honors = ''
      //     if (additional) {
      //       additional = additional.replace(/\n/g, ' ')
      //     } else additional = ''
      //     if (interests) {
      //       interests = interests.replace(/\n/g, ' ')
      //     } else interests = ''

      //     if (fs.existsSync(tempFilePath)) {
      //       console.log(`deleting ${tempFilePath}`)
      //       fs.unlinkSync(tempFilePath)
      //     }
      //     return res.status(400).render('parseresume', {
      //       message: `success`,
      //       name,
      //       email,
      //       phone,
      //       profiles,
      //       skills,
      //       education,
      //       certification,
      //       objective,
      //       summary,
      //       experience,
      //       languages,
      //       courses,
      //       projects,
      //       links,
      //       contacts,
      //       positions,
      //       awards,
      //       honors,
      //       additional,
      //       interests,
      //       miscellaneous,
      //     })
      //   })
      //   .catch((error) => {
      //     console.error(error)
      //     return res.status(400).render('parseresume', {
      //       message: `parsing error`,
      //       errors: error,
      //     })
      //   })
    })
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

        }

      })
    }
  }
  // console.log("tempFilePath")
  // console.log(tempFilePath)
  // }
})

module.exports = router
