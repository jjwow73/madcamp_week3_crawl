var nodes = new vis.DataSet([
]);

var edges = new vis.DataSet([
]);

var selComp = [];
var compInfos = [];
function draw() {
    var container = document.getElementById("mynetwork");
    var data = {
        nodes: nodes,
        edges: edges,
    };
    var options = {
        nodes: {
            shape: "dot",
            scaling: {
                min: 20,
                max: 30,
            },
        },
        layout: {
            randomSeed: 34,
        },
        physics: {
            forceAtlas2Based: {
                gravitationalConstant: -26,
                centralGravity: 0.005,
                springLength: 230,
                springConstant: 0.18,
            },
            maxVelocity: 146,
            solver: "forceAtlas2Based",
            timestep: 0.35,
            stabilization: {
                enabled: true,
                iterations: 2000,
                updateInterval: 25,
            },
        },
    };
    var network = new vis.Network(container, data, options);

    network.on("stabilizationProgress", function (params) {
        var maxWidth = 496;
        var minWidth = 20;
        var widthFactor = params.iterations / params.total;
        var width = Math.max(minWidth, maxWidth * widthFactor);

        document.getElementById("bar").style.width = width + "px";
        document.getElementById("text").innerHTML =
            Math.round(widthFactor * 100) + "%";
    });

    network.on("doubleClick", (params) => {
        params.event = "[original Event]";
        var nodeInfo = params;
        node = nodes.get(nodeInfo.nodes);
        var compName = node[0].label;
        console.log(node);
        $("#resultChecker").text(compName);
        compNews(compName);
        if ($("#rightsidebar").attr("class") != "") {
            $("#rightsidebar").toggleClass("active");
        }
    });

    network.once("stabilizationIterationsDone", function () {
        document.getElementById("text").innerHTML = "100%";
        document.getElementById("bar").style.width = "496px";
        document.getElementById("loadingBar").style.opacity = 0;
        // really clean the dom element
        setTimeout(function () {
            document.getElementById("loadingBar").style.display = "none";
        }, 500);
    });
}

function drawGraph(ev) {
    console.log("hit");
    console.log(ev.getAttribute("value"));

    if (
        selComp.find((element) => element == ev.getAttribute("value")) == undefined
    ) {
        console.log(selComp.find((element) => element == ev.getAttribute("value")));
        selComp.push(ev.getAttribute("value"));
        selComp = Array.from(new Set(selComp));
        console.log(selComp);
        sendSelComp();
        setTimeout(draw, 50);
    } else {
        var idx = selComp.indexOf(ev.getAttribute("value"));
        selComp.splice(idx, 1);
        sendSelComp();
        setTimeout(draw, 50);
    }
}

function sendSelComp() {
    postData("http://192.249.19.243:8780/api/company/corr", {
        companies: selComp,
    })
        .then((data) => {
            nodes = new vis.DataSet(data.data.nodes);
            edges = new vis.DataSet(data.data.edges);

        })
        .catch((error) => console.error(error));
}

function compInfo() {
    getData("http://192.249.19.243:8780/api/company/list", {})
        .then((data) => {
            for (comps in data.data) {
                compInfos.push({
                    회사명: data.data[comps].name,
                    업종: data.data[comps].upjong,
                    시가총액: data.data[comps].sichong,
                });
            }

            return true;
        })
        .then(() => {
            putCompanyList();
        })
        .catch((error) => console.error(error));
}

function postData(url, data) {
    console.log(data);
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    }).then((response) => response.json());
}

function getData(url, data) {
    //console.log(data);
    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => response.json());
}

function putCompanyList() {
    compInfos.forEach((element) => {
        $("#myList").append(
            `<a class="list-group-item" href="#" onclick="drawGraph(this)" value="${element["회사명"]}" > <span class="fa fa-check" id="isSelected" display = "none"></span> ${element["회사명"]}, ${element["시가총액"]}</a>`
        );
    });
}
function compNews(compName) {
    postData("http://192.249.19.243:8780/api/naver/news", { comp: compName })
        .then((data) => {
            putCompanyNews(data.data);
            //console.log(compInfos);
            //console.log(JSON.stringify(data));
            return true;
        })
        .catch((error) => console.error(error));
}

function putCompanyNews(data) {
    $("#newsList").empty();
    console.log(data);
    data.forEach((element) => {
        $("#newsList").append(
            `<div class="card custom-card">
        <div class="card-body">
          <h5 class="card-title">
          ${element["title"]}
          </h5>
          <h6 class="card-subtitle mb-2 text-muted">
          ${element["pubDate"]}
          </h6>
          <p class="card-text small">
          ${element["description"]}
          </p>
          <a
            href="${element["originallink"]}"
            class="card-link"
            >보러가기</a
          >
        </div>
      </div>`
        );
    });
}
window.onload = function () {
    console.log("load가 다 됐어요.");
    compInfo();
    draw();
};
