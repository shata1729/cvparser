// const { AffindaCredential, AffindaAPI } = require('@affinda/affinda')
const fs = require('fs')

// const credential = new AffindaCredential(
//   'aff_9b2f4d8a28c11eedc88bdeb091e6e54c6f63cf54',
// )
// const client = new AffindaAPI(credential)

// const readStream = fs.createReadStream('./resumeJulesSmith.pdf')

// console.log(readStream)
// https://docs.google.com/uc?id=1OVaiDi4NtjoKy589r_vqw5wjPHzbWilM&export=download`
// client.createDocument({url:`https://docs.google.com/uc?id=1OVaiDi4NtjoKy589r_vqw5wjPHzbWilM&export=download`,collection:'pBIoVbBR'}).then((result) => {

/*
client.createDocument({file: readStream,collection:'pBIoVbBR'}).then(async(result) => {
    console.log("Returned data:");
    // console.dir(result.data)
    if(result.data){
        let parsedRsume = await getParsedResumeJson(result.data);
        console.log(parsedRsume)
    }

    fs.writeFileSync("temp.json",JSON.stringify(result.data))
}).catch((err) => {
    console.log("An error occurred:");
    console.error(err);
});

*/
// const data = require('./temp.js')

const getParsedResumeJson = async (data) => {
  return new Promise((res, rej) => {
    let resume = {}
    if (!data) {
      logger.log('error', 'no data received for getParsedResumeJson')
      return res(null)
    }
    console.log("all raw data")
    console.log(data)
    if (data.name) {
      resume.firstName = data.name?.first
      resume.lastName = data.name?.last
    }
    if (data.languages?.length) {
      resume.languages = data.languages
    }
    if (data.rawText) {
      resume.rawText = data.rawText
    }
    resume.phoneNumbers = []
    if (data.phoneNumbers.length) {
      data.phoneNumberDetails.forEach(
        ({ internationalCountryCode, nationalNumber }) => {
          resume.phoneNumbers.push({ internationalCountryCode, nationalNumber })
        },
      )
    }
    resume.emails = data.emails
    resume.websites = data.websites
    resume.dateOfBirth = data.dateOfBirth ? data.dateOfBirth : ''
    resume.location = data.location ? data.location : ''
    resume.objective = data.objective
    resume.totalYearsExperience = data.totalYearsExperience
    resume.education = []
    if (data.education.length) {
      data.education.forEach((edu) => {
        resume.education.push({
          organization: edu.organization ? edu.organization : '',
          degree: `${edu.accreditation?.education ? edu.accreditation?.education : ''
            } ${edu.accreditation?.educationLevel
              ? edu.accreditation?.educationLevel
              : ''
            }`,
          grade: edu.grade?.value ? edu.grade.value : '',
          location: edu.location?.formatted ? edu.location?.formatted : '',
          period: edu.dates?.rawText ? edu.dates?.rawText : '',
        })
      })
    }

    resume.profession = data.profession ? data.profession : ''
    resume.linkedin = data.linkedin ? data.linkedin : ''
    resume.location = {
      postalCode: data.location?.postalCode,
      state: data.location?.state,
      country: data.location?.country,
      city: data.location?.city
    }
    resume.workExperience = []
    if (data.workExperience.length) {
      data.workExperience.forEach((we) => {
        let i = 1;
        resume.workExperience.push({
          organization: we.organization ? we.organization : '',
          jobTitle: we.jobTitle ? we.jobTitle : '',
          jobDescription: we.jobDescription ? we.jobDescription : '',
          isCurrent: we.dates?.isCurrent,
          // monthsInPosition: we.dates?.monthsInPosition
          //     ? we.dates?.monthsInPosition
          //     : 0,
          period: we.dates?.rawText ? we.dates?.rawText : '',
          location: we.location ? we.location?.formatted : '',
        })
      })
    }

    resume.personalDetails = []
    resume.summary = []
    if (data.sections.length) {
      data.sections.forEach((section) => {
        let i = 1;
        if (section.sectionType == 'PersonalDetails') {
          if (!resume.personalDetails.toString().includes(section.text)) {
            console.log("resume.personalDetails")
            console.log(resume.personalDetails)
            console.log("section.text")
            console.log(section.text)
            resume.personalDetails.push(section.text)
          }
        }
        if (section.sectionType == 'Summary') {
          if(!resume.summary.toString().includes(section.text)){
            resume.summary.push(section.text)
          }
        }
      })
    }

    resume.skills = []
    if (data.skills?.length) {
      data.skills.forEach(({ name, type }) => {
        resume.skills.push(name)
      })
    }

    resume.certifications = data.certifications
    resume.publications = data.publications
    resume.referees = data.referees
    resume.isResumeProbability = data.isResumeProbability

    // console.log(resume)
    return res(resume);
  }) // End of promise
}
// const main = async () => {
//   let parsedRsume = await getParsedResumeJson(data)
//   // console.log(parsedRsume)
// }

// main()

// // Can also use a URL:

// client.createResume({url: "https://api.affinda.com/static/sample_resumes/example.docx"}).then((result) => {
//     console.log("Returned data:");
//     console.dir(result)
// }).catch((err) => {
//     console.log("An error occurred:");
//     console.error(err);
// });

module.exports = { getParsedResumeJson }