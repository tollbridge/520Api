const { Router } = require('express')
const getTodayInfo = require('../lib/getTodayInfo')
const getParsedWebData = require('../lib/getParsedWebData')

const cheerio = require('cheerio')
const fetch = require('node-fetch')
const toolLink = process.env.TOLL_URI

// TODO: DELETE tempSchedule
let tempSchedule = {}

module.exports = new Router()

  .get('/api/toll', (req, res, next)=>{
    const todayInfo = getTodayInfo()
    fetch(toolLink)
      .then(res => res.buffer())
      .then(res => res.toString())
      .then(html=>{

        const $ = cheerio.load(html)
        const rawTable = $('table').find('tbody')[Number(todayInfo.isWeekendOrHoliday)]
        const todaySchedule = getParsedWebData(rawTable)

        res.json(
          { todayInfo,
            todaySchedule,
          }
        )

      })
      .catch(next)
  })

  .get('/api/toll/now', (req, res, next)=>{
    const { isWeekendOrHoliday, hour, dayName, holidayName } = getTodayInfo()
    fetch(toolLink)
      .then(res => res.buffer())
      .then(res => res.toString())
      .then(html=>{

        const $ = cheerio.load(html)
        const rawTable = $('table').find('tbody')[Number(isWeekendOrHoliday)]
        const todaySchedule = getParsedWebData(rawTable)

        // Searches down for the correct hour
        for(let i = hour; i >= 0; i--){
          if(todaySchedule[i]){
            return (
              res.json(
                {
                  dayName,
                  holidayName,
                  ...todaySchedule[i],
                }
              )
            )
          }
        }
      })
      .catch(next)
  })

  // TODO: delete /api/toll/temp
  .get('/api/toll/temp', (req, res, next)=>{
    if(Object.keys(tempSchedule).length > 0){
      console.log('I got the info cached')
      const todayInfo = getTodayInfo()
      res.json({todayInfo, tempSchedule})
    }
    else {
      console.log('do not have the info cached')
      const todayInfo = getTodayInfo()
      fetch(toolLink)
        .then(res => res.buffer())
        .then(res => res.toString())
        .then(html=>{

          const $ = cheerio.load(html)
          const rawTable = $('table').find('tbody')[Number(todayInfo.isWeekendOrHoliday)]
          const todaySchedule = getParsedWebData(rawTable)
          tempSchedule = todaySchedule
          res.json({todayInfo, tempSchedule})
        })
        .catch(next)
    }
  })
