const DATASETS = {
    videogames: {
        TITLE: 'Video Game Sales',
        DESCRIPTION: 'Top 100 Most Sold Video Games Grouped by Platform',
        FILE_PATH: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
    },
    movies: {
        TITLE: 'Movie Sales',
        DESCRIPTION: 'Top 100 Highest Grossing Movies Grouped By Genre',
        FILE_PATH: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
    },
    kickstarter: {
        TITLE: 'Kickstarter Pledges',
        DESCRIPTION: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
        FILE_PATH: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
    }
}


document.addEventListener('DOMContentLoaded', (e) => {

    let urlParams = new URLSearchParams(window.location.search)
    const DEFAULT_DATASET = 'videogames'
    const DATASET = DATASETS[urlParams.get('data') || DEFAULT_DATASET]

    document.getElementById('title').innerHTML = DATASET.TITLE
    document.getElementById('description').innerHTML = DATASET.DESCRIPTION


    let body = d3.select('body')


    var tooltip = body.append('div')
        .attr('class', 'tooltip')
        .attr('id', 'tooltip')
        .style("visibility", "hidden")

    let svg = d3.select('#tree-map')
    let width = svg.attr('width')
    let height = svg.attr('height')


    const fader = (color) => {
        return d3.interpolateRgb(color, '#fff')(0.2)
    }
    const color = d3.scaleOrdinal(d3.schemeSpectral[11].map(fader))
    const format = d3.format(',d')

    let treemap = d3.treemap()
        .size([width, height])
        .paddingInner(1)

    d3.json(DATASET.FILE_PATH)
        .then((data) => {

            const root = d3.hierarchy(data)
                .eachBefore((d) => {
                    d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name
                })
                .sum(sumBySize)
                .sort((a, b) => {
                    return b.height - a.height || b.value - a.value
                })

            treemap(root)
            console.log(data)

            const mouseOver = function (e, d) {
                d3.selectAll("rect")
                    .transition()
                    .duration(200)
                    .style("opacity", .7)
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "black")
                tooltip
                    .style("opacity", 1)
            }

            let mouseMove = function (e, d) {

                d3.selectAll("rect")
                    .transition()
                    .duration(200)
                    .style("opacity", .7)
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "black");
                tooltip.style("visibility", "visible")
                    .style("left", e.pageX + 10 + "px")
                    .style("top", e.pageY - 80 + "px")
                    .html(
                        'Name: ' + d.data.name +
                        '<br>Category: ' + d.data.category +
                        '<br>Value: ' + d.data.value
                    )
                    .attr('data-value', d.data.value)
            }

            let mouseLeave = function (d) {
                d3.selectAll(".rect")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 1)
                    .style("stroke", "transparent");
                tooltip
                    .style('visibility', 'hidden')
            }

            let cell = svg.selectAll('g')
                .data(root.leaves())
                .enter().append('g')
                .attr('class', 'group')
                .attr('transform', (d) => {
                    return 'translate(' + d.x0 + ',' + d.y0 + ')'
                })


            let tile = cell.append('rect')
                .attr('id', (d) => {
                    return d.data.id
                })
                .attr('class', 'tile')
                .attr('width', (d) => {
                    return d.x1 - d.x0
                })
                .attr('height', (d) => {
                    return d.y1 - d.y0
                })
                .attr('data-name', (d) => {
                    return d.data.name
                })
                .attr('data-category', (d) => {
                    return d.data.category
                })
                .attr('data-value', (d) => {
                    return d.data.value
                })
                .attr('fill', (d) => {
                    return color(d.data.category)
                })
                .on("mouseover", mouseOver)
                .on("mousemove", mouseMove)
                .on("mouseleave", mouseLeave)



            cell.append('text')
                .attr('class', 'tile-text')
                .selectAll('tspan')
                .data((d) => {
                    return d.data.name.split(/(?=[A-Z][^A-Z])/g)
                })
                .enter().append('tspan')
                .attr('x', 4)
                .attr('y', (d, i) => {
                    return 13 + i * 10
                })
                .text((d) => {
                    return d
                })


            let categories = root.leaves().map((nodes) => {

                return nodes.data.category
            })


            categories = categories.filter((category, index, self) => {
                return self.indexOf(category) === index
            })


            let legend = d3.select('#legend')
            var legendWidth = +legend.attr('width')
            const LEGEND_OFFSET = 10
            const LEGEND_RECT_SIZE = 15
            const LEGEND_H_SPACING = 150
            const LEGEND_V_SPACING = 10
            const LEGEND_TEXT_X_OFFSET = 3
            const LEGEND_TEXT_Y_OFFSET = -2
            let legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING)


            let legendElem = legend
                .append('g')
                .attr('transform', 'translate(60,' + LEGEND_OFFSET + ')')
                .selectAll('g')
                .data(categories)
                .enter().append('g')
                .attr('transform', function (d, i) {
                    return 'translate(' +
                        ((i % legendElemsPerRow) * LEGEND_H_SPACING) + ',' +
                        ((Math.floor(i / legendElemsPerRow)) * LEGEND_RECT_SIZE + (LEGEND_V_SPACING * (Math.floor(i / legendElemsPerRow)))) + ')'
                })


            legendElem.append('rect')
                .attr('width', LEGEND_RECT_SIZE)
                .attr('height', LEGEND_RECT_SIZE)
                .attr('class', 'legend-item')
                .attr('fill', function (d) {
                    return color(d)
                })

            legendElem.append('text')
                .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
                .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
                .text(function (d) {
                    return d
                })
        })
        .catch(() => {

            console.log('error')
        })

    function sumBySize(d) {
        return d.value
    }
})