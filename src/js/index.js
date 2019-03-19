import "bootstrap-css-only";
import "../css/style.css";

import ratfavi from "../img/ratfavi.png";

import swal from "sweetalert";

import * as d3 from "d3";
import { sliderHorizontal } from "d3-simple-slider";
import ChicagoMap from "./charts/chicagoMap";
import LineChart from "./charts/line";
import StackBar from "./charts/stackBar";

/* Images */
let favicon = document.getElementById("favicon");
favicon.href = ratfavi;

/* Data */
const files = [
    "data/chicago_community_boundaries.geojson", 
    "data/year_chicago_5_year_complaints_by_date.json", 
    "data/year_chicago_5_year_complaints_by_response_time.json"
];

/* Plot */
Promise.all(files.map(path => d3.json(path)))
    .then(res => {
        /* User Instructions */
        if (isMobileDevice()) {
            swal({
                title: "Dashboard Instructions",
                text: "Swipe slider to change year of data!\n\nTap map to see rat complaints per 10,000 population at community level!\n\nTap line dots to see monthly counts of rat complaints!\n\nTap circular bar slices to see how many rat complaints were responded within a certain time period!"
            });
        } else {
            swal({
                title: "Dashboard Instructions",
                text: "Drag slider to change year of data!\n\nHover over map to see rat complaints per 10,000 population at community level!\n\nHover over line dots to see monthly counts of rat complaints!\n\nHover over circular bar slices to see how many rat complaints were responded within a certain time period!"
            });
        };

        /* Name Data */
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
        chicagoMap.grapher(2014);
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

        /* Slider */
        sliderGenerate(annualTotal, responseTime, lineChart, barChart, chicagoMap);
        window.addEventListener("resize", () => {
            document.querySelector(".slider-width-getter").remove();
            sliderGenerate(annualTotal, responseTime, lineChart, barChart, chicagoMap);

            /* Regenerate 2014 Default */
            const yearData = annualTotal.filter(d => d.year == 2014);
            const responseData = responseTime.filter(d => d.year == 2014);
            chicagoMap.grapher(2014);
            lineChart.grapher(yearData);
            barChart.grapher(responseData);
        });
    })
    .catch(err => {
        swal("Something went wrong...", {
            button: false,
        });
        console.log(err);
    });

/* Responsive Control */
function responsivefy(svg, type) {
    let container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height"));
    let aspect = width / height;
    if (aspect < 0.8) { aspect = 1; width = 700; };

    svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    d3.select(window).on(`resize.${container.attr("id")}`, resize);

    function resize() {
        if (typeof console._commandLineAPI !== 'undefined') {
            console.API = console._commandLineAPI;
        } else if (typeof console._inspectorCommandLineAPI !== 'undefined') {
            console.API = console._inspectorCommandLineAPI;
        } else if (typeof console.clear !== 'undefined') {
            console.API = console;
        };
        console.API.clear();
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
function sliderGenerate(annualTotal, responseTime, lineChart, barChart, chicagoMap) {
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
            const year = parseInt(val);

            /* Chart Updates */
            chicagoMap.grapher(year);
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
};

/* Mobile Device */
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};