var jsdom = require('jsdom');
var _ = require('lodash');
var d3 = require('d3');
var cloud = require('d3-cloud');
var Canvas = require('canvas'); //https://www.npmjs.com/package/canvas
const fs = require("pn/fs"); // https://www.npmjs.com/package/pn
var svg2png = require('svg2png');

var maxWidth = 600;
var maxHeight = 400;

var maxfont;
var minfont;



module.exports = cloud_tag;

var user_data = {};
var finishHandler;
var OUTPUT_FOLDERS = 'svg_files';
var output;

function cloud_tag(options, cb) {
  user_data = options;
  output = `${OUTPUT_FOLDERS}/${user_data['output']}`;
  finishHandler = cb;
  jsdom.env({
    html:'',
    features:{ QuerySelector:true },
    done: draw_cloud_tag
  });
}

function draw_cloud_tag(errors, window) {
    var data = user_data['data'];
    var minWeight = _.min(_.map(data, 'weight'));
    var maxWeight = _.max(_.map(data, 'weight'));

    var minfont = 12;
    var maxfont = 40;


    global.document = window.document;
    var fill = d3.scaleOrdinal(d3.schemeCategory10);

    // for small screens (and slow cpu's) limit retries
    var MAX_TRIES = 1;

    // draw initial cloud wilthout filters
    generateCloud();

    function generateCloud(retryCycle) {
        var dataToDraw = transformToCloudLayoutObjects(data, retryCycle);

        cloud()
            .canvas(function() { return new Canvas(1, 1); })
            .size([maxWidth, maxHeight])
            .words(dataToDraw)
            .padding(5)
            .rotate(function(d) { return d.name.length >= 0 ? 0: (~~(Math.random() * 2) * 90); })
            .font("Impact")
            .fontSize(function(d) {
                return d.size;
            })
            .on("end", function(data) {
                // check if all words fit and are included
                if (data.length == dataToDraw.length) {
                    drawCloud(data); // finished

                }
                else if (!retryCycle || retryCycle < MAX_TRIES) {
                    // words are missing due to the random placement and limited room space
                    console.log('retrying');
                    // try again and start counting retries
                    generateCloud((retryCycle || 1) + 1);
                }
                else {
                    // retries maxed and failed to fit all the words
                    console.log('gave up :(');
                    // just draw what we have
                    drawCloud(data);
                }
            })
            .start();

        // convert skill objects into cloud layout objects
        function transformToCloudLayoutObjects(data, retryCycle) {
            return _.map(data, function(d) {
                return {
                    text: d.name.replace(/[^\x00-\xff]/g,"ab"),
                    name: d.name,
                    size: toFontSize(d.weight, retryCycle)
                };
            });
        }

        function toFontSize(weight, retryCycle) {
            var w = weight * 100;
            var max = maxWeight * 100;
            var min = minWeight * 100;

            return w == min ? minfont : (w / max ) * (maxfont - minfont) + minfont;
        }

        function drawCloud(words) {
            var svg = d3.select("body").append("svg")
                .attr("width", maxWidth)
                .attr("height", maxHeight)
                .style("background", "white")
                .attr('xmlns','http://www.w3.org/2000/svg')
                .append("g")
                .attr("transform", "translate(" + ~~(maxWidth / 2) + "," + ~~(maxHeight / 2) + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) {
                    return d.size + "px";
                })
                .style("-webkit-touch-callout", "none")
                .style("-webkit-user-select", "none")
                .style("-khtml-user-select", "none")
                .style("-moz-user-select", "none")
                .style("-ms-user-select", "none")
                .style("user-select", "none")
                .style("cursor", "default")
                .style("font-family", "impact")
                .style("font-weight", "100")
                .style("fill", function(d, i) {
                    return fill(i);
                })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) {
                    return d.name;
                });

            console.log(d3.select('body').html());
            console.log('prepare to write output', output);

            svg2png(d3.select('body').html(), { width: maxWidth, height: maxHeight })
            .then(buffer => {
              // console.log(buffer);
              fs.writeFile(output, buffer);
              finishHandler(user_data['output'], output);
            })
            .catch(e => {
              console.log(e)
            });
        }
    }
}
