import * as d3 from "d3";
import { legendColor } from "d3-svg-legend";

export default class stackBar {
    constructor(canvas, width, height, margin) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.graphWidth = this.width - this.margin.left - this.margin.right;
        this.graphHeight = this.height - this.margin.top - this.margin.bottom;
        this.innerRadius = 150;
        this.outerRadius = 350;
        this.center = {
            x: this.graphWidth / 2 + this.margin.left,
            y: this.graphHeight / 2
        }
        this.colorScheme = [
            "rgb(53, 168, 73)",     // green
            "rgb(252, 238, 33)",    // yellow
            "rgb(247, 171, 27)",    // orange
            "rgb(236, 112, 37)",    // darkorange
            "rgb(229, 75, 39)",     // darkerorange
            "rgb(203, 32, 45)",     // darkred
            "rgb(95, 44, 131)",      // purple
            "rgb(8, 91, 167)"      // darkblue
        ];
        this.keys = ["within 3 days",
            "4 to 7 days",
            "8 to 14 days",
            "15 to 30 days",
            "over 30 days"];
        this.graphed = false;
    };

    graphSetup() {
        this.graph = this.canvas.append("g")
            .attr("transform", `translate(${this.center.x}, ${this.center.y})`);
    };

    graphScales() {
        const xScaleOffset = Math.PI * 75 / 180;

        this.x = d3.scaleBand()
            .range([xScaleOffset, 2 * Math.PI + xScaleOffset])
            .domain(this.data.map(d => d.month))
            .align(0);

        this.y = d3.scaleLinear()
            .range([this.innerRadius, this.outerRadius])
            .domain([0, d3.max(this.data, d => d.total)]);

        this.color = d3.scaleOrdinal()
            .range(this.colorScheme)
            .domain(this.keys);
    };

    graphLegend() {
        this.legendGroup = this.canvas.append("g")
            .attr("transform", `translate(${4 * this.margin.left}, ${0.31 * this.height})`);

        this.legend = legendColor()
            .shape("circle")
            .shapePadding(5)
            .scale(this.color);

        this.legendGroup.call(this.legend);
        this.legendGroup.selectAll("text").attr("fill", "white");
    };

    graphPie() {
        this.arcPath = d3.arc()
            .innerRadius(d => this.y(d[0]))
            .outerRadius(d => this.y(d[1]))
            .startAngle(d => this.x(d.data.month))
            .endAngle(d => this.x(d.data.month) + this.x.bandwidth())
            .padAngle(0.02)
            .padRadius(this.innerRadius)
    };

    graphDraw() {
        this.piePath = this.graph
            .selectAll("g")
            .data(d3.stack().keys(this.keys)(this.data))
            .enter()
            .append("g")
            .attr("fill", d => this.color(d.key))
            .selectAll("path")
            .data(d => d)
            .enter()
            .append("path")
            .attr("d", this.arcPath);
    };

    graphXAxis() {
        this.xLabels = this.graph.append("g")
            .selectAll("g")
            .data(this.data)
            .enter().append("g")
            .attr("text-anchor", "middle")
            .attr("transform", d => `rotate(${((this.x(d.month) + this.x.bandwidth() / 2) * 180 / Math.PI - 90)})translate(${this.innerRadius}, 0)`);

        this.xLabels.append("text")
            .attr("transform", "rotate(90)translate(0, 16)")
            .text(d => d.month)
            .attr("fill", "white");
    };

    graphInfo() {
        this.graphTitle = this.graph.append("text")
            .text("Rat Complaint Response Time Has Dropped in Chicago (2014 to 2018)")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(0, -250)`)
            .attr("font-size", "16")
            .attr("fill", "white");

        this.graphSource = this.graph.append("text")
            .html(() => "Source: <a class='chart-source' href='https://data.cityofchicago.org/Service-Requests/311-Service-Requests-Rodent-Baiting-No-Duplicates/uqhs-j723'>Chicago Data Portal</a>")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(250, 350)`)
            .attr("font-size", "14")
            .attr("fill", "white");
    };

    graphRemove() {
        if (this.piePath) this.piePath.remove();
        if (this.xLabels) this.xLabels.remove();
        if (this.graphTitle) this.graphTitle.remove();
        if (this.graphSource) this.graphSource.remove();
        if (this.legendGroup) this.legendGroup.remove();
    };

    grapher(data) {
        this.data = data;
        this.graphRemove();
        this.graphSetup();
        this.graphScales();
        this.graphLegend();
        this.graphPie();
        this.graphDraw();
        this.graphXAxis();
        this.graphInfo();
        this.graphed = true;
    };
};