import * as d3 from "d3";

export default class stackBar {
    constructor(data, canvas, width, height, margin) {
        this.data = data;
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
            y: this.graphHeight / 2 + 2 * this.margin.top
        }
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

    graphPie() {
        this.arcPath = d3.arc()
            .innerRadius(d => this.y(d[0]))
            .outerRadius(d => this.y(d[1]))
            .startAngle(d => this.x(d.data.month))
            .endAngle(d => this.x(d.data.month) + this.x.bandwidth())
            .padAngle(0.01)
            .padRadius(this.innerRadius)
    };

    graphDraw() {
        this.graph
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
    }

    grapher() {
        this.graphSetup();
        this.graphScales();
        this.graphPie();
        this.graphDraw();
        this.graphed = true;
    };
};