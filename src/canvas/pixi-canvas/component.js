import React from "react";
import GraphicsEngine from "./canvas";
import "./style.css";
import PropTypes from "prop-types";
import {
    prepareLinksDataForCurves,
    prepareNodesDataWithOptions,
    removeEdgeMeta,
    removeVertexMeta
} from "../canvas-utils";
import GraphicsStore from "../../core/graphics-store";
import GESettings from "./settings";
import GraphSimulator from "../../core/graph-simulator";
// import UpdaterCls from "./updates";

// const connector = new Connector();

export default class PIXICanvasComponent extends React.Component {

    /*


    setHideVertexOptions={this.setHideVertexOptions.bind(this)}
    setSelectedElementData={this.setSelectedElementData.bind(this)}
    setRightContentName={this.setRightContentName.bind(this)}
    setMiddleBottomContentName={this.setMiddleBottomContentName.bind(this)}
    middleBottomContentName={this.state.middleBottomContentName}

    selectedElementData={this.state.selectedElementData}
    setStatusMessage={this.selectedElementData}

    connector={this.connector}
    resetShallReRenderD3Canvas={this.resetShallReRenderD3Canvas.bind(this)}
    shallReRenderD3Canvas={this.state.shallReRenderD3Canvas}
    makeQuery={this.makeQuery.bind(this)}

     */

    static defaultProps = {
        setHideVertexOptions: () => console.error("setHideVertexOptions not set",),
        setSelectedElementData: (selectedData) => console.error("setSelectedElementData not set", selectedData),
        setRightContentName: (contentName) => console.error("setRightContentName not set", contentName),
        setMiddleBottomContentName: (contentName) => console.error("setMiddleBottomContentName not set", contentName),
        middleBottomContentName: null,
        selectedElementData: null,
        setStatusMessage: (message) => console.debug("setStatusMessage not set", message),

        connector: false,
        dataStore: null,
        resetShallReRenderD3Canvas: () => console.log("resetShallReRenderD3Canvas"),
        shallReRenderD3Canvas: false,
        makeQuery: () => console.error("makeQuery not set"),
    }

    static propTypes = {
        setSelectedElementData: PropTypes.func,
        setMiddleBottomContentName: PropTypes.func,
        makeQuery: PropTypes.func,
        setHideVertexOptions: PropTypes.func,
        setRightContentName: PropTypes.func,
        requestBuilder: PropTypes.object,
        dataStore: PropTypes.object,
        connector: PropTypes.object,
        middleBottomContentName: PropTypes.string,

        shallReRenderD3Canvas: PropTypes.bool,
        resetShallReRenderD3Canvas: PropTypes.func,
        selectedElementData: PropTypes.object,
        setStatusMessage: PropTypes.func
    }


    constructor(props) {
        super(props);
    }


    checkAndAddNewData2Simulation() {
        /*

        This will add the new data needed for the new simulation..

         */
        console.log("PIXICanvasComponent checkAndAddNewData2Simulation()", this.props.dataStore.getAllData());


        this.graphicsEngine.isRendering = true;
        this.props.setStatusMessage("Updating the graph...");

        const {verticesToRender, edgesToRender} = this.props.dataStore.determineAllDataToRender();

        console.log("]=====verticesToRender, edgesToRender", verticesToRender, edgesToRender);

        // adding this data to force simulation
        this.forceSimulator.addDataToGraphSimulation(verticesToRender, edgesToRender,);

        // save the 2d position data to storage.
        this.props.dataStore.setDataToRender(verticesToRender, edgesToRender);
        // saves to already rendered data, to find the diff later.
        this.props.dataStore.setAlreadyRenderedData(verticesToRender, edgesToRender);
        // this.graphicsEngine.clearCanvas();

        // add to simulation.
        console.log("vertices2RenderPrepared", verticesToRender);


        // this.onForceSimulationEnd(this.graphicsEngine, this.setStatusMessage.bind(this));


    }

    // shouldComponentUpdate(nextProps, nextState) {
    //
    //     if (this.graphicsEngine.isRendering) {
    //         return false;
    //     }
    //     const {newVerticesToRender, newEdgesToRender} = this.props.dataStore.getNewDataToRender();
    //     console.log("===newVerticesToRender", newVerticesToRender, newEdgesToRender)
    //     return newVerticesToRender.length > 0 || newEdgesToRender.length > 0;
    //
    // }

    shouldComponentUpdate(nextProps) {
        return nextProps.shallReRenderD3Canvas;
    }


    componentDidMount() {
        let _this = this;
        const canvasElem = document.querySelector(".graphContainer");
        const nodeMenuEl = document.querySelector(".nodeMenuContainer");
        // const graphCanvasStatus = document.querySelector("#graph-canvas-status");

        console.log("canvasElem.offsetWidth,", canvasElem.offsetWidth, canvasElem.offsetHeight)
        this.settings = new GESettings(canvasElem.offsetWidth, canvasElem.offsetHeight);

        this.graphicsEngine = new GraphicsEngine(canvasElem, nodeMenuEl,
            this.settings,
            this.props.dataStore,
            this.onNodeSelected.bind(this)
        )

        this.forceSimulator = new GraphSimulator(this.settings, () => {
            console.log("========on onForceSimulationEnd ")
            // const {vertices2Render, edges2Render} = _this.getDataToRender();
            _this.onForceSimulationEnd(_this.graphicsEngine, _this.setStatusMessage.bind(_this));

        });

        this.checkAndAddNewData2Simulation();
    }

    setStatusMessage(message) {
        this.props.setStatusMessage(message);
    }

    onForceSimulationEnd(graphicsEngine, setStatusMessage) {
        console.log("onForceSimulationEnd", graphicsEngine, setStatusMessage);

        graphicsEngine.renderGraphics();
        graphicsEngine.isRendering = false;
        if (graphicsEngine.isFirstLoaded === false) {
            // center the view only for the first time.
            graphicsEngine.resetViewport();
            graphicsEngine.isFirstLoaded = true;
        }
        setStatusMessage("Updated the graph");
        // this.graphCanvasStatus.innerHTML = "Updated the data";

        // this.graphicsEngine.updatePositions();
        // GraphicsEngine.upd

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // console.log("componentDidUpdate", this.props.dataStore.getAllRawVerticesList().length, this.props.dataStore.getVerticesCount())

        if (this.props.shallReRenderD3Canvas === true) {
            this.props.resetShallReRenderD3Canvas()
        }

        this.checkAndAddNewData2Simulation();


    }

    onNodeSelected(nodeData) {
        if (this.props.middleBottomContentName !== "vertex-options") {
            this.props.setMiddleBottomContentName('selected-data-overview')
            this.props.setSelectedElementData(nodeData);
        }
    }


    onClickFocus() {
        const nodeData = this.graphicsEngine.eventStore.lastSelectedNodeData;
        this.graphicsEngine.dataStore.addNode2Focus(nodeData);
        this.graphicsEngine.graphicsStore.focusOnNodes(this.graphicsEngine.dataStore.focusedNodes);
        this.graphicsEngine.zoom2Point(nodeData.x, nodeData.y);
        document.querySelector(".focused-nodes").append(
            "<li>" + nodeData.id + "</li>"
        )
        this.graphicsEngine.eventStore.hideMenu();
    }

    onClickShowInV() {
        // alert("onClickShowInv clicked");
        const selectedNode = this.props.selectedElementData;
        const query_string = this.props.connector.requestBuilder.getInEdgeVertices(selectedNode.id);
        this.props.makeQuery(query_string);
    }

    onClickShowOutV() {
        // alert("onClickShowOutV clicked");
        const selectedNode = this.props.selectedElementData;
        console.log("expandOutLinksAndNodes", selectedNode);
        // TODO - improve performance of the query.


        const query_string = this.props.connector.requestBuilder.getOutEdgeVertices(selectedNode.id);

        this.props.makeQuery(query_string);
    }

    hideMenu() {
        this.graphicsEngine.eventStore.hideMenu();
    }

    cleanGraph() {
        console.log("this.forceSimulator", this.forceSimulator);
        this.forceSimulator.forceSimulator.restart();
    }

    resetFocus() {
        this.graphicsEngine.dataStore.removeAllNodes2Focus();
        this.graphicsEngine.graphicsStore.resetFocus();
        this.graphicsEngine.resetViewport();
    }


    render() {
        // console.log("PIXICanvas render()", this.props.dataStore.getAllRawVerticesList())
        return (
            <div className={"graphContainer"}>
                <ul className={"focused-nodes"}>
                </ul>


                <div className="nodeMenuContainer" style={{"display": "none"}}>
                    <h5>Vertex Label</h5>
                    <p>Id: <span id={"elementId"}></span></p>
                    <ul className={"nodeMenu"}>
                        <li onClick={() => this.onClickFocus()}>Focus</li>
                        <li onClick={() => this.resetFocus()}>Reset Focus</li>
                        <li onClick={() => this.onClickShowInV()}>Show InV</li>
                        <li onClick={() => this.onClickShowOutV()}>Show OutV</li>
                        <li onClick={() => this.cleanGraph()}>Clean Graph</li>
                        <li onClick={() => this.hideMenu()}>hide menu</li>
                    </ul>
                </div>

            </div>

        )
    }

}
