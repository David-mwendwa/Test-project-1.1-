const axios = require('axios').default;
const cheerio = require('cheerio');
const moment = require('moment');
const fs = require('fs');

let url = 'htttp://kenyalaw.org/caselaw/cases/advanced_search/';
const from = '01 Jan 1970';
const to = '31 Dec 1979';
const cases = [];
let id = 1;

async function getCases(page) {
  try {
    if (page > 250) return;

    if (page) {
      url = `htttp://kenyalaw.org/caselaw/cases/advanced_search` + "/page/" + page;
      page = page + 10
    }

      //console.log('URL: ', url);

      const res = await axios({
        method: 'POST',
        url: url,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: `content=&subject=&case_number=&parties=&date_from=${from}&date_to=${to}&submit=Search`
      });

      const data = await res.data;
      const $ = cheerio.load(data)

      $('.post').each((i, element) =>  {
        const post = $(element);
        const title = post
          .find(".post > table > tbody > tr:first-child td > h2")
          .text()
          .trim();
        
        const url = post
          .find('> a')
          .attr('href');

        let date = post 
          .find('table > tbody > tr:nth-child(2) td:last-child')
          .children()
          .remove()
          .end()
          .text()
          .trim();

        date  = moment(new Date(date)).format('YYYY-MM-DD');

        const singleCase = {
          id: id,
          title: title,
          url: url,
          date: date
        }
        id++

        cases.push(singleCase);

      });

      fs.writeFile('result.html', JSON.stringify(cases, null, 2), () => {
        console.log(`${cases.length} case(s) saved to 'result.html' successfully`); 
      });
       
      console.log("Page number: ", page);
      console.log("Total cases: ", cases.length);

    await page ? getCases(page) : getCases(10);

  } 
  catch (err) {
    console.error(err);
  }
  
}

getCases();
