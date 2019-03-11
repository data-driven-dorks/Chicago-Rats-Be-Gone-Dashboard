import * as d3 from "d3";

export default class stackBar {
    constructor(canvas, width, height, margin) {
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


    grapher(newData) {
        if (this.xAxisGroup) this.xAxisGroup.remove();
        if (this.yAxisGroup) this.yAxisGroup.remove();
        if (this.timePath) this.timePath.remove();
        if (this.circles) this.circles.remove();
        this.data = newData;
        this.graphSetup();
        this.graphScales();
        this.graphAxes();   
        this.graphLine();
        this.graphAxesLabel();
        this.graphInfo();
        this.graphed = true;
    };
};