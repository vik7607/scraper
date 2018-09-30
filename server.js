var express = require('express');
var fs = require('fs');
var request = require('request');
var app     = express();
var bodyParser =require('body-parser');
var path =require('path');
var cookieparser =require('cookie-parser');
var json2xls = require('json2xls');
var json = [{
  foo: 'bar',
  qux: 'moo',
  poo: 123,
  stux: new Date()
},
{
  foo: 'bar',
  qux: 'moo',
  poo: 345,
  stux: new Date()
}];



app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  next();
})
app.use(json2xls.middleware);
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json());
app.use(cookieparser());
// var scraper = require('google-search-scraper');
var cheerio = require("cheerio");
var google = require('google')

var querystring = require('querystring')
var util = require('util')
var Q = require('q');
var a=[];
var b=[];
var linkstorage=[];
var count =0;

//google.resultsPerPage = 25
var nextCounter = 0

var linkSel = 'h3.r a'
var descSel = 'div.s'
var itemSel = 'div.g'
var nextSel = 'td.b a span'
var URL = '%s://www.google.%s/search?hl=%s&q=%s&start=%s&sa=N&num=%s&ie=UTF-8&oe=UTF-8&gws_rd=ssl'
var query='sherif sales'
var start ='';
google.resultsPerPage = 80
google.tld = 'com'
google.lang = 'en'
google.requestOptions = {}
google.nextText = 'Next'
google.protocol = 'https'

if (google.timeSpan) {
    URL = URL.indexOf('tbs=qdr:') >= 0 ? URL.replace(/tbs=qdr:[snhdwmy]\d*/, 'tbs=qdr:' + google.timeSpan) : URL.concat('&tbs=qdr:', google.timeSpan)
  }

var newUrl = util.format(URL, google.protocol, google.tld, google.lang, querystring.escape(query), start, google.resultsPerPage)

var requestOptions = {
    url: newUrl,
    method: 'GET'
  }



app.post('/scrape',(req,resp,next)=>{
  
        return adminreport()
          .then((result)=>{
              console.log("result at top",result)
              var xls ='';
               xls=json2xls(result);
              fs.writeFileSync('data.xlsx', xls, 'binary');
            resp.json(result)
          })
          .catch((error)=>{
            resp.json(error);
          })
      })


      
      
      
      
      
      
     function adminreport() {
        return new Promise((resolve,reject)=>{

           console.log("step1")

            //   for (var k in google.requestOptions) {
            //     requestOptions[k] = google.requestOptions[k]
            //   }

 request(requestOptions, function (err, resp, body) {

                if ((err == null) && resp.statusCode === 200) {
                  //  console.log("step2",body)
                  var $ = cheerio.load(body)
                  var res = {
                    url: newUrl,
                    query: query,
                    start: start,
                    links: [],
                    $: $,
                    body: body
                  }
            
                  $(itemSel).each(function (i, elem) {
                   console.log("counter",count)
                    var linkElem = $(elem).find(linkSel)
                    var descElem = $(elem).find(descSel)
                    var item = {
                      title: $(linkElem).first().text(),
                      link: [],
                      description: [],
                      href:[]

                    
                    }
                    var qsObj = querystring.parse($(linkElem).attr('href'))
                   // console.log("qsobj",qsObj)
            
                    if (qsObj['/url?q']) {
                      item.link = qsObj['/url?q']
                      console.log("Link are",item.link)
                    //   linkstorage.push({"url":item.link})
                      item.href = item.link
                    }
            
                    $(descElem).find('div').remove()
                    item.description = $(descElem).text()
            
                    res.links.push({item})
                    linkstorage.push({"url":item.link,"county":item.title})
                    count++
                  })
                 // console.log("link storage are",linkstorage)
                  resolve(linkstorage)
            
                //   if ($(nextSel).last().text() === google.nextText) {
                //     res.next = function () {
                //       igoogle(query, start + google.resultsPerPage, callback)
                //     }
                //   }
            
                
             //     callback(null, res)
                } 
                // else {
                //   callback(new Error('Error on response' + (resp ? ' (' + resp.statusCode + ')' : '') + ':' + err + ' : ' + body), null, null)
                // }
            
            
            })


        //       }).then((result)=>{
        //           console.log("results are",result)
        //   resolve(result)
        //   }).catch((error)=>{
        //   reject(error);
          })
     //   })
      }

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;