import "bootstrap-css-only";
import "../css/style.css";

import ratfavi from "../img/ratfavi.png";

import * as d3 from "d3";
import { sliderHorizontal } from "d3-simple-slider";
import ChicagoMap from "./charts/chicagoMap";
import LineChart from "./charts/line";
import StackBar from "./charts/stackBar";

/* Images */
let favicon = document.getElementById("favicon");
favicon.href = ratfavi;

/* Data */
const files = ["data/chicago_community_boundaries.geojson", "data/year_chicago_5_year_complaints_by_date.json", "data/year_chicago_5_year_complaints_by_response_time.json"];

/* Plot */
Promise.all(files.map(path => d3.json(path)))
    .then(res => {
        const dataChicago = res[0];
        const annualTotal = res[1];
        const responseTime = res[2];

        /* Chicago Map */
        const mapMargin = { left: 25, right: 25, top: 75, bottom: 75 };
        const mapWidth = 700;
        const mapHeight = 800;
        const mapScale = 100500;
        let mapCanvas = d3.select(".chicago-map-section")
            .append("svg")
            .attr("width", mapWidth)
            .attr("height", mapHeight);
        const chicagoMap = new ChicagoMap(dataChicago, mapCanvas, mapWidth, mapHeight, mapMargin, mapScale);
        chicagoMap.grapher();
        responsivefy(chicagoMap.canvas);

        /* Line Chart */
        const year2014 = annualTotal.filter(d => d.year == 2014);
        const lineMargin = { left: 75, right: 75, top: 75, bottom: 75 };
        const lineWidth = 700;
        const lineHeight = 350;
        let lineCanvas = d3.select(".line-section")
            .append("svg")
            .attr("width", lineWidth)
            .attr("height", lineHeight);
        const lineChart = new LineChart(annualTotal, lineCanvas, lineWidth, lineHeight, lineMargin);
        lineChart.grapher(year2014);
        responsivefy(lineCanvas, "line");

        /* Stack Bar */
        const responseTime2014 = responseTime.filter(d => d.year == 2014);
        const barMargin = { left: 75, right: 75, top: 75, bottom: 75 };
        const barWidth = 700;
        const barHeight = 700;
        let barCanvas = d3.select(".stacked-bar-section")
            .append("svg")
            .attr("width", barWidth)
            .attr("height", barHeight);
        const barChart = new StackBar(barCanvas, barWidth, barHeight, barMargin);
        barChart.grapher(responseTime2014);
        responsivefy(barChart.canvas);

        /* Slider Chart */
        sliderGenerate(annualTotal, responseTime, lineChart, barChart);
        window.addEventListener("resize", () => {
            document.querySelector(".slider-width-getter").remove();
            sliderGenerate(annualTotal, responseTime, lineChart, barChart);
        });
    })
    .catch(err => {
        alert("Something went wrong...");
        console.log(err);
    });

/* Responsive Control */
function responsivefy(svg, type) {
    let container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height"));
    let aspect = width / height;
    if (aspect < 0.8) { aspect = 1; width = 700; }

    svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    d3.select(window).on(`resize.${container.attr("id")}`, resize);

    function resize() {
        let targetWidth = parseInt(container.style("width"));
        if (type === "line") targetWidth = NaN;
        svg.attr("width", targetWidth - 30);
        svg.attr("height", Math.round(targetWidth / aspect));
    };
};

/* Slider Ratio Adjuster */
function sliderWidthRatio() {
    if (window.innerWidth <= 400) {
        return 0.7;
    } else if (window.innerHeight >= 1500) {
        return 0.85;
    } else {
        return 0.8;
    };
}

/* Slider Generator */
function sliderGenerate(annualTotal, responseTime, lineChart, barChart) {
    let sliderContainerWidth = document.querySelector(".slider-section").offsetWidth

    const slider = sliderHorizontal()
        .min(2014)
        .max(2018)
        .step(1)
        .width(sliderContainerWidth * sliderWidthRatio())
        .ticks(5)
        .tickFormat(d3.format(".0f"))
        .on("onchange", val => {
            const yearData = annualTotal.filter(d => d.year == val);
            const responseData = responseTime.filter(d => d.year == val);

            /* Line Chart Update */
            lineChart.grapher(yearData);
            barChart.grapher(responseData);
        });

    const sliderCanvas = d3.select(".slider-section")
        .append("svg")
        .attr("class", "slider-width-getter")
        .attr("width", sliderContainerWidth * 1.5)
        .attr("height", 70);
    sliderCanvas.append("g")
        .attr("transform", `translate(${sliderContainerWidth * 0.05}, 20)`)
        .call(slider);
}