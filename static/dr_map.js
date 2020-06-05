reds = ['#E2B3B1', '#E29B97', '#E36B65', '#E3534B', '#E43B32', '#E50B00']
blues = ['#BFC9E3', '#A3B5E3', '#6D8FE3', '#517BE4', '#1B55E4', '#0042E5']

function colorAssigner(dr) {
    if (dr < -10) { return reds[5]; }
    if (dr < -7) { return reds[4]; }
    if (dr < -5) { return reds[3]; }
    if (dr < -3) { return reds[2]; }
    if (dr < -2) { return reds[1]; }
    if (dr < 0) { return reds[0]; }
    if (dr == 0) { return '#ffffff'; }
    if (dr < 2) { return blues[0]; }
    if (dr < 3) { return blues[1]; }
    if (dr < 5) { return blues[2]; }
    if (dr < 7) { return blues[3]; }
    if (dr < 10) { return blues[4]; }
    return blues[5];
}



var width = 900,
    height = 105,
    cellSize = 12; // cell size
week_days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

var day = d3.time.format("%w"),
    week = d3.time.format("%U"),
    percent = d3.format(".1%"),
    format = d3.time.format("%Y-%m-%d");
parseDate = d3.time.format("%Y-%m-%d").parse;

var svg = d3.select(".calender-map").selectAll("svg")
    .data(d3.range(2017, 2021))
    .enter().append("svg")
    .attr("width", '100%')
    .attr("data-height", '0.5678')
    .attr("viewBox", '0 0 900 105')
    .attr("class", "RdYlGn")
    .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svg.append("text")
    .attr("transform", "translate(-38," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function (d) { return d; });

for (var i = 0; i < 7; i++) {
    svg.append("text")
        .attr("transform", "translate(-5," + cellSize * (i + 1) + ")")
        .style("text-anchor", "end")
        .attr("dy", "-.25em")
        .text(function (d) { return week_days[i]; });
}

var rect = svg.selectAll(".day")
    .data(function (d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter()
    .append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function (d) { return week(d) * cellSize; })
    .attr("y", function (d) { return day(d) * cellSize; })
    .attr("fill", '#fff')
    .datum(format);

var legend = svg.selectAll(".legend")
    .data(month)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) { return "translate(" + (((i + 1) * 50) + 8) + ",0)"; });

legend.append("text")
    .attr("class", function (d, i) { return month[i] })
    .style("text-anchor", "end")
    .attr("dy", "-.25em")
    .text(function (d, i) { return month[i] });

svg.selectAll(".month")
    .data(function (d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("path")
    .attr("class", "month")
    .attr("id", function (d, i) { return month[i] })
    .attr("d", monthPath);

//"{{url_for('static', filename='data.csv')}}"
d3.csv("/static/export-4.csv", function (error, csv) {
    console.log(csv)
    csv.forEach(function (d) {
        console.log(parseFloat(d.Dr));
        d.Comparison_Type = parseFloat(d.Dr);
    });

    var Comparison_Type_Max = d3.max(csv, function (d) { return d.Comparison_Type; });
    console.log(Comparison_Type_Max)

    var data = d3.nest()
        .key(function (d) { return d.Date; })
        .rollup(function (d) {
            console.log(" rol " + d[0].Comparison_Type);
            return d[0].Comparison_Type;
        })
        .map(csv);

    rect.filter(function (d) { return d in data; })
        .attr("fill", function (d) {
            return colorAssigner(data[d]);
        })
        .attr("data-title", function (d) { return d + " Dr +  " + data[d].toFixed(2) });
    $("rect").tooltip({ container: 'body', html: true, placement: 'top' });
});

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = +day(t0), w0 = +week(t0),
        d1 = +day(t1), w1 = +week(t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z";
}
