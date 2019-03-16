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
            .attr("opacity", 0.7)
            .attr("stroke-width", 0.1);

        this.mapPath.transition()
            .duration(750)
            .attr("stroke", "#252525")
            .attr("stroke-width", 2.3)
            .attr("opacity", 1)
            .attr("fill", d => this.fill(d.properties.data[this.year - 2014].complaintspc))
            .attr("class", "cursor-pointer");

        this.mapPath.on("mouseover", this.handleMouseOver.bind(this))
            .on("mouseout", this.handleMouseOut.bind(this));
    };

    handleMouseOver(d, i, n) {
        const centroid = this.geoGenerator.centroid(d);

        d3.select(n[i])
            .attr("fill", "white");

        this.graph.append("foreignObject")
            .attr("width", 200)
            .attr("height", 54)
            .attr("id", `t-${d.properties.data[this.year - 2014].complaints}-${i}`)
            .attr("x", centroid[0])
            .attr("y", centroid[1] - 120)
            .html(() => {
                let content = `<div class="tip-style"><div>${d.properties.community}</div>`;
                content += `<div>${d.properties.data[this.year - 2014].complaintspc}</div></div>`;
                return content;
            });
    };

    handleMouseOut(d, i, n) {
        d3.select(n[i])
            .attr("fill", d => this.fill(d.properties.data[this.year - 2014].complaintspc));

        d3.select(`#t-${d.properties.data[this.year - 2014].complaints}-${i}`)
            .remove();
    };

    graphInfo() {
        this.graphTitle = this.graph.append("text")
            .text("Rat Complaints per 10,000 Population across Chicago Communities (2014 to 2018)")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.width / 2} , ${this.margin.top / 2})`)
            .attr("font-size", "16")
            .attr("fill", "white");

        this.graphSource = this.graph.append("text")
            .html(() => "Source: <a class='chart-source' href='https://data.cityofchicago.org/Service-Requests/311-Service-Requests-Rodent-Baiting-No-Duplicates/uqhs-j723'>Chicago Data Portal</a>")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.graphWidth * 0.86}, ${this.height * 0.96})`)
            .attr("font-size", "14")
            .attr("fill", "white");
    };

    graphRemove() {
        if (this.mapPath) this.mapPath.remove();
        if (this.graphTitle) this.graphTitle.remove();
        if (this.graphSource) this.graphSource.remove();
    };

    grapher(year) {
        this.year = year;
        this.graphRemove();
        this.graphSetup();
        this.graphProjection();
        this.graphFillScale();
        this.graphMap();
        this.graphInfo();
        this.graphed = true;
    }
}