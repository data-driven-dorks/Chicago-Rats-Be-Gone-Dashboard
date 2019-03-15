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
            .translate([ this.width / 2, this.height / 2])
            .center([8.25, 41.882505])
            .parallels([40, 45])
            .rotate([92.35, .5, -4])
            .scale([this.scale]);
    
        this.geoGenerator = d3.geoPath(this.projection);
    };

    graphFillScale() {
        this.fill = d3.scaleOrdinal()
            .domain([0, 754])
            .range([
                "#fcee21", "#fceb22", "#fce722", "#fce522", "#fce223", 
                "#fbdf23", "#fbdb23", "#fbd924", "#fbd624", "#fbd324", 
                "#facf25", "#facd25", "#faca25", "#fac625", "#f9c326", 
                "#f9c026", "#f9bd26", "#f8ba26", "#f8b626", "#f8b327", 
                "#f7b027", "#f7ad27", "#f6aa27", "#f6a627", "#f5a427", 
                "#f5a127", "#f49e27", "#f49a27", "#f39828", "#f39328", 
                "#f29028", "#f28d28", "#f18928", "#f08628", "#f08428", 
                "#ef8028", "#ef7c28", "#ee7928", "#ed7528", "#ed7128", 
                "#ec6f28", "#eb6b28", "#ea6728", "#ea6328", "#e95f27", 
                "#e85c27", "#e85827", "#e75427", "#e65027", "#e54b27"
            ])
    };

    graphMap() {
        this.graph.selectAll("path")
            .data(this.dataChicago.features)
            .enter()
            .append("path")
            .attr("d", this.geoGenerator)
            .style("stroke", "#252525")
            .style("stroke-width", 2)
            .attr("fill", d => this.fill(d.properties.data[0].complaintspc));
    };

    grapher() {
        this.graphSetup();
        this.graphProjection();
        this.graphFillScale();
        this.graphMap();
        this.graphed = true;
    }
}