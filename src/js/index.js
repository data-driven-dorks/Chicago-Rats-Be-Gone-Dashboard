import "bootstrap-css-only";
import "../css/style.css";

import ratfavi from "../img/ratfavi.png";

import * as d3 from "d3";
import ChicagoMap from "./charts/chicagoMap";

/* Images */
let favicon = document.getElementById("favicon");
favicon.href = ratfavi;

/* Data */
const files = ["data/chicago_community_boundaries.geojson"];

/* Plot */
Promise.all(files.map(path => d3.json(path)))
    .then(res => {
       const dataChicago = res[0];

       /* Chicago Map */
        const mapMargin = { left: 75, right: 75, top: 75, bottom: 75 }
        const mapWidth = 700;
        const mapHeight = 1000;
        const mapScale = 100500;
        let mapCanvas = d3.select(".chicago-map-section")
            .append("svg")
            .attr("width", mapWidth)
            .attr("height", mapHeight)
        const chicagoMap = new ChicagoMap(dataChicago, mapCanvas, mapWidth, mapHeight, mapMargin, mapScale);
        chicagoMap.grapher();
    })
    .catch(err => {
        alert("Something went wrong...");
        console.log(err);
    });

/* Responsive Control */
// function responsivefy(svg) {
//     const container = d3.select(svg.node().parentNode),
//         width = parseInt(svg.style("width")),
//         height = parseInt(svg.style("height")),
//         aspect = width / height;

//     svg.attr("viewBox", `0 0 ${width} ${height}`)
//         .attr("perserveAspectRatio", "xMinYMid")
//         .call(resize);

//     d3.select(window).on(`resize.${container.attr("id")}`, resize);

//     function resize() {
//         let targetWidth = parseInt(container.style("width"));
//         if (targetWidth <= 1000) {
//             svg.attr("width", targetWidth - 30);
//             svg.attr("height", Math.round(targetWidth / aspect));
//         }
//     };
// };