import * as d3 from "d3";

export default class lineChart {
    constructor(fiveYearData, canvas, width, height, margin) {
        this.fiveYearData = fiveYearData;
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.graphWidth = this.width - this.margin.left - this.margin.right;
        this.graphHeight = this.height - this.margin.top - this.margin.bottom;
        this.graphed = false;
    };

    graphSetup() {
        this.graph = this.canvas.append("g")
            .attr("tranform", `translate(${this.margin.left}, ${this.margin.top})`);
    };

    graphScales() {
        const dateExtent = d3.extent(this.fiveYearData, d => d.date)
            .map(e => new Date(e));
        const countMax = 7000;

        this.x = d3.scaleTime()
            .domain(dateExtent)
            .range([this.margin.left, this.graphWidth + this.margin.left])
            .nice();

        this.y = d3.scaleLinear()
            .domain([0, countMax])
            .range([this.graphHeight + this.margin.top, this.margin.top])
            .nice();
    };

    graphAxes() {
        this.xAxisGroup = this.graph.append("g")
            .attr("transform", `translate(0, ${this.margin.top + this.graphHeight})`);
        this.yAxisGroup = this.graph.append("g")
            .attr("transform", `translate(${this.margin.left}, 0)`);

        const xAxis = d3.axisBottom(this.x);

        const yAxis = d3.axisLeft(this.y);

        this.xAxisGroup.call(xAxis)
            .attr("class", "ticks-style");
        this.yAxisGroup.call(yAxis)
            .attr("class", "ticks-style");
    };

    graphLine() {
        const timeLine = d3.line()
            .x(d => this.x(new Date(d.date)))
            .y(d => this.y(d.count));

        this.allTimePath = this.graph.append("path")
            .datum(this.fiveYearData)
            .attr("d", timeLine)
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        const nl = this.allTimePath.node().getTotalLength();

        this.allTimePath.attr("stroke-dasharray", `${l}, ${l}`)
            .attr("stroke-dashoffset", nl);

        this.allTimePath.transition()
            .duration(2000)
            .attr("stroke-dashoffset", 0);

        this.timePath = this.graph.append("path")
            .datum(this.data)
            .attr("d", timeLine)
            .attr("stroke", "rgb(247, 171, 27)")
            .attr("stroke-width", 2.5)
            .attr("fill", "none");

        const l = this.timePath.node().getTotalLength();

        this.timePath.attr("stroke-dasharray", `${l}, ${l}`)
            .attr("stroke-dashoffset", l);

        this.timePath.transition()
            .duration(750)
            .attr("stroke-dashoffset", 0);

        setTimeout(() => {
            this.graphCircles()
        }, 500);
    };

    graphCircles() {
        if (this.circles) this.circles.remove();
        this.circles = this.graph.selectAll("circle")
            .data(this.data)
            .enter()
            .append("circle")
            .attr("r", 0)
            .attr("cx", d => this.x(new Date(d.date)))
            .attr("cy", d => this.y(d.count))
            .attr("class", "cursor-pointer")
            .attr("stroke", "white")
            .attr("stroke-width", 1);

        this.circles.transition()
            .duration(300)
            .attr("r", 2)
            .attr("fill", "rgb(252, 238, 33)");

        this.circles.on("mouseover", this.handleMouseOver.bind(this))
            .on("mouseout", this.handleMouseOut);
    };

    handleMouseOver(d, i, n) {
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        d3.select(n[i])
            .attr("r", 3)
            .attr("fill", "rgb(229, 75, 39)");

        this.graph.append("foreignObject")
            .attr("width", 160)
            .attr("height", 50)
            .attr("id", `t-${d.date}-${d.count}-${i}`)
            .attr("x", this.x(new Date(d.date)) - 70)
            .attr("y", this.y(d.count) - 60)
            .html(() => {
                return `<div class="tip-style">${months[(new Date(d.date)).getMonth()]}: ${d.count}</div>`;
            });
    };

    handleMouseOut(d, i, n) {
        d3.select(this)
            .attr("r", 2)
            .attr("fill", "rgb(252, 238, 33)");

        d3.select(`#t-${d.date}-${d.count}-${i}`)
            .remove();
    };

    graphBrush() {
        const dateMin = d3.min(this.data, d => new Date(d.date));
        const dateMax = d3.max(this.data, d => new Date(d.date));
        this.brush = d3.brushX()
            .extent([[this.x(dateMin), this.y(7000)], [this.x(dateMax), this.y(0)]]);

        this.gBrush = this.graph.append("g")
            .attr("class", "brush")
            .call(this.brush);

        this.gBrush.on(".brush", null);
    }

    graphAxesLabel() {
        this.xAxisLabel = this.graph.append("text")
            .text("Time")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.width / 1.9}, ${this.margin.bottom * 1.5 + this.graphHeight})`)
            .attr("font-size", "14")
            .attr("fill", "white");

        this.yAxisLabel = this.graph.append("text")
            .text("Complaint Count")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.margin.left / 3.5}, ${this.height / 1.9})rotate(-90)`)
            .attr("font-size", "14")
            .attr("fill", "white");
    };

    graphInfo() {
        this.graphTitle = this.graph.append("text")
            .text("Monthly rat complaint counts from 2014 to 2018 in Chicago")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.width / 2}, ${this.margin.top / 1.5})`)
            .attr("font-size", "16")
            .attr("fill", "white");

        this.graphSource = this.graph.append("text")
            .html(() => "Source: <a class='chart-source' href='https://data.cityofchicago.org/Service-Requests/311-Service-Requests-Rodent-Baiting-No-Duplicates/uqhs-j723'>Chicago Data Portal</a>")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.width / 1.19}, ${this.height - this.margin.bottom / 5})`)
            .attr("font-size", "14")
            .attr("fill", "white");
    };

    graphRemove() {
        if (this.xAxisGroup) this.xAxisGroup.remove();
        if (this.yAxisGroup) this.yAxisGroup.remove();
        if (this.timePath) this.timePath.remove();
        if (this.allTimePath) this.allTimePath.remove();
        if (this.circles) this.circles.remove();
        if (this.xAxisLabel) this.xAxisLabel.remove();
        if (this.yAxisLabel) this.yAxisLabel.remove();
        if (this.graphTitle) this.graphTitle.remove();
        if (this.graphSource) this.graphSource.remove();
        if (this.gBrush) this.gBrush.remove();
    };

    grapher(newData) {
        this.data = newData;
        this.graphRemove();
        this.graphSetup();
        this.graphScales();
        this.graphAxes();
        this.graphBrush();
        this.graphLine();
        this.graphAxesLabel();
        this.graphInfo();
        this.graphed = true;
    };
};