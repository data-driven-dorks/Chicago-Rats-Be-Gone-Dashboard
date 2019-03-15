import * as d3 from "d3";

export default class chicagoMap {
    constructor(dataChicago, canvas, width, height, margin, scale) {
        this.dataChicago = dataChicago;
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.scale = scale;
        this.graphWidth = this.width - this.margin.left - this.margin.right;
        this.graphHeight = this.height - this.margin.top - this.margin.bottom;
        this.colorScheme = [
            "rgb(229, 75, 39)",     // darkerorange
            "rgb(203, 32, 45)",     // darkred
            "rgb(95, 44, 131)",     // purple
            "rgb(8, 91, 167)",      // darkblue
            "rgb(53, 168, 73)",     // green
            "rgb(252, 238, 33)",    // yellow
            "rgb(247, 171, 27)",    // orange
            "rgb(236, 112, 37)"    // darkorange
        ];
        this.graphed = false;
    };

    graphSetup() {
        this.graph = this.canvas.append("g")
            .attr("tranform", `translate(${this.margin.left}, ${this.margin.top})`);
    };

    graphProjection() {
        this.projection = d3.geoAlbers()
            .translate([this.width / 2, this.height / 2])
            .center([8.25, 41.882505])
            .parallels([40, 45])
            .rotate([92.35, .5, -4])
            .scale([this.scale]);

        this.geoGenerator = d3.geoPath(this.projection);
    };

    graphFillScale() {
        this.fill = d3.scaleThreshold()
            .domain([2, 20, 50, 70, 100, 130, 180, 764])
            .range(["#ffffff", "#fffac6", "#fff486", "#fcee21", "#f9c524", "#f49c25", "#ec7025"]);
    };

    graphMap() {
        this.mapPath = this.graph.selectAll("path")
            .data(this.dataChicago.features)
            .enter()
            .append("path")
            .attr("d", this.geoGenerator)
            .style("stroke", "#252525")
            .style("stroke-width", 2.3)
            .attr("fill", d => this.fill(d.properties.data[this.year - 2014].complaintspc));
    };

    graphRemove() {
        if (this.mapPath) this.mapPath.remove();
    };

    grapher(year) {
        this.year = year;
        this.graphRemove();
        this.graphSetup();
        this.graphProjection();
        this.graphFillScale();
        this.graphMap();
        this.graphed = true;
    }
}